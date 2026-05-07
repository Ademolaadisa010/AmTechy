"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import BottomBar from "../bottom-bar/page";

interface FAQItem {
  id: string;
  category: "getting-started" | "account" | "courses" | "premium" | "technical" | "billing";
  question: string;
  answer: string;
  relatedTopics: string[];
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    id: "gs-1",
    category: "getting-started",
    question: "How do I create an account on AmTechy?",
    answer: "Creating an account is simple! Click the 'Sign Up' button on the homepage, enter your email address, create a strong password, and verify your email. You can also sign up using your Google or GitHub account for faster registration.",
    relatedTopics: ["account-security", "profile-setup"],
  },
  {
    id: "gs-2",
    category: "getting-started",
    question: "What are the system requirements to access AmTechy?",
    answer: "AmTechy works on any modern web browser (Chrome, Firefox, Safari, Edge). We recommend using the latest version of your browser for the best experience. Mobile app support is coming soon. For optimal performance, we recommend at least 2 Mbps internet connection.",
    relatedTopics: ["technical-issues", "app-features"],
  },
  {
    id: "gs-3",
    category: "getting-started",
    question: "How do I set up my profile?",
    answer: "After signing up, go to Settings > Profile to add your profile photo, bio, career goals, and skills. A complete profile helps us recommend better courses and mentors. You can update your profile anytime.",
    relatedTopics: ["account-settings", "career-goals"],
  },

  // Account
  {
    id: "acc-1",
    category: "account",
    question: "How do I change my password?",
    answer: "Go to Settings > Security > Change Password. Enter your current password, then create a new strong password (at least 8 characters with uppercase, lowercase, numbers, and symbols). For security, we recommend changing your password every 3 months.",
    relatedTopics: ["account-security", "two-factor-auth"],
  },
  {
    id: "acc-2",
    category: "account",
    question: "Can I deactivate or delete my account?",
    answer: "Yes. Go to Settings > Account > Deactivate Account. You'll be asked to confirm your action. Deactivation is reversible - you can reactivate within 30 days. After 30 days, your account and all data will be permanently deleted.",
    relatedTopics: ["privacy", "data-deletion"],
  },
  {
    id: "acc-3",
    category: "account",
    question: "How do I enable two-factor authentication (2FA)?",
    answer: "Go to Settings > Security > Two-Factor Authentication. You can choose to use authenticator apps (Google Authenticator, Authy) or SMS codes. We recommend authenticator apps for better security.",
    relatedTopics: ["account-security", "password-reset"],
  },
  {
    id: "acc-4",
    category: "account",
    question: "I forgot my password. What should I do?",
    answer: "Click 'Forgot Password' on the login page. Enter your email address, and we'll send you a password reset link. The link expires in 24 hours. If you don't receive an email, check your spam folder or contact our support team.",
    relatedTopics: ["account-security", "email-verification"],
  },

  // Courses
  {
    id: "course-1",
    category: "courses",
    question: "How many courses can I take simultaneously?",
    answer: "You can enroll in unlimited courses! However, we recommend focusing on 2-3 courses at a time for better learning outcomes. You can pause courses anytime and resume later without losing progress.",
    relatedTopics: ["course-progress", "certificates"],
  },
  {
    id: "course-2",
    category: "courses",
    question: "Can I download course materials?",
    answer: "Yes! Premium members can download course videos, PDFs, and resources for offline access. Free members can view materials online. Downloaded content is available for 30 days.",
    relatedTopics: ["premium-benefits", "offline-learning"],
  },
  {
    id: "course-3",
    category: "courses",
    question: "How do I track my course progress?",
    answer: "Go to your Dashboard > Progress to see all enrolled courses with completion percentages, last accessed dates, and estimated time to complete. You can also view individual lesson progress in the course player.",
    relatedTopics: ["learning-path", "certificates"],
  },
  {
    id: "course-4",
    category: "courses",
    question: "What happens after I complete a course?",
    answer: "After completing 100% of a course, you can request a certificate. Premium members can download certificates immediately. Your course completion is also added to your profile and LinkedIn (optional).",
    relatedTopics: ["certificates", "premium-benefits"],
  },
  {
    id: "course-5",
    category: "courses",
    question: "Can I get a refund for a course?",
    answer: "Free courses don't require refunds. For premium subscriptions, we offer a 7-day money-back guarantee. Contact our support team within 7 days of purchase for a full refund.",
    relatedTopics: ["billing", "premium-plans"],
  },

  // Premium
  {
    id: "prem-1",
    category: "premium",
    question: "What's included in Premium membership?",
    answer: "Premium members get: unlimited course access, certificate downloads, job board access, personalized learning paths, priority support, offline content downloads, and advanced analytics. Premium costs ₦5,000/month or ₦50,000/year.",
    relatedTopics: ["pricing", "billing"],
  },
  {
    id: "prem-2",
    category: "premium",
    question: "How do I upgrade to Premium?",
    answer: "Go to Settings > Subscription or click 'Upgrade' on any premium feature. Choose your plan (monthly or yearly), add your payment method, and confirm. Your premium access activates immediately.",
    relatedTopics: ["billing", "payment-methods"],
  },
  {
    id: "prem-3",
    category: "premium",
    question: "Can I cancel my Premium subscription?",
    answer: "Yes, anytime! Go to Settings > Subscription > Manage. Your access continues until the end of your billing period. You won't be charged again after cancellation.",
    relatedTopics: ["billing", "refunds"],
  },
  {
    id: "prem-4",
    category: "premium",
    question: "Is there a family or group plan?",
    answer: "Currently, we offer individual plans. Team plans are coming soon! Sign up for our newsletter to be notified when team plans launch.",
    relatedTopics: ["pricing", "contact-support"],
  },

  // Technical
  {
    id: "tech-1",
    category: "technical",
    question: "Why are videos buffering or loading slowly?",
    answer: "Check your internet connection (we recommend 2+ Mbps). Try lowering video quality in player settings. Clear browser cache and cookies. Disable browser extensions that might block content. If issues persist, contact support with your browser and device info.",
    relatedTopics: ["video-quality", "browser-issues"],
  },
  {
    id: "tech-2",
    category: "technical",
    question: "Which browsers are supported?",
    answer: "We support Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. We recommend using the latest version. Mobile browsers (iOS Safari, Chrome Mobile) are fully supported.",
    relatedTopics: ["system-requirements", "app-features"],
  },
  {
    id: "tech-3",
    category: "technical",
    question: "I'm experiencing login issues. What should I do?",
    answer: "1) Clear browser cookies and cache. 2) Try a different browser. 3) Disable VPN if using one. 4) Check if 2FA is enabled - verify your authenticator app time is correct. 5) Use 'Forgot Password' to reset. Still having issues? Contact support.",
    relatedTopics: ["account-security", "two-factor-auth"],
  },
  {
    id: "tech-4",
    category: "technical",
    question: "Is my data and privacy secure?",
    answer: "Yes! We use industry-standard SSL encryption, secure servers, and follow GDPR/data protection regulations. Your payment information is processed through secure payment gateways and never stored on our servers. Read our full Privacy Policy for details.",
    relatedTopics: ["privacy-policy", "data-security"],
  },

  // Billing
  {
    id: "bill-1",
    category: "billing",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, bank transfers, and mobile money (Paystack, Flutterwave). All payments are secured and encrypted.",
    relatedTopics: ["premium-plans", "refunds"],
  },
  {
    id: "bill-2",
    category: "billing",
    question: "Will I be charged a renewal fee?",
    answer: "Yes, subscription plans auto-renew at the end of each billing period. You'll receive an email reminder 7 days before renewal. You can cancel anytime before the next billing date to avoid charges.",
    relatedTopics: ["subscription-management", "cancellation"],
  },
  {
    id: "bill-3",
    category: "billing",
    question: "Can I change my billing cycle?",
    answer: "You can upgrade or downgrade anytime. If you switch from monthly to yearly, your prorated balance is credited. Changes take effect immediately.",
    relatedTopics: ["subscription-management", "premium-plans"],
  },
  {
    id: "bill-4",
    category: "billing",
    question: "Where can I view my invoices?",
    answer: "Go to Settings > Billing > Invoices to download all past invoices. Invoices are also sent to your registered email after each payment.",
    relatedTopics: ["payment-methods", "billing-settings"],
  },
];

