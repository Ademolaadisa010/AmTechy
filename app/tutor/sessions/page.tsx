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
  limit,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
  startAfter,
} from "firebase/firestore";

interface Session {
  id: string;
  bookingId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhoto?: string;
  tutorId: string;
  topic: string;
  sessionType: string;
  date: string;
  time: string;
  duration: number;
  amount: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  meetingLink?: string;
  notes?: string;
  materials?: string[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

type FilterTab = "upcoming" | "ongoing" | "past" | "all";

export default function TutorSessions() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showMeetingLinkModal, setShowMeetingLinkModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchSessions(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterSessions();
  }, [sessions, activeTab, searchQuery]);

  const fetchSessions = async (tutorId: string, loadMore = false) => {
    try {
      // Fetch confirmed bookings as sessions
      let sessionsQuery = query(
        collection(db, "bookings"),
        where("tutorId", "==", tutorId),
        where("status", "in", ["confirmed", "completed"]),
        orderBy("date", "desc"),
        limit(20)
      );

      if (loadMore && lastDoc) {
        sessionsQuery = query(
          collection(db, "bookings"),
          where("tutorId", "==", tutorId),
          where("status", "in", ["confirmed", "completed"]),
          orderBy("date", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      const snapshot = await getDocs(sessionsQuery);

      if (snapshot.docs.length < 20) {
        setHasMore(false);
      }

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      const sessionsData: Session[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const sessionDate = new Date(data.date + " " + data.time);
        const now = new Date();
        const sessionEndTime = new Date(
          sessionDate.getTime() + data.duration * 60 * 60 * 1000
        );

        let status: "upcoming" | "ongoing" | "completed" | "cancelled" = "upcoming";

        if (data.status === "completed") {
          status = "completed";
        } else if (now >= sessionDate && now <= sessionEndTime) {
          status = "ongoing";
        } else if (now < sessionDate) {
          status = "upcoming";
        } else {
          status = "completed";
        }

        return {
          id: doc.id,
          bookingId: doc.id,
          studentId: data.userId,
          studentName: data.userName || "Student",
          studentEmail: data.userEmail || "",
          studentPhoto: data.userPhoto,
          tutorId: data.tutorId,
          topic: data.topic || "General Tutoring",
          sessionType: data.sessionType || "One-on-One",
          date: data.date,
          time: data.time,
          duration: data.duration || 1,
          amount: data.totalAmount,
          status,
          meetingLink: data.meetingLink,
          notes: data.notes,
          materials: data.materials,
          createdAt: data.createdAt?.toDate() || new Date(),
          startedAt: data.startedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
        };
      });

      if (loadMore) {
        setSessions((prev) => [...prev, ...sessionsData]);
      } else {
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Filter by tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter((s) => s.status === "upcoming");
    } else if (activeTab === "ongoing") {
      filtered = filtered.filter((s) => s.status === "ongoing");
    } else if (activeTab === "past") {
      filtered = filtered.filter(
        (s) => s.status === "completed" || s.status === "cancelled"
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.studentName.toLowerCase().includes(query) ||
          session.topic.toLowerCase().includes(query) ||
          session.studentEmail.toLowerCase().includes(query)
      );
    }

    setFilteredSessions(filtered);
  };

  const handleAddMeetingLink = async () => {
    if (!selectedSession || !meetingLink.trim()) return;

    setActionLoading(true);
    try {
      const sessionRef = doc(db, "bookings", selectedSession.id);
      await updateDoc(sessionRef, {
        meetingLink: meetingLink.trim(),
        updatedAt: new Date(),
      });

      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSession.id
            ? { ...session, meetingLink: meetingLink.trim() }
            : session
        )
      );

      setShowMeetingLinkModal(false);
      setMeetingLink("");
      alert("Meeting link added successfully!");
    } catch (error) {
      console.error("Error adding meeting link:", error);
      alert("Failed to add meeting link. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSession) return;

    setActionLoading(true);
    try {
      const sessionRef = doc(db, "bookings", selectedSession.id);
      await updateDoc(sessionRef, {
        notes: sessionNotes.trim(),
        updatedAt: new Date(),
      });

      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSession.id
            ? { ...session, notes: sessionNotes.trim() }
            : session
        )
      );

      setShowNotesModal(false);
      alert("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartSession = async (sessionId: string) => {
    if (!confirm("Mark this session as started?")) return;

    try {
      const sessionRef = doc(db, "bookings", sessionId);
      await updateDoc(sessionRef, {
        startedAt: new Date(),
        updatedAt: new Date(),
      });

      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, status: "ongoing" as const, startedAt: new Date() }
            : session
        )
      );

      alert("Session started!");
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session. Please try again.");
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (!confirm("Mark this session as completed?")) return;

    try {
      const sessionRef = doc(db, "bookings", sessionId);
      await updateDoc(sessionRef, {
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      });

      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                status: "completed" as const,
                completedAt: new Date(),
              }
            : session
        )
      );

