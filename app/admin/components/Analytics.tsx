"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  revenue: { month: string; amount: number }[];
  topTutors: { name: string; sessions: number; earnings: number }[];
  topSubjects: { subject: string; bookings: number }[];
  platformStats: {
    totalRevenue: number;
    platformFees: number;
    tutorPayouts: number;
    averageSessionPrice: number;
  };
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    revenue: [],
    topTutors: [],
    topSubjects: [],
    platformStats: {
      totalRevenue: 0,
      platformFees: 0,
      tutorPayouts: 0,
      averageSessionPrice: 0,
    },
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [usersSnapshot, bookingsSnapshot, tutorsSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "bookings")),
        getDocs(collection(db, "tutor_profiles")),
      ]);

      // Calculate user growth
      const usersByDate: { [key: string]: number } = {};
      usersSnapshot.forEach((doc) => {
        const date = doc.data().createdAt?.toDate();
        if (date) {
          const dateKey = date.toISOString().split("T")[0];
          usersByDate[dateKey] = (usersByDate[dateKey] || 0) + 1;
        }
      });

      const userGrowth = Object.entries(usersByDate)
        .map(([date, count]) => ({ date, count }))
        .slice(-30);

      // Calculate revenue by month
      const revenueByMonth: { [key: string]: number } = {};
      let totalRevenue = 0;
      let completedBookings = 0;

      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "completed" && data.createdAt) {
          const amount = data.amount || 0;
          totalRevenue += amount;
          completedBookings++;

          const date = data.createdAt.toDate();
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + amount;
        }
      });

      const revenue = Object.entries(revenueByMonth)
        .map(([month, amount]) => ({ month, amount }))
        .slice(-6);

      // Calculate platform stats
      const platformFees = totalRevenue * 0.15;
      const tutorPayouts = totalRevenue * 0.85;
      const averageSessionPrice = completedBookings > 0 ? totalRevenue / completedBookings : 0;

      // Calculate top tutors
      const tutorStats: { [key: string]: { name: string; sessions: number; earnings: number } } = {};
      
      tutorsSnapshot.forEach((doc) => {
        const data = doc.data();
        tutorStats[doc.id] = {
          name: data.displayName || "Unknown",
          sessions: 0,
          earnings: 0,
        };
      });

      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tutorId && tutorStats[data.tutorId] && data.status === "completed") {
          tutorStats[data.tutorId].sessions++;
          tutorStats[data.tutorId].earnings += (data.amount || 0) * 0.85; // Tutor gets 85%
        }
      });

      const topTutors = Object.values(tutorStats)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10);

      // Calculate top subjects
      const subjectStats: { [key: string]: number } = {};
      bookingsSnapshot.forEach((doc) => {
        const topic = doc.data().topic;
        if (topic) {
          subjectStats[topic] = (subjectStats[topic] || 0) + 1;
        }
      });

      const topSubjects = Object.entries(subjectStats)
        .map(([subject, bookings]) => ({ subject, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 10);

      setAnalytics({
        userGrowth,
        revenue,
        topTutors,
        topSubjects,
        platformStats: {
          totalRevenue,
          platformFees,
          tutorPayouts,
          averageSessionPrice,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analytics & Reports</h2>
          <p className="text-slate-600">Platform performance metrics and insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Last {range}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-dollar-sign text-green-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            ${analytics.platformStats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-coins text-indigo-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            ${analytics.platformStats.platformFees.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600">Platform Fees (15%)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-wallet text-purple-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            ${analytics.platformStats.tutorPayouts.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600">Tutor Payouts (85%)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-yellow-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            ${analytics.platformStats.averageSessionPrice.toFixed(2)}
          </p>
          <p className="text-sm text-slate-600">Avg Session Price</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">User Growth (Last 30 Days)</h3>
          <div className="space-y-2">
            {analytics.userGrowth.slice(-7).map((data, i) => {
              const maxCount = Math.max(...analytics.userGrowth.map((d) => d.count));
              const percentage = (data.count / maxCount) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-24 flex-shrink-0">
                    {new Date(data.date).toLocaleDateString()}
                  </span>
                  <div className="flex-1 bg-slate-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    >
                      {data.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Monthly Revenue (Last 6 Months)</h3>
          <div className="space-y-2">
            {analytics.revenue.map((data, i) => {
              const maxAmount = Math.max(...analytics.revenue.map((d) => d.amount));
              const percentage = (data.amount / maxAmount) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-20 flex-shrink-0">{data.month}</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-green-600 h-full flex items-center justify-end pr-3 text-white text-sm font-medium transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    >
                      ${data.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tutors */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-trophy text-yellow-500"></i>
            Top Performing Tutors
          </h3>
          <div className="space-y-3">
            {analytics.topTutors.length > 0 ? (
              analytics.topTutors.map((tutor, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{tutor.name}</p>
                    <p className="text-sm text-slate-500">{tutor.sessions} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${tutor.earnings.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-book text-purple-500"></i>
            Popular Subjects
          </h3>
          <div className="space-y-3">
            {analytics.topSubjects.length > 0 ? (
              analytics.topSubjects.map((subject, i) => {
                const maxBookings = Math.max(...analytics.topSubjects.map((s) => s.bookings));
                const percentage = (subject.bookings / maxBookings) * 100;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                      {subject.subject}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-32 bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 w-12 text-right">
                        {subject.bookings}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}