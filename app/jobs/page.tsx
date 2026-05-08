"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import SideBar from "../sidebar/page";
import Link from "next/link";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/Kusudl0BaVtKB3QUdqdMYC";

interface UserData {
  fullName: string;
  plan: "free" | "premium";
  careerGoal?: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            fullName: data.fullName || "Learner",
            plan: data.plan || "free",
            careerGoal: data.careerGoal,
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const isPremium = userData?.plan === "premium";

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0 min-h-screen">
      <SideBar />

      <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

        {isPremium ? (
          <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                <i className="fa-solid fa-crown text-amber-500 text-[10px]" />
                Premium Access
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Jobs & Gigs 💼
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Exclusive tech job opportunities and gigs sent directly to our premium WhatsApp group. Join to get notified instantly.
              </p>
            </div>

            {/* Main WhatsApp card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
              {/* Green top bar */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <i className="fa-brands fa-whatsapp text-4xl text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">AmTechy Jobs & Gigs Group</h2>
                <p className="text-green-100 text-sm">Premium members only · Updated daily</p>
              </div>

              <div className="p-6">
                {/* What you get */}
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  What you get inside
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    { icon: "fa-briefcase",     color: "text-blue-500",   bg: "bg-blue-50",   text: "Full-time & part-time tech job listings" },
                    { icon: "fa-laptop-code",   color: "text-violet-500", bg: "bg-violet-50", text: "Freelance gigs and contract opportunities" },
                    { icon: "fa-bell",          color: "text-amber-500",  bg: "bg-amber-50",  text: "Instant notifications — new jobs posted daily" },
                    { icon: "fa-handshake",     color: "text-emerald-500",bg: "bg-emerald-50",text: "Direct referrals from partner companies" },
                    { icon: "fa-graduation-cap",color: "text-pink-500",   bg: "bg-pink-50",   text: "Internship & entry-level roles for new grads" },
                    { icon: "fa-globe",         color: "text-cyan-500",   bg: "bg-cyan-50",   text: "Remote & on-site opportunities across Africa" },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <i className={`fa-solid ${item.icon} ${item.color} text-sm`} />
                      </div>
                      <span className="text-sm text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 text-base"
                >
                  <i className="fa-brands fa-whatsapp text-xl" />
                  Join the WhatsApp Group
                </a>

                <p className="text-center text-xs text-slate-400 mt-3">
                  Tap the button above to open WhatsApp and join instantly
                </p>
              </div>
            </div>

            {/* Info note */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
              <i className="fa-solid fa-circle-info text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-indigo-800 mb-0.5">How it works</p>
                <p className="text-xs text-indigo-600 leading-relaxed">
                  All job listings are shared directly in the WhatsApp group by the AmTechy team. You'll get notified the moment a new opportunity is posted. Make sure to turn on WhatsApp notifications for the group.
                </p>
              </div>
            </div>

          </div>

        ) : (

          /* ── FREE USER — LOCKED VIEW ─────────────────────────────────── */
          <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center px-4">

            {/* Lock icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200 rounded-3xl flex items-center justify-center">
                <i className="fa-solid fa-lock text-amber-500 text-3xl" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-crown text-white text-xs" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              Premium Feature
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Jobs & Gigs is Premium Only
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
              Upgrade to Premium to get exclusive access to our WhatsApp Jobs & Gigs group where we post tech jobs, freelance gigs, internships, and referrals daily — just for AmTechy premium members.
            </p>

            {/* What they're missing */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 mb-6 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">What you'll unlock</p>
              <div className="space-y-2.5">
                {[
                  "Daily tech job & gig listings on WhatsApp",
                  "Freelance & remote opportunities",
                  "Direct referrals from partner companies",
                  "Internship & entry-level roles",
                  "Instant notifications for new postings",
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-lock text-slate-300 text-[9px]" />
                    </div>
                    <span className="text-sm text-slate-400 line-through">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade button */}
            <Link href="/pricing" className="w-full">
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200 text-base">
                <i className="fa-solid fa-crown text-amber-300 text-sm" />
                Upgrade to Premium
              </button>
            </Link>

            <p className="text-xs text-slate-400 mt-3">
              Starting from ₦12,500/month · Cancel anytime via WhatsApp
            </p>
          </div>
        )}

      </section>
    </main>
  );
}