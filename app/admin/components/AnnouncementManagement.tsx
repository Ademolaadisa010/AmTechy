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
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "general" | "enrollment" | "completion" | "progress" | "reminder";
  targetAudience: "all" | "students" | "tutors" | "premium-users";
  status: "active" | "inactive";
  priority: "low" | "medium" | "high";
  icon: string;
  backgroundColor: string;
  emailSent: boolean;
  emailCount: number;
  createdAt: any;
  updatedAt: any;
}

const ANNOUNCEMENT_TYPES = [
  { id: "general", label: "General", icon: "fa-bullhorn", desc: "General greetings or platform updates" },
  { id: "enrollment", label: "Enrollment", icon: "fa-book", desc: "Course enrollment reminders/notifications" },
  { id: "completion", label: "Completion", icon: "fa-certificate", desc: "Course completion & certificate requests" },
  { id: "progress", label: "Progress", icon: "fa-chart-line", desc: "Learning progress announcements" },
  { id: "reminder", label: "Reminder", icon: "fa-bell", desc: "Important reminders" },
];

const TARGET_OPTIONS = [
  { id: "all", label: "All Users" },
  { id: "students", label: "Students Only" },
  { id: "tutors", label: "Tutors Only" },
  { id: "premium-users", label: "Premium Users Only" },
];

