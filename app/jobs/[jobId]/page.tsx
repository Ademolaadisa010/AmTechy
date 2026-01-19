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
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
    portfolioUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchJobData();
        await checkIfSaved(user.uid);
        await checkIfApplied(user.uid);
        await prefillUserData(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [jobId, router]);

  const fetchJobData = async () => {
    try {
      const jobDoc = await getDoc(doc(db, "jobs", jobId));
      if (jobDoc.exists()) {
        const data = jobDoc.data();
        setJob({
          title: data.title || "",
          company: data.company || "",
          location: data.location || "",
          type: data.type || "full-time",
          level: data.level || "entry",
          salary: data.salary,
          description: data.description || "",
          requirements: data.requirements || [],
          skills: data.skills || [],
          remote: data.remote || false,
          postedDate: data.postedDate?.toDate() || new Date(),
          applicationUrl: data.applicationUrl,
          companyLogo: data.companyLogo,
        });
      } else {
        alert("Job not found");
        router.push("/jobs");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    }
  };

  const prefillUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setApplicationData((prev) => ({
          ...prev,
          fullName: userData.fullName || "",
          email: userData.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkIfSaved = async (userId: string) => {
    try {
      const savedJobsQuery = query(
        collection(db, "savedJobs"),
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );
      const snapshot = await getDocs(savedJobsQuery);
      setIsSaved(!snapshot.empty);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  };

  const checkIfApplied = async (userId: string) => {
    try {
      const applicationsQuery = query(
        collection(db, "jobApplications"),
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );
      const snapshot = await getDocs(applicationsQuery);
      setHasApplied(!snapshot.empty);
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const handleSaveJob = async () => {
    if (!auth.currentUser || !job) return;

    try {
      if (isSaved) {
        // Unsave (would need to implement delete)
        setIsSaved(false);
      } else {
        await addDoc(collection(db, "savedJobs"), {
          userId: auth.currentUser.uid,
          jobId: jobId,
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
      // If external application URL exists, open it
      window.open(job.applicationUrl, "_blank");
    } else {
      // Show internal application modal
      setShowApplicationModal(true);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !job) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "jobApplications"), {
        userId: auth.currentUser.uid,
        jobId: jobId,
        jobTitle: job.title,
        company: job.company,
        ...applicationData,
        status: "submitted",
        appliedAt: new Date().toISOString(),
      });

      setHasApplied(true);
      setShowApplicationModal(false);
      alert("🎉 Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="flex-1 flex bg-slate-50 min-w-0">
        <SideBar />
        <section className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back to Jobs
              </button>

              <div className="flex items-start justify-between gap-6">
                <div className="flex gap-4 flex-1">
                  {/* Company Logo */}
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      job.company.charAt(0)
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      {job.title}
                    </h1>
                    <p className="text-xl text-slate-600 mb-3">{job.company}</p>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        <i className="fa-solid fa-location-dot"></i>
                        {job.location}
                      </span>
                      {job.remote && (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                          🌍 Remote
                        </span>
                      )}
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium capitalize">
                        {job.type}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium capitalize">
                        {job.level}
                      </span>
                      <span className="text-slate-400">
                        • Posted {formatDate(job.postedDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveJob}
                    className={`p-3 rounded-lg border transition-colors ${
                      isSaved
                        ? "bg-indigo-50 border-indigo-600 text-indigo-600"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    <i
                      className={`fa-${isSaved ? "solid" : "regular"} fa-bookmark text-xl`}
                    ></i>
                  </button>
                  <button className="p-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 transition-colors">
                    <i className="fa-solid fa-share-nodes text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Job Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Salary */}
                {job.salary && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-dollar-sign text-green-700 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Salary Range</p>
                        <p className="text-2xl font-bold text-green-900">{job.salary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Job Description
                  </h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Requirements
                  </h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <i className="fa-solid fa-check-circle text-green-600 mt-1"></i>
                        <span className="text-slate-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Apply Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    Ready to Apply?
                  </h3>

                  {hasApplied ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <i className="fa-solid fa-check-circle"></i>
                        <span className="font-semibold">Already Applied</span>
                      </div>
                      <p className="text-sm text-green-600">
                        You've already submitted your application for this position.
                      </p>
                    </div>
                  ) : null}

                  <button
                    onClick={handleApply}
                    disabled={hasApplied}
                    className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasApplied ? "Application Submitted" : "Apply Now"}
                  </button>

                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-clock text-indigo-600 mt-1"></i>
                      <div>
                        <p className="font-medium text-slate-900">Quick Process</p>
                        <p>Application takes 5-10 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-shield-halved text-indigo-600 mt-1"></i>
                      <div>
                        <p className="font-medium text-slate-900">Secure & Private</p>
                        <p>Your information is protected</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="fa-solid fa-bell text-indigo-600 mt-1"></i>
                      <div>
                        <p className="font-medium text-slate-900">Track Status</p>
                        <p>Get updates on your application</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center">
                      By applying, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                Apply for {job.title}
              </h2>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <i className="fa-solid fa-times text-slate-600 text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={applicationData.fullName}
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, fullName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={applicationData.email}
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={applicationData.phone}
                  onChange={(e) =>
                    setApplicationData({ ...applicationData, phone: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resume/CV URL *
                </label>
                <input
                  type="url"
                  value={applicationData.resumeUrl}
                  onChange={(e) =>
                    setApplicationData({ ...applicationData, resumeUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/..."
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Upload your resume to Google Drive or Dropbox and paste the shareable link
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio URL (Optional)
                </label>
                <input
                  type="url"
                  value={applicationData.portfolioUrl}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      portfolioUrl: e.target.value,
                    })
                  }
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      coverLetter: e.target.value,
                    })
                  }
                  required
                  rows={6}
                  placeholder="Tell us why you're a great fit for this role..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}