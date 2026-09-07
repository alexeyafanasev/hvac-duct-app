"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import { decomposeItemToCutPieces, round2 } from "@/lib/hvac-geometry";
import {
  nestPiecesOnSheets,
  SHEET_PRESETS,
} from "@/lib/nesting-engine";
import {
  generateSheetGcode,
  DEFAULT_GCODE_CONFIG,
} from "@/lib/gcode-generator";
import { generateSheetDxf } from "@/lib/dxf-generator";

const PART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

function getCleanPartLabel(partName = "") {
  if (/bottom.*s-curve/i.test(partName)) return "Bottom S";
  if (/top.*s-curve/i.test(partName)) return "Top S";
  if (/right.*flat/i.test(partName)) return "Right Flat";
  if (/left.*flat/i.test(partName)) return "Left Flat";
  if (/cheek/i.test(partName)) return "Cheek";
  if (/throat/i.test(partName)) return "Throat";
  if (/heel/i.test(partName)) return "Heel";
  if (/straight.*part\s*1/i.test(partName)) return "Straight 1";
  if (/straight.*part\s*2/i.test(partName)) return "Straight 2";
  if (/straight/i.test(partName)) return "Straight";
  if (/wrapper/i.test(partName)) return "Wrapper";
  if (/cap/i.test(partName)) return "Cap";
  return partName.replace(/\s*\(.*?\)/g, "").trim() || partName;
}

