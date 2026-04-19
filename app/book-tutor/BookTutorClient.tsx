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

const USD_TO_NGN = 1600;

const toNaira = (usd: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(usd * USD_TO_NGN);

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

type Step = "schedule" | "payment" | "confirm";

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "schedule", label: "Schedule" },
    { id: "payment", label: "Payment" },
    { id: "confirm", label: "Confirmed" },
  ];
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < idx
                  ? "bg-green-500 text-white"
                  : i === idx
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {i < idx ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (i + 1)}
            </div>
            <span className={`text-xs font-medium ${i === idx ? "text-indigo-600" : i < idx ? "text-green-600" : "text-slate-400"}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${i < idx ? "bg-green-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Payment Modal — Bank Transfer ONLY ───────────────────────────────────────
function PaymentModal({
  amount,
  tutorName,
  onConfirm,
  onClose,
}: {
  amount: number;
  tutorName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!confirmed) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-indigo-200 text-xs uppercase tracking-widest font-semibold">
              Bank Transfer Required
            </p>
            <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-semibold">
              <i className="fa-solid fa-lock text-xs" />
              Escrow Protected
            </span>
          </div>
          <p className="text-white text-3xl font-bold">{toNaira(amount)}</p>
          <p className="text-indigo-200 text-sm mt-0.5">Session with {tutorName}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* How it works */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
            <p className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-indigo-500" />
              How payment works
            </p>
            <div className="space-y-2.5">
              {[
                "Transfer the session fee to our company account below",
                "Your booking is confirmed once transfer is verified (within 1 hour)",
                "After your session is completed, we release payment to your tutor",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-indigo-800 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bank details */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-building-columns text-slate-400" />
              Transfer Details
            </p>
            {[
              { label: "Bank Name", value: "Guaranty Trust Bank (GTB)" },
              { label: "Account Number", value: "0123456789", mono: true },
              { label: "Account Name", value: "AmTechy Technology Ltd" },
              { label: "Amount", value: toNaira(amount), highlight: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className={`text-sm font-bold ${
                  row.highlight ? "text-indigo-600 text-base" : "text-slate-900"
                } ${row.mono ? "font-mono tracking-widest" : ""}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Narration tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              <span className="font-bold">Important:</span> Use your full name as the transfer narration so we can match your payment quickly.
            </p>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div
              onClick={() => setConfirmed(!confirmed)}
              className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                confirmed ? "bg-indigo-600 border-indigo-600" : "border-slate-300 hover:border-indigo-400"
              }`}
            >
              {confirmed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-slate-700 leading-snug">
              I confirm I have transferred <strong>{toNaira(amount)}</strong> to the AmTechy account above and understand my booking will be confirmed after payment verification.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={submitting}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={!confirmed || submitting}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</>
                : <><i className="fa-solid fa-circle-check" />I've Transferred</>}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            Payments verified within 1 hour on business days · Tutors paid after session completion
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BookTutorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("1-hour");
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState("");
  const [step, setStep] = useState<Step>("schedule");
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        label: date.toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" }),
      });
    }
    return dates;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const value = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        slots.push({ value, label: `${displayHour}:${min.toString().padStart(2, "0")} ${period}` });
      }
    }
    return slots;
  };

  const availableDates = getAvailableDates();
  const timeSlots = getTimeSlots();

  useEffect(() => {
    const id = searchParams.get("tutorId");
    setTutorId(id);
  }, [searchParams]);

  useEffect(() => {
    if (tutorId === null) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      setUserId(user.uid);
      if (!tutorId) { router.push("/find-tutor"); return; }
      await fetchTutor(tutorId);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [tutorId, router]);

  const fetchTutor = async (id: string) => {
    try {
      let snap = await getDoc(doc(db, "tutor_profiles", id));
      if (!snap.exists()) snap = await getDoc(doc(db, "tutors", id));
      if (!snap.exists()) { setNotFound(true); return; }
      const d = snap.data();
      setTutor({
        id: snap.id,
        name: d.displayName || d.name || "Unknown Tutor",
        title: d.jobTitle || d.title || "Mentor",
        company: d.company || "",
        bio: d.bio || "",
        skills: Array.isArray(d.expertise) ? d.expertise : Array.isArray(d.skills) ? d.skills : [],
        rating: typeof d.rating === "number" ? d.rating : 5.0,
        reviewCount: d.totalReviews ?? d.reviewCount ?? 0,
        hourlyRate: typeof d.hourlyRate === "number" ? d.hourlyRate : 50,
        profileImage: d.profileImage || d.avatar || undefined,
        availability: d.availability || "Available",
        verified: d.isVerified ?? d.verified ?? true,
      });
    } catch (err) {
      console.error("Error fetching tutor:", err);
      setNotFound(true);
    }
  };

  const calculateTotal = () => {
    if (!tutor) return 0;
    return tutor.hourlyRate * (sessionTypes.find((s) => s.id === sessionType)?.price ?? 1);
  };

  // Called after user ticks "I've transferred" in the modal
  const handlePaymentConfirmed = async () => {
    setShowPayment(false);
    setStep("payment");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        userId,
        tutorId: tutor!.id,
        tutorName: tutor!.name,
        studentId: userId,
        date: selectedDate,
        time: selectedTime,
        sessionType,
        notes,
        amount: calculateTotal(),
        totalAmountNGN: calculateTotal() * USD_TO_NGN,
        totalAmountUSD: calculateTotal(),
        paymentMethod: "bank_transfer",
        // Admin must verify the transfer before marking as confirmed
        paymentStatus: "pending_verification",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setStep("confirm");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to save booking. Please contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading booking details…</p>
        </div>
      </main>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !tutor) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-user-slash text-red-400 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tutor Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            This tutor profile could not be found. They may have been removed or the link is invalid.
          </p>
          <button onClick={() => router.push("/find-tutor")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
            Browse Tutors
          </button>
        </div>
      </main>
    );
  }

  // ── Confirmation screen ───────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <main className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="fa-solid fa-clock text-indigo-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Submitted!</h1>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Your booking with <span className="font-semibold text-slate-800">{tutor.name}</span> has been submitted.
            We'll verify your bank transfer and confirm your session within <strong>1 hour</strong>.
          </p>

          {/* What happens next */}
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-left space-y-3 mb-5">
            <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">What happens next</p>
            {[
              { icon: "fa-magnifying-glass", color: "text-indigo-500", text: "We verify your bank transfer" },
              { icon: "fa-envelope", color: "text-blue-500", text: "You get a confirmation email with session details" },
              { icon: "fa-video", color: "text-green-500", text: "Session link sent 30 mins before your scheduled time" },
              { icon: "fa-money-bill-transfer", color: "text-emerald-600", text: "After the session, we release payment to your tutor" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <i className={`fa-solid ${item.icon} ${item.color} w-4 text-center flex-shrink-0`} />
                <span className="text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border border-slate-200 rounded-xl p-4 text-sm text-left space-y-2 mb-5">
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-NG", {
                  weekday: "long", month: "long", day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-semibold text-slate-800">
                {timeSlots.find((s) => s.value === selectedTime)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-slate-800">
                {sessionTypes.find((s) => s.id === sessionType)?.label}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">Amount Declared</span>
              <span className="font-bold text-indigo-600">{toNaira(calculateTotal())}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 mb-6 text-left">
            <i className="fa-solid fa-triangle-exclamation mr-1.5 text-amber-500" />
            If your payment is not verified within 2 hours, your booking may be cancelled. Contact support if you need help.
          </div>

          <button onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // ── Schedule screen ───────────────────────────────────────────────────────
  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: booking form */}
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
                  <p className="text-sm text-slate-600">with {tutor.name}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Session duration */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Session Duration</label>
                  <div className="grid grid-cols-3 gap-3">
                    {sessionTypes.map((type) => (
                      <button key={type.id} onClick={() => setSessionType(type.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          sessionType === type.id
                            ? "border-indigo-600 bg-indigo-50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}>
                        <div className="font-bold text-slate-900">{type.label}</div>
                        <div className="text-sm text-indigo-600 font-semibold mt-1">
                          {toNaira(tutor.hourlyRate * type.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableDates.map((date) => (
                      <button key={date.value} onClick={() => setSelectedDate(date.value)}
                        className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${
                          selectedDate === date.value
                            ? "border-indigo-600 bg-indigo-50 font-semibold shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}>
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Time</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1 rounded-lg">
                    {timeSlots.map((slot) => (
                      <button key={slot.value} onClick={() => setSelectedTime(slot.value)}
                        className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${
                          selectedTime === slot.value
                            ? "border-indigo-600 bg-indigo-50 font-semibold shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}>
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Session Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="What would you like to learn or discuss? Any specific topics or questions?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
                </div>

                {/* Payment notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <i className="fa-solid fa-building-columns text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <span className="font-bold">Bank transfer only.</span> After clicking below you'll see our GTB account details. Your booking is confirmed once your transfer is verified by our team.
                  </div>
                </div>

                <button
                  onClick={() => { if (selectedDate && selectedTime) setShowPayment(true); }}
                  disabled={!selectedDate || !selectedTime || submitting}
                  className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  ) : (
                    <><i className="fa-solid fa-building-columns" />View Payment Details — {toNaira(calculateTotal())}</>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">
                  🔒 Funds held in escrow · Tutors are paid only after session completion
                </p>
              </div>
            </div>
          </div>

          {/* Right: summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Session Summary</h2>

              <div className="flex items-start gap-3 pb-5 border-b border-slate-200">
                <img
                  src={tutor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=6366f1&color=fff&size=56`}
                  alt={tutor.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900">{tutor.name}</h3>
                    {tutor.verified && <i className="fa-solid fa-circle-check text-indigo-600 text-sm" />}
                  </div>
                  <p className="text-sm text-slate-500">{tutor.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <i className="fa-solid fa-star text-yellow-400 text-xs" />
                    <span className="text-sm font-bold text-slate-700">{tutor.rating}</span>
                    <span className="text-xs text-slate-400">({tutor.reviewCount})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-900">
                    {sessionTypes.find((s) => s.id === sessionType)?.label}
                  </span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-NG", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="font-semibold text-slate-900">
                      {timeSlots.find((s) => s.value === selectedTime)?.label}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-semibold text-slate-900 block">Total</span>
                      <span className="text-xs text-slate-400">≈ ${calculateTotal()} USD</span>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600">{toNaira(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Payment method badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-building-columns text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Bank Transfer</p>
                  <p className="text-xs text-slate-500">GTB · AmTechy Technology Ltd</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-900">
                  <i className="fa-solid fa-circle-info mr-1.5 text-amber-500" />
                  Payment is held in escrow. Your tutor only receives payment after your session is completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && tutor && (
        <PaymentModal
          amount={calculateTotal()}
          tutorName={tutor.name}
          onConfirm={handlePaymentConfirmed}
          onClose={() => setShowPayment(false)}
        />
      )}
    </main>
  );
}