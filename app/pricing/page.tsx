"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const WHATSAPP_NUMBER = "2349058704410"; // 👈 replace with your actual number

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;   // in Naira
  yearlyPrice: number;    // in Naira (billed annually)
  billingCycle: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonStyle: string;
  emoji: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    billingCycle: "forever",
    description: "Perfect for getting started with your tech journey",
    emoji: "🚀",
    features: [
      "Access to free courses",
      "Basic progress tracking",
      "Email support",
      "Mobile app access",
      "1 Course completion certificate",
    ],
    buttonText: "Get Started Free",
    buttonStyle: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  {
    id: "advance",
    name: "Advance",
    monthlyPrice: 12500,
    yearlyPrice: 120000,
    billingCycle: "per month",
    description: "For serious learners ready to level up their skills",
    emoji: "⚡",
    popular: true,
    features: [
      "Everything in Free",
      "Access to Jobs & Gigs board",
      "All course completion certificates",
      "Ad-free experience",
      "Early access to new courses",
      "Access to community forum",
    ],
    buttonText: "Start Advance",
    buttonStyle: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 32000,
    yearlyPrice: 300000,
    billingCycle: "per month",
    description: "For teams and professionals who want it all",
    emoji: "👑",
    features: [
      "Everything in Advance",
      "Internship placement support",
      "1-on-1 mentor sessions (2/month)",
      "Team analytics dashboard",
      "Custom learning paths",
      "Dedicated account manager",
      "Priority 24/7 support",
      "API access & SSO integration",
    ],
    buttonText: "Start Pro",
    buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Just reach out to us on WhatsApp and we'll sort it out immediately.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers, Opay, Palmpay, Flutterwave, and other local Nigerian payment methods. Contact us on WhatsApp to get your preferred payment link.",
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us on WhatsApp for a full refund.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Absolutely. Message us on WhatsApp at any time to cancel. You'll keep access until the end of your billing period.",
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! Students get 30% off on Advance and Pro plans. Send your student ID via WhatsApp for verification.",
  },
  {
    question: "How do I get access after paying?",
    answer: "After payment confirmation, we'll upgrade your account within 30 minutes. You'll receive a WhatsApp confirmation message.",
  },
];

const comparisonRows = [
  { feature: "Free Courses",        free: true,  advance: true,  pro: true  },
  { feature: "Jobs & Gigs Board",   free: false, advance: true,  pro: true  },
  { feature: "Certificates",        free: "1",   advance: true,  pro: true  },
  { feature: "Community Forum",     free: false, advance: true,  pro: true  },
  { feature: "Mentor Sessions",     free: false, advance: false, pro: "2/month" },
  { feature: "Internship Support",  free: false, advance: false, pro: true  },
  { feature: "Analytics Dashboard", free: false, advance: false, pro: true  },
  { feature: "Priority Support",    free: false, advance: true,  pro: true  },
  { feature: "API Access",          free: false, advance: false, pro: true  },
];

function formatNaira(amount: number): string {
  if (amount === 0) return "₦0";
  return `₦${amount.toLocaleString("en-NG")}`;
}