const BG_COLORS = [
  { id: "indigo", label: "Indigo", value: "from-indigo-500 to-purple-600" },
  { id: "green", label: "Green", value: "from-green-500 to-teal-600" },
  { id: "blue", label: "Blue", value: "from-blue-500 to-cyan-600" },
  { id: "orange", label: "Orange", value: "from-orange-500 to-red-600" },
  { id: "pink", label: "Pink", value: "from-pink-500 to-rose-600" },
  { id: "purple", label: "Purple", value: "from-purple-500 to-fuchsia-600" },
];

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    message: string;
    type: "general" | "enrollment" | "completion" | "progress" | "reminder";
    targetAudience: "all" | "students" | "tutors" | "premium-users";
    status: "active" | "inactive";
    priority: "low" | "medium" | "high";
    backgroundColor: string;
    icon: string;
    sendEmail: boolean;
  }>({
    title: "",
    message: "",
    type: "general",
    targetAudience: "all",
    status: "active",
    priority: "medium",
    backgroundColor: "from-indigo-500 to-purple-600",
    icon: "fa-bullhorn",
    sendEmail: true, // ✅ NEW: Auto-send emails on creation
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          emailSent: docData.emailSent || false,
          emailCount: docData.emailCount || 0,
        } as Announcement;
      });
      setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      showToast("Failed to load announcements", "error");
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
      message: "",
      type: "general",
      targetAudience: "all",
      status: "active",
      priority: "medium",
      backgroundColor: "from-indigo-500 to-purple-600",
      icon: "fa-bullhorn",
      sendEmail: true,
    });
    setEditingId(null);
  };

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type as "general" | "enrollment" | "completion" | "progress" | "reminder",
        targetAudience: announcement.targetAudience as "all" | "students" | "tutors" | "premium-users",
        status: announcement.status as "active" | "inactive",
        priority: announcement.priority as "low" | "medium" | "high",
        backgroundColor: announcement.backgroundColor,
        icon: announcement.icon,
        sendEmail: false,
      });
      setEditingId(announcement.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast("Title and message are required", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const announcementData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetAudience: formData.targetAudience,
        status: formData.status,
        priority: formData.priority,
        backgroundColor: formData.backgroundColor,
        icon: formData.icon,
        updatedAt: serverTimestamp(),
      };

      let newAnnouncementId = editingId;

      if (editingId) {
        // ✅ Update existing
        await updateDoc(doc(db, "announcements", editingId), announcementData);
        showToast("Announcement updated ✓", "success");
      } else {
        // ✅ Create new
        const newData = {
          ...announcementData,
          createdAt: serverTimestamp(),
          emailSent: false,
          emailCount: 0,
          emailFailures: 0,
        };
        const docRef = await addDoc(collection(db, "announcements"), newData);
        newAnnouncementId = docRef.id;
        showToast("Announcement created ✓", "success");
      }

      // ✅ Send emails if checkbox was checked
      if (formData.sendEmail && !editingId && newAnnouncementId) {
        showToast("📧 Sending emails to users...", "success");
        
        try {
          const response = await fetch("/api/send-announcement-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ announcementId: newAnnouncementId }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to send emails");
          }

          // Update announcement with email sent status
          await updateDoc(doc(db, "announcements", newAnnouncementId), {
            emailSent: true,
            emailCount: data.successCount,
            emailFailures: data.failureCount,
            emailSentAt: serverTimestamp(),
          });

          showToast(
            `✅ Emails sent to ${data.successCount} users!`,
            "success"
          );
        } catch (emailErr) {
          console.error("Error sending emails:", emailErr);
          showToast(
            `⚠️ Announcement created but email sending failed: ${String(emailErr)}`,
            "error"
          );
        }
      }
      
      await fetchAnnouncements();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving announcement:", err);
      showToast("Failed to save announcement", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ NEW: Send emails manually for existing announcement via API route
  const handleSendEmails = async (announcementId: string) => {
    if (!confirm("Send announcement emails to all matching users?")) return;
    
    setSendingEmailId(announcementId);
    try {
      showToast("📧 Sending emails... This may take a few moments", "success");
      
      // Call the API route
      const response = await fetch("/api/send-announcement-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ announcementId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      // Update announcement to mark emails as sent
      await updateDoc(doc(db, "announcements", announcementId), {
        emailSent: true,
        emailCount: data.successCount,
        emailFailures: data.failureCount,
        emailSentAt: serverTimestamp(),
      });
      
      await fetchAnnouncements();
      showToast(
        `✅ Emails sent successfully! (${data.successCount}/${data.totalUsers} users)`,
        "success"
      );
    } catch (err) {
      console.error("Error sending emails:", err);
      showToast(`Failed to send emails: ${String(err)}`, "error");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      showToast("Announcement deleted ✓", "success");
      await fetchAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      showToast("Failed to delete announcement", "error");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, "announcements", id), {
        status: currentStatus === "active" ? "inactive" : "active",
        updatedAt: serverTimestamp(),
      });
      await fetchAnnouncements();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const getTargetLabel = (audience: string) => {
    const found = TARGET_OPTIONS.find((t) => t.id === audience);
    return found?.label || audience;
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
          <h2 className="text-2xl font-bold text-slate-900">📧 Announcements & Emails</h2>
          <p className="text-slate-500 text-sm mt-0.5">Create announcements and send emails to users</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <i className="fa-solid fa-plus" />
          Create Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-bullhorn text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{announcements.length}</p>
            <p className="text-xs text-slate-500">Total Announcements</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-envelope text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {announcements.filter((a) => a.emailSent).length}
            </p>
            <p className="text-xs text-slate-500">Emails Sent</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-circle-check text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {announcements.filter((a) => a.status === "active").length}
            </p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <i className="fa-solid fa-inbox text-4xl mb-4" />
            <p className="font-medium">No announcements yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br ${announcement.backgroundColor}`}
                    >
                      <i className={`fa-solid ${announcement.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">{announcement.title}</h3>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            announcement.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {announcement.status === "active" ? "🟢 Active" : "⚫ Inactive"}
                        </span>
                        {announcement.emailSent && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            ✅ Emails Sent
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-700 mb-3 line-clamp-2">{announcement.message}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-users" />
                          {getTargetLabel(announcement.targetAudience)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-tag" />
                          {ANNOUNCEMENT_TYPES.find((t) => t.id === announcement.type)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    {!announcement.emailSent && (
                      <button
                        onClick={() => handleSendEmails(announcement.id)}
                        disabled={sendingEmailId === announcement.id}
                        className="w-9 h-9 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-all disabled:opacity-60"
                        title="Send Emails"
                      >
                        {sendingEmailId === announcement.id ? (
                          <i className="fa-solid fa-spinner animate-spin" />
                        ) : (
                          <i className="fa-solid fa-envelope" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(announcement.id, announcement.status)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        announcement.status === "active"
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={announcement.status === "active" ? "Deactivate" : "Activate"}
                    >
                      <i className={`fa-solid ${announcement.status === "active" ? "fa-toggle-on" : "fa-toggle-off"}`} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(announcement)}
                      className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-all"
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen-to-square" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="w-9 h-9 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-all"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit Announcement" : "Create New Announcement"}
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
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Your Course!"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your announcement message here..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Announcement Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id as "general" | "enrollment" | "completion" | "progress" | "reminder" })}
                      className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                        formData.type === type.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <i className={`fa-solid ${type.icon} mr-2`} />
                      {type.label}
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Who receives this? (Target Audience)
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as "all" | "students" | "tutors" | "premium-users" })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TARGET_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* ✅ NEW: Send Email Checkbox */}
              {!editingId && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Send emails to users</p>
                      <p className="text-xs text-slate-600">
                        {formData.sendEmail
                          ? "Emails will be automatically sent to all matching users"
                          : "Announcement will be created but no emails will be sent"}
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Background Color */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Design
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BG_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setFormData({ ...formData, backgroundColor: color.value })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.backgroundColor === color.value
                          ? "border-slate-900"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`h-8 rounded-lg bg-gradient-to-br ${color.value}`} />
                      <p className="text-xs font-medium text-slate-700 mt-1">{color.label}</p>
                    </button>
                  ))}
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
                    {editingId ? "Update" : "Create"} Announcement
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