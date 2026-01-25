"use client";
export const dynamic = "force-dynamic";


import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function BookTutor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tutorId, setTutorId] = useState<string | null>(null);
  
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
    const id = searchParams.get('tutorId');
    console.log("URL tutorId:", id);
    setTutorId(id);
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        if (tutorId) {
          await fetchTutor();
          setLoading(false);
        } else if (tutorId === null) {
          // Still waiting for tutorId to be set
          return;
        } else {
          console.error("No tutor ID provided");
          alert("Invalid tutor selection. Please try again.");
          router.push("/find-tutor");
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [tutorId, router]);

  const fetchTutor = async () => {
    if (!tutorId) {
      console.error("No tutor ID provided");
      return;
    }
    
    try {
      console.log("Fetching tutor with ID:", tutorId);
      const tutorDoc = await getDoc(doc(db, "tutors", tutorId));
      
      if (tutorDoc.exists()) {
        console.log("Tutor found:", tutorDoc.data());
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
        console.error("Tutor not found with ID:", tutorId);
        alert("Tutor not found. Redirecting to find tutors page.");
        router.push("/find-tutor");
      }
    } catch (error) {
      console.error("Error fetching tutor:", error);
      alert("Error loading tutor information. Please try again.");
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Book a Session</h1>
                  <p className="text-sm text-slate-600">Choose your preferred date and time</p>
                </div>
              </div>

              <div className="space-y-6">
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
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          sessionType === type.id
                            ? "border-indigo-600 bg-indigo-50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="font-bold text-slate-900">{type.label}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          ${(tutor.hourlyRate * type.price).toFixed(0)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Date
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableDates.map((date) => (
                      <button
                        key={date.value}
                        type="button"
                        onClick={() => setSelectedDate(date.value)}
                        className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${
                          selectedDate === date.value
                            ? "border-indigo-600 bg-indigo-50 font-semibold shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1 rounded-lg">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setSelectedTime(slot.value)}
                        className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${
                          selectedTime === slot.value
                            ? "border-indigo-600 bg-indigo-50 font-semibold shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Session Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What would you like to learn or discuss? Any specific topics or questions?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Help your mentor prepare by sharing what you'd like to focus on
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={submitting || !selectedDate || !selectedTime}
                  className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Booking - ${calculateTotal()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Session Summary</h2>

              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-slate-200">
                <img
                  src={
                    tutor.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=6366f1&color=fff&size=56`
                  }
                  alt={tutor.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{tutor.name}</h3>
                    {tutor.verified && (
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{tutor.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-slate-700">{tutor.rating}</span>
                    <span className="text-xs text-slate-400">({tutor.reviewCount})</span>
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
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString("en-US", {
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
                    <span className="text-2xl font-bold text-indigo-600">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-blue-900">
                    You'll receive a confirmation email once the mentor accepts your booking request. The session link will be shared 30 minutes before the scheduled time.
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