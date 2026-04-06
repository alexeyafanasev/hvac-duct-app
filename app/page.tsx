"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../lib/firebase";
import {
  collection,
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
  items?: unknown[];
  notes?: string;
  status?: "Active" | "In Progress" | "Completed";
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
  const [isCreating, setIsCreating] = useState(false);

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

  const createProject = async () => {
    if (!projectName.trim()) return;

    try {
      setIsCreating(true);

      await addDoc(collection(db, "projects"), {
        name: projectName.trim(),
        date: projectDate,
        notes: projectNotes.trim(),
        status: "Active",
        items: [],
        createdAt: serverTimestamp(),
      });

      setProjectName("");
      setProjectDate(getTodayDate());
      setProjectNotes("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Could not create project.");
    } finally {
      setIsCreating(false);
    }
  };

return (
  <main className="p-6 max-w-xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">HVAC Duct Orders</h1>

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
        {projects.map((project) => (
          <Link key={project.id} href={`/project/${project.id}`}>
            <div className="border rounded-xl p-4 shadow-sm hover:bg-gray-50 cursor-pointer">
              <h2 className="text-xl font-semibold">{project.name}</h2>

              <p className="text-gray-500 text-sm">
                Date: {project?.date || "-"}
              </p>

              <p className="text-gray-500">
                Items: {project.items ? project.items.length : 0}
              </p>

              <span
                className={`text-xs px-3 py-1 rounded-full border ${
                  project.status === "Completed"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : project.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-blue-100 text-blue-700 border-blue-200"
                }`}
              >
                {project.status || "Active"}
              </span>

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
              className="flex-1 border px-4 py-2 rounded-lg disabled:opacity-50"
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