"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  OffsetDrawing,
  ElbowDrawing,
  TransitionDrawing,
  StraightDrawing,
} from "../../../../../components/FittingDrawings";
import {
  StraightFlatPattern,
  ElbowFlatPattern,
  TransitionFlatPattern,
  OffsetFlatPattern,
} from "../../../../../components/FabricationDrawings";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as htmlToImage from "html-to-image";
import { createRoot } from "react-dom/client";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getAutoElbowBendType(width, height) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;

  return h >= w ? "short" : "long";
}

function getStatusClasses(status) {
  if (status === "Done") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "In Progress") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
}

function createEmptyItem(type) {
  const base = {
    id: crypto.randomUUID(),
    type,
    name: "",
    quantity: 1,
    insulated: false,
    createdAt: Date.now(),
  };

  if (type === "straight") {
    return {
      ...base,
      name: "Straight",
      width: "",
      height: "",
      length: "",
    };
  }

    if (type === "elbow") {
    return {
        ...base,
        name: "Elbow",
        width: "",
        height: "",
        radius: "",
        angle: "90",
    };
    }

  if (type === "transition") {
    return {
      ...base,
      name: "Transition",
      width1: "",
      height1: "",
      width2: "",
      height2: "",
      length: "",
      justification: "center",
    };
  }

  return {
    ...base,
    name: "Offset",
    width: "",
    height: "",
    length: "",
    offset: "",
    direction: "right",
  };
}

function FittingPreview({ item }) {
        if (item.type === "straight") {
        return (
            <div className="space-y-3">
            <StraightDrawing
                width={item.width}
                height={item.height}
                length={item.length}
                className="w-full max-w-sm"
            />

            <StraightFlatPattern
                width={item.width}
                height={item.height}
                length={item.length}
                className="w-full"
            />
            </div>
        );
        }

  if (item.type === "elbow") {
    return (
      <div className="space-y-3">
        <ElbowDrawing
        bendType={getAutoElbowBendType(item.width, item.height)}
        width={item.width}
        height={item.height}
        radius={item.radius}
        angle={item.angle}
        className="w-full max-w-sm"
        />

        <ElbowFlatPattern
        width={item.width}
        height={item.height}
        radius={item.radius}
        angle={item.angle}
        bendType={getAutoElbowBendType(item.width, item.height)}
        className="w-full"
        />
      </div>
    );
  }

  if (item.type === "transition") {
    return (
        <div className="space-y-3">
        <TransitionDrawing
            justification={item.justification}
            width1={item.width1}
            height1={item.height1}
            width2={item.width2}
            height2={item.height2}
            length={item.length}
            className="w-full max-w-sm"
        />

        <TransitionFlatPattern
            justification={item.justification}
            width1={item.width1}
            height1={item.height1}
            width2={item.width2}
            height2={item.height2}
            length={item.length}
            className="w-full"
        />
        </div>
    );
  }

  if (item.type === "offset") {
    return (
        <div className="space-y-3">
        <OffsetDrawing
            direction={item.direction}
            width={item.width}
            height={item.height}
            length={item.length}
            offset={item.offset}
            className="w-full max-w-sm"
        />

        <OffsetFlatPattern
            direction={item.direction}
            width={item.width}
            height={item.height}
            length={item.length}
            offset={item.offset}
            className="w-full"
        />
        </div>
    );
  }

  return null;
}

function validateOffsetDimensions(item) {
  if (item.type !== "offset") {
    return { isValid: true, message: "" };
  }

  const direction = item.direction || "right";
  const width = Number(item.width) || 0;
  const height = Number(item.height) || 0;
  const length = Number(item.length) || 0;
  const offset = Number(item.offset) || 0;

  if (direction === "right" || direction === "left") {
    if (length < offset + width) {
      return {
        isValid: false,
        message:
          "For Offset Right/Left, Length must be greater than or equal to Offset + Width.",
      };
    }
  }

  if (direction === "up" || direction === "down") {
    if (length < offset + height) {
      return {
        isValid: false,
        message:
          "For Offset Up/Down, Length must be greater than or equal to Offset + Height.",
      };
    }
  }

  return { isValid: true, message: "" };
}

