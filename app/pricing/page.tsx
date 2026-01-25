"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonStyle: string;
}

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const monthlyPlans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      billingCycle: "forever",
      description: "Perfect for getting started with learning",
      features: [
        "Access to free courses",
        "Community forum access",
        "Basic progress tracking",
        "Email support",
        "Mobile app access",
        "Course completion certificates",
      ],
      buttonText: "Get Started",
      buttonStyle: "bg-slate-900 hover:bg-slate-800 text-white",
    },
    {
      id: "pro",
      name: "Pro",
      price: 29,
      billingCycle: "per month",
      description: "For serious learners ready to advance their skills",
      features: [
        "Everything in Free",
        "Access to all premium courses",
        "Unlimited course enrollments",
        "1-on-1 mentor sessions (2/month)",
        "Priority email support",
        "Downloadable resources",
        "Ad-free experience",
        "Early access to new courses",
      ],
      popular: true,
      buttonText: "Start Pro",
      buttonStyle: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg",
    },
    {
      id: "team",
      name: "Team",
      price: 99,
      billingCycle: "per month",
      description: "Perfect for teams and organizations",
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Team analytics dashboard",
        "Custom learning paths",
        "Dedicated account manager",
        "API access",
        "SSO integration",
        "Priority 24/7 support",
        "Custom branding options",
        "Bulk course creation",
      ],
      buttonText: "Start Team",
      buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
    },
  ];

  const yearlyPlans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      billingCycle: "forever",
      description: "Perfect for getting started with learning",
      features: [
        "Access to free courses",
        "Community forum access",
        "Basic progress tracking",
        "Email support",
        "Mobile app access",
        "Course completion certificates",
      ],
      buttonText: "Get Started",
      buttonStyle: "bg-slate-900 hover:bg-slate-800 text-white",
    },
    {
      id: "pro",
      name: "Pro",
      price: 290,
      billingCycle: "per year",
      description: "For serious learners ready to advance their skills",
      features: [
        "Everything in Free",
        "Access to all premium courses",
        "Unlimited course enrollments",
        "1-on-1 mentor sessions (2/month)",
        "Priority email support",
        "Downloadable resources",
        "Ad-free experience",
        "Early access to new courses",
      ],
      popular: true,
      buttonText: "Start Pro",
      buttonStyle: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg",
    },
    {
      id: "team",
      name: "Team",
      price: 990,
      billingCycle: "per year",
      description: "Perfect for teams and organizations",
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Team analytics dashboard",
        "Custom learning paths",
        "Dedicated account manager",
        "API access",
        "SSO integration",
        "Priority 24/7 support",
        "Custom branding options",
        "Bulk course creation",
      ],
      buttonText: "Start Team",
      buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
    },
  ];

  const plans = billingCycle === "monthly" ? monthlyPlans : yearlyPlans;

  const faqs = [
    {
      question: "Can I switch plans at any time?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and various local payment methods.",
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.",
    },
    {
      question: "Do you offer student discounts?",
      answer: "Yes! Students get 50% off on Pro and Team plans. Contact support with your student ID for verification.",
    },
    {
      question: "What happens if I exceed the team member limit?",
      answer: "You can easily add more team members for $9/month per additional user. We'll notify you when you approach your limit.",
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (planId === "free") {
      alert("You're already on the free plan!");
      return;
    }

    // In production, this would redirect to a payment page
    alert(`Redirecting to checkout for ${planId} plan...`);
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Choose the perfect plan for your learning journey
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-sm border border-slate-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full font-semibold transition-all relative ${
                  billingCycle === "yearly"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-xl ${
                  plan.popular ? "border-indigo-600 scale-105" : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className={`p-8 ${plan.popular ? "pt-14" : ""}`}>
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-600 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600">/ {plan.billingCycle}</span>
                    </div>
                    {plan.price > 0 && billingCycle === "yearly" && (
                      <p className="text-sm text-green-600 font-medium">
                        Save ${(plan.price / 12 * 12 * 1.17 - plan.price).toFixed(0)} per year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <i className="fa-solid fa-check text-indigo-600 mt-1 flex-shrink-0"></i>
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Section */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-12 mb-16 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              For large organizations with unique requirements, we offer custom enterprise plans with dedicated support, advanced features, and flexible pricing.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-check-circle text-green-400"></i>
                <span>Unlimited users</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-check-circle text-green-400"></i>
                <span>Custom integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-check-circle text-green-400"></i>
                <span>Dedicated infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-check-circle text-green-400"></i>
                <span>SLA guarantees</span>
              </div>
            </div>
            <button className="px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
              Contact Sales
            </button>
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
              Compare All Features
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Free</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Pro</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-700">Free Courses</td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700">Premium Courses</td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-xmark text-slate-300"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-700">Mentor Sessions</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">-</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700">2/month</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700">10/month</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700">Team Members</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">1</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700">1</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-700">10</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-700">Analytics Dashboard</td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-xmark text-slate-300"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-xmark text-slate-300"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700">API Access</td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-xmark text-slate-300"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-xmark text-slate-300"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-700">Priority Support</td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-xmark text-slate-300"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                      <td className="px-6 py-4 text-center"><i className="fa-solid fa-check text-green-600"></i></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">100K+</div>
              <div className="text-sm text-slate-600">Active Learners</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-sm text-slate-600">Premium Courses</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">4.9/5</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-sm text-slate-600">Support Available</div>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group"
                >
                  <summary className="px-6 py-4 font-semibold text-slate-900 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between">
                    {faq.question}
                    <i className="fa-solid fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div className="px-6 pb-4 pt-2 text-slate-700 border-t border-slate-100">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-16 bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-shield-check text-green-600 text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-slate-700 max-w-2xl mx-auto">
              Try any paid plan risk-free. If you're not completely satisfied within the first 30 days, we'll refund your payment—no questions asked.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}