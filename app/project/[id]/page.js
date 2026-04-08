"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  doc,
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
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

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
      setNotesValue(project.notes || "");
    }
  }, [project]);


  const handleSaveNotes = async () => {
    if (!project) return;

    setIsSavingNotes(true);

    try {
      await updateDoc(doc(db, "projects", project.id), {
        notes: notesValue.trim(),
      });

      setProject((prev) => ({
        ...prev,
        notes: notesValue.trim(),
      }));

      setIsEditingNotes(false);
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };
  

  const createOrder = async () => {
    if (!orderName.trim() || !params.id) return;

    try {
      setIsCreatingOrder(true);

      await addDoc(collection(db, "projects", params.id, "orders"), {
        name: orderName.trim(),
        date: orderDate,
        notes: orderNotes.trim(),
        status: "Active",
        items: [],
        createdAt: serverTimestamp(),
      });

      setOrderName("");
      setOrderDate(new Date().toISOString().split("T")[0]);
      setOrderNotes("");
      setShowOrderModal(false);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (!project) {
    return (
      <main className="p-6 max-w-xl mx-auto bg-white text-gray-900 min-h-screen">
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
    <main className="p-6 max-w-xl mx-auto bg-white text-gray-900 min-h-screen">
      <button
        onClick={() => router.push("/")}
        className="mb-4 text-blue-600 font-medium hover:underline"
      >
        ← Back to Projects
      </button>

      <h1 className="text-3xl font-bold mb-6">{project.name}</h1>

      <div className="mb-6 rounded-xl border border-gray-300 bg-white p-4 space-y-3 text-gray-900">

        <p className="text-sm text-gray-900">
          <span className="font-semibold text-gray-900">Date:</span>{" "}
          {project?.date || "-"}
        </p>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-900">Notes</span>

            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-sm text-blue-600 font-medium"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="text-sm text-green-600 font-medium"
                >
                  {isSavingNotes ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => {
                    setIsEditingNotes(false);
                    setNotesValue(project.notes || "");
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
              {project?.notes || "-"}
            </p>
          ) : (
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg p-2 text-sm min-h-[80px]"
            />
          )}
        </div>
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
            <Link
              key={order.id}
              href={`/project/${project.id}/order/${order.id}`}
            >
              <div className="border rounded-xl p-4 shadow-sm hover:bg-gray-50 cursor-pointer bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{order.name}</h2>

                    <p className="text-gray-700 text-sm">
                      Date: {order.date || "-"}
                    </p>

                    <p className="text-gray-700 text-sm">
                      Items: {order.items ? order.items.length : 0}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full border ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : order.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                  >
                    {order.status || "Active"}
                  </span>
                </div>
              </div>
            </Link>
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
                value={orderName}
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
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-900">
                Notes
              </label>
              <textarea
                placeholder="Notes for this order"
                value={orderNotes}
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