const CATEGORIES = [
  { id: "getting-started", label: "Getting Started", icon: "fa-rocket", color: "from-blue-500 to-cyan-500" },
  { id: "account", label: "Account & Security", icon: "fa-shield", color: "from-green-500 to-emerald-500" },
  { id: "courses", label: "Courses", icon: "fa-book", color: "from-purple-500 to-pink-500" },
  { id: "premium", label: "Premium & Billing", icon: "fa-crown", color: "from-yellow-500 to-orange-500" },
  { id: "technical", label: "Technical Issues", icon: "fa-tools", color: "from-red-500 to-pink-500" },
];

export default function HelpCenter() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categoryCount = (catId: string) => FAQ_DATA.filter((item) => item.category === catId).length;

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">

      <section className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
              <i className="fa-solid fa-headset mr-2"></i>
              Help Center
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">How Can We Help?</h1>
            <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Find answers to common questions, learn about features, and get support
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                <input
                  type="text"
                  placeholder="Search help articles, guides, and FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-white text-slate-900 placeholder-slate-400 shadow-2xl"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">{FAQ_DATA.length}</div>
                <div className="text-sm text-white text-opacity-80">Articles</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-white text-opacity-80">Available</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">5m</div>
                <div className="text-sm text-white text-opacity-80">Avg Read</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Categories Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`p-4 rounded-xl font-semibold transition-all text-center ${
                  selectedCategory === null
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300"
                }`}
              >
                <div className="text-lg mb-2">📋</div>
                <div>All Articles</div>
                <div className="text-sm opacity-75">{FAQ_DATA.length} items</div>
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl font-semibold transition-all text-center ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                      : "bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="text-lg mb-2">
                    <i className={`fa-solid ${cat.icon}`}></i>
                  </div>
                  <div>{cat.label}</div>
                  <div className="text-sm opacity-75">{categoryCount(cat.id)} items</div>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="mb-12">
            {filteredFAQs.length > 0 ? (
              <div className="space-y-3">
                {filteredFAQs.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{item.question}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {CATEGORIES.map((cat) => {
                            if (cat.id === item.category) {
                              return (
                                <span
                                  key={cat.id}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                                >
                                  <i className={`fa-solid ${cat.icon}`}></i>
                                  {cat.label}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-transform ${
                          expandedId === item.id ? "rotate-180" : ""
                        }`}
                      >
                        <i className="fa-solid fa-chevron-down text-slate-600"></i>
                      </div>
                    </button>

                    {/* Expanded Answer */}
                    {expandedId === item.id && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <p className="text-slate-700 leading-relaxed mb-4">{item.answer}</p>

                        {item.relatedTopics.length > 0 && (
                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-sm font-semibold text-slate-600 mb-3">Related Topics:</p>
                            <div className="flex flex-wrap gap-2">
                              {item.relatedTopics.map((topic) => (
                                <button
                                  key={topic}
                                  onClick={() => {
                                    setSearchQuery(topic);
                                    setSelectedCategory(null);
                                  }}
                                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors"
                                >
                                  {topic.replace("-", " ")}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-magnifying-glass text-slate-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Results Found</h3>
                <p className="text-slate-600 mb-6">
                  We couldn't find any articles matching "{searchQuery}". Try different keywords.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200 p-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-envelope text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Email Support</h3>
              <p className="text-slate-600 text-sm mb-4">
                Have a question? Send us an email and we'll respond within 24 hours.
              </p>
              <a
                href="mailto:support@amtechy.com"
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
              >
                support@amtechy.com
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-8">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <i className="fa-brands fa-whatsapp text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">WhatsApp</h3>
              <p className="text-slate-600 text-sm mb-4">
                Quick support via WhatsApp. Chat with us for faster responses.
              </p>
              <a
                href="https://wa.me/2349058704410"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700"
              >
                Chat Now
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-8">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-comments text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Chat</h3>
              <p className="text-slate-600 text-sm mb-4">
                Available during business hours (9 AM - 6 PM WAT, Mon-Fri).
              </p>
              <button className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700">
                Start Chat
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* FAQ Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-lightbulb text-blue-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Didn't find what you need?</h3>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              Our support team is here to help! Whether you have a question about features, billing, or technical issues, 
              don't hesitate to reach out. We're committed to providing the best support experience.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push("mailto:support@amtechy.com")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <BottomBar />
      </section>
    </main>
  );
}