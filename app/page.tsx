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
  items?: unknown[];
  createdAt?: unknown;
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
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
        items: [],
        createdAt: serverTimestamp(),
      });

      setProjectName("");
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
        className="w-full bg-blue-600 text-white py-3 rounded-xl mb-6 text-lg"
      >
        + New Project
      </button>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet</p>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <div className="border rounded-xl p-4 shadow-sm hover:bg-gray-50 cursor-pointer">
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <p className="text-gray-500">
                  Items: {project.items ? project.items.length : 0}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">New Project</h2>

            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={createProject}
                disabled={isCreating}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                disabled={isCreating}
                className="border px-4 py-2 rounded disabled:opacity-50"
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