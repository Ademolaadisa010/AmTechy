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
  orderBy,
  limit,
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
  enrollmentDate?: Date;
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

interface UserProgress {
  courseId: string;
  userId: string;
  progress: number;
  completedLessons: number;
  totalLessons?: number;
  lastAccessed?: Date;
  completionDate?: Date;
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
    avgCompletion: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUser({
          uid: currentUser.uid,
          displayName: userDoc.data()?.fullName || userDoc.data()?.displayName || currentUser.displayName || "User",
          email: currentUser.email,
        });
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
      // Fetch course progress data
      const progressQuery = query(
        collection(db, "progress"),
        where("userId", "==", userId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      const coursesData: Course[] = [];
      const skillsData: { [key: string]: Skill } = {};
      let totalHours = 0;

      for (const progressDoc of progressSnapshot.docs) {
        const progressData = progressDoc.data() as UserProgress;
        
        // Fetch course details
        try {
          const courseDoc = await getDoc(doc(db, "courses", progressData.courseId));
          
          if (courseDoc.exists()) {
            const courseInfo = courseDoc.data();
            const courseLessons = courseInfo.lessons ? Object.keys(courseInfo.lessons).length : progressData.totalLessons || 10;
            
            coursesData.push({
              id: courseDoc.id,
              title: courseInfo.title || "Untitled Course",
              progress: progressData.progress || 0,
              totalLessons: courseLessons,
              completedLessons: progressData.completedLessons || 0,
              thumbnail: courseInfo.imageUrl || courseInfo.thumbnail,
              category: courseInfo.category || "General",
              lastAccessed: progressData.lastAccessed 
                ? (progressData.lastAccessed as any).toDate?.() || new Date(progressData.lastAccessed as any)
                : new Date(),
              enrollmentDate: progressData.lastAccessed
                ? (progressData.lastAccessed as any).toDate?.() || new Date(progressData.lastAccessed as any)
                : new Date(),
            });

            // Extract skills from course
            if (courseInfo.skills && Array.isArray(courseInfo.skills)) {
              courseInfo.skills.forEach((skill: string) => {
                const progressPercent = progressData.progress || 0;
                if (!skillsData[skill]) {
                  skillsData[skill] = {
                    name: skill,
                    level: Math.floor(progressPercent / 25) + 1,
                    progress: progressPercent % 25 * 4,
                  };
                } else {
                  // Update skill with higher progress
                  skillsData[skill].progress = Math.max(skillsData[skill].progress, progressPercent % 25 * 4);
                  skillsData[skill].level = Math.max(skillsData[skill].level, Math.floor(progressPercent / 25) + 1);
                }
              });
            }

            // Calculate hours (assuming 1 lesson = 1 hour)
            totalHours += progressData.completedLessons || 0;
          }
        } catch (error) {
          console.error(`Error fetching course ${progressData.courseId}:`, error);
        }
      }

      setCourses(coursesData);
      setSkills(Object.values(skillsData));

      // Calculate stats
      const completed = coursesData.filter((c) => c.progress === 100).length;
      const avgCompletion = coursesData.length > 0 
        ? Math.round(coursesData.reduce((sum, c) => sum + c.progress, 0) / coursesData.length)
        : 0;

      setStats({
        totalCourses: coursesData.length,
        completedCourses: completed,
        hoursLearned: totalHours,
        currentStreak: 7, // Can be calculated from daily activity
        avgCompletion: avgCompletion,
      });

      // Generate achievements based on actual progress
      generateAchievements(completed, coursesData.length, totalHours);

      // Generate recent activity
      generateRecentActivity(coursesData);

    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const generateAchievements = (completed: number, enrolled: number, hours: number) => {
    const achievementsData: Achievement[] = [
      {
        id: "1",
        title: "First Steps",
        description: "Complete your first course",
        icon: "fa-trophy",
        unlocked: completed > 0,
        date: completed > 0 ? new Date() : undefined,
      },
      {
        id: "2",
        title: "Quick Learner",
        description: "Complete 3 courses",
        icon: "fa-bolt",
        unlocked: completed >= 3,
        date: completed >= 3 ? new Date() : undefined,
      },
      {
        id: "3",
        title: "Knowledge Seeker",
        description: "Enroll in 5 courses",
        icon: "fa-book",
        unlocked: enrolled >= 5,
        date: enrolled >= 5 ? new Date() : undefined,
      },
      {
        id: "4",
        title: "Week Warrior",
        description: "7 day learning streak",
        icon: "fa-fire",
        unlocked: true,
        date: new Date(),
      },
      {
        id: "5",
        title: "Hour Master",
        description: "Complete 50 hours of learning",
        icon: "fa-hourglass-end",
        unlocked: hours >= 50,
        date: hours >= 50 ? new Date() : undefined,
      },
      {
        id: "6",
        title: "Master",
        description: "Complete 10 courses",
        icon: "fa-crown",
        unlocked: completed >= 10,
        date: completed >= 10 ? new Date() : undefined,
      },
      {
        id: "7",
        title: "Dedicated Learner",
        description: "Complete 100+ hours",
        icon: "fa-graduation-cap",
        unlocked: hours >= 100,
        date: hours >= 100 ? new Date() : undefined,
      },
      {
        id: "8",
        title: "Skill Collector",
        description: "Master 5 different skills",
        icon: "fa-gem",
        unlocked: false,
      },
    ];

    setAchievements(achievementsData);
  };

  const generateRecentActivity = (coursesData: Course[]) => {
    const activities: Activity[] = [];

    // Get recently accessed courses
    const sortedCourses = [...coursesData].sort((a, b) => {
      const dateA = a.lastAccessed?.getTime() || 0;
      const dateB = b.lastAccessed?.getTime() || 0;
      return dateB - dateA;
    });

    // Add recent course activities
    sortedCourses.slice(0, 3).forEach((course) => {
      const activityDate = course.lastAccessed || new Date();
      if (course.progress === 100) {
        activities.push({
          id: `completed_${course.id}`,
          type: "course_completed",
          title: `Completed: ${course.title}`,
          date: activityDate,
          icon: "fa-check-circle",
          color: "green",
        });
      } else {
        activities.push({
          id: `progress_${course.id}`,
          type: "course_progress",
          title: `Progress: ${course.title} (${course.progress}%)`,
          date: activityDate,
          icon: "fa-book-open",
          color: "blue",
        });
      }
    });

    // Sort by date (most recent first)
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    setRecentActivity(activities.slice(0, 4));
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressColorClass = (progress: number) => {
    if (progress < 30) return "text-red-600";
    if (progress < 70) return "text-yellow-600";
    return "text-green-600";
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
                <span className="text-2xl font-bold text-slate-900">{stats.avgCompletion}%</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">Avg Completion</p>
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
                  {courses.filter(c => c.progress < 100).length > 0 ? (
                    courses.filter(c => c.progress < 100).slice(0, 3).map((course) => (
                      <div key={course.id} className="mb-4 last:mb-0 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                            <i className="fa-solid fa-book"></i>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{course.title}</h3>
                            <p className="text-sm text-slate-600">{course.category}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-2xl font-bold ${getProgressColorClass(course.progress)}`}>
                              {course.progress}%
                            </p>
                            <p className="text-xs text-slate-500">
                              {course.completedLessons}/{course.totalLessons} lessons
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fa-solid fa-check-circle text-green-500 text-4xl mb-3"></i>
                      <p className="text-slate-600 font-medium">All courses completed!</p>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
                  {recentActivity.length > 0 ? (
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
                  ) : (
                    <p className="text-slate-500 text-center py-8">No activity yet</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Weekly Goal */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                  <h2 className="text-lg font-bold mb-2">Learning Streak</h2>
                  <p className="text-sm opacity-90 mb-4">Keep it up!</p>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-2">
                    <div className="bg-white h-3 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                  <p className="text-sm">7 / 7 days active</p>
                </div>

                {/* Top Skills */}
                {skills.length > 0 && (
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
                )}

                {/* Recent Achievements */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Achievements</h2>
                  {achievements.filter(a => a.unlocked).length > 0 ? (
                    <div className="space-y-3">
                      {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className={`fa-solid ${achievement.icon} text-yellow-600`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{achievement.title}</p>
                            <p className="text-xs text-slate-500">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-6 text-sm">No achievements yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div>
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl">
                        <i className="fa-solid fa-graduation-cap"></i>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{course.category}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <span className={`text-sm font-bold ${getProgressColorClass(course.progress)}`}>
                            {course.progress}%
                          </span>
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
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <i className="fa-solid fa-book text-slate-300 text-5xl mb-4"></i>
                  <p className="text-slate-600 font-medium">No enrolled courses yet</p>
                </div>
              )}
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
              {skills.length > 0 ? (
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
                        <p className="text-sm text-slate-600">{Math.round(skill.progress)}% to next level</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <i className="fa-solid fa-gem text-slate-300 text-5xl mb-4"></i>
                  <p className="text-slate-600 font-medium">No skills tracked yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}