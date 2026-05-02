"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
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
  status: "active" | "inactive";
  postedDate: Date;
  applicationUrl?: string;
  companyLogo?: string;
  createdAt: Date;
}

const JOB_TYPES = [
  { id: "full-time", label: "Full Time" },
  { id: "part-time", label: "Part Time" },
  { id: "internship", label: "Internship" },
  { id: "contract", label: "Contract" },
];

const LEVELS = [
  { id: "entry", label: "Entry Level" },
  { id: "mid", label: "Mid Level" },
  { id: "senior", label: "Senior Level" },
];

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    company: string;
    location: string;
    type: "full-time" | "part-time" | "internship" | "contract";
    level: "entry" | "mid" | "senior";
    salary: string;
    description: string;
    requirements: string[];
    skills: string[];
    remote: boolean;
    status: "active" | "inactive";
    applicationUrl: string;
    companyLogo: string;
  }>({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    level: "entry",
    salary: "",
    description: "",
    requirements: [""],
    skills: [""],
    remote: false,
    status: "active",
    applicationUrl: "",
    companyLogo: "",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        postedDate: doc.data().postedDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Job[];
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      type: "full-time",
      level: "entry",
      salary: "",
      description: "",
      requirements: [""],
      skills: [""],
      remote: false,
      status: "active",
      applicationUrl: "",
      companyLogo: "",
    });
    setEditingId(null);
  };

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        level: job.level,
        salary: job.salary || "",
        description: job.description,
        requirements: job.requirements.length > 0 ? job.requirements : [""],
        skills: job.skills.length > 0 ? job.skills : [""],
        remote: job.remote,
        status: job.status,
        applicationUrl: job.applicationUrl || "",
        companyLogo: job.companyLogo || "",
      });
      setEditingId(job.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        level: formData.level,
        salary: formData.salary || null,
        description: formData.description,
        requirements: formData.requirements.filter((r) => r.trim()),
        skills: formData.skills.filter((s) => s.trim()),
        remote: formData.remote,
        status: formData.status,
        applicationUrl: formData.applicationUrl || null,
        companyLogo: formData.companyLogo || null,
      };

      if (editingId) {
        await updateDoc(doc(db, "jobs", editingId), {
          ...jobData,
          updatedAt: serverTimestamp(),
        });
        showToast("Job updated successfully ✓", "success");
      } else {
        await addDoc(collection(db, "jobs"), {
          ...jobData,
          postedDate: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        showToast("Job created successfully ✓", "success");
      }

      await fetchJobs();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving job:", error);
      showToast("Failed to save job", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteDoc(doc(db, "jobs", id));
      showToast("Job deleted ✓", "success");
      await fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      showToast("Failed to delete job", "error");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, "jobs", id), {
        status: currentStatus === "active" ? "inactive" : "active",
      });
      await fetchJobs();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium text-white transition-all ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <i className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-circle-xmark"}`} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Jobs Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">Create and manage job postings</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus" />
          Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-briefcase text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
            <p className="text-xs text-slate-500">Total Jobs</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-circle-check text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {jobs.filter((j) => j.status === "active").length}
            </p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-globe text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {jobs.filter((j) => j.remote).length}
            </p>
            <p className="text-xs text-slate-500">Remote</p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <i className="fa-solid fa-inbox text-4xl mb-4" />
            <p className="font-medium">No jobs posted yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-lg">{job.title}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          job.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {job.status === "active" ? "🟢 Active" : "⚫ Inactive"}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm mb-2">{job.company}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-location-dot" />
                        {job.location}
                      </span>
                      {job.remote && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                          🌍 Remote
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                        {job.type}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                        {job.level}
                      </span>
                      {job.salary && <span className="text-green-600 font-semibold">{job.salary}</span>}
                      <span className="text-slate-400">· Posted {formatDate(job.postedDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => handleToggleStatus(job.id, job.status)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        job.status === "active"
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={job.status === "active" ? "Deactivate" : "Activate"}
                    >
                      <i
                        className={`fa-solid ${
                          job.status === "active" ? "fa-toggle-on" : "fa-toggle-off"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleOpenModal(job)}
                      className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-all"
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen-to-square" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="w-9 h-9 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-all"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 text-sm line-clamp-2 mb-2">{job.description}</p>

                {job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Job" : "Post New Job"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {/* Title & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior React Developer"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Tech Startup Inc"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Lagos, Nigeria"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Level & Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g., $50,000 - $80,000/year"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Remote & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={formData.remote}
                    onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="remote" className="text-sm font-medium text-slate-700">
                    Remote Position
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the job role, responsibilities, and key requirements..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Requirements
                </label>
                <div className="space-y-2">
                  {formData.requirements.map((req, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...formData.requirements];
                          newReqs[idx] = e.target.value;
                          setFormData({ ...formData, requirements: newReqs });
                        }}
                        placeholder="e.g., 5+ years experience with React"
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              requirements: formData.requirements.filter((_, i) => i !== idx),
                            });
                          }}
                          className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <i className="fa-solid fa-trash text-sm" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        requirements: [...formData.requirements, ""],
                      })
                    }
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add Requirement
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Required Skills
                </label>
                <div className="space-y-2">
                  {formData.skills.map((skill, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...formData.skills];
                          newSkills[idx] = e.target.value;
                          setFormData({ ...formData, skills: newSkills });
                        }}
                        placeholder="e.g., React, Node.js, MongoDB"
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              skills: formData.skills.filter((_, i) => i !== idx),
                            });
                          }}
                          className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <i className="fa-solid fa-trash text-sm" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        skills: [...formData.skills, ""],
                      })
                    }
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add Skill
                  </button>
                </div>
              </div>

              {/* Application URL & Logo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Application URL
                  </label>
                  <input
                    type="url"
                    value={formData.applicationUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, applicationUrl: e.target.value })
                    }
                    placeholder="https://company.com/careers/job-id"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.companyLogo}
                    onChange={(e) =>
                      setFormData({ ...formData, companyLogo: e.target.value })
                    }
                    placeholder="https://company.com/logo.png"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    {editingId ? "Update" : "Create"} Job
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}