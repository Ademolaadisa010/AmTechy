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
}

interface UserData {
  fullName: string;
  email: string;
  role: string;
  careerGoal?: string;
  photoURL?: string;
}

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);

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
    { href: "/dashboard", icon: "fa-house", label: "Dashboard" },
    { href: "/mylearning", icon: "fa-book-open", label: "My Learning", badge: enrollmentCount },
    { href: "/find-tutor", icon: "fa-users", label: "Find Tutors" },
    { href: "/jobs", icon: "fa-briefcase", label: "Jobs & Gigs" },
    { href: "/community", icon: "fa-comment", label: "Community" },
    { href: "/progress", icon: "fa-chart-line", label: "My Progress" },
    { href: "/certificates", icon: "fa-certificate", label: "Certificates" },
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

  const isActive = (href: string) => pathname === href;

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCareerGoalDisplay = (careerGoal?: string): string => {
    const goalMap: { [key: string]: string } = {
      frontend: "Frontend Developer",
      backend: "Backend Developer",
      "data-science": "Data Scientist",
      mobile: "Mobile Developer",
      designer: "Product Designer",
      fullstack: "Full Stack Developer",
    };
    return careerGoal ? goalMap[careerGoal] || careerGoal : "Learner";
  };

  return (
    <div>
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary-600 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            <span className="text-xl font-bold text-slate-900">AmTechy</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={`nav-item w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  isActive(item.href)
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
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
          ))}

          {/* Divider */}
          <div className="pt-4 pb-2">
            <div className="border-t border-slate-200"></div>
          </div>

          {/* Additional Links */}
          <Link href="/settings">
            <button
              className={`nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive("/settings")
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <i className="fa-solid fa-gear w-5 h-5"></i>
              <span>Settings</span>
            </button>
          </Link>

          <Link href="/help">
            <button
              className={`nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive("/help")
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <i className="fa-solid fa-circle-question w-5 h-5"></i>
              <span>Help & Support</span>
            </button>
          </Link>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Upgrade Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-indigo-200">Free Plan</span>
              <span className="bg-white/20 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full">
                Limited
              </span>
            </div>
            <p className="text-sm font-semibold mb-1">Unlock AI Tutor Pro</p>
            <p className="text-xs text-indigo-100 mb-3">
              Get unlimited access to courses & tutors
            </p>
            <Link href="/pricing">
              <button className="w-full py-2 bg-white text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-sm">
                Upgrade Now
              </button>
            </Link>
          </div>

          <Link href="/profile">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              {userData?.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={userData.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {userData ? getInitials(userData.fullName) : "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {userData?.fullName || "Loading..."}
                </p>
                <p className="text-xs text-indigo-600 font-medium truncate">
                  {getCareerGoalDisplay(userData?.careerGoal)}
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors w-full rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-5 h-5"></i>
            <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}