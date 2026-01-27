"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";

interface Earning {
  id: string;
  sessionId: string;
  studentName: string;
  topic: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  date: Date;
  status: "pending" | "completed" | "withdrawn";
}

interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: Date;
  completedAt?: Date;
  accountDetails?: string;
}

type TimePeriod = "week" | "month" | "year" | "all";

export default function TutorEarnings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [accountDetails, setAccountDetails] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchEarningsData(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchEarningsData = async (tutorId: string) => {
    try {
      // Fetch tutor profile for platform fee rate
      const profileDoc = await getDoc(doc(db, "tutor_profiles", tutorId));
      if (profileDoc.exists()) {
        setTutorProfile(profileDoc.data());
      }

      // Fetch completed bookings as earnings
      const earningsQuery = query(
        collection(db, "bookings"),
        where("tutorId", "==", tutorId),
        where("status", "==", "completed"),
        orderBy("createdAt", "desc")
      );
      const earningsSnapshot = await getDocs(earningsQuery);

      const platformFeeRate = 0.15; // 15% platform fee

      const earningsData: Earning[] = earningsSnapshot.docs.map((doc) => {
        const data = doc.data();
        const amount = data.totalAmount || 0;
        const platformFee = amount * platformFeeRate;
        const netAmount = amount - platformFee;

        return {
          id: doc.id,
          sessionId: doc.id,
          studentName: data.userName || "Student",
          topic: data.topic || "General Tutoring",
          amount,
          platformFee,
          netAmount,
          date: data.completedAt?.toDate() || data.createdAt?.toDate() || new Date(),
          status: "completed",
        };
      });

      setEarnings(earningsData);

      // Mock withdrawals (replace with real data later)
      setWithdrawals([
        {
          id: "1",
          amount: 500,
          method: "Bank Transfer",
          status: "completed",
          requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: "2",
          amount: 300,
          method: "PayPal",
          status: "processing",
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]);
    } catch (error) {
      console.error("Error fetching earnings:", error);
    }
  };

  const getFilteredEarnings = () => {
    const now = new Date();
    let startDate = new Date();

    switch (timePeriod) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        return earnings;
    }

    return earnings.filter((earning) => earning.date >= startDate);
  };

  const getEarningsStats = () => {
    const filteredEarnings = getFilteredEarnings();

    const totalGross = filteredEarnings.reduce((sum, e) => sum + e.amount, 0);
    const totalFees = filteredEarnings.reduce((sum, e) => sum + e.platformFee, 0);
    const totalNet = filteredEarnings.reduce((sum, e) => sum + e.netAmount, 0);
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalNet - totalWithdrawn;

    return {
      totalGross,
      totalFees,
      totalNet,
      totalWithdrawn,
      availableBalance,
      sessionCount: filteredEarnings.length,
      averagePerSession: filteredEarnings.length > 0 ? totalNet / filteredEarnings.length : 0,
    };
  };

  const getMonthlyEarnings = () => {
    const monthlyData: { [key: string]: number } = {};

    earnings.forEach((earning) => {
      const monthKey = earning.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + earning.netAmount;
    });

    return Object.entries(monthlyData)
      .slice(-6)
      .map(([month, amount]) => ({ month, amount }));
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const stats = getEarningsStats();

    if (amount > stats.availableBalance) {
      alert("Insufficient balance");
      return;
    }

    if (!accountDetails.trim()) {
      alert("Please provide account details");
      return;
    }

    setWithdrawing(true);
    try {
      // In production, this would call a backend API
      const withdrawal: Withdrawal = {
        id: Date.now().toString(),
        amount,
        method: withdrawMethod === "bank" ? "Bank Transfer" : "PayPal",
        status: "pending",
        requestedAt: new Date(),
        accountDetails,
      };

      setWithdrawals((prev) => [withdrawal, ...prev]);
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setAccountDetails("");

      alert("Withdrawal request submitted successfully! It will be processed within 3-5 business days.");
    } catch (error) {
      console.error("Error requesting withdrawal:", error);
      alert("Failed to request withdrawal. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const getWithdrawalStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const stats = getEarningsStats();
  const monthlyData = getMonthlyEarnings();
  const filteredEarnings = getFilteredEarnings();

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push("/tutor/dashboard")}
              className="flex items-center text-slate-600 hover:text-slate-900 mb-2"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Earnings</h1>
            <p className="text-slate-600 mt-1">
              Track your income and manage withdrawals
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={stats.availableBalance <= 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-money-bill-transfer mr-2"></i>
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-wallet text-2xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${stats.availableBalance.toFixed(2)}
            </div>
            <div className="text-sm text-green-100">Available Balance</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-indigo-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${stats.totalNet.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">Total Earnings (Net)</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-arrow-down text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${stats.totalWithdrawn.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">Total Withdrawn</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-percent text-orange-600 text-xl"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${stats.totalFees.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">Platform Fees (15%)</div>
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Earnings Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimePeriod("week")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === "week"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimePeriod("month")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === "month"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimePeriod("year")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === "year"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setTimePeriod("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.sessionCount}
                  </div>
                  <div className="text-sm text-slate-600">Completed Sessions</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-slate-900">
                    ${stats.averagePerSession.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-600">Average per Session</div>
                </div>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Monthly Earnings</h3>
              {monthlyData.length > 0 ? (
                <div className="space-y-3">
                  {monthlyData.map((data, index) => {
                    const maxAmount = Math.max(...monthlyData.map((d) => d.amount));
                    const percentage = (data.amount / maxAmount) * 100;

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            {data.month}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            ${data.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  No earnings data yet
                </div>
              )}
            </div>

            {/* Earnings History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Earnings History</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {filteredEarnings.length} transaction(s) in selected period
                </p>
              </div>

              {filteredEarnings.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {filteredEarnings.map((earning) => (
                    <div key={earning.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">
                              {earning.topic}
                            </h4>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              Completed
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            Session with {earning.studentName}
                          </p>
                          <div className="text-xs text-slate-500">
                            {earning.date.toLocaleDateString()} at{" "}
                            {earning.date.toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600 mb-1">
                            +${earning.netAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Gross: ${earning.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Fee: -${earning.platformFee.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-receipt text-slate-400 text-2xl"></i>
                  </div>
                  <p className="text-slate-600">No earnings in this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Withdrawal History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Withdrawal History</h3>
              {withdrawals.length > 0 ? (
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">
                          ${withdrawal.amount.toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getWithdrawalStatusColor(
                            withdrawal.status
                          )}`}
                        >
                          {withdrawal.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-1">
                        {withdrawal.method}
                      </div>
                      <div className="text-xs text-slate-500">
                        Requested{" "}
                        {withdrawal.requestedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {withdrawal.completedAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Completed{" "}
                          {withdrawal.completedAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600 text-sm">
                  No withdrawals yet
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-info-circle text-blue-600 text-xl mt-1"></i>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Payment Information
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Platform fee: 15% per session</li>
                    <li>• Minimum withdrawal: $50</li>
                    <li>• Processing time: 3-5 business days</li>
                    <li>• Available methods: Bank, PayPal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-3">Need Help?</h4>
              <p className="text-sm text-slate-600 mb-4">
                Have questions about your earnings or withdrawals?
              </p>
              <button
                onClick={() => router.push("/support")}
                className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <i className="fa-solid fa-headset mr-2"></i>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Available Balance */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700 mb-1">Available Balance</div>
                <div className="text-3xl font-bold text-green-600">
                  ${stats.availableBalance.toFixed(2)}
                </div>
              </div>

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    min="50"
                    max={stats.availableBalance}
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Minimum withdrawal: $50
                </p>
              </div>

              {/* Withdrawal Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setWithdrawMethod("bank")}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      withdrawMethod === "bank"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <i className="fa-solid fa-building-columns text-2xl text-indigo-600 mb-2"></i>
                    <div className="font-medium text-slate-900 text-sm">
                      Bank Transfer
                    </div>
                  </button>
                  <button
                    onClick={() => setWithdrawMethod("paypal")}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      withdrawMethod === "paypal"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <i className="fa-brands fa-paypal text-2xl text-indigo-600 mb-2"></i>
                    <div className="font-medium text-slate-900 text-sm">PayPal</div>
                  </button>
                </div>
              </div>

              {/* Account Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {withdrawMethod === "bank" ? "Account Number" : "PayPal Email"}
                </label>
                <input
                  type={withdrawMethod === "bank" ? "text" : "email"}
                  placeholder={
                    withdrawMethod === "bank"
                      ? "Enter account number"
                      : "Enter PayPal email"
                  }
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  Withdrawals are processed within 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={
                  withdrawing ||
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) < 50 ||
                  parseFloat(withdrawAmount) > stats.availableBalance ||
                  !accountDetails.trim()
                }
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check mr-2"></i>
                    Confirm Withdrawal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}