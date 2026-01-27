"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

interface Student {
  id: string;
  name: string;
  email: string;
  photo?: string;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalSpent: number;
  lastSessionDate?: Date;
  firstSessionDate?: Date;
  favoriteTopics: string[];
  averageRating?: number;
  status: "active" | "inactive";
}

interface StudentSession {
  id: string;
  date: string;
  time: string;
  topic: string;
  duration: number;
  amount: number;
  status: string;
}

type SortBy = "name" | "sessions" | "spent" | "recent";
type ViewMode = "grid" | "list";

export default function TutorStudents() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSessions, setStudentSessions] = useState<StudentSession[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchStudents(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchQuery, sortBy]);

  const fetchStudents = async (tutorId: string) => {
    try {
      // Fetch all bookings for this tutor
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("tutorId", "==", tutorId)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      // Group bookings by student
      const studentMap = new Map<string, any>();

      bookingsSnapshot.docs.forEach((doc) => {
        const booking = doc.data();
        const studentId = booking.userId;

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            name: booking.userName || "Student",
            email: booking.userEmail || "",
            photo: booking.userPhoto,
            sessions: [],
            topics: new Set(),
          });
        }

        const student = studentMap.get(studentId);
        student.sessions.push({
          id: doc.id,
          date: booking.date,
          time: booking.time,
          topic: booking.topic || "General Tutoring",
          duration: booking.duration || 1,
          amount: booking.totalAmount,
          status: booking.status,
          createdAt: booking.createdAt?.toDate() || new Date(),
        });

        if (booking.topic) {
          student.topics.add(booking.topic);
        }
      });

      // Process student data
      const studentsData: Student[] = Array.from(studentMap.values()).map(
        (student) => {
          const sessions = student.sessions;
          const completedSessions = sessions.filter(
            (s: any) => s.status === "completed"
          );
          const upcomingSessions = sessions.filter(
            (s: any) => s.status === "confirmed" || s.status === "pending"
          );

          const sessionDates = sessions
            .map((s: any) => new Date(s.date))
            .sort((a: Date, b: Date) => b.getTime() - a.getTime());

          const lastSessionDate = sessionDates[0];
          const firstSessionDate = sessionDates[sessionDates.length - 1];

          const totalSpent = sessions.reduce(
            (sum: number, s: any) => sum + (s.amount || 0),
            0
          );

          // Determine if active (had session in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const isActive = lastSessionDate && lastSessionDate > thirtyDaysAgo;

          return {
            id: student.id,
            name: student.name,
            email: student.email,
            photo: student.photo,
            totalSessions: sessions.length,
            completedSessions: completedSessions.length,
            upcomingSessions: upcomingSessions.length,
            totalSpent,
            lastSessionDate,
            firstSessionDate,
            favoriteTopics: Array.from(student.topics).slice(0, 3),
            status: isActive ? "active" : "inactive",
          };
        }
      );

      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "sessions":
          return b.totalSessions - a.totalSessions;
        case "spent":
          return b.totalSpent - a.totalSpent;
        case "recent":
          if (!a.lastSessionDate) return 1;
          if (!b.lastSessionDate) return -1;
          return b.lastSessionDate.getTime() - a.lastSessionDate.getTime();
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  };

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
    setLoadingModal(true);

    try {
      // Fetch all sessions for this student
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("tutorId", "==", user.uid),
        where("userId", "==", student.id),
        orderBy("date", "desc")
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);

      const sessions: StudentSession[] = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        date: doc.data().date,
        time: doc.data().time,
        topic: doc.data().topic || "General Tutoring",
        duration: doc.data().duration || 1,
        amount: doc.data().totalAmount,
        status: doc.data().status,
      }));

      setStudentSessions(sessions);
    } catch (error) {
      console.error("Error fetching student sessions:", error);
    } finally {
      setLoadingModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStats = () => {
    return {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      totalSessions: students.reduce((sum, s) => sum + s.totalSessions, 0),
      totalRevenue: students.reduce((sum, s) => sum + s.totalSpent, 0),
    };
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const stats = getStats();

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push("/tutor/dashboard")}
              className="flex items-center text-slate-600 hover:text-slate-900 mb-2"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900">My Students</h1>
            <p className="text-slate-600 mt-1">
              Track and manage your student relationships
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/tutor/sessions")}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              <i className="fa-solid fa-calendar mr-2"></i>
              Sessions
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-users text-indigo-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.totalStudents}
            </div>
            <div className="text-sm text-slate-600">Total Students</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-user-check text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.activeStudents}
            </div>
            <div className="text-sm text-slate-600">Active Students</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chalkboard-user text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-slate-600">Total Sessions</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-dollar-sign text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Total Revenue</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="sessions">Most Sessions</option>
                <option value="spent">Highest Spent</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-3 ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-grid"></i>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-3 border-l border-slate-300 ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Students Display */}
        {filteredStudents.length > 0 ? (
          viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewStudent(student)}
                >
                  {/* Student Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        student.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-slate-600 truncate">
                        {student.email}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          student.status
                        )}`}
                      >
                        {student.status === "active" ? (
                          <>
                            <i className="fa-solid fa-circle-dot mr-1"></i>
                            Active
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-circle mr-1"></i>
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-slate-900">
                        {student.totalSessions}
                      </div>
                      <div className="text-xs text-slate-600">Total Sessions</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        ${student.totalSpent}
                      </div>
                      <div className="text-xs text-slate-600">Total Spent</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 text-sm border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Completed:</span>
                      <span className="font-semibold text-slate-900">
                        {student.completedSessions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Upcoming:</span>
                      <span className="font-semibold text-slate-900">
                        {student.upcomingSessions}
                      </span>
                    </div>
                    {student.lastSessionDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Last Session:</span>
                        <span className="font-semibold text-slate-900">
                          {student.lastSessionDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Favorite Topics */}
                  {student.favoriteTopics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="text-xs text-slate-600 mb-2">Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {student.favoriteTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => handleViewStudent(student)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        student.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{student.name}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                            student.status
                          )}`}
                        >
                          {student.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{student.email}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-slate-900">
                          {student.totalSessions}
                        </div>
                        <div className="text-xs text-slate-600">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600">
                          ${student.totalSpent}
                        </div>
                        <div className="text-xs text-slate-600">Spent</div>
                      </div>
                      {student.lastSessionDate && (
                        <div className="text-center">
                          <div className="font-bold text-slate-900">
                            {student.lastSessionDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-slate-600">Last Session</div>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <i className="fa-solid fa-chevron-right text-slate-400"></i>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-users text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No students found
            </h3>
            <p className="text-slate-600">
              {searchQuery
                ? "Try adjusting your search query"
                : "You haven't taught any students yet"}
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedStudent.photo ? (
                    <img
                      src={selectedStudent.photo}
                      alt={selectedStudent.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    selectedStudent.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-slate-600">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loadingModal ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-slate-900">
                        {selectedStudent.totalSessions}
                      </div>
                      <div className="text-sm text-slate-600">Total Sessions</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedStudent.completedSessions}
                      </div>
                      <div className="text-sm text-slate-600">Completed</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedStudent.upcomingSessions}
                      </div>
                      <div className="text-sm text-slate-600">Upcoming</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        ${selectedStudent.totalSpent}
                      </div>
                      <div className="text-sm text-slate-600">Total Spent</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      {selectedStudent.firstSessionDate && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <i className="fa-solid fa-flag text-indigo-600"></i>
                          <span>
                            First session:{" "}
                            {selectedStudent.firstSessionDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {selectedStudent.lastSessionDate && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <i className="fa-solid fa-clock text-indigo-600"></i>
                          <span>
                            Last session:{" "}
                            {selectedStudent.lastSessionDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favorite Topics */}
                  {selectedStudent.favoriteTopics.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Favorite Topics
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.favoriteTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Session History */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">
                      Session History ({studentSessions.length})
                    </h4>
                    <div className="space-y-2">
                      {studentSessions.length > 0 ? (
                        studentSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900 mb-1">
                                {session.topic}
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(session.date).toLocaleDateString()} at{" "}
                                {session.time} • {session.duration}h
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getSessionStatusColor(
                                  session.status
                                )}`}
                              >
                                {session.status}
                              </span>
                              <div className="font-bold text-slate-900">
                                ${session.amount}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-600">
                          No sessions found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}