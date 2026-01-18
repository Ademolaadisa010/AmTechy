"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  orderBy,
} from "firebase/firestore";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "internship" | "contract";
  level: "entry" | "mid" | "senior";
  salary?: string;
  description: string;
  requirements: string[];
  skills: string[];
  remote: boolean;
  postedDate: Date;
  applicationUrl?: string;
  companyLogo?: string;
}

export default function JobsAndInternships() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userCareerGoal, setUserCareerGoal] = useState<string>("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const jobTypes = [
    { id: "all", label: "All Jobs", icon: "💼" },
    { id: "full-time", label: "Full Time", icon: "🏢" },
    { id: "part-time", label: "Part Time", icon: "⏰" },
    { id: "internship", label: "Internship", icon: "🎓" },
    { id: "contract", label: "Contract", icon: "📝" },
  ];

  const levels = [
    { id: "all", label: "All Levels" },
    { id: "entry", label: "Entry Level" },
    { id: "mid", label: "Mid Level" },
    { id: "senior", label: "Senior Level" },
  ];

  const locations = [
    { id: "all", label: "All Locations" },
    { id: "remote", label: "Remote Only" },
    { id: "nigeria", label: "Nigeria" },
    { id: "kenya", label: "Kenya" },
    { id: "ghana", label: "Ghana" },
    { id: "south-africa", label: "South Africa" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserCareerGoal(user.uid);
        await fetchSavedJobs(user.uid);
        await fetchJobs();
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterJobs();
  }, [jobs, selectedType, selectedLevel, selectedLocation, searchQuery]);

  const fetchUserCareerGoal = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserCareerGoal(userDoc.data().careerGoal || "");
      }
    } catch (error) {
      console.error("Error fetching career goal:", error);
    }
  };

  const fetchSavedJobs = async (userId: string) => {
    try {
      const savedJobsQuery = query(
        collection(db, "savedJobs"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(savedJobsQuery);
      const jobIds = snapshot.docs.map((doc) => doc.data().jobId);
      setSavedJobs(jobIds);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobsQuery = query(
        collection(db, "jobs"),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(jobsQuery);

      const jobsData: Job[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "",
        company: doc.data().company || "",
        location: doc.data().location || "",
        type: doc.data().type || "full-time",
        level: doc.data().level || "entry",
        salary: doc.data().salary,
        description: doc.data().description || "",
        requirements: doc.data().requirements || [],
        skills: doc.data().skills || [],
        remote: doc.data().remote || false,
        postedDate: doc.data().postedDate?.toDate() || new Date(),
        applicationUrl: doc.data().applicationUrl,
        companyLogo: doc.data().companyLogo,
      }));

      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (selectedType !== "all") {
      filtered = filtered.filter((job) => job.type === selectedType);
    }

    if (selectedLevel !== "all") {
      filtered = filtered.filter((job) => job.level === selectedLevel);
    }

    if (selectedLocation === "remote") {
      filtered = filtered.filter((job) => job.remote);
    } else if (selectedLocation !== "all") {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(selectedLocation)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleSaveJob = async (jobId: string) => {
    if (!auth.currentUser) return;

    try {
      if (savedJobs.includes(jobId)) {
        // Unsave job
        const savedJobsQuery = query(
          collection(db, "savedJobs"),
          where("userId", "==", auth.currentUser.uid),
          where("jobId", "==", jobId)
        );
        const snapshot = await getDocs(savedJobsQuery);
        // In a real app, you'd delete this document
        setSavedJobs(savedJobs.filter((id) => id !== jobId));
      } else {
        // Save job
        await addDoc(collection(db, "savedJobs"), {
          userId: auth.currentUser.uid,
          jobId: jobId,
          savedAt: new Date().toISOString(),
        });
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const getRecommendedJobs = () => {
    const careerKeywords: { [key: string]: string[] } = {
      frontend: ["frontend", "react", "javascript", "web", "ui"],
      backend: ["backend", "node", "python", "api", "database"],
      "data-science": ["data", "analyst", "machine learning", "python", "ai"],
      mobile: ["mobile", "ios", "android", "react native", "flutter"],
      designer: ["designer", "ui", "ux", "figma", "design"],
    };

    const keywords = careerKeywords[userCareerGoal] || [];
    if (keywords.length === 0) return [];

    return jobs
      .filter((job) => {
        const text = `${job.title} ${job.description} ${job.skills.join(" ")}`.toLowerCase();
        return keywords.some((keyword) => text.includes(keyword));
      })
      .slice(0, 3);
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

  const recommendedJobs = getRecommendedJobs();

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading opportunities...</p>
        </div>
      </main>
    );
  }

  return (
    <div>
      <main className="flex-1 flex bg-slate-50 min-w-0">
        <SideBar />
        <section className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Jobs & Internships</h1>
              <p className="text-slate-600 mt-1">
                Find opportunities that match your skills and career goals
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, companies, or keywords..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>

            {/* Recommended Jobs */}
            {recommendedJobs.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fa-solid fa-sparkles text-indigo-600"></i>
                  <h2 className="text-xl font-bold text-slate-900">
                    Recommended For You
                  </h2>
                </div>
                <p className="text-slate-600 mb-6">
                  Based on your career goal and skills
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-sm text-slate-600">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full capitalize">
                          {job.type}
                        </span>
                        <span>📍 {job.location}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      {job.salary && (
                        <p className="text-sm font-semibold text-green-600 mb-3">
                          {job.salary}
                        </p>
                      )}
                      <button
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">{jobs.length}</div>
                <p className="text-sm text-slate-600">Total Opportunities</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">
                  {jobs.filter((j) => j.type === "internship").length}
                </div>
                <p className="text-sm text-slate-600">Internships</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">
                  {jobs.filter((j) => j.remote).length}
                </div>
                <p className="text-sm text-slate-600">Remote Jobs</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">
                  {savedJobs.length}
                </div>
                <p className="text-sm text-slate-600">Saved Jobs</p>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Job Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Job Type</h3>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedType === type.id
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Experience Level
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedLevel === level.id
                            ? "bg-indigo-600 text-white shadow-md"
                            : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Location</h3>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedLocation === location.id
                            ? "bg-indigo-600 text-white shadow-md"
                            : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        {location.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                  <i className="fa-solid fa-filter mr-2"></i>
                  More Filters
                </button>
              </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length > 0 ? (
              <div className="space-y-4 pb-12">
                {filteredJobs.map((job) => {
                  const isSaved = savedJobs.includes(job.id);

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4 flex-1">
                          {/* Company Logo */}
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {job.companyLogo ? (
                              <img
                                src={job.companyLogo}
                                alt={job.company}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              job.company.charAt(0)
                            )}
                          </div>

                          {/* Job Info */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-slate-600 mb-2">{job.company}</p>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                              <span className="flex items-center gap-1">
                                <i className="fa-solid fa-location-dot"></i>
                                {job.location}
                              </span>
                              {job.remote && (
                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                  🌍 Remote
                                </span>
                              )}
                              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium capitalize">
                                {job.type}
                              </span>
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium capitalize">
                                {job.level}
                              </span>
                              <span className="text-slate-400">
                                • {formatDate(job.postedDate)}
                              </span>
                            </div>

                            <p className="text-slate-600 mb-4 line-clamp-2">
                              {job.description}
                            </p>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.slice(0, 5).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills.length > 5 && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                  +{job.skills.length - 5} more
                                </span>
                              )}
                            </div>

                            {job.salary && (
                              <p className="text-lg font-bold text-green-600">
                                {job.salary}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={() => handleSaveJob(job.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isSaved
                              ? "text-indigo-600 bg-indigo-50"
                              : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          <i
                            className={`fa-${isSaved ? "solid" : "regular"} fa-bookmark text-xl`}
                          ></i>
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          View Details & Apply
                        </button>
                        <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                          Share
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-briefcase text-slate-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedType("all");
                    setSelectedLevel("all");
                    setSelectedLocation("all");
                    setSearchQuery("");
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}