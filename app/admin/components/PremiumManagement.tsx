"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

interface User {
  id: string;
  fullName: string;
  email: string;
  plan: "free" | "premium";
  role: string;
  careerGoal?: string;
  premiumSince?: Timestamp;
  premiumExpiry?: Timestamp;
  photoURL?: string;
}

const PLAN_DURATIONS = [
  { label: "1 Month",  days: 30  },
  { label: "3 Months", days: 90  },
  { label: "6 Months", days: 180 },
  { label: "1 Year",   days: 365 },
  { label: "Lifetime", days: 0   }, // 0 = no expiry
];

const CAREER_GOAL_MAP: Record<string, string> = {
  frontend:       "Frontend Developer",
  backend:        "Backend Developer",
  "data-science": "Data Scientist",
  mobile:         "Mobile Developer",
  designer:       "Product Designer",
  fullstack:      "Full Stack Developer",
};

export default function PremiumManagement({ onUpdate }: { onUpdate?: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "premium">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(PLAN_DURATIONS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as User[];
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openUpgradeModal = (user: User) => {
    setSelectedUser(user);
    setSelectedDuration(PLAN_DURATIONS[0]);
    setIsModalOpen(true);
  };

  const handleUpgrade = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const now = new Date();
      const premiumSince = Timestamp.fromDate(now);

      let premiumExpiry: Timestamp | null = null;
      if (selectedDuration.days > 0) {
        const expiry = new Date(now);
        expiry.setDate(expiry.getDate() + selectedDuration.days);
        premiumExpiry = Timestamp.fromDate(expiry);
      }

      const updateData: Record<string, any> = {
        plan: "premium",
        premiumSince,
      };
      if (premiumExpiry) updateData.premiumExpiry = premiumExpiry;

      await updateDoc(doc(db, "users", selectedUser.id), updateData);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, plan: "premium", premiumSince, premiumExpiry: premiumExpiry ?? undefined }
            : u
        )
      );

      setIsModalOpen(false);
      showToast(`${selectedUser.fullName} upgraded to Premium ✓`, "success");
      onUpdate?.();
    } catch (err) {
      console.error("Upgrade error:", err);
      showToast("Failed to upgrade user. Try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async (user: User) => {
    if (!confirm(`Remove Premium from ${user.fullName}?`)) return;
    try {
      await updateDoc(doc(db, "users", user.id), {
        plan: "free",
        premiumSince: null,
        premiumExpiry: null,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, plan: "free", premiumSince: undefined, premiumExpiry: undefined }
            : u
        )
      );
      showToast(`${user.fullName} reverted to Free plan.`, "success");
      onUpdate?.();
    } catch (err) {
      console.error("Revoke error:", err);
      showToast("Failed to revoke premium. Try again.", "error");
    }
  };

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "—";
    return ts.toDate().toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const isExpired = (ts?: Timestamp) => {
    if (!ts) return false;
    return ts.toDate() < new Date();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === "all" || u.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const premiumCount = users.filter((u) => u.plan === "premium").length;
  const freeCount    = users.filter((u) => u.plan === "free").length;

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="space-y-6">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
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

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Premium Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage user plan access and upgrades</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <i className="fa-solid fa-arrows-rotate" />
          Refresh
        </button>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-users text-slate-600 text-lg" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-500">Total Users</p>
          </div>
        </div>
        <div className="bg-white border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-crown text-amber-500 text-lg" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{premiumCount}</p>
            <p className="text-xs text-slate-500">Premium Users</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-user text-slate-500 text-lg" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-700">{freeCount}</p>
            <p className="text-xs text-slate-500">Free Users</p>
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
          {(["all", "premium", "free"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlan(p)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                filterPlan === p
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <i className="fa-solid fa-users-slash text-4xl mb-3" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Since</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expires</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const expired = isExpired(user.premiumExpiry);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {getInitials(user.fullName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan badge */}
                      <td className="px-5 py-4">
                        {user.plan === "premium" ? (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                            expired
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            <i className="fa-solid fa-crown text-[10px]" />
                            {expired ? "Expired" : "Premium"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                            Free
                          </span>
                        )}
                      </td>

                      {/* Since */}
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(user.premiumSince)}
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4 text-xs">
                        {user.plan === "premium" && !user.premiumExpiry ? (
                          <span className="text-emerald-600 font-semibold">Lifetime</span>
                        ) : (
                          <span className={expired ? "text-red-500 font-semibold" : "text-slate-500"}>
                            {formatDate(user.premiumExpiry)}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        {user.plan === "premium" ? (
                          <button
                            onClick={() => handleRevoke(user)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => openUpgradeModal(user)}
                            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all"
                          >
                            <i className="fa-solid fa-crown mr-1 text-[10px]" />
                            Upgrade
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Upgrade Modal ─────────────────────────────────────────────────── */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-crown text-amber-300" />
                  <h3 className="font-bold text-lg">Upgrade to Premium</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>

              {/* Selected user */}
              <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt={selectedUser.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    {getInitials(selectedUser.fullName)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{selectedUser.fullName}</p>
                  <p className="text-white/70 text-xs">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLAN_DURATIONS.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => setSelectedDuration(d)}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                        selectedDuration.label === d.label
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                      }`}
                    >
                      {d.days === 0 ? (
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-infinity text-amber-500" />
                          {d.label}
                        </div>
                      ) : d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiry preview */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
                <i className="fa-solid fa-calendar-check text-indigo-500 mr-1.5" />
                {selectedDuration.days === 0 ? (
                  <span>Access never expires — <strong>Lifetime plan</strong></span>
                ) : (
                  <span>
                    Expires on:{" "}
                    <strong>
                      {new Date(Date.now() + selectedDuration.days * 86400000).toLocaleDateString("en-NG", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </strong>
                  </span>
                )}
              </div>

              {/* What they get */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What they'll unlock</p>
                {["Jobs & Gigs board", "All certificates", "Community forum", "Ad-free experience", "Early course access"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <i className="fa-solid fa-check text-indigo-500 text-xs" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Upgrading...</>
                ) : (
                  <><i className="fa-solid fa-crown text-amber-300 text-xs" /> Confirm Upgrade</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}