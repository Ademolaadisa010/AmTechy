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

function PaymentModal({ tutor, amount, onSuccess, onClose }: {
  tutor: Tutor; amount: number; onSuccess: () => void; onClose: () => void;
}) {
  const [payMethod, setPayMethod] = useState<"card" | "transfer">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const formatCard = (val: string) => val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length >= 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const handlePay = async () => {
    setError("");
    if (payMethod === "card" && (!cardNumber || !expiry || !cvv || !cardName)) {
      setError("Please fill in all card details.");
      return;
    }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2200)); // Replace with Paystack SDK
    setProcessing(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-xs uppercase tracking-widest font-semibold">Secure Payment</p>
            <p className="text-white text-2xl font-bold mt-0.5">{toNaira(amount)}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-xs font-semibold">SSL Secured</span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            {(["card", "transfer"] as const).map((m) => (
              <button key={m} onClick={() => setPayMethod(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${payMethod === m ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {m === "card" ? "💳  Debit/Credit Card" : "🏦  Bank Transfer"}
              </button>
            ))}
          </div>

          {payMethod === "card" ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Card Number</label>
                <input type="text" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Name on Card</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="JOHN DOE"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Expiry</label>
                  <input type="text" inputMode="numeric" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">CVV</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-slate-800">Transfer exactly {toNaira(amount)} to:</p>
              <div className="space-y-1 text-slate-700">
                <p><span className="text-slate-500">Bank:</span> <strong>Guaranty Trust Bank</strong></p>
                <p><span className="text-slate-500">Account No:</span> <strong className="font-mono tracking-wider">0123456789</strong></p>
                <p><span className="text-slate-500">Account Name:</span> <strong>SkillPath Escrow Ltd</strong></p>
              </div>
              <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mt-2">
                ⚠️ Use your name as the transfer narration. Funds are held in escrow until the session is complete.
              </p>
            </div>
          )}

          {error && <p className="text-red-600 text-xs bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={processing}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handlePay} disabled={processing}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {processing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Processing…</>
              ) : <>Pay {toNaira(amount)}</>}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400">Powered by Paystack · Your payment is secured with 256-bit encryption</p>
        </div>
      </div>
    </div>
  );
}

export default function BookTutor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState<Tutor | null>(null);
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

  useEffect(() => { setTutorId(searchParams.get("tutorId")); }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        if (tutorId) { await fetchTutor(); setLoading(false); }
        else if (tutorId === null) return;
        else { router.push("/find-tutor"); setLoading(false); }
      } else { router.push("/login"); }
    });
    return () => unsubscribe();
  }, [tutorId, router]);

  const fetchTutor = async () => {
    if (!tutorId) return;
    try {
      const tutorDoc = await getDoc(doc(db, "tutors", tutorId));
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
      } else { router.push("/find-tutor"); }
    } catch { router.push("/find-tutor"); }
  };

  const calculateTotal = () => {
    if (!tutor) return 0;
    return tutor.hourlyRate * (sessionTypes.find((s) => s.id === sessionType)?.price || 1);
  };

  const handleProceedToPayment = () => {
    if (!selectedDate || !selectedTime) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setStep("payment");
    setSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        userId,
        tutorId: tutor!.id,
        tutorName: tutor!.name,
        date: selectedDate,
        time: selectedTime,
        sessionType,
        notes,
        totalAmountNGN: calculateTotal() * USD_TO_NGN,
        totalAmountUSD: calculateTotal(),
        paymentStatus: "paid",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setStep("confirm");
    } catch { alert("Booking failed after payment. Please contact support."); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking details…</p>
        </div>
      </main>
    );
  }

  if (!tutor) return null;

  if (step === "confirm") {
    return (
      <main className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-6 text-sm">
            Payment received. Your session with <span className="font-semibold text-slate-800">{tutor.name}</span> is confirmed.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-semibold text-slate-800">{timeSlots.find((s) => s.value === selectedTime)?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-slate-800">{sessionTypes.find((s) => s.id === sessionType)?.label}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-bold text-indigo-600">{toNaira(calculateTotal())}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-6">A session link will be sent to your email 30 minutes before the scheduled time.</p>
          <button onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        <StepIndicator current={step} />

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
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Session Duration</label>
                  <div className="grid grid-cols-3 gap-3">
                    {sessionTypes.map((type) => (
                      <button key={type.id} onClick={() => setSessionType(type.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${sessionType === type.id ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="font-bold text-slate-900">{type.label}</div>
                        <div className="text-sm text-indigo-600 font-semibold mt-1">{toNaira(tutor.hourlyRate * type.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableDates.map((date) => (
                      <button key={date.value} onClick={() => setSelectedDate(date.value)}
                        className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${selectedDate === date.value ? "border-indigo-600 bg-indigo-50 font-semibold shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Time</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1 rounded-lg">
                    {timeSlots.map((slot) => (
                      <button key={slot.value} onClick={() => setSelectedTime(slot.value)}
                        className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${selectedTime === slot.value ? "border-indigo-600 bg-indigo-50 font-semibold shadow-sm" : "border-slate-200 hover:border-slate-300"}`}>
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Session Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="What would you like to learn or discuss? Any specific topics or questions?"
                    rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
                </div>

                <button onClick={handleProceedToPayment} disabled={!selectedDate || !selectedTime || submitting}
                  className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2">
                  {submitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving booking…</>
                  ) : (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>Proceed to Payment — {toNaira(calculateTotal())}</>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">
                  🔒 Payment is processed securely before your session is confirmed
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Session Summary</h2>
              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-slate-200">
                <img src={tutor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=6366f1&color=fff&size=56`}
                  alt={tutor.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100" />
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

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-900">{sessionTypes.find((s) => s.id === sessionType)?.label}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="font-semibold text-slate-900">{timeSlots.find((s) => s.value === selectedTime)?.label}</span>
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

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-amber-900">
                    Payment is required to confirm your booking. Funds are held in escrow and released to the mentor after the session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal tutor={tutor} amount={calculateTotal()} onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />
      )}
    </main>
  );
}