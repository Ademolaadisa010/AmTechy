"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import SideBar from "@/app/sidebar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

interface JobData {
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  salary?: string;
  description: string;
  requirements: string[];
  skills: string[];
  remote: boolean;
  postedDate: Date;
  applicationUrl?: string;
  companyLogo?: string;
}

export default function JobDetail() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
    portfolioUrl: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await Promise.all([
          fetchJob(),
          checkSaved(user.uid),
          checkApplied(user.uid),
          prefillUser(user.uid),
        ]);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [jobId, router]);

  const fetchJob = async () => {
    try {
      const jobDoc = await getDoc(doc(db, "jobs", jobId));
      if (jobDoc.exists()) {
        const d = jobDoc.data();
        setJob({
          title: d.title || "",
          company: d.company || "",
          location: d.location || "",
          type: d.type || "full-time",
          level: d.level || "entry",
          salary: d.salary,
          description: d.description || "",
          requirements: d.requirements || [],
          skills: d.skills || [],
          remote: d.remote || false,
          postedDate: d.postedDate?.toDate() || new Date(),
          applicationUrl: d.applicationUrl,
          companyLogo: d.companyLogo,
        });
      } else {
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      router.push("/jobs");
    }
  };

  const prefillUser = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const u = userDoc.data();
        setForm((prev) => ({
          ...prev,
          fullName: u.fullName || u.name || "",
          email: u.email || "",
        }));
      }
    } catch (error) {
      console.error("Error prefilling user:", error);
    }
  };

  const checkSaved = async (userId: string) => {
    try {
      const snap = await getDocs(
        query(collection(db, "savedJobs"), where("userId", "==", userId), where("jobId", "==", jobId))
      );
      setIsSaved(!snap.empty);
    } catch (error) {
      console.error("Error checking saved:", error);
    }
  };

  const checkApplied = async (userId: string) => {
    try {
      const snap = await getDocs(
        query(collection(db, "jobApplications"), where("userId", "==", userId), where("jobId", "==", jobId))
      );
      setHasApplied(!snap.empty);
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || !job) return;
    try {
      if (isSaved) {
        const snap = await getDocs(
          query(collection(db, "savedJobs"), where("userId", "==", auth.currentUser.uid), where("jobId", "==", jobId))
        );
        await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "savedJobs", d.id))));
        setIsSaved(false);
      } else {
        await addDoc(collection(db, "savedJobs"), {
          userId: auth.currentUser.uid,
          jobId,
          jobTitle: job.title,
          company: job.company,
          savedAt: new Date().toISOString(),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const handleApply = () => {
    if (job?.applicationUrl) {
      window.open(job.applicationUrl, "_blank");
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !job) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "jobApplications"), {
        userId: auth.currentUser.uid,
        jobId,
        jobTitle: job.title,
        company: job.company,
        ...form,
        status: "submitted",
        appliedAt: new Date().toISOString(),
      });
      setHasApplied(true);
      setShowModal(false);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    const days = Math.ceil(Math.abs(new Date().getTime() - date.getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const typeBadge: Record<string, string> = {
    "full-time": "bg-blue-50 text-blue-700",
    "part-time": "bg-purple-50 text-purple-700",
    internship: "bg-yellow-50 text-yellow-700",
    contract: "bg-orange-50 text-orange-700",
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading job details…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      <section className="flex-1 overflow-y-auto">

        {/* Sticky header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <button onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 text-sm font-medium transition-colors">
              <i className="fa-solid fa-arrow-left"></i> Back to Jobs
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 overflow-hidden">
                  {job.companyLogo
                    ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                    : job.company.charAt(0)}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                  <p className="text-slate-500 mb-2">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-600">
                      <i className="fa-solid fa-location-dot"></i> {job.location}
                    </span>
                    {job.remote && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">🌍 Remote</span>}
                    <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${typeBadge[job.type] || "bg-slate-100 text-slate-600"}`}>{job.type}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium capitalize">{job.level}</span>
                    <span className="text-slate-400">· Posted {formatDate(job.postedDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={handleSave}
                  className={`p-3 rounded-xl border transition-colors ${isSaved ? "bg-indigo-50 border-indigo-300 text-indigo-600" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"}`}>
                  <i className={`fa-${isSaved ? "solid" : "regular"} fa-bookmark`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Success banner */}
          {submitted && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-check text-green-600"></i>
              </div>
              <div>
                <p className="font-semibold text-green-800">Application submitted!</p>
                <p className="text-sm text-green-700">The company will review your application and get back to you.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: job details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Salary */}
              {job.salary && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-money-bill-wave text-green-700"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Salary</p>
                    <p className="text-xl font-bold text-green-900">{job.salary}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Job Description</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">{job.description}</p>
              </div>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <i className="fa-solid fa-check-circle text-green-500 mt-0.5 flex-shrink-0"></i>
                        <span className="text-slate-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {job.skills.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: apply card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-28">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Ready to Apply?</h3>

                {hasApplied && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <i className="fa-solid fa-check-circle text-sm"></i>
                      <span className="font-semibold text-sm">Applied!</span>
                    </div>
                    <p className="text-xs text-green-600">You've submitted your application for this role.</p>
                  </div>
                )}

                <button onClick={handleApply} disabled={hasApplied}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  {hasApplied ? "Application Submitted ✓" : "Apply Now"}
                </button>

                <div className="space-y-3 text-sm">
                  {[
                    { icon: "fa-clock", title: "Quick Process", desc: "Takes 5–10 minutes" },
                    { icon: "fa-shield-halved", title: "Secure & Private", desc: "Your info is protected" },
                    { icon: "fa-bell", title: "Track Status", desc: "Get updates on your application" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`fa-solid ${item.icon} text-indigo-600 text-xs`}></i>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{item.title}</p>
                        <p className="text-slate-500 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center">
                    By applying, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Apply for {job.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{job.company}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-slate-600 text-sm"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                  <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number *</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                  placeholder="+234 800 000 0000"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resume / CV URL *</label>
                <input type="url" value={form.resumeUrl} onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })} required
                  placeholder="https://drive.google.com/…"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <p className="text-xs text-slate-400 mt-1">Upload to Google Drive or Dropbox and paste the shareable link</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Portfolio URL <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <input type="url" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cover Letter *</label>
                <textarea value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} required
                  rows={5} placeholder="Tell us why you're a great fit for this role…"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Submitting…</>
                    : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}