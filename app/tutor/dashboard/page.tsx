"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

interface TutorStats {
  totalSessions: number;
  totalStudents: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
}

interface UpcomingSession {
  id: string;
  studentName: string;
  topic: string;
  date: Date;
  time: string;
  duration: string;
  amount: number;
}

interface Booking {
  id: string;
  studentName: string;
  date: string;
  time: string;
  sessionType: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
}

export default function TutorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TutorStats>({
    totalSessions: 0,
    totalStudents: 0,
    totalEarnings: 0,
    rating: 0,
    reviewCount: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [tutorProfile, setTutorProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchTutorData(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchTutorData = async (userId: string) => {
    try {
      // Fetch tutor profile
      const profileDoc = await getDoc(doc(db, "tutor_profiles", userId));
      if (!profileDoc.exists()) {
        router.push("/tutor/apply");
        return;
      }

      const profileData = profileDoc.data();
      setTutorProfile(profileData);

      // Set stats
      setStats({
        totalSessions: profileData.totalSessions || 0,
        totalStudents: profileData.totalStudents || 0,
        totalEarnings: profileData.totalEarnings || 0,
        rating: profileData.rating || 0,
        reviewCount: profileData.reviewCount || 0,
      });

      // Fetch bookings
      await fetchBookings(userId);

      // Mock upcoming sessions (replace with real data)
      setUpcomingSessions([
        {
          id: "1",
          studentName: "John Smith",
          topic: "React Hooks Deep Dive",
          date: new Date(Date.now() + 86400000),
          time: "10:00 AM",
          duration: "1 hour",
          amount: profileData.pricing?.hourlyRate || 50,
        },
        {
          id: "2",
          studentName: "Sarah Johnson",
          topic: "JavaScript Advanced Concepts",
          date: new Date(Date.now() + 172800000),
          time: "2:00 PM",
          duration: "2 hours",
          amount: (profileData.pricing?.hourlyRate || 50) * 2,
        },
      ]);
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    }
  };

  const fetchBookings = async (tutorId: string) => {
    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("tutorId", "==", tutorId),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(bookingsQuery);

      const bookingsData: Booking[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        studentName: doc.data().userName || "Student",
        date: doc.data().date,
        time: doc.data().time,
        sessionType: doc.data().sessionType,
        status: doc.data().status,
        totalAmount: doc.data().totalAmount,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setRecentBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.displayName}! 👋</h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your tutoring</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/tutor/schedule")}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              <i className="fa-solid fa-calendar mr-2"></i>
              Schedule
            </button>
            <button
              onClick={() => router.push("/tutor/settings")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <i className="fa-solid fa-gear mr-2"></i>
              Settings
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chalkboard-user text-indigo-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalSessions}</div>
            <div className="text-sm text-slate-600">Total Sessions</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-users text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalStudents}</div>
            <div className="text-sm text-slate-600">Total Students</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-dollar-sign text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">${stats.totalEarnings}</div>
            <div className="text-sm text-slate-600">Total Earnings</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-star text-yellow-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.rating > 0 ? stats.rating.toFixed(1) : "—"}
            </div>
            <div className="text-sm text-slate-600">Rating</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-message text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.reviewCount}</div>
            <div className="text-sm text-slate-600">Reviews</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Upcoming Sessions</h2>
                <button
                  onClick={() => router.push("/tutor/sessions")}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View All <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <div className="text-center">
                          <div className="text-xs font-semibold">
                            {session.date.toLocaleDateString("en-US", { month: "short" })}
                          </div>
                          <div className="text-xl font-bold">
                            {session.date.getDate()}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{session.topic}</h3>
                        <p className="text-sm text-slate-600">with {session.studentName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span><i className="fa-solid fa-clock mr-1"></i>{session.time}</span>
                          <span><i className="fa-solid fa-hourglass mr-1"></i>{session.duration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${session.amount}</div>
                        <button className="mt-2 px-4 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-calendar-xmark text-slate-400 text-2xl"></i>
                  </div>
                  <p className="text-slate-600">No upcoming sessions scheduled</p>
                </div>
              )}
            </div>

            {/* Recent Booking Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Recent Booking Requests</h2>
                <button
                  onClick={() => router.push("/tutor/bookings")}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View All <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
              </div>

              {recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-slate-900">{booking.studentName}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {new Date(booking.date).toLocaleDateString()} at {booking.time}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{booking.sessionType}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 mb-2">${booking.totalAmount}</div>
                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                              Accept
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-inbox text-slate-400 text-2xl"></i>
                  </div>
                  <p className="text-slate-600">No booking requests yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/tutor/schedule")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <i className="fa-solid fa-calendar-plus text-indigo-600"></i>
                  <span className="font-medium text-slate-900">Update Schedule</span>
                </button>
                <button
                  onClick={() => router.push("/tutor/students")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <i className="fa-solid fa-users text-green-600"></i>
                  <span className="font-medium text-slate-900">View Students</span>
                </button>
                <button
                  onClick={() => router.push("/tutor/earnings")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <i className="fa-solid fa-chart-line text-purple-600"></i>
                  <span className="font-medium text-slate-900">View Earnings</span>
                </button>
                <button
                  onClick={() => router.push("/tutor/reviews")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <i className="fa-solid fa-star text-yellow-600"></i>
                  <span className="font-medium text-slate-900">View Reviews</span>
                </button>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-bold mb-2">Profile Strength</h3>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-2">
                <div className="bg-white h-3 rounded-full" style={{ width: "85%" }}></div>
              </div>
              <p className="text-sm opacity-90 mb-4">85% complete</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check-circle"></i>
                  Profile info added
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check-circle"></i>
                  Pricing set
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <i className="fa-regular fa-circle"></i>
                  Upload intro video
                </li>
              </ul>
              <button className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-opacity-90">
                Complete Profile
              </button>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-lightbulb text-blue-600 text-xl mt-1"></i>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Tutor Tip</h3>
                  <p className="text-sm text-slate-700">
                    Students are 3x more likely to book tutors with introduction videos. Upload yours today!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}