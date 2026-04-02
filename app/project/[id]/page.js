"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../../../lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  OffsetDrawing,
  ElbowDrawing,
} from "../../../components/FittingDrawings";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [showFittingSelector, setShowFittingSelector] = useState(false);
  const [selectedFitting, setSelectedFitting] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const shopEmail = "shop@hvacshop.ca";

  const [straightForm, setStraightForm] = useState({
    width: "",
    height: "",
    length: "",
    quantity: "1",
    insulated: false,
  });

  const [elbowForm, setElbowForm] = useState({
    width: "",
    height: "",
    angle: "90",
    radius: "",
    quantity: "1",
    insulated: false,
    bendType: "short",
  });

  const [transitionForm, setTransitionForm] = useState({
    width1: "",
    height1: "",
    width2: "",
    height2: "",
    length: "",
    quantity: "1",
    insulated: false,
  });

  const [offsetForm, setOffsetForm] = useState({
    width: "",
    height: "",
    offset: "",
    length: "",
    quantity: "1",
    insulated: false,
    direction: "right",
  });

  useEffect(() => {
    if (!params.id) return;

    const projectRef = doc(db, "projects", params.id);

    const unsubscribe = onSnapshot(projectRef, (snapshot) => {
      if (!snapshot.exists()) {
        setProject(null);
        setItems([]);
        return;
      }

      const projectData = {
        id: snapshot.id,
        ...snapshot.data(),
      };

      setProject(projectData);
      setItems(projectData.items || []);
    });

    return () => unsubscribe();
  }, [params.id]);

  const saveItemsToProject = async (updatedItems) => {
    if (!params.id) return;

    const projectRef = doc(db, "projects", params.id);

    await updateDoc(projectRef, {
      items: updatedItems,
    });
  };

  const updateItemInProject = async (updatedItem) => {
    if (editingIndex === null) return;

    const updatedItems = items.map((item, index) =>
      index === editingIndex ? updatedItem : item
    );

    await saveItemsToProject(updatedItems);
    setEditingIndex(null);
    setSelectedFitting(null);
  };

  const handleDeleteItem = async (indexToDelete) => {
    const updatedItems = items.filter((_, index) => index !== indexToDelete);
    await saveItemsToProject(updatedItems);
  };

  const handleEditItem = (item, index) => {
    setEditingIndex(index);
    setSelectedFitting(item.type);
    setShowFittingSelector(false);

    if (item.type === "Straight") {
      setStraightForm({
        width: item.width || "",
        height: item.height || "",
        length: item.length || "",
        quantity: item.quantity || "1",
        insulated: item.insulated || false,
      });
    }

    if (item.type === "Elbow") {
      setElbowForm({
        width: item.width || "",
        height: item.height || "",
        angle: item.angle || "90",
        radius: item.radius || "",
        quantity: item.quantity || "1",
        insulated: item.insulated || false,
        bendType: item.bendType || "short",
      });
    }

    if (item.type === "Transition") {
      setTransitionForm({
        width1: item.width1 || "",
        height1: item.height1 || "",
        width2: item.width2 || "",
        height2: item.height2 || "",
        length: item.length || "",
        quantity: item.quantity || "1",
        insulated: item.insulated || false,
      });
    }

    if (item.type === "Offset") {
      setOffsetForm({
        width: item.width || "",
        height: item.height || "",
        offset: item.offset || "",
        length: item.length || "",
        quantity: item.quantity || "1",
        insulated: item.insulated || false,
        direction: item.direction || "right",
      });
    }
  };

  const handleSelectFitting = (type) => {
    setEditingIndex(null);
    setSelectedFitting(type);
    setShowFittingSelector(false);
  };

  const handleStraightChange = (field, value) => {
    setStraightForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleElbowChange = (field, value) => {
    setElbowForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTransitionChange = (field, value) => {
    setTransitionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOffsetChange = (field, value) => {
    setOffsetForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddStraight = async () => {
    if (
      !straightForm.width.trim() ||
      !straightForm.height.trim() ||
      !straightForm.length.trim() ||
      !straightForm.quantity.trim()
    ) {
      return;
    }

    const newItem = {
      type: "Straight",
      width: straightForm.width,
      height: straightForm.height,
      length: straightForm.length,
      quantity: straightForm.quantity,
      insulated: straightForm.insulated,
    };

    if (editingIndex !== null) {
      await updateItemInProject(newItem);
    } else {
      const updatedItems = [...items, newItem];
      await saveItemsToProject(updatedItems);
      setSelectedFitting(null);
    }

    setStraightForm({
      width: "",
      height: "",
      length: "",
      quantity: "1",
      insulated: false,
    });
  };

  const handleAddElbow = async () => {
    if (
      !elbowForm.width.trim() ||
      !elbowForm.height.trim() ||
      !elbowForm.angle.trim() ||
      !elbowForm.radius.trim() ||
      !elbowForm.quantity.trim()
    ) {
      return;
    }

    const newItem = {
      type: "Elbow",
      width: elbowForm.width,
      height: elbowForm.height,
      angle: elbowForm.angle,
      radius: elbowForm.radius,
      quantity: elbowForm.quantity,
      insulated: elbowForm.insulated,
      bendType: elbowForm.bendType,
    };

    if (editingIndex !== null) {
      await updateItemInProject(newItem);
    } else {
      const updatedItems = [...items, newItem];
      await saveItemsToProject(updatedItems);
      setSelectedFitting(null);
    }

    setElbowForm({
      width: "",
      height: "",
      angle: "90",
      radius: "",
      quantity: "1",
      insulated: false,
      bendType: "short",
    });
  };

  const handleAddTransition = async () => {
    if (
      !transitionForm.width1.trim() ||
      !transitionForm.height1.trim() ||
      !transitionForm.width2.trim() ||
      !transitionForm.height2.trim() ||
      !transitionForm.length.trim() ||
      !transitionForm.quantity.trim()
    ) {
      return;
    }

    const newItem = {
      type: "Transition",
      width1: transitionForm.width1,
      height1: transitionForm.height1,
      width2: transitionForm.width2,
      height2: transitionForm.height2,
      length: transitionForm.length,
      quantity: transitionForm.quantity,
      insulated: transitionForm.insulated,
    };

    if (editingIndex !== null) {
      await updateItemInProject(newItem);
    } else {
      const updatedItems = [...items, newItem];
      await saveItemsToProject(updatedItems);
      setSelectedFitting(null);
    }

    setTransitionForm({
      width1: "",
      height1: "",
      width2: "",
      height2: "",
      length: "",
      quantity: "1",
      insulated: false,
    });
  };

  const handleAddOffset = async () => {
    if (
      !offsetForm.width.trim() ||
      !offsetForm.height.trim() ||
      !offsetForm.offset.trim() ||
      !offsetForm.length.trim() ||
      !offsetForm.quantity.trim()
    ) {
      return;
    }

    const newItem = {
      type: "Offset",
      width: offsetForm.width,
      height: offsetForm.height,
      offset: offsetForm.offset,
      length: offsetForm.length,
      quantity: offsetForm.quantity,
      insulated: offsetForm.insulated,
      direction: offsetForm.direction,
    };

    if (editingIndex !== null) {
      await updateItemInProject(newItem);
    } else {
      const updatedItems = [...items, newItem];
      await saveItemsToProject(updatedItems);
      setSelectedFitting(null);
    }

    setOffsetForm({
      width: "",
      height: "",
      offset: "",
      length: "",
      quantity: "1",
      insulated: false,
      direction: "right",
    });
  };

  const renderItemLabel = (item) => {
    if (item.type === "Straight") {
      return `Straight ${item.width}x${item.height} L${item.length} Qty ${item.quantity}${item.insulated ? " INS" : ""}`;
    }

    if (item.type === "Elbow") {
      return `Elbow ${item.width}x${item.height} ${item.angle}° R${item.radius} ${
        item.bendType === "long" ? "Long Way" : "Short Way"
      } Qty ${item.quantity}${item.insulated ? " INS" : ""}`;
    }

    if (item.type === "Transition") {
      return `Transition ${item.width1}x${item.height1} -> ${item.width2}x${item.height2} L${item.length} Qty ${item.quantity}${item.insulated ? " INS" : ""}`;
    }

    if (item.type === "Offset") {
      return `Offset ${item.width}x${item.height} O${item.offset} L${item.length} ${item.direction} Qty ${item.quantity}${item.insulated ? " INS" : ""}`;
    }

    return item.type;
  };

  const handleExportPDF = () => {
    if (!project) return;

    const docPdf = new jsPDF();

    docPdf.setFontSize(18);
    docPdf.text("HVAC Duct Order", 14, 20);

    docPdf.setFontSize(12);
    docPdf.text(`Project: ${project.name}`, 14, 30);
    docPdf.text(`Total items: ${items.length}`, 14, 38);

    const tableRows = items.map((item, index) => {
      if (item.type === "Straight") {
        return [
          index + 1,
          "Straight",
          item.width,
          item.height,
          item.length,
          "-",
          "-",
          item.insulated ? "Yes" : "No",
          item.quantity,
        ];
      }

      if (item.type === "Elbow") {
        return [
          index + 1,
          `Elbow ${item.bendType === "long" ? "Long Way" : "Short Way"}`,
          item.width,
          item.height,
          "-",
          item.angle,
          item.radius,
          item.insulated ? "Yes" : "No",
          item.quantity,
        ];
      }

      if (item.type === "Transition") {
        return [
          index + 1,
          `Transition ${item.width1}x${item.height1} -> ${item.width2}x${item.height2}`,
          "-",
          "-",
          item.length,
          "-",
          "-",
          item.insulated ? "Yes" : "No",
          item.quantity,
        ];
      }

      if (item.type === "Offset") {
        return [
          index + 1,
          `Offset ${item.direction}`,
          item.width,
          item.height,
          item.length,
          `O${item.offset}`,
          "-",
          item.insulated ? "Yes" : "No",
          item.quantity,
        ];
      }

      return [
        index + 1,
        item.type,
        "-",
        "-",
        "-",
        "-",
        "-",
        item.insulated ? "Yes" : "No",
        item.quantity || "-",
      ];
    });

    autoTable(docPdf, {
      startY: 48,
      head: [[
        "#",
        "Type",
        "Width",
        "Height",
        "Length",
        "Angle/Offset",
        "Radius",
        "Insulated",
        "Qty",
      ]],
      body: tableRows,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
      },
    });

    const fileName = `${project.name.replace(/\s+/g, "_")}_duct_order.pdf`;
    docPdf.save(fileName);
  };

  const handleSendToShop = () => {
    if (!project) return;

    const subject = `HVAC Duct Order - ${project.name}`;

    let body = `Project: ${project.name}\n`;
    body += `Total items: ${items.length}\n\n`;
    body += `Items:\n`;

    if (items.length === 0) {
      body += "No items in order.\n";
    } else {
      items.forEach((item, index) => {
        body += `${index + 1}. ${renderItemLabel(item)}\n`;
      });
    }

    const mailtoLink = `mailto:${shopEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleBackFromForm = () => {
    setSelectedFitting(null);
    setEditingIndex(null);
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <button
        onClick={() => router.push("/")}
        className="mb-4 text-blue-600 font-medium hover:underline"
      >
        ← Back to Projects
      </button>

      <h1 className="text-3xl font-bold mb-6">
        {project ? project.name : "Project not found"}
      </h1>

      {!showFittingSelector && !selectedFitting && (
        <>
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setShowFittingSelector(true)}
              className="w-full bg-green-600 text-white py-3 rounded-xl text-lg"
            >
              + Add Fitting
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg"
            >
              Export PDF
            </button>

            <button
              onClick={handleSendToShop}
              className="w-full bg-gray-900 text-white py-3 rounded-xl text-lg"
            >
              Send to Shop
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500">No fittings yet</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="text-lg font-medium">{renderItemLabel(item)}</p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => handleEditItem(item, index)}
                      className="border border-blue-300 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="border border-red-300 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showFittingSelector && !selectedFitting && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Select Fitting</h2>

          <div className="grid grid-cols-1 gap-3 mb-6">
            <button
              onClick={() => handleSelectFitting("Straight")}
              className="w-full border rounded-xl p-4 text-left text-lg hover:bg-gray-50"
            >
              Straight
            </button>

            <button
              onClick={() => handleSelectFitting("Elbow")}
              className="w-full border rounded-xl p-4 text-left text-lg hover:bg-gray-50"
            >
              Elbow
            </button>

            <button
              onClick={() => handleSelectFitting("Transition")}
              className="w-full border rounded-xl p-4 text-left text-lg hover:bg-gray-50"
            >
              Transition
            </button>

            <button
              onClick={() => handleSelectFitting("Offset")}
              className="w-full border rounded-xl p-4 text-left text-lg hover:bg-gray-50"
            >
              Offset
            </button>
          </div>

          <button
            onClick={() => setShowFittingSelector(false)}
            className="w-full border py-3 rounded-xl text-lg"
          >
            Cancel
          </button>
        </>
      )}

      {selectedFitting === "Straight" && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Straight Duct</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Width</label>
              <input
                type="number"
                value={straightForm.width}
                onChange={(e) => handleStraightChange("width", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="14"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Height</label>
              <input
                type="number"
                value={straightForm.height}
                onChange={(e) => handleStraightChange("height", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Length</label>
              <input
                type="number"
                value={straightForm.length}
                onChange={(e) => handleStraightChange("length", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="60"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                value={straightForm.quantity}
                onChange={(e) => handleStraightChange("quantity", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="1"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="straight-insulated"
                type="checkbox"
                checked={straightForm.insulated}
                onChange={(e) =>
                  handleStraightChange("insulated", e.target.checked)
                }
                className="h-5 w-5"
              />
              <label htmlFor="straight-insulated" className="font-medium">
                Insulated
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddStraight}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg"
            >
              {editingIndex !== null ? "Save Changes" : "Add to Order"}
            </button>

            <button
              onClick={handleBackFromForm}
              className="w-full border py-3 rounded-xl text-lg"
            >
              Back
            </button>
          </div>
        </>
      )}

      {selectedFitting === "Elbow" && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Rectangular Elbow</h2>

          <div className="mb-6 rounded-xl border p-4 bg-gray-50">
            <ElbowDrawing bendType={elbowForm.bendType} />
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Width</label>
              <input
                type="number"
                value={elbowForm.width}
                onChange={(e) => handleElbowChange("width", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="14"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Height</label>
              <input
                type="number"
                value={elbowForm.height}
                onChange={(e) => handleElbowChange("height", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Angle</label>
              <select
                value={elbowForm.angle}
                onChange={(e) => handleElbowChange("angle", e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="90">90°</option>
                <option value="45">45°</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Bend Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleElbowChange("bendType", "short")}
                  className={`rounded-xl border p-3 text-sm ${
                    elbowForm.bendType === "short"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300"
                  }`}
                >
                  Short Way
                </button>

                <button
                  type="button"
                  onClick={() => handleElbowChange("bendType", "long")}
                  className={`rounded-xl border p-3 text-sm ${
                    elbowForm.bendType === "long"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300"
                  }`}
                >
                  Long Way
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Radius</label>
              <input
                type="number"
                value={elbowForm.radius}
                onChange={(e) => handleElbowChange("radius", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                value={elbowForm.quantity}
                onChange={(e) => handleElbowChange("quantity", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="1"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="elbow-insulated"
                type="checkbox"
                checked={elbowForm.insulated}
                onChange={(e) =>
                  handleElbowChange("insulated", e.target.checked)
                }
                className="h-5 w-5"
              />
              <label htmlFor="elbow-insulated" className="font-medium">
                Insulated
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddElbow}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg"
            >
              {editingIndex !== null ? "Save Changes" : "Add to Order"}
            </button>

            <button
              onClick={handleBackFromForm}
              className="w-full border py-3 rounded-xl text-lg"
            >
              Back
            </button>
          </div>
        </>
      )}

      {selectedFitting === "Transition" && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Rectangular Transition</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Width 1</label>
              <input
                type="number"
                value={transitionForm.width1}
                onChange={(e) =>
                  handleTransitionChange("width1", e.target.value)
                }
                className="w-full border rounded-xl p-3"
                placeholder="14"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Height 1</label>
              <input
                type="number"
                value={transitionForm.height1}
                onChange={(e) =>
                  handleTransitionChange("height1", e.target.value)
                }
                className="w-full border rounded-xl p-3"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Width 2</label>
              <input
                type="number"
                value={transitionForm.width2}
                onChange={(e) =>
                  handleTransitionChange("width2", e.target.value)
                }
                className="w-full border rounded-xl p-3"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Height 2</label>
              <input
                type="number"
                value={transitionForm.height2}
                onChange={(e) =>
                  handleTransitionChange("height2", e.target.value)
                }
                className="w-full border rounded-xl p-3"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Length</label>
              <input
                type="number"
                value={transitionForm.length}
                onChange={(e) =>
                  handleTransitionChange("length", e.target.value)
                }
                className="w-full border rounded-xl p-3"
                placeholder="12"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                value={transitionForm.quantity}
                onChange={(e) =>
                  handleTransitionChange("quantity", e.target.value)
                }
                className="w-full border rounded-xl p-3"
                placeholder="1"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="transition-insulated"
                type="checkbox"
                checked={transitionForm.insulated}
                onChange={(e) =>
                  handleTransitionChange("insulated", e.target.checked)
                }
                className="h-5 w-5"
              />
              <label htmlFor="transition-insulated" className="font-medium">
                Insulated
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddTransition}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg"
            >
              {editingIndex !== null ? "Save Changes" : "Add to Order"}
            </button>

            <button
              onClick={handleBackFromForm}
              className="w-full border py-3 rounded-xl text-lg"
            >
              Back
            </button>
          </div>
        </>
      )}

      {selectedFitting === "Offset" && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Rectangular Offset</h2>

          <div className="mb-6 rounded-xl border p-4 bg-gray-50">
            <OffsetDrawing direction={offsetForm.direction} />
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Width</label>
              <input
                type="number"
                value={offsetForm.width}
                onChange={(e) => handleOffsetChange("width", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="14"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Height</label>
              <input
                type="number"
                value={offsetForm.height}
                onChange={(e) => handleOffsetChange("height", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Offset Distance</label>
              <input
                type="number"
                value={offsetForm.offset}
                onChange={(e) => handleOffsetChange("offset", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="12"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOffsetChange("direction", "left")}
                  className={`rounded-xl border p-3 text-sm ${
                    offsetForm.direction === "left"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300"
                  }`}
                >
                  Left
                </button>

                <button
                  type="button"
                  onClick={() => handleOffsetChange("direction", "right")}
                  className={`rounded-xl border p-3 text-sm ${
                    offsetForm.direction === "right"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300"
                  }`}
                >
                  Right
                </button>

                <button
                  type="button"
                  onClick={() => handleOffsetChange("direction", "up")}
                  className={`rounded-xl border p-3 text-sm ${
                    offsetForm.direction === "up"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300"
                  }`}
                >
                  Up
                </button>

                <button
                  type="button"
                  onClick={() => handleOffsetChange("direction", "down")}
                  className={`rounded-xl border p-3 text-sm ${
                    offsetForm.direction === "down"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300"
                  }`}
                >
                  Down
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium">Length</label>
              <input
                type="number"
                value={offsetForm.length}
                onChange={(e) => handleOffsetChange("length", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                value={offsetForm.quantity}
                onChange={(e) => handleOffsetChange("quantity", e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="1"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="offset-insulated"
                type="checkbox"
                checked={offsetForm.insulated}
                onChange={(e) =>
                  handleOffsetChange("insulated", e.target.checked)
                }
                className="h-5 w-5"
              />
              <label htmlFor="offset-insulated" className="font-medium">
                Insulated
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddOffset}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg"
            >
              {editingIndex !== null ? "Save Changes" : "Add to Order"}
            </button>

            <button
              onClick={handleBackFromForm}
              className="w-full border py-3 rounded-xl text-lg"
            >
              Back
            </button>
          </div>
        </>
      )}
    </main>
  );
}