function FabricationDrawingForPdf({ item }) {
  if (item.type === "straight") {
    return (
      <StraightFlatPattern
        width={item.width}
        height={item.height}
        length={item.length}
        className="w-[900px]"
      />
    );
  }

  if (item.type === "elbow") {
    return (
      <ElbowFlatPattern
        width={item.width}
        height={item.height}
        radius={item.radius}
        angle={item.angle}
        bendType={item.bendType}
        className="w-[900px]"
      />
    );
  }

  if (item.type === "transition") {
    return (
      <TransitionFlatPattern
        justification={item.justification}
        width1={item.width1}
        height1={item.height1}
        width2={item.width2}
        height2={item.height2}
        length={item.length}
        className="w-[900px]"
      />
    );
  }

  if (item.type === "offset") {
    return (
      <OffsetFlatPattern
        direction={item.direction}
        width={item.width}
        height={item.height}
        length={item.length}
        offset={item.offset}
        className="w-[900px]"
      />
    );
  }

  return <div>Unsupported drawing</div>;
}

async function renderDrawingToPng(item) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "950px";
  container.style.background = "white";
  container.style.padding = "16px";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<FabricationDrawingForPdf item={item} />);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const svgNode = container.querySelector("svg");
  if (!svgNode) {
    root.unmount();
    document.body.removeChild(container);
    throw new Error("SVG not found in rendered drawing.");
  }

  const dataUrl = await htmlToImage.toPng(svgNode, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  root.unmount();
  document.body.removeChild(container);

  return dataUrl;
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id;
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);
  const [notesValue, setNotesValue] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [itemType, setItemType] = useState("straight");
  const [newItem, setNewItem] = useState(createEmptyItem("straight"));
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [expandedDrawingId, setExpandedDrawingId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [foremanNameValue, setForemanNameValue] = useState("");

  useEffect(() => {
    if (!projectId || !orderId) return;

    const orderRef = doc(db, "projects", projectId, "orders", orderId);

    const unsubscribe = onSnapshot(orderRef, (snapshot) => {
      if (!snapshot.exists()) {
        setOrder(null);
        return;
      }

      const data = {
        id: snapshot.id,
        ...snapshot.data(),
      };

        setOrder(data);
        setNotesValue(data.notes || "");
        setForemanNameValue(data.foremanName || "");
    });

    return () => unsubscribe();
  }, [projectId, orderId]);


  const items = useMemo(() => {
    if (!order?.items || !Array.isArray(order.items)) return [];
    return order.items;
  }, [order]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }, [items]);

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!order) return;

    try {
      await updateDoc(doc(db, "projects", projectId, "orders", orderId), {
        status: newStatus,
      });

      setOrder((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const handleSaveNotes = async () => {
    if (!order) return;

    setIsSavingNotes(true);

    try {
      await updateDoc(doc(db, "projects", projectId, "orders", orderId), {
        notes: notesValue.trim(),
        foremanName: foremanNameValue.trim(),
      });

      setOrder((prev) => ({
        ...prev,
        notes: notesValue.trim(),
        foremanName: foremanNameValue.trim(),
      }));

      setIsEditingNotes(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

 const handleSaveItem = async () => {
  if (!order) return;

    const preparedItem = {
    ...newItem,
    quantity: Number(newItem.quantity) || 1,
    ...(newItem.type === "elbow"
        ? {
            bendType: getAutoElbowBendType(newItem.width, newItem.height),
        }
        : {}),
    };
  const offsetValidation = validateOffsetDimensions(preparedItem);

  if (!offsetValidation.isValid) {
    alert(offsetValidation.message);
    return;
  }

  setIsSavingItem(true);

  try {
    let nextItems = [];

    if (editingItemId) {
      nextItems = items.map((item) =>
        item.id === editingItemId ? { ...preparedItem, id: editingItemId } : item
      );
    } else {
      nextItems = [...items, preparedItem];
    }

    await updateDoc(doc(db, "projects", projectId, "orders", orderId), {
      items: nextItems,
    });

    setOrder((prev) => ({
      ...prev,
      items: nextItems,
    }));

    setShowItemModal(false);
    setEditingItemId(null);
    setItemType("straight");
    setNewItem(createEmptyItem("straight"));
  } catch (error) {
    console.error("Error saving item:", error);
    alert("Failed to save item");
  } finally {
    setIsSavingItem(false);
  }
};

  const handleDeleteItem = async (itemId) => {
    if (!order) return;

    try {
      const nextItems = items.filter((item) => item.id !== itemId);

      await updateDoc(doc(db, "projects", projectId, "orders", orderId), {
        items: nextItems,
      });

      setOrder((prev) => ({
        ...prev,
        items: nextItems,
      }));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

    const handleEditItem = (item) => {
        setEditingItemId(item.id);
        setItemType(item.type);
        setNewItem({
            ...item,
            quantity: item.quantity || 1,
            insulated: !!item.insulated,
        });
        setShowItemModal(true);
    };

  const updateNewItemField = (field, value) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!order) {
    return (
        <main className="w-full max-w-screen-sm mx-auto px-4 py-4 bg-white text-gray-900 min-h-screen">        <button
          onClick={() => router.push(`/project/${projectId}`)}
          className="mb-4 text-blue-700 font-medium hover:underline"
        >
          ← Back to Project
        </button>

        <p className="text-gray-900">Loading order...</p>
      </main>
    );
  }

const handleSaveOrderPdf = async () => {
  if (!order) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;

  pdf.setFontSize(18);
  pdf.text(order.name || "Order", margin, 18);

  pdf.setFontSize(11);
  pdf.text(`Date: ${order.date || "-"}`, margin, 28);
  pdf.text(`Foreman: ${order.foremanName || "-"}`, margin, 35);
  pdf.text(`Status: ${order.status || "Active"}`, margin, 42);

  const notesText = pdf.splitTextToSize(`Notes: ${order.notes || "-"}`, 180);
  pdf.text(notesText, margin, 52);

  let currentY = 52 + notesText.length * 6 + 6;

  autoTable(pdf, {
    startY: currentY,
    head: [["Item", "Type", "Qty", "Insulated", "Details"]],
    body: items.map((item, index) => [
      `${index + 1}. ${item.name || item.type || "-"}`,
      item.type || "-",
      String(item.quantity || 1),
      item.insulated ? "Yes" : "No",
      item.type === "straight"
        ? `W:${item.width || "-"} H:${item.height || "-"} L:${item.length || "-"}`
        : item.type === "elbow"
        ? `W:${item.width || "-"} H:${item.height || "-"} R:${item.radius || "-"} A:${item.angle || "-"}`
        : item.type === "transition"
        ? `IN:${item.width1 || "-"}x${item.height1 || "-"} OUT:${item.width2 || "-"}x${item.height2 || "-"} L:${item.length || "-"}`
        : item.type === "offset"
        ? `W:${item.width || "-"} H:${item.height || "-"} L:${item.length || "-"} O:${item.offset || "-"} Dir:${item.direction || "-"}`
        : "-",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  currentY = (pdf.lastAutoTable?.finalY || currentY) + 8;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (currentY > pageHeight - 90) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFontSize(12);
    pdf.text(
      `${i + 1}. ${item.name || item.type || "Item"} Drawing`,
      margin,
      currentY
    );
    currentY += 4;

    try {
      const dataUrl = await renderDrawingToPng(item);

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = 70;

      if (currentY + imgHeight > pageHeight - 10) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.addImage(dataUrl, "PNG", margin, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10;
    } catch (error) {
      console.error("Failed to render drawing for PDF:", error);
      pdf.setFontSize(10);
      pdf.text("Drawing could not be rendered.", margin, currentY + 8);
      currentY += 16;
    }
  }

  pdf.save(`${(order.name || "order").replace(/\s+/g, "_")}.pdf`);
};

const handleSendOrderEmail = () => {
  if (!order) return;

  const subject = encodeURIComponent(`Order: ${order.name || "Order"}`);

  const body = encodeURIComponent(
    [
      `Order: ${order.name || "-"}`,
      `Date: ${order.date || "-"}`,
      `Foreman: ${order.foremanName || "-"}`,
      `Status: ${order.status || "Active"}`,
      "",
      `Notes:`,
      `${order.notes || "-"}`,
      "",
      `Items:`,
      ...items.map((item, index) => {
        const details =
          item.type === "straight"
            ? `W:${item.width || "-"} H:${item.height || "-"} L:${item.length || "-"}`
            : item.type === "elbow"
            ? `W:${item.width || "-"} H:${item.height || "-"} R:${item.radius || "-"} A:${item.angle || "-"}`
            : item.type === "transition"
            ? `IN:${item.width1 || "-"}x${item.height1 || "-"} OUT:${item.width2 || "-"}x${item.height2 || "-"} L:${item.length || "-"}`
            : item.type === "offset"
            ? `W:${item.width || "-"} H:${item.height || "-"} L:${item.length || "-"} O:${item.offset || "-"} Dir:${item.direction || "-"}`
            : "-";

        return `${index + 1}. ${item.name || item.type || "-"} | Qty: ${
          item.quantity || 1
        } | ${item.insulated ? "Insulated" : "Not insulated"} | ${details}`;
      }),
    ].join("\n")
  );

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

  return (
        <main className="w-full max-w-screen-sm mx-auto px-4 py-4 bg-white text-gray-900 min-h-screen">      <button
        onClick={() => router.push(`/project/${projectId}`)}
        className="mb-4 text-blue-700 font-medium hover:underline"
      >
        ← Back to Project
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{order.name}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
            <button
            onClick={handleSaveOrderPdf}
            className="text-sm border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg whitespace-nowrap"
            >
            Save PDF
            </button>

            <button
            onClick={handleSendOrderEmail}
            className="text-sm border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg whitespace-nowrap"
            >
            Send by Email
            </button>
        </div>
        </div>

      <div className="mb-6 rounded-xl border border-gray-300 bg-white p-4 space-y-4">
        <div className="relative">
  <div className="flex items-center gap-3 flex-wrap">
    <span className="text-sm font-semibold text-gray-900">Status:</span>

    <button
      onClick={() => setShowStatusMenu((prev) => !prev)}
      className={`text-sm px-3 py-2 rounded-lg border font-medium min-w-[140px] text-left ${getStatusClasses(
        order?.status || "Active"
      )}`}
    >
      {order?.status || "Active"}
    </button>
  </div>

  {showStatusMenu && (
    <div className="mt-2 w-[180px] rounded-xl border border-gray-300 bg-white shadow-lg overflow-hidden">
      <button
        onClick={() => {
          handleUpdateOrderStatus("Active");
          setShowStatusMenu(false);
        }}
        className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100"
      >
        Active
      </button>

      <button
        onClick={() => {
          handleUpdateOrderStatus("In Progress");
          setShowStatusMenu(false);
        }}
        className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100"
      >
        In Progress
      </button>

      <button
        onClick={() => {
          handleUpdateOrderStatus("Done");
          setShowStatusMenu(false);
        }}
        className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100"
      >
        Done
      </button>
    </div>
  )}
</div>

        <div className="space-y-1 text-sm text-gray-900">
            <p>
                <span className="font-semibold">Order Date:</span> {order.date || "-"}
            </p>

            <p>
                <span className="font-semibold">Foreman:</span>{" "}
                {order.foremanName || "-"}
            </p>    

            <p>
                <span className="font-semibold">Items:</span> {items.length}
            </p>

            <p>
                <span className="font-semibold">Total Qty:</span> {totalQuantity}
            </p>
        </div>

        <div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Notes for shop</span>

            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-sm text-blue-700 font-medium"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="text-sm text-green-600 font-medium disabled:opacity-50"
                >
                    {isSavingNotes ? "Saving..." : "Save"}
                </button>

                <button
                    onClick={() => {
                    setIsEditingNotes(false);
                    setNotesValue(order?.notes || "");
                    setForemanNameValue(order?.foremanName || "");
                    }}
                    className="text-sm text-gray-700 font-medium"
                >
                    Cancel
                </button>
                </div>
            )}
          </div>

          {!isEditingNotes ? (
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {order.notes || "-"}
            </p>
          ) : (
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg p-3 text-sm min-h-[110px]"
              placeholder="Notes for shop"
            />
          )}
        </div>
      </div>

        <button
        onClick={() => {
            setEditingItemId(null);
            setItemType("straight");
            setNewItem(createEmptyItem("straight"));
            setShowItemModal(true);
        }}
        className="w-full sm:w-auto bg-blue-700 text-white px-5 py-3 rounded-xl mb-6 text-base font-medium"
        >
        + Add Fitting
        </button>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-700">
          No items yet
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
                key={item.id}
                className="w-full rounded-xl border border-gray-300 bg-white p-4 shadow-sm"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">
                    {index + 1}. {item.name || item.type}
                    </h2>

                    <p className="text-sm text-gray-700 mt-1">
                        {item.insulated ? "Insulated" : "Not insulated"}
                    </p>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-800">
                    {item.type === "straight" && (
                        <>
                        <div>W: {item.width || "-"}</div>
                        <div>H: {item.height || "-"}</div>
                        <div>L: {item.length || "-"}</div>
                        <div>Qty: {item.quantity || 1}</div>
                        </>
                    )}

                    {item.type === "elbow" && (
                        <>
                        <div>W: {item.width || "-"}</div>
                        <div>H: {item.height || "-"}</div>
                        <div>R: {item.radius || "-"}</div>
                        <div>Angle: {item.angle || "-"}</div>
                        <div>
                            Bend:{" "}
                            {getAutoElbowBendType(item.width, item.height) === "short"
                                ? "Short Way"
                                : "Long Way"}
                        </div>
                        <div>Qty: {item.quantity || 1}</div>
                        </>
                    )}

                    {item.type === "transition" && (
                        <>
                        <div>IN W: {item.width1 || "-"}</div>
                        <div>IN H: {item.height1 || "-"}</div>
                        <div>OUT W: {item.width2 || "-"}</div>
                        <div>OUT H: {item.height2 || "-"}</div>
                        <div>L: {item.length || "-"}</div>
                        <div>Just: {item.justification || "-"}</div>
                        <div>Qty: {item.quantity || 1}</div>
                        </>
                    )}

                    {item.type === "offset" && (
                        <>
                        <div>W: {item.width || "-"}</div>
                        <div>H: {item.height || "-"}</div>
                        <div>L: {item.length || "-"}</div>
                        <div>Offset: {item.offset || "-"}</div>
                        <div>Dir: {item.direction || "-"}</div>
                        <div>Qty: {item.quantity || 1}</div>
                        </>
                    )}
                    </div>
                </div>

                <div className="flex gap-2 sm:justify-end flex-nowrap">
                    <button
                    onClick={() => handleEditItem(item)}
                    className="text-sm border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg"
                    >
                    Edit
                    </button>

                    <button
                    onClick={() =>
                        setExpandedDrawingId((prev) => (prev === item.id ? null : item.id))
                    }
                    className="text-sm border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg"
                    >
                    Drawing
                    </button>

                    <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-sm border border-red-300 text-red-700 px-3 py-2 rounded-lg"
                    >
                    Delete
                    </button>
                </div>
                </div>

                {expandedDrawingId === item.id && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 overflow-hidden">
                    <FittingPreview item={item} />
                </div>
                )}
            </div>
            ))}
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {editingItemId ? "Edit Fitting" : "Add Fitting"}
            </h2>

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Type
                </label>

                <select
                    value={itemType}
                    onChange={(e) => {
                        const nextType = e.target.value;
                        setItemType(nextType);
                        setNewItem(createEmptyItem(nextType));
                    }}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                >
                  <option value="straight">Straight</option>
                  <option value="elbow">Elbow</option>
                  <option value="transition">Transition</option>
                  <option value="offset">Offset</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => updateNewItemField("quantity", e.target.value)}
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                />
              </div>
            </div>

            <div className="mb-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-900">
                    <input
                    type="checkbox"
                    checked={!!newItem.insulated}
                    onChange={(e) => updateNewItemField("insulated", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                    />
                    Insulated
                </label>
            </div>

            {itemType === "straight" && (
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Width
                  </label>
                  <input
                    type="number"
                    value={newItem.width}
                    onChange={(e) => updateNewItemField("width", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Height
                  </label>
                  <input
                    type="number"
                    value={newItem.height}
                    onChange={(e) => updateNewItemField("height", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Length
                  </label>
                  <input
                    type="number"
                    value={newItem.length}
                    onChange={(e) => updateNewItemField("length", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>
              </div>
            )}

            {itemType === "elbow" && (
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Width
                  </label>
                  <input
                    type="number"
                    value={newItem.width}
                    onChange={(e) => updateNewItemField("width", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Height
                  </label>
                  <input
                    type="number"
                    value={newItem.height}
                    onChange={(e) => updateNewItemField("height", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Radius
                  </label>
                  <input
                    type="number"
                    value={newItem.radius}
                    onChange={(e) => updateNewItemField("radius", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Angle
                  </label>
                  <input
                    type="number"
                    value={newItem.angle}
                    onChange={(e) => updateNewItemField("angle", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>
                    <div className="sm:col-span-3">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Bend Type:</span>{" "}
                            {getAutoElbowBendType(newItem.width, newItem.height) === "short"
                            ? "Short Way"
                            : "Long Way"}
                        </p>
                    </div>
              </div>
            )}

            {itemType === "transition" && (
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    IN Width
                  </label>
                  <input
                    type="number"
                    value={newItem.width1}
                    onChange={(e) => updateNewItemField("width1", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    IN Height
                  </label>
                  <input
                    type="number"
                    value={newItem.height1}
                    onChange={(e) => updateNewItemField("height1", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    OUT Width
                  </label>
                  <input
                    type="number"
                    value={newItem.width2}
                    onChange={(e) => updateNewItemField("width2", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    OUT Height
                  </label>
                  <input
                    type="number"
                    value={newItem.height2}
                    onChange={(e) => updateNewItemField("height2", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Length
                  </label>
                  <input
                    type="number"
                    value={newItem.length}
                    onChange={(e) => updateNewItemField("length", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Justification
                  </label>
                  <select
                    value={newItem.justification}
                    onChange={(e) => updateNewItemField("justification", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="top-left">Top Left</option>
                    <option value="top">Top</option>
                    <option value="top-right">Top Right</option>
                    <option value="right">Right</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom">Bottom</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>
            )}

            {itemType === "offset" && (
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Width
                  </label>
                  <input
                    type="number"
                    value={newItem.width}
                    onChange={(e) => updateNewItemField("width", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Height
                  </label>
                  <input
                    type="number"
                    value={newItem.height}
                    onChange={(e) => updateNewItemField("height", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Length
                  </label>
                  <input
                    type="number"
                    value={newItem.length}
                    onChange={(e) => updateNewItemField("length", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Offset
                  </label>
                  <input
                    type="number"
                    value={newItem.offset}
                    onChange={(e) => updateNewItemField("offset", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Direction
                  </label>
                  <select
                    value={newItem.direction}
                    onChange={(e) => updateNewItemField("direction", e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                  >
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                    <p className="text-sm text-amber-700">
                        {newItem.direction === "right" || newItem.direction === "left"
                        ? "Rule: Length must be ≥ Offset + Width"
                        : "Rule: Length must be ≥ Offset + Height"}
                    </p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4">
              <div className="text-sm font-semibold text-gray-900 mb-3 overflow-hidden">Preview</div>
              <FittingPreview item={newItem} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveItem}
                disabled={isSavingItem}
                className="flex-1 bg-blue-700 text-white px-4 py-3 rounded-lg disabled:opacity-50"
                >
                {isSavingItem ? "Saving..." : editingItemId ? "Save Changes" : "Add Item"}
              </button>

              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 border border-gray-300 bg-white text-gray-900 px-4 py-3 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}