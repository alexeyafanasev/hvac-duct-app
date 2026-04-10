"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

function getStatusClasses(status) {
  if (status === "Done" || status === "Completed") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "In Progress") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [orders, setOrders] = useState([]);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderName, setOrderName] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [orderNotes, setOrderNotes] = useState("");
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editOrderName, setEditOrderName] = useState("");
  const [editOrderDate, setEditOrderDate] = useState("");
  const [editForemanName, setEditForemanName] = useState("");
  const [editOrderNotes, setEditOrderNotes] = useState("");
  const [isSavingOrderEdit, setIsSavingOrderEdit] = useState(false);
  const [foremanName, setForemanName] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);

  const [projectNameValue, setProjectNameValue] = useState("");
  const [projectDateValue, setProjectDateValue] = useState("");
  const [projectClientValue, setProjectClientValue] = useState("");
  const [projectAddressValue, setProjectAddressValue] = useState("");
  const [projectStartDateValue, setProjectStartDateValue] = useState("");
  const [projectDueDateValue, setProjectDueDateValue] = useState("");


  useEffect(() => {
    if (!params.id) return;

    const projectRef = doc(db, "projects", params.id);

    const unsubscribe = onSnapshot(projectRef, (snapshot) => {
      if (!snapshot.exists()) {
        setProject(null);
        return;
      }

      const projectData = {
        id: snapshot.id,
        ...snapshot.data(),
      };

      setProject(projectData);
    });

    return () => unsubscribe();
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;

    const ordersRef = collection(db, "projects", params.id, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setOrders(ordersList);
    });

    return () => unsubscribe();
  }, [params.id]);

    useEffect(() => {
    if (project) {
        setProjectNameValue(project.name || "");
        setProjectDateValue(project.date || "");
        setProjectClientValue(project.client || "");
        setProjectAddressValue(project.address || "");
        setProjectStartDateValue(project.startDate || "");
        setProjectDueDateValue(project.dueDate || "");
        setNotesValue(project.notes || "");
    }
    }, [project]);


    const handleSaveProject = async () => {
    if (!project) return;

    setIsSavingProject(true);

    try {
        const payload = {
        name: projectNameValue.trim(),
        date: projectDateValue,
        client: projectClientValue.trim(),
        address: projectAddressValue.trim(),
        startDate: projectStartDateValue,
        dueDate: projectDueDateValue,
        notes: notesValue.trim(),
        };

        await updateDoc(doc(db, "projects", project.id), payload);

        setProject((prev) => ({
        ...prev,
        ...payload,
        }));

        setIsEditingProject(false);
    } catch (error) {
        console.error("Error updating project:", error);
        alert("Failed to save project");
    } finally {
        setIsSavingProject(false);
    }
    };
  

  const createOrder = async () => {
    if (!orderName.trim() || !params.id) return;

    try {
      setIsCreatingOrder(true);

    await addDoc(collection(db, "projects", params.id, "orders"), {
        name: orderName.trim(),
        date: orderDate,
        foremanName: foremanName.trim(),
        notes: orderNotes.trim(),
        status: "Active",
        items: [],
        createdAt: serverTimestamp(),
    });

      setOrderName("");
      setOrderDate(new Date().toISOString().split("T")[0]);
      setForemanName("");
      setOrderNotes("");
      setShowOrderModal(false);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order");
    } finally {
      setIsCreatingOrder(false);
    }
  };

        const handleStartEditOrder = (order) => {
        setEditingOrderId(order.id);
        setEditOrderName(order.name || "");
        setEditOrderDate(order.date || "");
        setEditForemanName(order.foremanName || "");
        setEditOrderNotes(order.notes || "");
        };

        const handleCancelEditOrder = () => {
        setEditingOrderId(null);
        setEditOrderName("");
        setEditOrderDate("");
        setEditForemanName("");
        setEditOrderNotes("");
        };

        const handleSaveOrderEdit = async () => {
        if (!params.id || !editingOrderId || !editOrderName.trim()) return;

        try {
            setIsSavingOrderEdit(true);

            await updateDoc(doc(db, "projects", params.id, "orders", editingOrderId), {
            name: editOrderName.trim(),
            date: editOrderDate,
            foremanName: editForemanName.trim(),
            notes: editOrderNotes.trim(),
            });

            handleCancelEditOrder();
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update order");
        } finally {
            setIsSavingOrderEdit(false);
        }
        };

        const handleDeleteOrder = async (orderId) => {
        if (!params.id || !orderId) return;

        const confirmed = window.confirm(
            "Delete this order? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "projects", params.id, "orders", orderId));

            if (editingOrderId === orderId) {
            handleCancelEditOrder();
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Failed to delete order");
        }
        };

  if (!project) {
    return (
      <main className="w-full max-w-screen-sm mx-auto px-4 py-4 bg-white text-gray-900 min-h-screen">
        <button
          onClick={() => router.push("/")}
          className="mb-4 text-blue-600 font-medium hover:underline"
        >
          ← Back to Projects
        </button>

        <p>Loading project...</p>
      </main>
    );
  }

  return (
    <main className="w-full max-w-screen-sm mx-auto px-4 py-4 bg-white text-gray-900 min-h-screen">
      <button
        onClick={() => router.push("/")}
        className="mb-4 text-blue-600 font-medium hover:underline"
      >
        ← Back to Projects
      </button>

      <div className="flex items-center justify-between gap-3 mb-6">
  {!isEditingProject ? (
        <h1 className="text-3xl font-bold">{project.name}</h1>
    ) : (
        <input
        type="text"
        value={projectNameValue || ""}
        onChange={(e) => setProjectNameValue(e.target.value)}
        className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg text-2xl font-bold"
        />
    )}

    {!isEditingProject ? (
        <button
        onClick={() => setIsEditingProject(true)}
        className="text-sm border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg whitespace-nowrap"
        >
        Edit Project
        </button>
    ) : (
        <div className="flex gap-2">
        <button
            onClick={handleSaveProject}
            disabled={isSavingProject}
            className="text-sm text-green-700 font-medium whitespace-nowrap"
        >
            {isSavingProject ? "Saving..." : "Save"}
        </button>

        <button
            onClick={() => {
            setIsEditingProject(false);
            setProjectNameValue(project.name || "");
            setProjectDateValue(project.date || "");
            setProjectClientValue(project.client || "");
            setProjectAddressValue(project.address || "");
            setProjectStartDateValue(project.startDate || "");
            setProjectDueDateValue(project.dueDate || "");
            setNotesValue(project.notes || "");
            }}
            className="text-sm text-gray-700 font-medium whitespace-nowrap"
        >
            Cancel
        </button>
        </div>
    )}
    </div>

        <div className="mb-6 rounded-xl border border-gray-300 bg-white p-4 space-y-4 text-gray-900">
        {!isEditingProject ? (
            <>
            <p className="text-sm text-gray-900">
                <span className="font-semibold">Date:</span> {project?.date || "-"}
            </p>

            <p className="text-sm text-gray-900">
                <span className="font-semibold">Client:</span> {project?.client || "-"}
            </p>

            <p className="text-sm text-gray-900 whitespace-pre-line">
                <span className="font-semibold">Address:</span>{" "}
                {project?.address || "-"}
            </p>

            <p className="text-sm text-gray-900">
                <span className="font-semibold">Start Date:</span>{" "}
                {project?.startDate || "-"}
            </p>

            <p className="text-sm text-gray-900">
                <span className="font-semibold">Due Date:</span>{" "}
                {project?.dueDate || "-"}
            </p>

            <div>
                <span className="text-sm font-semibold text-gray-900">Notes</span>
                <p className="text-sm text-gray-900 whitespace-pre-line mt-1">
                {project?.notes || "-"}
                </p>
            </div>
            </>
        ) : (
            <>
            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                Date
                </label>
                <input
                type="date"
                value={projectDateValue || ""}
                onChange={(e) => setProjectDateValue(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                Client
                </label>
                <input
                type="text"
                value={projectClientValue || ""}
                onChange={(e) => setProjectClientValue(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                Address
                </label>
                <textarea
                value={projectAddressValue || ""}
                onChange={(e) => setProjectAddressValue(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg min-h-[90px]"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Start Date
                </label>
                <input
                    type="date"
                    value={projectStartDateValue || ""}
                    onChange={(e) => setProjectStartDateValue(e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                />
                </div>

                <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Due Date
                </label>
                <input
                    type="date"
                    value={projectDueDateValue || ""}
                    onChange={(e) => setProjectDueDateValue(e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                Notes
                </label>
                <textarea
                value={notesValue || ""}
                onChange={(e) => setNotesValue(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg p-3 text-sm min-h-[110px]"
                />
            </div>
            </>
        )}
        </div>

      <button
        onClick={() => setShowOrderModal(true)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl mb-6 text-lg"
      >
        + New Order
      </button>

      {orders.length === 0 ? (
        <p className="text-gray-700">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
                key={order.id}
                className="border rounded-xl p-4 shadow-sm bg-white space-y-3"
            >
                {editingOrderId === order.id ? (
                <>
                    <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-900">
                        Order Name
                        </label>
                        <input
                        type="text"
                        value={editOrderName || ""}
                        onChange={(e) => setEditOrderName(e.target.value)}
                        className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-900">
                        Date
                        </label>
                        <input
                        type="date"
                        value={editOrderDate || ""}
                        onChange={(e) => setEditOrderDate(e.target.value)}
                        className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-900">
                        Foreman Name
                        </label>
                        <input
                        type="text"
                        value={editForemanName || ""}
                        onChange={(e) => setEditForemanName(e.target.value)}
                        className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-900">
                        Notes
                        </label>
                        <textarea
                        value={editOrderNotes || ""}
                        onChange={(e) => setEditOrderNotes(e.target.value)}
                        className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg min-h-[90px]"
                        />
                    </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleSaveOrderEdit}
                        disabled={isSavingOrderEdit || !editOrderName.trim()}
                        className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                    >
                        {isSavingOrderEdit ? "Saving..." : "Save"}
                    </button>

                    <button
                        onClick={handleCancelEditOrder}
                        disabled={isSavingOrderEdit}
                        className="text-sm border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={isSavingOrderEdit}
                        className="text-sm border border-red-300 text-red-700 px-3 py-2 rounded-lg"
                    >
                        Delete
                    </button>
                    </div>
                </>
                ) : (
                <>
                    <Link href={`/project/${project.id}/order/${order.id}`}>
                    <div className="cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1">
                        <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold">{order.name}</h2>

                            <p className="text-gray-700 text-sm">
                            Date: {order.date || "-"}
                            </p>

                            {order.foremanName && (
                            <p className="text-gray-700 text-sm">
                                Foreman: {order.foremanName}
                            </p>
                            )}

                            <p className="text-gray-700 text-sm">
                            Items: {order.items ? order.items.length : 0}
                            </p>
                        </div>

                        <span
                            className={`text-xs px-3 py-1 rounded-full border ${
                            order.status === "Done" || order.status === "Completed"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : order.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                            }`}
                        >
                            {order.status === "Completed" ? "Done" : order.status || "Active"}
                        </span>
                        </div>
                    </div>
                    </Link>

                    <div className="flex gap-2">
                    <button
                        onClick={() => handleStartEditOrder(order)}
                        className="text-sm border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-sm border border-red-300 text-red-700 px-3 py-2 rounded-lg"
                    >
                        Delete
                    </button>
                    </div>
                </>
                )}
            </div>
            ))}
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">New Order</h2>

            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1 text-gray-900">
                Order Name
              </label>
              <input
                type="text"
                placeholder="Enter order name"
                value={orderName || ""}
                onChange={(e) => setOrderName(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1 text-gray-900">
                Date
              </label>
              <input
                type="date"
                value={orderDate || ""}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
              />
            </div>

            <div className="mb-3">
                <label className="block text-sm font-semibold mb-1 text-gray-900">
                    Foreman Name
                </label>
                <input
                    type="text"
                    placeholder="Enter foreman name"
                    value={foremanName || ""}
                    onChange={(e) => setForemanName(e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg"
                />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-900">
                Notes
              </label>
              <textarea
                placeholder="Notes for this order"
                value={orderNotes || ""}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg min-h-[90px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={createOrder}
                disabled={isCreatingOrder || !orderName.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isCreatingOrder ? "Creating..." : "Create"}
              </button>

              <button
                onClick={() => setShowOrderModal(false)}
                disabled={isCreatingOrder}
                className="flex-1 border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg disabled:opacity-50"
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