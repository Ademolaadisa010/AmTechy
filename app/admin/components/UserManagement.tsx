"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: any;
  status: "active" | "suspended" | "banned";
  lastLogin?: any;
  photoURL?: string;
}

interface UserManagementProps {
  onUpdate?: () => void;
}

export default function UserManagement({ onUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Check authentication first
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error('❌ User is not authenticated');
        alert('You must be logged in to view users');
        setLoading(false);
        return;
      }
      
      console.log('✅ User authenticated:', currentUser.email);
      
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(200)
      );
      
      console.log('🔄 Fetching users...');
      const snapshot = await getDocs(usersQuery);
      console.log('✅ Fetched', snapshot.docs.length, 'users');
      
      const usersData: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        fullName: doc.data().fullName || "Unknown",
        email: doc.data().email,
        role: doc.data().role || "learner",
        createdAt: doc.data().createdAt,
        status: doc.data().status || "active",
        lastLogin: doc.data().lastLogin,
        photoURL: doc.data().photoURL,
      }));
      
      setUsers(usersData);
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        alert('Permission denied. You need admin access to view users.\n\nPlease check:\n1. You are logged in\n2. Firestore rules allow user access\n3. You have admin role');
      } else {
        alert('Failed to fetch users: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return;

    setProcessing(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "suspended",
        suspendedAt: serverTimestamp(),
      });
      alert("User suspended successfully!");
      await fetchUsers();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error("Error suspending user:", error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. You need admin access to suspend users.');
      } else {
        alert('Failed to suspend user: ' + error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleActivateUser = async (userId: string) => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "active",
        reactivatedAt: serverTimestamp(),
      });
      alert("User activated successfully!");
      await fetchUsers();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error("Error activating user:", error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. You need admin access to activate users.');
      } else {
        alert('Failed to activate user: ' + error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }

    setProcessing(true);
    try {
      await deleteDoc(doc(db, "users", userId));
      alert("User deleted successfully!");
      await fetchUsers();
      if (onUpdate) onUpdate();
      setShowUserModal(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. You need admin access to delete users.');
      } else {
        alert('Failed to delete user: ' + error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;

    setProcessing(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        roleChangedAt: serverTimestamp(),
      });
      alert("User role updated successfully!");
      await fetchUsers();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error("Error changing role:", error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. You need admin access to change user roles.');
      } else {
        alert('Failed to change user role: ' + error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "tutors" && user.role === "tutor") ||
      (filter === "students" && user.role === "learner") ||
      (filter === "suspended" && user.status === "suspended") ||
      (filter === "admins" && user.role === "admin");

    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">User Management</h2>
        <p className="text-slate-600">Manage all platform users and their permissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {["all", "students", "tutors", "admins", "suspended"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Tutors</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === "tutor").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Suspended</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter((u) => u.status === "suspended").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.fullName}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      disabled={processing}
                      className="px-3 py-1 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="learner">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "suspended"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        View
                      </button>
                      
                      {user.status === "active" ? (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          disabled={processing}
                          className="px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          disabled={processing}
                          className="px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={processing}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <i className="fa-solid fa-users text-slate-300 text-4xl mb-4"></i>
            <p className="text-slate-600">No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    selectedUser.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedUser.fullName}</h4>
                  <p className="text-slate-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Role</p>
                  <p className="font-medium text-slate-900 capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.status === "active"
                        ? "bg-green-100 text-green-700"
                        : selectedUser.status === "suspended"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Joined</p>
                  <p className="font-medium text-slate-900">
                    {selectedUser.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Last Login</p>
                  <p className="font-medium text-slate-900">
                    {selectedUser.lastLogin?.toDate?.()?.toLocaleDateString() || "Never"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                {selectedUser.status === "active" ? (
                  <button
                    onClick={() => handleSuspendUser(selectedUser.id)}
                    disabled={processing}
                    className="flex-1 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? "Processing..." : "Suspend User"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateUser(selectedUser.id)}
                    disabled={processing}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? "Processing..." : "Activate User"}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}