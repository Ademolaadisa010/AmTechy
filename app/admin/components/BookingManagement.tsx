"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  studentName: string;
  tutorName: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: number;
  createdAt: any;
  notes?: string;
}

interface BookingManagementProps {
  onUpdate?: () => void;
}

export default function BookingManagement({ onUpdate }: BookingManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc"),
        limit(200)
      );
      const snapshot = await getDocs(bookingsQuery);
      
      const bookingsData: Booking[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        studentId: doc.data().studentId,
        tutorId: doc.data().tutorId,
        studentName: doc.data().studentName,
        tutorName: doc.data().tutorName,
        topic: doc.data().topic,
        date: doc.data().date,
        time: doc.data().time,
        duration: doc.data().duration || "60 min",
        status: doc.data().status,
        amount: doc.data().amount || 0,
        createdAt: doc.data().createdAt,
        notes: doc.data().notes,
      }));
      
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    if (!confirm(`Update booking status to ${newStatus}?`)) return;

    setProcessing(true);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      alert("Booking status updated successfully!");
      await fetchBookings();
      if (onUpdate) onUpdate();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }

    setProcessing(true);
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      alert("Booking deleted successfully!");
      await fetchBookings();
      if (onUpdate) onUpdate();
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === "all" || booking.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      booking.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.topic.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "fa-check-circle";
      case "completed":
        return "fa-circle-check";
      case "cancelled":
        return "fa-circle-xmark";
      default:
        return "fa-clock";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Management</h2>
        <p className="text-slate-600">Oversee and manage all platform bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by student, tutor, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {bookings.filter((b) => b.status === "pending").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">
            {bookings.filter((b) => b.status === "confirmed").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {bookings.filter((b) => b.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tutor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{booking.topic}</p>
                      <p className="text-sm text-slate-500">{booking.duration}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{booking.studentName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{booking.tutorName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-900">{booking.date}</p>
                      <p className="text-sm text-slate-500">{booking.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-green-600">${booking.amount}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(booking.status)}`}>
                      <i className={`fa-solid ${getStatusIcon(booking.status)}`}></i>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <i className="fa-solid fa-calendar-xmark text-slate-300 text-4xl mb-4"></i>
            <p className="text-slate-600">No bookings found</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Booking Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-xmark text-slate-600"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${getStatusColor(selectedBooking.status)}`}>
                  <i className={`fa-solid ${getStatusIcon(selectedBooking.status)}`}></i>
                  {selectedBooking.status.toUpperCase()}
                </span>
                <p className="text-2xl font-bold text-green-600">${selectedBooking.amount}</p>
              </div>

              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Student</p>
                  <p className="font-medium text-slate-900">{selectedBooking.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Tutor</p>
                  <p className="font-medium text-slate-900">{selectedBooking.tutorName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Topic</p>
                  <p className="font-medium text-slate-900">{selectedBooking.topic}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Duration</p>
                  <p className="font-medium text-slate-900">{selectedBooking.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Date</p>
                  <p className="font-medium text-slate-900">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Time</p>
                  <p className="font-medium text-slate-900">{selectedBooking.time}</p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Notes</p>
                  <p className="text-slate-900 bg-slate-50 p-4 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <i className="fa-solid fa-calendar mr-2"></i>
                  <strong>Booked:</strong> {selectedBooking.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700">Update Status:</p>
                <div className="grid grid-cols-2 gap-3">
                  {["pending", "confirmed", "completed", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedBooking.id, status)}
                      disabled={processing || selectedBooking.status === status}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedBooking.status === status
                          ? "bg-slate-200 text-slate-700"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  disabled={processing}
                  className="w-full mt-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash mr-2"></i>
                      Delete Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}