      alert("Session marked as completed!");
    } catch (error) {
      console.error("Error completing session:", error);
      alert("Failed to complete session. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ongoing":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return "fa-clock";
      case "ongoing":
        return "fa-video";
      case "completed":
        return "fa-check-circle";
      case "cancelled":
        return "fa-times-circle";
      default:
        return "fa-circle";
    }
  };

  const getTabCounts = () => {
    return {
      all: sessions.length,
      upcoming: sessions.filter((s) => s.status === "upcoming").length,
      ongoing: sessions.filter((s) => s.status === "ongoing").length,
      past: sessions.filter(
        (s) => s.status === "completed" || s.status === "cancelled"
      ).length,
    };
  };

  const isSessionLive = (session: Session) => {
    const sessionDate = new Date(session.date + " " + session.time);
    const now = new Date();
    const sessionEndTime = new Date(
      sessionDate.getTime() + session.duration * 60 * 60 * 1000
    );
    return now >= sessionDate && now <= sessionEndTime;
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const tabCounts = getTabCounts();

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
            <h1 className="text-3xl font-bold text-slate-900">My Sessions</h1>
            <p className="text-slate-600 mt-1">
              Manage your tutoring sessions and track your teaching history
            </p>
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
              onClick={() => router.push("/tutor/bookings")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <i className="fa-solid fa-bookmark mr-2"></i>
              Bookings
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2 mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Sessions
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20">
              {tabCounts.all}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "upcoming"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i className="fa-solid fa-clock mr-2"></i>
            Upcoming
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20">
              {tabCounts.upcoming}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "ongoing"
                ? "bg-green-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i className="fa-solid fa-video mr-2"></i>
            Live Now
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20">
              {tabCounts.ongoing}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "past"
                ? "bg-slate-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i className="fa-solid fa-history mr-2"></i>
            Past
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white bg-opacity-20">
              {tabCounts.past}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by student name, topic, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                  isSessionLive(session)
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Student Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {session.studentPhoto ? (
                          <img
                            src={session.studentPhoto}
                            alt={session.studentName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          session.studentName.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            {session.topic}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                              session.status
                            )}`}
                          >
                            <i
                              className={`fa-solid ${getStatusIcon(
                                session.status
                              )} mr-1`}
                            ></i>
                            {session.status === "ongoing"
                              ? "LIVE NOW"
                              : session.status.toUpperCase()}
                          </span>
                          {isSessionLive(session) && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse">
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                              LIVE
                            </span>
                          )}
                        </div>

                        <p className="text-slate-600 mb-3">
                          with <span className="font-semibold">{session.studentName}</span>
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-700">
                            <i className="fa-solid fa-calendar text-indigo-600"></i>
                            <span>
                              {new Date(session.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <i className="fa-solid fa-clock text-indigo-600"></i>
                            <span>{session.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <i className="fa-solid fa-hourglass text-indigo-600"></i>
                            <span>{session.duration}h</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <i className="fa-solid fa-dollar-sign"></i>
                            <span>${session.amount}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <i className="fa-solid fa-users text-indigo-600"></i>
                            <span>{session.sessionType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <i className="fa-solid fa-envelope text-indigo-600"></i>
                            <span className="truncate">{session.studentEmail}</span>
                          </div>
                        </div>

                        {/* Session Notes Preview */}
                        {session.notes && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-slate-700 line-clamp-2">
                              <i className="fa-solid fa-note-sticky mr-2 text-blue-600"></i>
                              {session.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {/* Join Button for Live/Upcoming Sessions */}
                      {(session.status === "ongoing" ||
                        session.status === "upcoming") && (
                        <>
                          {session.meetingLink ? (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-4 py-3 rounded-lg font-semibold text-center transition-colors ${
                                isSessionLive(session)
                                  ? "bg-green-600 hover:bg-green-700 text-white animate-pulse"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                              }`}
                            >
                              <i className="fa-solid fa-video mr-2"></i>
                              {isSessionLive(session) ? "Join Now" : "Join Session"}
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setMeetingLink("");
                                setShowMeetingLinkModal(true);
                              }}
                              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors text-sm"
                            >
                              <i className="fa-solid fa-link mr-2"></i>
                              Add Link
                            </button>
                          )}
                        </>
                      )}

                      {/* Action Buttons */}
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setSessionNotes(session.notes || "");
                          setShowNotesModal(true);
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        <i className="fa-solid fa-note-sticky mr-2"></i>
                        {session.notes ? "View Notes" : "Add Notes"}
                      </button>

                      {session.status === "upcoming" && (
                        <button
                          onClick={() => handleStartSession(session.id)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          <i className="fa-solid fa-play mr-2"></i>
                          Start
                        </button>
                      )}

                      {session.status === "ongoing" && (
                        <button
                          onClick={() => handleCompleteSession(session.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <i className="fa-solid fa-check mr-2"></i>
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-calendar-xmark text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No sessions found
              </h3>
              <p className="text-slate-600">
                {searchQuery
                  ? "Try adjusting your search query"
                  : activeTab === "all"
                  ? "You don't have any sessions yet"
                  : `You don't have any ${activeTab} sessions`}
              </p>
            </div>
          )}

          {/* Load More */}
          {hasMore && filteredSessions.length > 0 && (
            <div className="text-center pt-4">
              <button
                onClick={() => user && fetchSessions(user.uid, true)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Load More Sessions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Meeting Link Modal */}
      {showMeetingLinkModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Add Meeting Link
              </h3>
              <button
                onClick={() => setShowMeetingLinkModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Details
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="font-semibold text-slate-900">
                    {selectedSession.topic}
                  </div>
                  <div className="text-slate-600">
                    with {selectedSession.studentName}
                  </div>
                  <div className="text-slate-600">
                    {new Date(selectedSession.date).toLocaleDateString()} at{" "}
                    {selectedSession.time}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Call Link
                  <span className="text-slate-500 font-normal ml-1">
                    (Zoom, Google Meet, etc.)
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  The student will be able to join the session using this link.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMeetingLinkModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMeetingLink}
                disabled={actionLoading || !meetingLink.trim()}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-save mr-2"></i>
                    Save Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Notes Modal */}
      {showNotesModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Session Notes</h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Details
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="font-semibold text-slate-900">
                    {selectedSession.topic}
                  </div>
                  <div className="text-slate-600">
                    with {selectedSession.studentName}
                  </div>
                  <div className="text-slate-600">
                    {new Date(selectedSession.date).toLocaleDateString()} at{" "}
                    {selectedSession.time}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                  <span className="text-slate-500 font-normal ml-1">
                    (Topics covered, homework assigned, etc.)
                  </span>
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={8}
                  placeholder="Enter your session notes here..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  These notes are private and only visible to you.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-save mr-2"></i>
                    Save Notes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}