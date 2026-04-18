"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: number;
  premiumOnly?: boolean;
}

interface UserData {
  fullName: string;
  email: string;
  role: string;
  careerGoal?: string;
  photoURL?: string;
  plan?: "free" | "premium";
}

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [showPremiumToast, setShowPremiumToast] = useState(false);
  const [toastLabel, setToastLabel] = useState("");

  const isPremium = userData?.plan === "premium";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
        await fetchEnrollmentCount(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          fullName: data.fullName || "User",
          email: data.email || "",
          role: data.role || "learner",
          careerGoal: data.careerGoal,
          photoURL: data.photoURL,
          plan: data.plan || "free",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchEnrollmentCount = async (userId: string) => {
    try {
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("learnerId", "==", userId),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(enrollmentsQuery);
      setEnrollmentCount(snapshot.size);
    } catch (error) {
      console.error("Error fetching enrollment count:", error);
    }
  };

  const navItems: NavItem[] = [
    { href: "/dashboard",    icon: "fa-house",        label: "Dashboard" },
    { href: "/mylearning",   icon: "fa-book-open",    label: "My Learning", badge: enrollmentCount },
    { href: "/find-tutor",   icon: "fa-users",        label: "Find Tutors" },
    { href: "/community",    icon: "fa-comment",      label: "Community" },
    { href: "/progress",     icon: "fa-chart-line",   label: "My Progress" },
    { href: "/certificates", icon: "fa-certificate",  label: "Certificates",  premiumOnly: true },
    { href: "/jobs",         icon: "fa-briefcase",    label: "Jobs & Gigs",   premiumOnly: true },
  ];

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };

  const handlePremiumClick = (label: string) => {
    setToastLabel(label);
    setShowPremiumToast(true);
    setTimeout(() => setShowPremiumToast(false), 3000);
  };

  const isActive = (href: string) => pathname === href;

  const getInitials = (name: string): string =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getCareerGoalDisplay = (careerGoal?: string): string => {
    const goalMap: { [key: string]: string } = {
      frontend:       "Frontend Developer",
      backend:        "Backend Developer",
      "data-science": "Data Scientist",
      mobile:         "Mobile Developer",
      designer:       "Product Designer",
      fullstack:      "Full Stack Developer",
    };
    return careerGoal ? goalMap[careerGoal] || careerGoal : "Learner";
  };

  return (
    <div>
      {/* ── Premium Toast ────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] transition-all duration-300 ${
          showPremiumToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl border border-white/10 whitespace-nowrap">
          <span className="text-base">👑</span>
          <span><strong>{toastLabel}</strong> is a Premium feature.</span>
          <Link href="/pricing">
            <button className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ml-1">
              Upgrade
            </button>
          </Link>
        </div>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">

        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            <span className="text-xl font-bold text-slate-900">AmTechy</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const locked = item.premiumOnly && !isPremium;
            const active = isActive(item.href);

            if (locked) {
              return (
                <button
                  key={item.href}
                  onClick={() => handlePremiumClick(item.label)}
                  className="group w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium rounded-xl
                             text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} w-5 h-5`}></i>
                    <span>{item.label}</span>
                  </div>
                  <span className="flex items-center gap-1 bg-amber-100 text-amber-600 text-[10px] font-bold
                                   px-2 py-0.5 rounded-full group-hover:bg-amber-200 transition-colors">
                    <i className="fa-solid fa-crown text-[8px]"></i>
                    PRO
                  </span>
                </button>
              );
            }

            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} w-5 h-5`}></i>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="py-3">
            <div className="border-t border-slate-100" />
          </div>

          {/* Settings & Help */}
          {[
            { href: "/settings", icon: "fa-gear",            label: "Settings" },
            { href: "/help",     icon: "fa-circle-question",  label: "Help & Support" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive(item.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 h-5`}></i>
                <span>{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-slate-100 space-y-2">

          {/* User profile row */}
          <Link href="/profile">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              {userData?.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={userData.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {userData ? getInitials(userData.fullName) : "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {userData?.fullName || "Loading..."}
                </p>
                <p className="text-xs text-indigo-600 font-medium truncate">
                  {getCareerGoalDisplay(userData?.careerGoal)}
                </p>
              </div>
              {isPremium && (
                <i className="fa-solid fa-crown text-amber-400 text-xs flex-shrink-0" title="Premium" />
              )}
            </div>
          </Link>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500
                       hover:text-red-600 hover:bg-red-50 transition-colors w-full rounded-xl
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>

      </aside>
    </div>
  );
}