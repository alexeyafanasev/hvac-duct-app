"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

type Project = {
  id: string;
  name: string;
  date?: string;
  client?: string;
  address?: string;
  startDate?: string;
  dueDate?: string;
  items?: unknown[];
  notes?: string;
  ordersCount?: number;
  itemsCount?: number;
  status?: "Active" | "In Progress" | "Completed" | "Done";
  archived?: boolean;
  createdAt?: unknown;
};

export default function Home() {
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
    };
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDate, setProjectDate] = useState(getTodayDate());
  const [projectNotes, setProjectNotes] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectStartDate, setProjectStartDate] = useState("");
  const [projectDueDate, setProjectDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectList: Project[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Project, "id">),
      }));

      setProjects(projectList);
    });

    return () => unsubscribe();
  }, []);

  const visibleProjects = projects.filter((project) =>
    showArchived ? project.archived : !project.archived
  );

  const createProject = async () => {
    if (!projectName.trim()) return;

    try {
      setIsCreating(true);

    await addDoc(collection(db, "projects"), {
      name: projectName.trim(),
      date: projectDate,
      client: projectClient.trim(),
      address: projectAddress.trim(),
      startDate: projectStartDate,
      dueDate: projectDueDate,
      notes: projectNotes.trim(),
      status: "Active",
      items: [],
      ordersCount: 0,
      itemsCount: 0,
      archived: false,
      createdAt: serverTimestamp(),
    });

      setProjectName("");
      setProjectDate(getTodayDate());
      setProjectNotes("");
      setProjectClient("");
      setProjectAddress("");
      setProjectStartDate("");
      setProjectDueDate("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Could not create project.");
    } finally {
      setIsCreating(false);
    }
  };

return (
  <main className="w-full max-w-screen-sm mx-auto px-4 py-4">
    <div className="flex justify-between items-start w-full mb-6">
    <h1 className="text-3xl font-bold mb-6">HVAC Duct Orders</h1>
    <div className="flex flex-col items-end gap-1">
      <span className="text-sm text-gray-700">
        {showArchived ? "Archived only" : "Active only"}
      </span>

      <button
        onClick={() => setShowArchived((prev) => !prev)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
          showArchived ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
            showArchived ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
    </div>

    <button
      onClick={() => setShowModal(true)}
      className="w-full bg-blue-900 text-white py-3 rounded-xl mb-6 text-lg"
    >
      + New Project
    </button>

    {projects.length === 0 ? (
      <p className="text-gray-800">No projects yet</p>
    ) : (
      
      <div className="space-y-3">
        {visibleProjects.map((project) => (
          <Link key={project.id} href={`/project/${project.id}`}>
            <div className="border rounded-xl p-4 shadow-sm hover:bg-gray-50 cursor-pointer">
              <h2 className="text-xl font-semibold">{project.name}</h2>

              <p className="text-gray-500 text-sm">
                Date: {project?.date || "-"}
              </p>

              <p className="text-gray-700 text-sm">
                Orders: {project.ordersCount ?? 0}
              </p>

              <p className="text-gray-700 text-sm">
                Total Items: {project.itemsCount ?? 0}
              </p>

            </div>
          </Link>
        ))}
      </div>
    )}

    {showModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">New Project</h2>

          {/* Project Name */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Project Name
            </label>
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg"
            />
          </div>

          {/* Date */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Date
            </label>
            <input
              type="date"
              value={projectDate}
              onChange={(e) => setProjectDate(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Client
            </label>
            <input
              type="text"
              placeholder="Client name"
              value={projectClient}
              onChange={(e) => setProjectClient(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Address
            </label>
            <textarea
              placeholder="Project address"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg min-h-[80px]"
            />
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Start Date
            </label>
            <input
              type="date"
              value={projectStartDate}
              onChange={(e) => setProjectStartDate(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Due Date
            </label>
            <input
              type="date"
              value={projectDueDate}
              onChange={(e) => setProjectDueDate(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg"
            />
          </div>
        </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-900">
              Notes
            </label>
            <textarea
              placeholder="Notes for shop"
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 p-3 rounded-lg"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={createProject}
              disabled={isCreating || !projectName.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>

            <button
              onClick={() => setShowModal(false)}
              disabled={isCreating}
              className="flex-1 border px-4 py-2 rounded-lg disabled:opacity-50 border-gray-300 bg-white text-gray-900"
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