export default function NestingPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Nesting Parameters (Inches) ---
  const [selectedPreset, setSelectedPreset] = useState('48" × 96" (4×8 ft)');
  const [sheetWidth, setSheetWidth] = useState(96); // X axis (inches)
  const [sheetHeight, setSheetHeight] = useState(48); // Y axis (inches)
  const [margin, setMargin] = useState(0.5); // margin from sheet edge
  const [spacing, setSpacing] = useState(0.25); // kerf gap between parts
  const [straightMode, setStraightMode] = useState("l-shape"); // "l-shape" vs "full"
  const [allowRotation, setAllowRotation] = useState(true);
  const [zeroMarginStraight, setZeroMarginStraight] = useState(false);

  // Active Sheet Tab
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [labelMode, setLabelMode] = useState("badge"); // "badge" | "name" | "dims" | "none"

  // --- G-Code Configuration ---
  const [gcodeConfig, setGcodeConfig] = useState(DEFAULT_GCODE_CONFIG);
  const [showGcodeModal, setShowGcodeModal] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showRapids, setShowRapids] = useState(false);

  // Load Order & Project from Firebase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        // Load Order
        const orderRef = doc(db, "projects", projectId, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };
          if (isMounted) setOrder(orderData);
        }

        // Load Project
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists() && isMounted) {
          setProject({ id: projectSnap.id, ...projectSnap.data() });
        }
      } catch (err) {
        console.error("Error loading order for nesting:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId, orderId]);

  // Handle Preset Changes
  const handlePresetChange = (label) => {
    setSelectedPreset(label);
    const found = SHEET_PRESETS.find((p) => p.label === label);
    if (found && label !== "Custom") {
      setSheetWidth(found.width);
      setSheetHeight(found.height);
    }
  };

  // 1. Unroll order items into 2D cut pieces
  const allCutPieces = useMemo(() => {
    if (!order?.items || !Array.isArray(order.items)) return [];

    const pieces = [];
    order.items.forEach((item) => {
      const itemPieces = decomposeItemToCutPieces(item, {
        straightMode,
      });
      pieces.push(...itemPieces);
    });

    return pieces;
  }, [order, straightMode]);

  // 2. Perform 2D Nesting Calculation
  const sheets = useMemo(() => {
    if (allCutPieces.length === 0) return [];

    return nestPiecesOnSheets(allCutPieces, {
      sheetWidth: Number(sheetWidth) || 96,
      sheetHeight: Number(sheetHeight) || 48,
      margin: margin !== "" && !isNaN(Number(margin)) ? Math.max(0, Number(margin)) : 0.5,
      spacing: spacing !== "" && !isNaN(Number(spacing)) ? Math.max(0, Number(spacing)) : 0.25,
      zeroMarginStraight,
      allowRotation,
    });
  }, [allCutPieces, sheetWidth, sheetHeight, margin, spacing, zeroMarginStraight, allowRotation]);

  // Ensure active sheet index is valid
  useEffect(() => {
    if (activeSheetIndex >= sheets.length && sheets.length > 0) {
      setActiveSheetIndex(sheets.length - 1);
    }
  }, [sheets.length, activeSheetIndex]);

  const currentSheet = sheets[activeSheetIndex] || null;

  // Generate G-code for Current Sheet
  const currentGcode = useMemo(() => {
    if (!currentSheet) return "";
    return generateSheetGcode(
      currentSheet,
      {
        projectName: project?.name,
        orderName: order?.name,
        sheetIndex: activeSheetIndex,
      },
      gcodeConfig
    );
  }, [currentSheet, project, order, activeSheetIndex, gcodeConfig]);

  // Generate DXF for Current Sheet
  const currentDxf = useMemo(() => {
    if (!currentSheet) return "";
    return generateSheetDxf(currentSheet, {
      projectName: project?.name,
      orderName: order?.name,
      sheetIndex: activeSheetIndex,
    });
  }, [currentSheet, project, order, activeSheetIndex]);

  // File Download Handlers
  const handleDownloadGcode = () => {
    if (!currentGcode) return;
    const blob = new Blob([currentGcode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeOrder = (order?.name || "Order").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.href = url;
    link.download = `${safeOrder}_Sheet_${activeSheetIndex + 1}.nc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDxf = () => {
    if (!currentDxf) return;
    const blob = new Blob([currentDxf], { type: "application/dxf;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeOrder = (order?.name || "Order").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.href = url;
    link.download = `${safeOrder}_Sheet_${activeSheetIndex + 1}.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyGcode = () => {
    if (!currentGcode) return;
    navigator.clipboard.writeText(currentGcode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <main className="w-full max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          Loading order details...
        </main>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard>
        <main className="w-full max-w-6xl mx-auto px-4 py-8">
          <p className="text-red-600">Order not found.</p>
          <Link
            href={`/project/${projectId}`}
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Return to Project
          </Link>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="w-full max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen text-gray-900">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <Link
            href={`/project/${projectId}/order/${orderId}`}
            className="text-blue-700 font-medium hover:underline text-sm flex items-center gap-1"
          >
            ← Back to Order ({order.name})
          </Link>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">
            CNC Laser & Nesting (Inches)
          </span>
        </div>

        {/* Page Title & Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sheet Metal Nesting & CNC G-Code
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Project: <span className="font-medium text-gray-800">{project?.name || "-"}</span> | Order:{" "}
              <span className="font-medium text-gray-800">{order.name}</span> | Date: {order.date || "-"}
            </p>
          </div>

          {/* CNC Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowGcodeModal(true)}
              className="text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-1.5"
            >
              ⚙️ CNC Settings
            </button>
            <button
              onClick={handleDownloadDxf}
              disabled={!currentSheet}
              className="text-sm bg-purple-700 hover:bg-purple-800 text-white px-3.5 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 transition flex items-center gap-1.5"
            >
              📥 Download DXF
            </button>
            <button
              onClick={handleDownloadGcode}
              disabled={!currentSheet}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 transition flex items-center gap-1.5"
            >
              ⚡ Download G-Code (.nc)
            </button>
          </div>
        </div>

        {/* Nesting Parameters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Sheet & Cutting Setup (Dimensions in Inches)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            {/* Sheet Preset */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sheet Preset
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
              >
                {SHEET_PRESETS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sheet Width (X) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Length X (in)
              </label>
              <input
                type="number"
                step="0.5"
                min="10"
                max="240"
                value={sheetWidth}
                onChange={(e) => {
                  setSelectedPreset("Custom");
                  setSheetWidth(e.target.value);
                }}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
              />
            </div>

            {/* Sheet Height (Y) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Width Y (in)
              </label>
              <input
                type="number"
                step="0.5"
                min="10"
                max="120"
                value={sheetHeight}
                onChange={(e) => {
                  setSelectedPreset("Custom");
                  setSheetHeight(e.target.value);
                }}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
              />
            </div>

            {/* Margin */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700">
                  Margin (in)
                </label>
                <button
                  type="button"
                  onClick={() => setMargin(0)}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  0"
                </button>
              </div>
              <input
                type="number"
                step="0.125"
                min="0"
                max="2"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
              />
            </div>

            {/* Spacing / Kerf */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700">
                  Part Gap (in)
                </label>
                <button
                  type="button"
                  onClick={() => setSpacing(0)}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  0"
                </button>
              </div>
              <input
                type="number"
                step="0.0625"
                min="0"
                max="1"
                value={spacing}
                onChange={(e) => setSpacing(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
              />
            </div>

            {/* Straight Duct Cut Mode */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Straight Duct
              </label>
              <select
                value={straightMode}
                onChange={(e) => setStraightMode(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 bg-white"
              >
                <option value="l-shape">2 L-Sections</option>
                <option value="full">Full Wrapper (1 pc)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition">
              <input
                type="checkbox"
                checked={zeroMarginStraight}
                onChange={(e) => setZeroMarginStraight(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>
                Nest Full-Width Straight Ducts Flush ({sheetHeight}&quot;, 0&quot; Margin &amp; Gap on separate sheets)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowRotation}
                onChange={(e) => setAllowRotation(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Allow 90° Rotation for Tighter Fit</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRapids}
                onChange={(e) => setShowRapids(e.target.checked)}
                className="rounded text-orange-500"
              />
              <span>Show G0 Rapid Toolpath Lines</span>
            </label>
          </div>
        </div>

        {/* Sheets Navigation Tabs */}
        {sheets.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
            {sheets.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSheetIndex(idx)}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition flex items-center gap-2 ${
                  activeSheetIndex === idx
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span>Sheet {idx + 1} of {sheets.length}</span>
                {s.sheetType === "straight-flush" ? (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeSheetIndex === idx
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    Flush Straight
                  </span>
                ) : (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeSheetIndex === idx
                        ? "bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s.stats.efficiencyPercent}% yield
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center text-yellow-800 mb-6">
            No cuttable items in this order yet. Add straight ducts, elbows, transitions, offsets or end caps in the order page.
          </div>
        )}

        {/* Active Sheet Statistics Bar */}
        {currentSheet && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-xs text-gray-500">Yield / Efficiency</div>
              <div className="text-xl font-bold text-green-600">
                {currentSheet.stats.efficiencyPercent}%
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-xs text-gray-500">Parts on Sheet</div>
              <div className="text-xl font-bold text-blue-600">
                {currentSheet.stats.totalParts} <span className="text-xs font-normal text-gray-500">pcs</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-xs text-gray-500">Sheet Size</div>
              <div className="text-base font-bold text-gray-800">
                {currentSheet.sheetWidth}&quot; × {currentSheet.sheetHeight}&quot;
              </div>
              <div className="text-xs text-gray-400">
                {currentSheet.stats.totalSheetAreaSqFt} sq ft
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-xs text-gray-500">Parts Metal Area</div>
              <div className="text-base font-bold text-gray-800">
                {currentSheet.stats.partsAreaSqFt} <span className="text-xs font-normal">sq ft</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-xs text-gray-500">Scrap / Offcut</div>
              <div className="text-base font-bold text-amber-600">
                {currentSheet.stats.scrapAreaSqFt} <span className="text-xs font-normal">sq ft</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200 text-center shadow-sm">
              <div className="text-xs text-gray-500">Total Cut Length</div>
              <div className="text-base font-bold text-gray-800">
                {currentSheet.stats.cutLengthFeet} <span className="text-xs font-normal">ft</span>
              </div>
              <div className="text-xs text-gray-400">
                {currentSheet.stats.cutLengthInches}&quot;
              </div>
            </div>
          </div>
        )}

        {/* Visualizer & Interactive Canvas */}
        {currentSheet && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-100 border border-blue-600 inline-block" />
                  Cut Contour (Laser Cut)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-red-600 border-b border-dashed inline-block" />
                  Bend Lines (Mark/Score)
                </span>
                {showRapids && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-orange-400 border-b border-dotted inline-block" />
                    Rapid Move (G0)
                  </span>
                )}
              </div>

              {/* Label View Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Labels:</span>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setLabelMode("badge")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      labelMode === "badge"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Compact part number (#1, #2) centered — never overlaps adjacent parts"
                  >
                    # Number
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelMode("name")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      labelMode === "name"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Part number and short part name with auto-scaled font size"
                  >
                    Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelMode("dims")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      labelMode === "dims"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Part number and bounding dimensions in inches"
                  >
                    Dimensions
                  </button>
                  <button
                    type="button"
                    onClick={() => setLabelMode("none")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      labelMode === "none"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Hide part labels"
                  >
                    Hide
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {currentSheet.sheetType === "straight-flush" ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-md border border-emerald-300">
                    Straight Ducts (Flush 0&quot; Margin &amp; Gap)
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-md border border-gray-200">
                    Margin: {currentSheet.margin}&quot; | Gap: {currentSheet.spacing}&quot;
                  </span>
                )}
                <div className="text-xs text-gray-500">
                  Origin: <span className="font-semibold text-gray-700">Bottom-Left (X=0, Y=0)</span>
                </div>
              </div>
            </div>

            {/* SVG Metal Sheet Container */}
            <div className="w-full overflow-x-auto bg-slate-900 rounded-xl p-4 shadow-inner">
              <SheetCanvasSvg
                sheet={currentSheet}
                selectedPieceId={selectedPieceId}
                onSelectPiece={setSelectedPieceId}
                showRapids={showRapids}
                labelMode={labelMode}
              />
            </div>
          </div>
        )}

        {/* G-Code & DXF Preview Section */}
        {currentSheet && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  G-Code Preview (Inches Mode - G20)
                </h2>
                <p className="text-xs text-gray-500">
                  Ready for GRBL, Mach3/4, LinuxCNC, and CNC laser controllers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCodeViewer(!showCodeViewer)}
                  className="text-xs border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg font-medium"
                >
                  {showCodeViewer ? "Hide Raw Code" : "View Full Code"}
                </button>
                <button
                  onClick={handleCopyGcode}
                  className="text-xs bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg font-medium transition"
                >
                  {copySuccess ? "✓ Copied!" : "📋 Copy G-Code"}
                </button>
              </div>
            </div>

            {showCodeViewer && (
              <div className="relative">
                <pre className="w-full bg-gray-950 text-emerald-400 text-xs font-mono p-4 rounded-xl max-h-80 overflow-y-auto leading-relaxed">
                  {currentGcode}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Parts on Current Sheet Table */}
        {currentSheet && currentSheet.placedPieces.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Parts Layout on Sheet {activeSheetIndex + 1}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">#</th>
                    <th className="px-4 py-3">Part Name</th>
                    <th className="px-4 py-3">Parent Fitting</th>
                    <th className="px-4 py-3">Cut Size (in)</th>
                    <th className="px-4 py-3">Position (X, Y)</th>
                    <th className="px-4 py-3">Rotated</th>
                    <th className="px-4 py-3 rounded-r-lg">Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSheet.placedPieces.map((p, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedPieceId(p.piece.id)}
                      className={`hover:bg-blue-50 cursor-pointer transition ${
                        selectedPieceId === p.piece.id ? "bg-blue-100 font-semibold" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white shadow-xs"
                          style={{ backgroundColor: PART_COLORS[idx % PART_COLORS.length] }}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-blue-700">{p.piece.partName}</td>
                      <td className="px-4 py-2.5">{p.piece.parentName}</td>
                      <td className="px-4 py-2.5 font-mono">
                        {p.placedWidth}&quot; × {p.placedHeight}&quot;
                      </td>
                      <td className="px-4 py-2.5 font-mono text-gray-500">
                        X:{p.x}&quot;, Y:{p.y}&quot;
                      </td>
                      <td className="px-4 py-2.5">
                        {p.rotated ? (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                            90°
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">0°</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono">
                        {round2(p.piece.area / 144)} sq ft
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CNC Settings Modal */}
        {showGcodeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                CNC Laser Settings (Inches & Feeds)
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Units Mode
                  </label>
                  <select
                    value={gcodeConfig.unit}
                    onChange={(e) =>
                      setGcodeConfig({ ...gcodeConfig, unit: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="G20">G20 - Inches (Imperial) [Recommended]</option>
                    <option value="G21">G21 - Millimeters (Metric)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Cut Feed Rate (IPM)
                    </label>
                    <input
                      type="number"
                      value={gcodeConfig.cutFeedRate}
                      onChange={(e) =>
                        setGcodeConfig({
                          ...gcodeConfig,
                          cutFeedRate: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Rapid Feed Rate (IPM)
                    </label>
                    <input
                      type="number"
                      value={gcodeConfig.rapidFeedRate}
                      onChange={(e) =>
                        setGcodeConfig({
                          ...gcodeConfig,
                          rapidFeedRate: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Laser ON (Cut)
                    </label>
                    <input
                      type="text"
                      value={gcodeConfig.laserOnCut}
                      onChange={(e) =>
                        setGcodeConfig({
                          ...gcodeConfig,
                          laserOnCut: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Laser OFF
                    </label>
                    <input
                      type="text"
                      value={gcodeConfig.laserOff}
                      onChange={(e) =>
                        setGcodeConfig({
                          ...gcodeConfig,
                          laserOff: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Pierce Dwell (seconds)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={gcodeConfig.pierceDwell}
                      onChange={(e) =>
                        setGcodeConfig({
                          ...gcodeConfig,
                          pierceDwell: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Origin Position
                    </label>
                    <select
                      value={gcodeConfig.origin}
                      onChange={(e) =>
                        setGcodeConfig({
                          ...gcodeConfig,
                          origin: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                    >
                      <option value="bottom-left">Bottom-Left (Standard)</option>
                      <option value="top-left">Top-Left</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gcodeConfig.includeBendLines}
                    onChange={(e) =>
                      setGcodeConfig({
                        ...gcodeConfig,
                        includeBendLines: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Mark/Etch Bend Lines with low laser power before cutting</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowGcodeModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}

/**
 * Interactive SVG Canvas component representing the sheet and nested parts
 */
function SheetCanvasSvg({ sheet, selectedPieceId, onSelectPiece, showRapids, labelMode = "badge" }) {
  const sw = sheet.sheetWidth;
  const sh = sheet.sheetHeight;
  const m = sheet.margin;

  // Generate Rapid travel points for visualization
  const rapidPathD = useMemo(() => {
    if (!showRapids || !sheet.placedPieces || sheet.placedPieces.length === 0) {
      return "";
    }
    const points = [{ x: 0, y: 0 }];
    sheet.placedPieces.forEach((p) => {
      if (p.transformedSegments && p.transformedSegments.length > 0) {
        const first = p.transformedSegments[0];
        points.push({ x: first.x, y: first.y });
      }
    });
    return points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${sh - pt.y}`).join(" ");
  }, [showRapids, sheet, sh]);

  return (
    <div className="relative w-full overflow-hidden flex justify-center items-center">
      <svg
        viewBox={`-2 -2 ${sw + 4} ${sh + 4}`}
        className="w-full max-h-[600px] select-none"
        style={{ transformOrigin: "center" }}
      >
        <defs>
          {/* Subtle grid pattern: 12 inches grid */}
          <pattern id="grid12" width="12" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M 12 0 L 0 0 0 12"
              fill="none"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="0.2"
            />
          </pattern>
        </defs>

        {/* 1. Metal Sheet Background (Dark steel color) */}
        <rect
          x="0"
          y="0"
          width={sw}
          height={sh}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="0.5"
          rx="0.5"
        />

        {/* Grid Overlay */}
        <rect x="0" y="0" width={sw} height={sh} fill="url(#grid12)" />

        {/* 2. Margin Boundary (Dashed red/white line, only shown when margin > 0) */}
        {m > 0.01 && (
          <rect
            x={m}
            y={m}
            width={sw - 2 * m}
            height={sh - 2 * m}
            fill="none"
            stroke="#ef4444"
            strokeWidth="0.3"
            strokeDasharray="2 2"
            opacity="0.6"
          />
        )}

        {/* Rapid moves G0 if enabled */}
        {showRapids && rapidPathD && (
          <path
            d={rapidPathD}
            fill="none"
            stroke="#fb923c"
            strokeWidth="0.3"
            strokeDasharray="1 1"
            opacity="0.7"
          />
        )}

        {/* 3. Nested Placed Pieces */}
        {sheet.placedPieces.map((p, idx) => {
          const isSelected = selectedPieceId === p.piece.id;
          const color = PART_COLORS[idx % PART_COLORS.length];

          // Build SVG path data for contour
          // Note: In SVG coordinate system Y goes down from top.
          // For engineering standard, we invert Y so (0,0) is bottom-left!
          const segs = p.transformedSegments || [];
          let pathD = "";

          for (const s of segs) {
            if (s.cmd === "M") {
              pathD += `M ${s.x} ${sh - s.y} `;
            } else if (s.cmd === "L") {
              pathD += `L ${s.x} ${sh - s.y} `;
            } else if (s.cmd === "A") {
              // In Cartesian CCW (s.cw === false), on screen with inverted Y,
              // sweeping from bottom-right (X, 0) to top-left (0, Y) is CCW (sweep-flag 0),
              // which bows outward to form the convex quarter-circle.
              const sweepFlag = s.cw ? 1 : 0;
              pathD += `A ${s.r} ${s.r} 0 ${s.largeArc ? 1 : 0} ${sweepFlag} ${s.x} ${sh - s.y} `;
            } else if (s.cmd === "Z") {
              pathD += "Z ";
            }
          }

          return (
            <g
              key={idx}
              onClick={() => onSelectPiece(p.piece.id)}
              className="cursor-pointer group"
            >
              {/* Native browser tooltip on hover */}
              <title>
                {`#${idx + 1}: ${p.piece.partName}\nParent: ${p.piece.parentName || "Fitting"}\nSize: ${round2(p.placedWidth)}" × ${round2(p.placedHeight)}"\nPos: X=${round2(p.x)}", Y=${round2(p.y)}"${p.rotated ? " (Rotated 90°)" : ""}`}
              </title>

              {/* Part Outer Cut Path */}
              <path
                d={pathD}
                fill={color}
                fillOpacity={isSelected ? 0.45 : 0.25}
                stroke={isSelected ? "#60a5fa" : "#e2e8f0"}
                strokeWidth={isSelected ? 0.7 : 0.4}
                className="transition-colors duration-150"
              />

              {/* Bend Lines (Fold marks) */}
              {(p.transformedBendLines || []).map((b, bi) => (
                <line
                  key={bi}
                  x1={b.x1}
                  y1={sh - b.y1}
                  x2={b.x2}
                  y2={sh - b.y2}
                  stroke="#ef4444"
                  strokeWidth="0.35"
                  strokeDasharray="1.5 1"
                />
              ))}

              {/* Part Label Badge (Clamped and bounded within part) */}
              {labelMode !== "none" && (() => {
                const cx = p.x + p.placedWidth / 2;
                const cy = sh - (p.y + p.placedHeight / 2);
                const pw = p.placedWidth;
                const ph = p.placedHeight;
                const numStr = `#${idx + 1}`;

                if (labelMode === "badge" || pw < 9 || ph < 5) {
                  // Compact Pill Badge: "#1"
                  const pillH = Math.max(1.2, Math.min(1.8, ph * 0.65));
                  const pillW = Math.max(1.8, Math.min(3.2, pw * 0.75, (numStr.length + 1) * 0.95));
                  const fs = Math.max(0.7, Math.min(1.1, pillH * 0.62, (pillW * 0.8) / (numStr.length * 0.55)));

                  return (
                    <g pointerEvents="none">
                      <rect
                        x={cx - pillW / 2}
                        y={cy - pillH / 2}
                        width={pillW}
                        height={pillH}
                        rx={pillH * 0.3}
                        fill="#0f172a"
                        fillOpacity="0.88"
                        stroke={isSelected ? "#60a5fa" : "#94a3b8"}
                        strokeWidth="0.15"
                      />
                      <text
                        x={cx}
                        y={cy}
                        fontSize={fs}
                        fill="#ffffff"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {numStr}
                      </text>
                    </g>
                  );
                }

                if (labelMode === "name") {
                  // Short Name Badge: Line 1 = "#1", Line 2 = Short Part Name
                  const cleanName = getCleanPartLabel(p.piece.partName);
                  const badgeH = Math.max(2.0, Math.min(3.2, ph * 0.75));
                  const badgeW = Math.max(3.2, Math.min(pw * 0.85, (cleanName.length + 2) * 0.7));
                  const fs1 = Math.max(0.7, Math.min(1.0, badgeH * 0.3));
                  const fs2 = Math.max(0.6, Math.min(0.85, (badgeW * 0.85) / (cleanName.length * 0.55), badgeH * 0.28));

                  return (
                    <g pointerEvents="none">
                      <rect
                        x={cx - badgeW / 2}
                        y={cy - badgeH / 2}
                        width={badgeW}
                        height={badgeH}
                        rx="0.4"
                        fill="#0f172a"
                        fillOpacity="0.88"
                        stroke={isSelected ? "#60a5fa" : "#94a3b8"}
                        strokeWidth="0.15"
                      />
                      <text
                        x={cx}
                        y={cy - badgeH * 0.22}
                        fontSize={fs1}
                        fill="#93c5fd"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {numStr}
                      </text>
                      <text
                        x={cx}
                        y={cy + badgeH * 0.24}
                        fontSize={fs2}
                        fill="#ffffff"
                        fontWeight="600"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {cleanName}
                      </text>
                    </g>
                  );
                }

                if (labelMode === "dims") {
                  // Dimensions Badge: Line 1 = "#1", Line 2 = W" × H"
                  const dimsStr = `${round2(pw)}″ × ${round2(ph)}″`;
                  const badgeH = Math.max(2.0, Math.min(3.2, ph * 0.75));
                  const badgeW = Math.max(3.5, Math.min(pw * 0.85, (dimsStr.length + 1) * 0.7));
                  const fs1 = Math.max(0.7, Math.min(1.0, badgeH * 0.3));
                  const fs2 = Math.max(0.6, Math.min(0.8, (badgeW * 0.85) / (dimsStr.length * 0.55), badgeH * 0.26));

                  return (
                    <g pointerEvents="none">
                      <rect
                        x={cx - badgeW / 2}
                        y={cy - badgeH / 2}
                        width={badgeW}
                        height={badgeH}
                        rx="0.4"
                        fill="#0f172a"
                        fillOpacity="0.88"
                        stroke={isSelected ? "#60a5fa" : "#94a3b8"}
                        strokeWidth="0.15"
                      />
                      <text
                        x={cx}
                        y={cy - badgeH * 0.22}
                        fontSize={fs1}
                        fill="#93c5fd"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {numStr}
                      </text>
                      <text
                        x={cx}
                        y={cy + badgeH * 0.24}
                        fontSize={fs2}
                        fill="#34d399"
                        fontWeight="600"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {dimsStr}
                      </text>
                    </g>
                  );
                }

                return null;
              })()}
            </g>
          );
        })}

        {/* 4. Origin Indicator (X=0, Y=0 at bottom-left) */}
        <circle cx="0" cy={sh} r="1.5" fill="#22c55e" />
        <line x1="0" y1={sh} x2="6" y2={sh} stroke="#22c55e" strokeWidth="0.6" />
        <line x1="0" y1={sh} x2="0" y2={sh - 6} stroke="#22c55e" strokeWidth="0.6" />
        <text x="7" y={sh - 1} fontSize="2.5" fill="#22c55e" fontWeight="bold">
          X+
        </text>
        <text x="1" y={sh - 7} fontSize="2.5" fill="#22c55e" fontWeight="bold">
          Y+
        </text>
      </svg>
    </div>
  );
}
