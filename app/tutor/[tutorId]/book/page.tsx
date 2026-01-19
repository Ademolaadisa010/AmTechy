"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface Tutor {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  profileImage?: string;
  availability: string;
  verified: boolean;
}

export default function BookTutor({ params }: { params: { tutorId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("1-hour");
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState("");

  const sessionTypes = [
    { id: "30-min", label: "30 Minutes", price: 0.5 },
    { id: "1-hour", label: "1 Hour", price: 1 },
    { id: "2-hour", label: "2 Hours", price: 2 },
  ];

  // Generate next 7 days
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return dates;
  };

  // Generate time slots
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${min
          .toString()
          .padStart(2, "0")}`;
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayTime = `${displayHour}:${min
          .toString()
          .padStart(2, "0")} ${period}`;
        slots.push({ value: time, label: displayTime });
      }
    }
    return slots;
  };

  const availableDates = getAvailableDates();
  const timeSlots = getTimeSlots();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchTutor();
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTutor = async () => {
    try {
      const tutorDoc = await getDoc(doc(db, "tutors", params.tutorId));
      if (tutorDoc.exists()) {
        setTutor({
          id: tutorDoc.id,
          name: tutorDoc.data().name || "",
          title: tutorDoc.data().title || "",
          company: tutorDoc.data().company || "",
          bio: tutorDoc.data().bio || "",
          skills: tutorDoc.data().skills || [],
          rating: tutorDoc.data().rating || 4.5,
          reviewCount: tutorDoc.data().reviewCount || 0,
          hourlyRate: tutorDoc.data().hourlyRate || 40,
          profileImage: tutorDoc.data().profileImage,
          availability: tutorDoc.data().availability || "Available",
          verified: tutorDoc.data().verified || false,
        });
      } else {
        router.push("/find-tutor");
      }
    } catch (error) {
      console.error("Error fetching tutor:", error);
      router.push("/find-tutor");
    }
  };

  const calculateTotal = () => {
    if (!tutor) return 0;
    const sessionMultiplier =
      sessionTypes.find((s) => s.id === sessionType)?.price || 1;
    return tutor.hourlyRate * sessionMultiplier;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !tutor) {
      alert("Please select a date and time");
      return;
    }

    setSubmitting(true);

    try {
      const booking = {
        userId,
        tutorId: tutor.id,
        tutorName: tutor.name,
        date: selectedDate,
        time: selectedTime,
        sessionType,
        notes,
        totalAmount: calculateTotal(),
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), booking);

      alert("Booking successful! The tutor will confirm shortly.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking details...</p>
        </div>
      </main>
    );
  }

  if (!tutor) return null;

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">
                Book a Session
              </h1>

              <div className="space-y-6">
                {/* Session Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Session Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {sessionTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSessionType(type.id)}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          sessionType === type.id
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold text-slate-900">
                          {type.label}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          ${(tutor.hourlyRate * type.price).toFixed(0)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Date
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableDates.map((date) => (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => setSelectedDate(date.value)}
                        className={`p-3 rounded-lg border-2 text-center text-sm transition-all ${
                          selectedDate === date.value
                            ? "border-indigo-600 bg-indigo-50 font-semibold"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Time
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setSelectedTime(slot.value)}
                        className={`p-3 rounded-lg border-2 text-center text-sm transition-all ${
                          selectedTime === slot.value
                            ? "border-indigo-600 bg-indigo-50 font-semibold"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Session Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What would you like to learn or discuss?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={submitting || !selectedDate || !selectedTime}
                  className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    `Confirm Booking - $${calculateTotal()}`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tutor Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Session Summary
              </h2>

              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-slate-200">
                <img
                  src={
                    tutor.profileImage ||
                    `https://ui-avatars.com/api/?name=${tutor.name}&background=6366f1&color=fff`
                  }
                  alt={tutor.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{tutor.name}</h3>
                    {tutor.verified && (
                      <i className="fa-solid fa-circle-check text-indigo-600 text-sm"></i>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{tutor.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                    <span className="text-sm font-bold text-slate-700">
                      {tutor.rating}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({tutor.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Session Type</span>
                  <span className="font-semibold text-slate-900">
                    {sessionTypes.find((s) => s.id === sessionType)?.label}
                  </span>
                </div>

                {selectedDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Date</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {selectedTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Time</span>
                    <span className="font-semibold text-slate-900">
                      {timeSlots.find((s) => s.value === selectedTime)?.label}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <i className="fa-solid fa-circle-info mt-0.5"></i>
                  <p>
                    You'll receive a confirmation email once the tutor accepts
                    your booking request.
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