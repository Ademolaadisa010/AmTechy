"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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
    completedBookings: number;
    totalUsers: number;
  };
}

// ── Sparkline SVG component ──────────────────────────────────────────────────
function Sparkline({
  data,
  color = "#6366f1",
  height = 40,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const w = 120;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h * 0.85 - h * 0.075;
    return `${x},${y}`;
  });
  const area = `M${pts.join("L")}L${w},${h}L0,${h}Z`;
  const line = `M${pts.join("L")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#", "")})`} />
      <path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const duration = 900;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return (
    <span>
      {prefix}
      {display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

// ── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ slices }: { slices: { value: number; color: string; label: string }[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 60;
  const cx = 70;
  const cy = 70;
  const arcs = slices.map((s) => {
    const start = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += s.value;
    const end = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return { ...s, d: `M${cx},${cy}L${x1},${y1}A${r},${r},0,${large},1,${x2},${y2}Z` };
  });
  return (
    <svg viewBox="0 0 140 140" className="w-32 h-32">
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill={a.color} opacity="0.9" />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="white" />
    </svg>
  );
}

// ── Column chart ─────────────────────────────────────────────────────────────
function ColumnChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1 h-full justify-end">
          <span className="text-[9px] text-slate-400 font-medium">{d.value}</span>
          <div
            className="w-full rounded-t-sm transition-all duration-700"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: color,
              animationDelay: `${i * 60}ms`,
            }}
          />
          <span className="text-[9px] text-slate-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
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
      completedBookings: 0,
      totalUsers: 0,
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

      // User growth
      const usersByDate: { [key: string]: number } = {};
      usersSnapshot.forEach((doc) => {
        const date = doc.data().createdAt?.toDate();
        if (date) {
          const key = date.toISOString().split("T")[0];
          usersByDate[key] = (usersByDate[key] || 0) + 1;
        }
      });
      const userGrowth = Object.entries(usersByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }))
        .slice(-30);

      // Revenue
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
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          revenueByMonth[key] = (revenueByMonth[key] || 0) + amount;
        }
      });
      const revenue = Object.entries(revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount }))
        .slice(-6);

      const platformFees = totalRevenue * 0.15;
      const tutorPayouts = totalRevenue * 0.85;
      const averageSessionPrice = completedBookings > 0 ? totalRevenue / completedBookings : 0;

      // Top tutors
      const tutorStats: { [key: string]: { name: string; sessions: number; earnings: number } } = {};
      tutorsSnapshot.forEach((doc) => {
        const data = doc.data();
        tutorStats[doc.id] = { name: data.displayName || "Unknown", sessions: 0, earnings: 0 };
      });
      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tutorId && tutorStats[data.tutorId] && data.status === "completed") {
          tutorStats[data.tutorId].sessions++;
          tutorStats[data.tutorId].earnings += (data.amount || 0) * 0.85;
        }
      });
      const topTutors = Object.values(tutorStats)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 8);

      // Top subjects
      const subjectStats: { [key: string]: number } = {};
      bookingsSnapshot.forEach((doc) => {
        const topic = doc.data().topic;
        if (topic) subjectStats[topic] = (subjectStats[topic] || 0) + 1;
      });
      const topSubjects = Object.entries(subjectStats)
        .map(([subject, bookings]) => ({ subject, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 8);

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
          completedBookings,
          totalUsers: usersSnapshot.size,
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
      <div className="flex flex-col items-center justify-center p-16 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">Loading analytics…</p>
      </div>
    );
  }

  const revenueSparkline = analytics.revenue.map((r) => r.amount);
  const userSparkline = analytics.userGrowth.map((u) => u.count);
  const maxSubjects = Math.max(...analytics.topSubjects.map((s) => s.bookings), 1);
  const donutSlices = [
    { value: analytics.platformStats.platformFees, color: "#6366f1", label: "Platform (15%)" },
    { value: analytics.platformStats.tutorPayouts, color: "#10b981", label: "Tutors (85%)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h2>
          <p className="text-slate-500 text-sm mt-0.5">Platform performance at a glance</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                timeRange === range
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: analytics.platformStats.totalRevenue,
            prefix: "$",
            color: "#10b981",
            bg: "bg-emerald-50",
            icon: "fa-dollar-sign",
            iconColor: "text-emerald-600",
            spark: revenueSparkline,
            sparkColor: "#10b981",
          },
          {
            label: "Platform Fees",
            value: analytics.platformStats.platformFees,
            prefix: "$",
            color: "#6366f1",
            bg: "bg-indigo-50",
            icon: "fa-coins",
            iconColor: "text-indigo-600",
            spark: revenueSparkline.map((v) => v * 0.15),
            sparkColor: "#6366f1",
          },
          {
            label: "Tutor Payouts",
            value: analytics.platformStats.tutorPayouts,
            prefix: "$",
            color: "#8b5cf6",
            bg: "bg-violet-50",
            icon: "fa-wallet",
            iconColor: "text-violet-600",
            spark: revenueSparkline.map((v) => v * 0.85),
            sparkColor: "#8b5cf6",
          },
          {
            label: "Avg Session Price",
            value: analytics.platformStats.averageSessionPrice,
            prefix: "$",
            decimals: 2,
            color: "#f59e0b",
            bg: "bg-amber-50",
            icon: "fa-chart-line",
            iconColor: "text-amber-600",
            spark: revenueSparkline,
            sparkColor: "#f59e0b",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <i className={`fa-solid ${card.icon} ${card.iconColor} text-sm`} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              <Counter value={card.value} prefix={card.prefix} decimals={card.decimals || 0} />
            </p>
            <div className="h-10">
              <Sparkline data={card.spark} color={card.sparkColor} height={40} />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-calendar-check text-blue-600 text-lg" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">
              <Counter value={analytics.platformStats.completedBookings} />
            </p>
            <p className="text-sm text-slate-500">Completed Sessions</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-users text-rose-500 text-lg" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">
              <Counter value={analytics.platformStats.totalUsers} />
            </p>
            <p className="text-sm text-slate-500">Registered Users</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue column chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900">Monthly Revenue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-3 py-1 rounded-full">
              <i className="fa-solid fa-arrow-trend-up mr-1" />
              Revenue
            </span>
          </div>
          {analytics.revenue.length > 0 ? (
            <ColumnChart
              data={analytics.revenue.map((r) => ({
                label: r.month.split("-")[1] + "/" + r.month.split("-")[0].slice(2),
                value: r.amount,
              }))}
              color="linear-gradient(to top, #6366f1, #8b5cf6)"
            />
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Revenue split donut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">Revenue Split</h3>
            <p className="text-xs text-slate-400 mt-0.5">Platform vs Tutors</p>
          </div>
          <div className="flex flex-col items-center gap-4 flex-1 justify-center">
            <DonutChart slices={donutSlices} />
            <div className="space-y-2 w-full">
              {donutSlices.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-600">{s.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">${s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User growth + Top tutors + Top subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User growth bars */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">User Growth</h3>
            <p className="text-xs text-slate-400 mt-0.5">New signups per day (last 7 days)</p>
          </div>
          {analytics.userGrowth.length > 0 ? (
            <div className="space-y-2">
              {analytics.userGrowth.slice(-7).map((d, i) => {
                const maxCount = Math.max(...analytics.userGrowth.map((u) => u.count), 1);
                const pct = (d.count / maxCount) * 100;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 w-20 flex-shrink-0">
                      {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-end pr-2 transition-all duration-700"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      >
                        <span className="text-white text-[10px] font-bold">{d.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No growth data yet</div>
          )}
        </div>

        {/* Top tutors */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-trophy text-amber-400" />
            <h3 className="font-bold text-slate-900">Top Tutors</h3>
          </div>
          <div className="space-y-2.5">
            {analytics.topTutors.length > 0 ? (
              analytics.topTutors.slice(0, 6).map((tutor, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{
                      background:
                        i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#e2e8f0",
                      color: i < 3 ? "white" : "#94a3b8",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{tutor.name}</p>
                    <p className="text-[11px] text-slate-400">{tutor.sessions} sessions</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 flex-shrink-0">
                    ${tutor.earnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-24 text-slate-400 text-sm">No tutor data yet</div>
            )}
          </div>
        </div>

        {/* Top subjects */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-book-open text-violet-500" />
            <h3 className="font-bold text-slate-900">Popular Subjects</h3>
          </div>
          <div className="space-y-2.5">
            {analytics.topSubjects.length > 0 ? (
              analytics.topSubjects.slice(0, 6).map((s, i) => {
                const pct = (s.bookings / maxSubjects) * 100;
                const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-slate-700 truncate max-w-[70%]">{s.subject}</span>
                      <span className="text-slate-400 font-medium">{s.bookings}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: colors[i] || "#6366f1" }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-24 text-slate-400 text-sm">No subject data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}