function CellValue({ value }: { value: boolean | string }) {
  if (value === true)  return <i className="fa-solid fa-check text-green-600" />;
  if (value === false) return <i className="fa-solid fa-xmark text-slate-300" />;
  return <span className="text-sm text-slate-700">{value}</span>;
}

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === "free") {
      if (!user) router.push("/register");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    const cycle = billingCycle === "monthly" ? "monthly" : "yearly";
    const userName = user.displayName || user.email || "there";

    // Build a pre-filled WhatsApp message
    const message = encodeURIComponent(
      `Hi AmTechy! 👋\n\nI'd like to subscribe to the *${plan.name} Plan*.\n\n` +
      `💰 Price: ${formatNaira(price)} / ${cycle}\n` +
      `📧 Email: ${user.email}\n` +
      `👤 Name: ${userName}\n\n` +
      `Please send me the payment details to get started. Thank you!`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />

      <section className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <i className="fa-brands fa-whatsapp" />
              Pay via WhatsApp · Prices in Naira
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
              Choose your plan, click the button, and we'll get you set up on WhatsApp in minutes.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 bg-white rounded-full p-1.5 shadow-sm border border-slate-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === "yearly"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Yearly
                <span className="absolute -top-2.5 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* ── Pricing Cards ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => {
              const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const isFree = plan.id === "free";

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                    plan.popular ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-indigo-600 text-white text-center py-2 text-xs font-bold tracking-wide uppercase">
                      ⭐ Most Popular
                    </div>
                  )}

                  <div className={`p-6 sm:p-8 flex flex-col flex-1`}>
                    {/* Plan name */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{plan.emoji}</span>
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      {isFree ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-slate-900">Free</span>
                          <span className="text-slate-500 text-sm">forever</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-slate-900">{formatNaira(price)}</span>
                            <span className="text-slate-500 text-sm">
                              / {billingCycle === "monthly" ? "month" : "year"}
                            </span>
                          </div>
                          {billingCycle === "yearly" && (
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              Save {formatNaira(plan.monthlyPrice * 12 - plan.yearlyPrice)} vs monthly
                            </p>
                          )}
                          {billingCycle === "monthly" && (
                            <p className="text-xs text-slate-400 mt-1">
                              or {formatNaira(plan.yearlyPrice)} / year (save 20%)
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <i className="fa-solid fa-check text-indigo-500 mt-0.5 flex-shrink-0 text-sm" />
                          <span className="text-sm text-slate-700 leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isFree ? (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all ${plan.buttonStyle}`}
                      >
                        {plan.buttonText}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${plan.buttonStyle}`}
                      >
                        <i className="fa-brands fa-whatsapp text-base" />
                        {plan.buttonText} on WhatsApp
                      </button>
                    )}

                    {!isFree && (
                      <p className="text-center text-xs text-slate-400 mt-3">
                        We'll reply within 30 minutes 🕐
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── How it works ────────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-16">
            <h2 className="text-xl font-bold text-slate-900 text-center mb-8">How to Subscribe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { step: "1", icon: "fa-hand-pointer", title: "Pick a Plan", desc: "Choose the plan that fits your goals and click the WhatsApp button." },
                { step: "2", icon: "fa-whatsapp", title: "Chat with Us", desc: "We'll send you payment details. Pay via bank transfer, Opay, or Palmpay." },
                { step: "3", icon: "fa-rocket", title: "Get Access", desc: "Account upgraded within 30 minutes. Start your premium journey!" },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mb-3">
                    <i className={`fa-${icon === "fa-whatsapp" ? "brands" : "solid"} ${icon} text-indigo-600 text-lg`} />
                  </div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Step {step}</div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Comparison Table ─────────────────────────────────────────── */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
              Compare All Features
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold text-slate-900 w-1/2">Feature</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold text-slate-900">Free</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold text-indigo-700 bg-indigo-50">Advance</th>
                      <th className="px-5 py-4 text-center text-sm font-semibold text-purple-700">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 1 ? "bg-slate-50/50" : ""}>
                        <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{row.feature}</td>
                        <td className="px-5 py-3.5 text-center"><CellValue value={row.free} /></td>
                        <td className="px-5 py-3.5 text-center bg-indigo-50/40"><CellValue value={row.advance} /></td>
                        <td className="px-5 py-3.5 text-center"><CellValue value={row.pro} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Trust Badges ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "10K+",  label: "Active Learners" },
              { value: "500+",  label: "Premium Courses" },
              { value: "4.9/5", label: "Average Rating" },
              { value: "24/7",  label: "WhatsApp Support" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">{value}</div>
                <div className="text-xs sm:text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Enterprise ───────────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-12 mb-16 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Need a Custom Solution?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              For schools, bootcamps, and organizations with unique requirements — we offer custom plans with dedicated support and flexible pricing.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8 text-sm">
              {["Unlimited users","Custom integrations","Dedicated support","SLA guarantees"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-green-400 text-sm" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const msg = encodeURIComponent("Hi AmTechy! 👋\n\nI'm interested in a *Custom/Enterprise Plan* for my organization.\n\nCould you share more details? Thank you!");
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-400 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <i className="fa-brands fa-whatsapp text-lg" />
              Contact Us on WhatsApp
            </button>
          </div>

          {/* ── FAQs ─────────────────────────────────────────────────────── */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <summary className="px-5 py-4 font-semibold text-slate-900 text-sm cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between list-none">
                    {faq.question}
                    <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}