"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // If this is the admin login page, render it immediately — no auth check needed
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip the auth check entirely for the login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          const adminEmails = ["admin@amtechy.com"];

          const hasAdminRole =
            userData?.role === "admin" || userData?.isAdmin === true;
          const hasAdminEmail = adminEmails.includes(user.email || "");

          if (hasAdminRole || hasAdminEmail) {
            setIsAdmin(true);
            setLoading(false);
          } else {
            await auth.signOut();
            router.push("/admin/login");
          }
        } catch (error) {
          console.error("Error checking admin access:", error);
          router.push("/admin/login");
        }
      } else {
        // No session → send to ADMIN login, not general login
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router, isLoginPage]);

  // Admin login page: render immediately, no spinner
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Other admin pages: show spinner while verifying
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}