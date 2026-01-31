"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

// Import components
import UserManagement from "./components/UserManagement";
import ApplicationReview from "./components/ApplicationReview";
import ContentModeration from "./components/ContentModeration";
import Analytics from "./components/Analytics";
import BookingManagement from "./components/BookingManagement";

interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  pendingApplications: number;
  totalBookings: number;
  totalRevenue: number;
  activeSessions: number;
  flaggedContent: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    pendingApplications: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeSessions: 0,
    flaggedContent: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setAdmin({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || "Admin",
        });
        await loadDashboardData();
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Fetch all necessary data
      const [
        usersSnapshot,
        tutorsSnapshot,
        applicationsSnapshot,
        bookingsSnapshot,
        postsSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "tutor_profiles")),
        getDocs(
          query(collection(db, "tutor_applications"), where("status", "==", "pending"))
        ),
        getDocs(collection(db, "bookings")),
        getDocs(query(collection(db, "posts"), where("flagged", "==", true))),
      ]);

      // Calculate revenue
      let totalRevenue = 0;
      let activeSessions = 0;
      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "completed") {
          totalRevenue += data.amount || 0;
        }
        if (data.status === "confirmed") {
          activeSessions++;
        }
      });

      setStats({
        totalUsers: usersSnapshot.size,
        totalTutors: tutorsSnapshot.size,
        totalStudents: usersSnapshot.size - tutorsSnapshot.size,
        pendingApplications: applicationsSnapshot.size,
        totalBookings: bookingsSnapshot.size,
        totalRevenue,
        activeSessions,
        flaggedContent: postsSnapshot.size,
      });

      // Get recent activity
      const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const recentBookings = await getDocs(bookingsQuery);
      const activities = recentBookings.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentActivity(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const refreshData = async () => {
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">AmTechy</h1>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: "overview", icon: "fa-chart-line", label: "Overview" },
              { id: "users", icon: "fa-users", label: "Users" },
              { id: "applications", icon: "fa-file-lines", label: "Applications", badge: stats.pendingApplications },
              { id: "bookings", icon: "fa-calendar-check", label: "Bookings" },
              { id: "content", icon: "fa-flag", label: "Content", badge: stats.flaggedContent },
              { id: "analytics", icon: "fa-chart-pie", label: "Analytics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${tab.icon}`}></i>
                  <span className="font-medium">{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-semibold">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* Admin Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {admin?.displayName?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {admin?.displayName}
              </p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              auth.signOut();
              router.push("/login");
            }}
            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <i className="fa-solid fa-right-from-bracket mr-2"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-600 mt-1">Monitor your platform's performance</p>
              </div>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <i className="fa-solid fa-arrows-rotate mr-2"></i>
                Refresh Data
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-users text-blue-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <i className="fa-solid fa-arrow-up mr-1"></i>12%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                  {stats.totalUsers.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-600">Total Users</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-chalkboard-user text-purple-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <i className="fa-solid fa-arrow-up mr-1"></i>8%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                  {stats.totalTutors.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-600">Active Tutors</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-calendar-check text-green-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <i className="fa-solid fa-arrow-up mr-1"></i>24%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                  {stats.totalBookings.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-600">Total Bookings</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-dollar-sign text-yellow-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <i className="fa-solid fa-arrow-up mr-1"></i>18%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                  ${stats.totalRevenue.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-600">Total Revenue</p>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Pending Applications</h3>
                  <i className="fa-solid fa-clock text-2xl opacity-75"></i>
                </div>
                <p className="text-4xl font-bold mb-2">{stats.pendingApplications}</p>
                <button
                  onClick={() => setActiveTab("applications")}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  Review now →
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Active Sessions</h3>
                  <i className="fa-solid fa-video text-2xl opacity-75"></i>
                </div>
                <p className="text-4xl font-bold mb-2">{stats.activeSessions}</p>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  View details →
                </button>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Flagged Content</h3>
                  <i className="fa-solid fa-flag text-2xl opacity-75"></i>
                </div>
                <p className="text-4xl font-bold mb-2">{stats.flaggedContent}</p>
                <button
                  onClick={() => setActiveTab("content")}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  Review now →
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 pb-4 border-b border-slate-200 last:border-0"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-calendar text-indigo-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {activity.studentName} booked with {activity.tutorName}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{activity.topic}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-slate-900">
                          ${activity.amount || 0}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.createdAt?.toDate?.()?.toLocaleDateString() || "Today"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <i className="fa-solid fa-inbox text-3xl mb-2"></i>
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs - Render Components */}
        {activeTab === "users" && <UserManagement onUpdate={refreshData} />}
        {activeTab === "applications" && <ApplicationReview onUpdate={refreshData} />}
        {activeTab === "bookings" && <BookingManagement onUpdate={refreshData} />}
        {activeTab === "content" && <ContentModeration onUpdate={refreshData} />}
        {activeTab === "analytics" && <Analytics />}
      </main>
    </div>
  );
}