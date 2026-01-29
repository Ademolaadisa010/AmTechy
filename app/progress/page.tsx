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
} from "firebase/firestore";
import BottomBar from "../bottom-bar/page";

interface Course {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  thumbnail?: string;
  category: string;
  lastAccessed?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: Date;
}

interface Skill {
  name: string;
  level: number;
  progress: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  date: Date;
  icon: string;
  color: string;
}

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState<Course[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserProgress(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserProgress = async (userId: string) => {
    try {
      // Fetch enrollments
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("learnerId", "==", userId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

      const coursesData: Course[] = [];
      for (const enrollDoc of enrollmentsSnapshot.docs) {
        const enrollment = enrollDoc.data();
        const courseDoc = await getDoc(doc(db, "courses", enrollment.courseId));
        
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          coursesData.push({
            id: courseDoc.id,
            title: courseData.title || "",
            progress: enrollment.progress || 0,
            totalLessons: courseData.totalLessons || 10,
            completedLessons: enrollment.completedLessons || 0,
            thumbnail: courseData.thumbnail,
            category: courseData.category || "General",
            lastAccessed: enrollment.lastAccessed?.toDate(),
          });
        }
      }

      setCourses(coursesData);

      // Calculate stats
      const completed = coursesData.filter((c) => c.progress === 100).length;
      setStats({
        totalCourses: coursesData.length,
        completedCourses: completed,
        hoursLearned: coursesData.length * 8, // Mock data
        currentStreak: 7, // Mock data
      });

      // Mock achievements
      setAchievements([
        { id: "1", title: "First Steps", description: "Complete your first course", icon: "fa-trophy", unlocked: completed > 0, date: new Date() },
        { id: "2", title: "Quick Learner", description: "Complete 3 courses", icon: "fa-bolt", unlocked: completed >= 3, date: new Date() },
        { id: "3", title: "Knowledge Seeker", description: "Enroll in 5 courses", icon: "fa-book", unlocked: coursesData.length >= 5 },
        { id: "4", title: "Week Warrior", description: "7 day learning streak", icon: "fa-fire", unlocked: true, date: new Date() },
        { id: "5", title: "Night Owl", description: "Study past midnight", icon: "fa-moon", unlocked: false },
        { id: "6", title: "Master", description: "Complete 10 courses", icon: "fa-crown", unlocked: completed >= 10 },
      ]);

      // Mock skills
      setSkills([
        { name: "React", level: 3, progress: 75 },
        { name: "JavaScript", level: 4, progress: 85 },
        { name: "Python", level: 2, progress: 45 },
        { name: "UI/UX Design", level: 3, progress: 60 },
      ]);

      // Mock recent activity
      setRecentActivity([
        { id: "1", type: "course_completed", title: "Completed: Advanced React Patterns", date: new Date(Date.now() - 86400000), icon: "fa-check-circle", color: "green" },
        { id: "2", type: "lesson_completed", title: "Finished: Understanding Hooks", date: new Date(Date.now() - 172800000), icon: "fa-book-open", color: "blue" },
        { id: "3", type: "achievement", title: "Unlocked: Week Warrior", date: new Date(Date.now() - 259200000), icon: "fa-trophy", color: "yellow" },
        { id: "4", type: "course_started", title: "Started: Python for Data Science", date: new Date(Date.now() - 345600000), icon: "fa-play", color: "purple" },
      ]);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      
      <section className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">My Progress</h1>
            <p className="text-slate-600 mt-1">Track your learning journey and achievements</p>
          </div>
          <BottomBar/>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-book-open text-indigo-600 text-xl"></i>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.totalCourses}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">Total Courses</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-green-600 text-xl"></i>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.completedCourses}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">Completed</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-clock text-purple-600 text-xl"></i>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.hoursLearned}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">Hours Learned</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-fire text-orange-600 text-xl"></i>
                </div>
                <span className="text-2xl font-bold text-slate-900">{stats.currentStreak}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">Day Streak</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "overview" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Overview
                {activeTab === "overview" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "courses" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Courses
                {activeTab === "courses" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "achievements" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Achievements
                {activeTab === "achievements" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "skills" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Skills
                {activeTab === "skills" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Continue Learning */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Continue Learning</h2>
                  {courses.filter(c => c.progress < 100).slice(0, 3).map((course) => (
                    <div key={course.id} className="mb-4 last:mb-0 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl">
                          <i className="fa-solid fa-book"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{course.title}</h3>
                          <p className="text-sm text-slate-600">{course.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">{course.progress}%</p>
                          <p className="text-xs text-slate-500">{course.completedLessons}/{course.totalLessons} lessons</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                          <i className={`fa-solid ${activity.icon} text-${activity.color}-600`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                          <p className="text-xs text-slate-500">{activity.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Weekly Goal */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                  <h2 className="text-lg font-bold mb-2">Weekly Goal</h2>
                  <p className="text-sm opacity-90 mb-4">5 hours of learning</p>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-2">
                    <div className="bg-white h-3 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                  <p className="text-sm">3.5 / 5 hours completed</p>
                </div>

                {/* Top Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Top Skills</h2>
                  <div className="space-y-3">
                    {skills.slice(0, 3).map((skill, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                          <span className="text-xs text-slate-500">Level {skill.level}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${skill.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Achievements</h2>
                  <div className="space-y-3">
                    {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <i className={`fa-solid ${achievement.icon} text-yellow-600`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{achievement.title}</p>
                          <p className="text-xs text-slate-500">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{course.category}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">{course.completedLessons}/{course.totalLessons} lessons</span>
                      <span className="text-sm font-bold text-indigo-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-xl shadow-sm border p-6 text-center transition-all ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-white border-slate-200 opacity-50"
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    achievement.unlocked ? "bg-yellow-100" : "bg-slate-100"
                  }`}>
                    <i className={`fa-solid ${achievement.icon} text-3xl ${
                      achievement.unlocked ? "text-yellow-600" : "text-slate-400"
                    }`}></i>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{achievement.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                  {achievement.unlocked && achievement.date && (
                    <p className="text-xs text-slate-500">Unlocked {achievement.date.toLocaleDateString()}</p>
                  )}
                  {!achievement.unlocked && (
                    <p className="text-xs text-slate-500">🔒 Locked</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Your Skills</h2>
                <div className="space-y-6">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{skill.name}</h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                          Level {skill.level}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all"
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-600">{skill.progress}% to next level</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}