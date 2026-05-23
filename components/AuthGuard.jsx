"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function AuthGuard({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);

      if (!currentUser) {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return children;
}