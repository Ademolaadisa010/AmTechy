"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import BottomBar from "../bottom-bar/page";
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
  deleteDoc,
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
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userCareerGoal, setUserCareerGoal] = useState("");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");

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
        setCurrentUserId(user.uid);
        await Promise.all([
          fetchUserCareerGoal(user.uid),
          fetchSavedJobs(user.uid),
          fetchJobs(),
        ]);
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
      if (userDoc.exists()) setUserCareerGoal(userDoc.data().careerGoal || "");
    } catch (error) {
      console.error("Error fetching career goal:", error);
    }
  };

  const fetchSavedJobs = async (userId: string) => {
    try {
      const snap = await getDocs(
        query(collection(db, "savedJobs"), where("userId", "==", userId))
      );
      setSavedJobs(snap.docs.map((d) => d.data().jobId));
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  // Fetches only jobs the admin has posted with status "active"
  const fetchJobs = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "jobs"), where("status", "==", "active"))
      );
      const data: Job[] = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().title || "",
        company: d.data().company || "",
        location: d.data().location || "",
        type: d.data().type || "full-time",
        level: d.data().level || "entry",
        salary: d.data().salary,
        description: d.data().description || "",
        requirements: d.data().requirements || [],
        skills: d.data().skills || [],
        remote: d.data().remote || false,
        postedDate: d.data().postedDate?.toDate() || new Date(),
        applicationUrl: d.data().applicationUrl,
        companyLogo: d.data().companyLogo,
      }));
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];
    if (selectedType !== "all") filtered = filtered.filter((j) => j.type === selectedType);
    if (selectedLevel !== "all") filtered = filtered.filter((j) => j.level === selectedLevel);
    if (selectedLocation === "remote") filtered = filtered.filter((j) => j.remote);
    else if (selectedLocation !== "all")
      filtered = filtered.filter((j) => j.location.toLowerCase().includes(selectedLocation));
    if (searchQuery)
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    setFilteredJobs(filtered);
  };

  const handleSaveJob = async (jobId: string) => {
    if (!currentUserId) return;
    try {
      if (savedJobs.includes(jobId)) {
        // Remove saved job
        const snap = await getDocs(
          query(
            collection(db, "savedJobs"),
            where("userId", "==", currentUserId),
            where("jobId", "==", jobId)
          )
        );
        await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "savedJobs", d.id))));
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
      } else {
        await addDoc(collection(db, "savedJobs"), {
          userId: currentUserId,
          jobId,
          savedAt: new Date().toISOString(),
        });
        setSavedJobs((prev) => [...prev, jobId]);
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const getRecommendedJobs = () => {
    const careerKeywords: Record<string, string[]> = {
      frontend: ["frontend", "react", "javascript", "web", "ui"],
      backend: ["backend", "node", "python", "api", "database"],
      "data-science": ["data", "analyst", "machine learning", "python", "ai"],
      mobile: ["mobile", "ios", "android", "react native", "flutter"],
      designer: ["designer", "ui", "ux", "figma", "design"],
    };
    const keywords = careerKeywords[userCareerGoal] || [];
    if (!keywords.length) return [];
    return jobs
      .filter((job) => {
        const text = `${job.title} ${job.description} ${job.skills.join(" ")}`.toLowerCase();
        return keywords.some((kw) => text.includes(kw));
      })
      .slice(0, 3);
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

  const recommendedJobs = getRecommendedJobs();

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading opportunities…</p>
        </div>
      </main>
    );
  }

  return (
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

          <BottomBar />

          {/* Search */}
          <div className="relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies, or skills…"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Recommended */}
          {recommendedJobs.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-sparkles text-indigo-600"></i>
                <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
              </div>
              <p className="text-slate-600 text-sm mb-5">Based on your career goal and skills</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5 line-clamp-1">{job.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{job.company}</p>
                    <div className="flex items-center gap-2 text-xs mb-3">
                      <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${typeBadge[job.type]}`}>{job.type}</span>
                      <span className="text-slate-500">📍 {job.location}</span>
                    </div>
                    {job.salary && <p className="text-xs font-semibold text-green-600 mb-3">{job.salary}</p>}
                    <button
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      View & Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Opportunities", value: jobs.length, icon: "fa-briefcase", color: "text-indigo-600 bg-indigo-50" },
              { label: "Internships", value: jobs.filter((j) => j.type === "internship").length, icon: "fa-graduation-cap", color: "text-yellow-600 bg-yellow-50" },
              { label: "Remote Jobs", value: jobs.filter((j) => j.remote).length, icon: "fa-globe", color: "text-green-600 bg-green-50" },
              { label: "Saved Jobs", value: savedJobs.length, icon: "fa-bookmark", color: "text-purple-600 bg-purple-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <i className={`fa-solid ${s.icon} text-sm`}></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Job Type</h3>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map((t) => (
                  <button key={t.id} onClick={() => setSelectedType(t.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedType === t.id ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"}`}>
                    <span className="mr-1.5">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Experience Level</h3>
                <div className="flex flex-wrap gap-2">
                  {levels.map((l) => (
                    <button key={l.id} onClick={() => setSelectedLevel(l.id)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedLevel === l.id ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Location</h3>
                <div className="flex flex-wrap gap-2">
                  {locations.map((l) => (
                    <button key={l.id} onClick={() => setSelectedLocation(l.id)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedLocation === l.id ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm">
              <strong className="text-slate-900">{filteredJobs.length}</strong> job{filteredJobs.length !== 1 ? "s" : ""} found
            </p>
            {(selectedType !== "all" || selectedLevel !== "all" || selectedLocation !== "all" || searchQuery) && (
              <button onClick={() => { setSelectedType("all"); setSelectedLevel("all"); setSelectedLocation("all"); setSearchQuery(""); }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Clear filters
              </button>
            )}
          </div>

          {/* Jobs list */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-4 pb-12">
              {filteredJobs.map((job) => {
                const isSaved = savedJobs.includes(job.id);
                return (
                  <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex gap-4 flex-1">
                        {/* Logo */}
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                          {job.companyLogo
                            ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                            : job.company.charAt(0)}
                        </div>
                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-0.5">{job.title}</h3>
                          <p className="text-slate-500 text-sm mb-2">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-slate-600">
                              <i className="fa-solid fa-location-dot"></i> {job.location}
                            </span>
                            {job.remote && (
                              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">🌍 Remote</span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${typeBadge[job.type]}`}>{job.type}</span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium capitalize">{job.level}</span>
                            <span className="text-slate-400">· {formatDate(job.postedDate)}</span>
                          </div>
                        </div>
                      </div>
                      {/* Save button */}
                      <button onClick={() => handleSaveJob(job.id)}
                        className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${isSaved ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                        <i className={`fa-${isSaved ? "solid" : "regular"} fa-bookmark`}></i>
                      </button>
                    </div>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                    {/* Skills */}
                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{skill}</span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">+{job.skills.length - 5} more</span>
                        )}
                      </div>
                    )}

                    {job.salary && <p className="text-base font-bold text-green-600 mb-4">{job.salary}</p>}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <button onClick={() => router.push(`/jobs/${job.id}`)}
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
                        View Details & Apply
                      </button>
                      <button onClick={() => handleSaveJob(job.id)}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${isSaved ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                        {isSaved ? "Saved ✓" : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-briefcase text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
              <p className="text-slate-600 mb-6 text-sm">
                {jobs.length === 0
                  ? "No jobs have been posted yet. Check back soon!"
                  : "Try adjusting your filters or search query."}
              </p>
              {jobs.length > 0 && (
                <button onClick={() => { setSelectedType("all"); setSelectedLevel("all"); setSelectedLocation("all"); setSearchQuery(""); }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}