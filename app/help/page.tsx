"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in-progress" | "resolved";
  createdAt: Date;
}

export default function HelpSupport() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Contact form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: "all", label: "All Topics", icon: "fa-list" },
    { id: "account", label: "Account & Billing", icon: "fa-user" },
    { id: "courses", label: "Courses & Learning", icon: "fa-book" },
    { id: "technical", label: "Technical Issues", icon: "fa-wrench" },
    { id: "certificates", label: "Certificates", icon: "fa-certificate" },
    { id: "community", label: "Community", icon: "fa-users" },
  ];

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How do I reset my password?",
      answer: "To reset your password, go to the login page and click on 'Forgot Password'. Enter your email address and we'll send you a link to reset your password. Make sure to check your spam folder if you don't see the email within a few minutes.",
      category: "account",
    },
    {
      id: "2",
      question: "How do I enroll in a course?",
      answer: "Browse our course catalog, select the course you're interested in, and click the 'Enroll Now' button. Some courses are free while others require payment. Once enrolled, you'll have immediate access to all course materials.",
      category: "courses",
    },
    {
      id: "3",
      question: "Can I download course videos?",
      answer: "Currently, course videos are available for streaming only and cannot be downloaded. This helps us protect the intellectual property of our instructors. However, you can access your courses anytime with an internet connection.",
      category: "courses",
    },
    {
      id: "4",
      question: "How do I get a certificate?",
      answer: "To earn a certificate, you must complete 100% of the course content and pass all required assessments with a minimum score of 70%. Once completed, your certificate will be automatically generated and available in the 'Certificates' section of your dashboard.",
      category: "certificates",
    },
    {
      id: "5",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and various local payment methods depending on your region. All payments are processed securely through our payment partner.",
      category: "account",
    },
    {
      id: "6",
      question: "Is there a refund policy?",
      answer: "Yes! We offer a 30-day money-back guarantee on all paid courses. If you're not satisfied with a course, you can request a full refund within 30 days of purchase. Note that certificate-eligible courses require completion before refunds are processed.",
      category: "account",
    },
    {
      id: "7",
      question: "The video player is not working. What should I do?",
      answer: "First, try refreshing the page and clearing your browser cache. Make sure you're using a supported browser (Chrome, Firefox, Safari, or Edge). Check your internet connection speed - we recommend at least 5 Mbps for smooth playback. If issues persist, try using a different browser or contact support.",
      category: "technical",
    },
    {
      id: "8",
      question: "How do I connect with other learners?",
      answer: "Visit the Community section to connect with fellow learners! You can join study groups, participate in discussions, share your progress, and ask questions. Many learners also connect through our Discord server - link available in your dashboard.",
      category: "community",
    },
    {
      id: "9",
      question: "Can I access courses on mobile devices?",
      answer: "Yes! Our platform is fully responsive and works great on all devices. We also have mobile apps for iOS and Android that provide an optimized learning experience with offline access to downloaded content.",
      category: "technical",
    },
    {
      id: "10",
      question: "How long do I have access to a course?",
      answer: "Once you enroll in a course, you have lifetime access! You can learn at your own pace and revisit the material anytime. Course updates and new content are also included at no extra cost.",
      category: "courses",
    },
  ];

  const quickLinks = [
    { title: "Getting Started Guide", icon: "fa-rocket", url: "#", color: "indigo" },
    { title: "Video Tutorials", icon: "fa-video", url: "#", color: "purple" },
    { title: "Community Forum", icon: "fa-comments", url: "#", color: "green" },
    { title: "System Status", icon: "fa-signal", url: "#", color: "blue" },
    { title: "Feature Requests", icon: "fa-lightbulb", url: "#", color: "yellow" },
    { title: "Report a Bug", icon: "fa-bug", url: "#", color: "red" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUser({
          uid: currentUser.uid,
          displayName: userDoc.data()?.name || currentUser.displayName || "User",
          email: currentUser.email,
        });
        setName(userDoc.data()?.name || "");
        setEmail(currentUser.email || "");
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        userName: name,
        userEmail: email,
        subject,
        message,
        priority,
        status: "open",
        createdAt: serverTimestamp(),
      });

      alert("Support ticket submitted successfully! We'll get back to you within 24 hours.");
      setSubject("");
      setMessage("");
      setPriority("medium");
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
      
      <section className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Help & Support</h1>
            <p className="text-lg text-slate-600">We're here to help you learn better</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles, tutorials, and more..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {quickLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center hover:shadow-md transition-shadow group"
              >
                <div className={`w-12 h-12 bg-${link.color}-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${link.icon} text-${link.color}-600 text-xl`}></i>
                </div>
                <p className="text-sm font-medium text-slate-700">{link.title}</p>
              </a>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("faq")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "faq" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Frequently Asked Questions
                {activeTab === "faq" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "contact" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Contact Support
                {activeTab === "contact" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "resources" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Resources
                {activeTab === "resources" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
                  <h3 className="font-bold text-slate-900 mb-3">Categories</h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <i className={`fa-solid ${category.icon} w-5`}></i>
                        <span className="text-sm font-medium">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-3">
                {filteredFAQs.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFAQs.map((faq) => (
                      <div
                        key={faq.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                        >
                          <h3 className="font-semibold text-slate-900 pr-4">{faq.question}</h3>
                          <i className={`fa-solid fa-chevron-${expandedFAQ === faq.id ? "up" : "down"} text-slate-400 flex-shrink-0`}></i>
                        </button>
                        {expandedFAQ === faq.id && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                            <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                            <div className="mt-4 flex items-center gap-4 text-sm">
                              <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Was this helpful?
                              </button>
                              <button className="text-slate-600 hover:text-slate-700">
                                <i className="fa-regular fa-thumbs-up mr-1"></i>
                                Yes
                              </button>
                              <button className="text-slate-600 hover:text-slate-700">
                                <i className="fa-regular fa-thumbs-down mr-1"></i>
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-magnifying-glass text-slate-400 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                    <p className="text-slate-600">Try adjusting your search or browse by category</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Submit a Support Ticket</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Brief description of your issue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="low">Low - General inquiry</option>
                        <option value="medium">Medium - Need assistance</option>
                        <option value="high">High - Urgent issue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Please provide as much detail as possible about your issue..."
                      />
                    </div>

                    <button
                      onClick={handleSubmitTicket}
                      disabled={submitting}
                      className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </span>
                      ) : (
                        "Submit Ticket"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">Need Immediate Help?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-envelope text-xl mt-0.5"></i>
                      <div>
                        <p className="text-sm opacity-90">Email us</p>
                        <p className="font-semibold">support@learnskill.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-clock text-xl mt-0.5"></i>
                      <div>
                        <p className="text-sm opacity-90">Response time</p>
                        <p className="font-semibold">Within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Other Ways to Get Help</h3>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <i className="fa-brands fa-discord text-indigo-600 text-xl w-6"></i>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Discord Community</p>
                        <p className="text-xs text-slate-600">Get instant help</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <i className="fa-brands fa-youtube text-red-600 text-xl w-6"></i>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Video Tutorials</p>
                        <p className="text-xs text-slate-600">Watch how-to guides</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                      <i className="fa-solid fa-book text-green-600 text-xl w-6"></i>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Documentation</p>
                        <p className="text-xs text-slate-600">Detailed guides</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-book-open text-indigo-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">User Guide</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Complete guide to using all platform features and getting the most out of your learning experience.
                </p>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Read guide →
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-video text-purple-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Video Tutorials</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Step-by-step video walkthroughs for common tasks and platform features.
                </p>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Watch tutorials →
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-graduation-cap text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Learning Tips</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Best practices and strategies to maximize your learning outcomes and retention.
                </p>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Get tips →
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-code text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">API Documentation</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Technical documentation for developers integrating with our platform.
                </p>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  View docs →
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-newspaper text-orange-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Blog & Updates</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Latest news, feature updates, and educational content from our team.
                </p>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Read blog →
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-shield-halved text-red-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Security & Privacy</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Information about how we protect your data and maintain your privacy.
                </p>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Learn more →
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}