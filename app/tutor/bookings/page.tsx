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
  getDoc,
  startAfter,
  Timestamp,
} from "firebase/firestore";

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  tutorId: string;
  date: string;
  time: string;
  duration: number;
  sessionType: string;
  topic: string;
  message?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  totalAmount: number;
  createdAt: Date;
  updatedAt?: Date;
}

type FilterStatus = "all" | "pending" | "confirmed" | "cancelled" | "completed";

export default function TutorBookings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchBookings(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterBookings();
  }, [bookings, filterStatus, searchQuery]);

  const fetchBookings = async (tutorId: string, loadMore = false) => {
    try {
      let bookingsQuery = query(
        collection(db, "bookings"),
        where("tutorId", "==", tutorId),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      if (loadMore && lastDoc) {
        bookingsQuery = query(
          collection(db, "bookings"),
          where("tutorId", "==", tutorId),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      const snapshot = await getDocs(bookingsQuery);

      if (snapshot.docs.length < 20) {
        setHasMore(false);
      }

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      const bookingsData: Booking[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        userName: doc.data().userName || "Student",
        userEmail: doc.data().userEmail || "",
        userPhoto: doc.data().userPhoto,
        tutorId: doc.data().tutorId,
        date: doc.data().date,
        time: doc.data().time,
        duration: doc.data().duration || 1,
        sessionType: doc.data().sessionType || "One-on-One",
        topic: doc.data().topic || "General Tutoring",
        message: doc.data().message,
        status: doc.data().status,
        totalAmount: doc.data().totalAmount,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));

      if (loadMore) {
        setBookings((prev) => [...prev, ...bookingsData]);
      } else {
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.userName.toLowerCase().includes(query) ||
          booking.topic.toLowerCase().includes(query) ||
          booking.userEmail.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!confirm("Accept this booking request?")) return;

    setActionLoading(bookingId);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "confirmed",
        updatedAt: new Date(),
      });

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "confirmed", updatedAt: new Date() }
            : booking
        )
      );

      alert("Booking accepted successfully!");
    } catch (error) {
      console.error("Error accepting booking:", error);
      alert("Failed to accept booking. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    const reason = prompt("Please provide a reason for declining (optional):");
    if (reason === null) return; // User cancelled

    setActionLoading(bookingId);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "cancelled",
        cancellationReason: reason || "Declined by tutor",
        updatedAt: new Date(),
      });

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled", updatedAt: new Date() }
            : booking
        )
      );

      alert("Booking declined.");
    } catch (error) {
      console.error("Error declining booking:", error);
      alert("Failed to decline booking. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkComplete = async (bookingId: string) => {
    if (!confirm("Mark this session as completed?")) return;

    setActionLoading(bookingId);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      });

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "completed", updatedAt: new Date() }
            : booking
        )
      );

      alert("Session marked as completed!");
    } catch (error) {
      console.error("Error marking complete:", error);
      alert("Failed to mark session as completed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "fa-clock";
      case "confirmed":
        return "fa-check-circle";
      case "cancelled":
        return "fa-times-circle";
      case "completed":
        return "fa-flag-checkered";
      default:
        return "fa-circle";
    }
  };

  const getStatusCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const statusCounts = getStatusCounts();

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
            <h1 className="text-3xl font-bold text-slate-900">Booking Management</h1>
            <p className="text-slate-600 mt-1">
              Manage your tutoring session bookings and requests
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/tutor/schedule")}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              <i className="fa-solid fa-calendar mr-2"></i>
              My Schedule
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setFilterStatus("all")}
            className={`p-4 rounded-lg border-2 transition-all ${
              filterStatus === "all"
                ? "bg-indigo-50 border-indigo-600"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-slate-900">{statusCounts.all}</div>
            <div className="text-sm text-slate-600">All Bookings</div>
          </button>

          <button
            onClick={() => setFilterStatus("pending")}
            className={`p-4 rounded-lg border-2 transition-all ${
              filterStatus === "pending"
                ? "bg-yellow-50 border-yellow-600"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </button>

          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`p-4 rounded-lg border-2 transition-all ${
              filterStatus === "confirmed"
                ? "bg-green-50 border-green-600"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-green-700">{statusCounts.confirmed}</div>
            <div className="text-sm text-slate-600">Confirmed</div>
          </button>

          <button
            onClick={() => setFilterStatus("completed")}
            className={`p-4 rounded-lg border-2 transition-all ${
              filterStatus === "completed"
                ? "bg-blue-50 border-blue-600"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-blue-700">{statusCounts.completed}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </button>

          <button
            onClick={() => setFilterStatus("cancelled")}
            className={`p-4 rounded-lg border-2 transition-all ${
              filterStatus === "cancelled"
                ? "bg-red-50 border-red-600"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-bold text-red-700">{statusCounts.cancelled}</div>
            <div className="text-sm text-slate-600">Cancelled</div>
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

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              {filterStatus === "all" ? "All Bookings" : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Bookings`}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {filteredBookings.length} booking(s) found
            </p>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side - Student Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {booking.userPhoto ? (
                          <img
                            src={booking.userPhoto}
                            alt={booking.userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          booking.userName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {booking.userName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            <i className={`fa-solid ${getStatusIcon(booking.status)} mr-1`}></i>
                            {booking.status}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-2">{booking.userEmail}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-700">
                            <i className="fa-solid fa-book text-indigo-600"></i>
                            <span className="font-medium">{booking.topic}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <i className="fa-solid fa-calendar"></i>
                            <span>{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <i className="fa-solid fa-clock"></i>
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <i className="fa-solid fa-hourglass"></i>
                            <span>{booking.duration} hour(s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <i className="fa-solid fa-users"></i>
                            <span>{booking.sessionType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <i className="fa-solid fa-dollar-sign"></i>
                            <span>${booking.totalAmount}</span>
                          </div>
                        </div>

                        {booking.message && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                              <i className="fa-solid fa-message mr-2 text-slate-400"></i>
                              {booking.message}
                            </p>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-slate-500">
                          Requested {booking.createdAt.toLocaleDateString()} at{" "}
                          {booking.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors whitespace-nowrap"
                      >
                        <i className="fa-solid fa-eye mr-2"></i>
                        View Details
                      </button>

                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAcceptBooking(booking.id)}
                            disabled={actionLoading === booking.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {actionLoading === booking.id ? (
                              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                            ) : (
                              <i className="fa-solid fa-check mr-2"></i>
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineBooking(booking.id)}
                            disabled={actionLoading === booking.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {actionLoading === booking.id ? (
                              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                            ) : (
                              <i className="fa-solid fa-times mr-2"></i>
                            )}
                            Decline
                          </button>
                        </>
                      )}

                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleMarkComplete(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {actionLoading === booking.id ? (
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                          ) : (
                            <i className="fa-solid fa-flag-checkered mr-2"></i>
                          )}
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-inbox text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No bookings found
              </h3>
              <p className="text-slate-600">
                {searchQuery
                  ? "Try adjusting your search query"
                  : filterStatus === "all"
                  ? "You don't have any bookings yet"
                  : `You don't have any ${filterStatus} bookings`}
              </p>
            </div>
          )}

          {/* Load More */}
          {hasMore && filteredBookings.length > 0 && (
            <div className="p-6 border-t border-slate-200 text-center">
              <button
                onClick={() => user && fetchBookings(user.uid, true)}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Load More Bookings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Booking Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full border-2 ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  <i className={`fa-solid ${getStatusIcon(selectedBooking.status)} mr-2`}></i>
                  {selectedBooking.status.toUpperCase()}
                </span>
              </div>

              {/* Student Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Student Information</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedBooking.userPhoto ? (
                      <img
                        src={selectedBooking.userPhoto}
                        alt={selectedBooking.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      selectedBooking.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-lg">
                      {selectedBooking.userName}
                    </div>
                    <div className="text-slate-600">{selectedBooking.userEmail}</div>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Session Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Topic</div>
                    <div className="font-medium text-slate-900">{selectedBooking.topic}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Session Type</div>
                    <div className="font-medium text-slate-900">
                      {selectedBooking.sessionType}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Date</div>
                    <div className="font-medium text-slate-900">
                      {new Date(selectedBooking.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Time</div>
                    <div className="font-medium text-slate-900">{selectedBooking.time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Duration</div>
                    <div className="font-medium text-slate-900">
                      {selectedBooking.duration} hour(s)
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Amount</div>
                    <div className="font-semibold text-green-600 text-lg">
                      ${selectedBooking.totalAmount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Message */}
              {selectedBooking.message && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-message text-blue-600"></i>
                    Student's Message
                  </h4>
                  <p className="text-slate-700">{selectedBooking.message}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <i className="fa-solid fa-clock"></i>
                    <span>
                      Requested on{" "}
                      {selectedBooking.createdAt.toLocaleDateString()} at{" "}
                      {selectedBooking.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  {selectedBooking.updatedAt && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <i className="fa-solid fa-clock-rotate-left"></i>
                      <span>
                        Last updated on{" "}
                        {selectedBooking.updatedAt.toLocaleDateString()} at{" "}
                        {selectedBooking.updatedAt.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedBooking.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleAcceptBooking(selectedBooking.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <i className="fa-solid fa-check mr-2"></i>
                      Accept Booking
                    </button>
                    <button
                      onClick={() => {
                        handleDeclineBooking(selectedBooking.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      <i className="fa-solid fa-times mr-2"></i>
                      Decline Booking
                    </button>
                  </>
                )}

                {selectedBooking.status === "confirmed" && (
                  <button
                    onClick={() => {
                      handleMarkComplete(selectedBooking.id);
                      setShowDetailsModal(false);
                    }}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <i className="fa-solid fa-flag-checkered mr-2"></i>
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}