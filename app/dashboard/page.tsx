"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SideBar from "../sidebar/page";
import Learning from "@/public/data.jpg";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import BottomBar from "../bottom-bar/page";

interface UserData {
  fullName: string;
  email: string;
  role: string;
  streak?: number;
  xp?: number;
}

interface CourseProgress {
  id: string;
  courseId: string;
  courseName: string;
  courseImage?: string;
  category: string;
  progress: number;
  currentModule: number;
  totalModules: number;
  lastAccessed: Date;
}

interface Stats {
  weeklyGoal: number;
  timeSpent: number;
  certificates: number;
  certificatesInProgress: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({
    weeklyGoal: 0,
    timeSpent: 0,
    certificates: 0,
    certificatesInProgress: 0,
  });
  const [currentCourse, setCurrentCourse] = useState<CourseProgress | null>(null);
  const [allCourses, setAllCourses] = useState<CourseProgress[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
        await fetchUserStats(user.uid);
        await fetchCourseProgress(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          fullName: data.fullName || "User",
          email: data.email || "",
          role: data.role || "learner",
          streak: data.streak || 0,
          xp: data.xp || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      const progressQuery = query(
        collection(db, "progress"),
        where("userId", "==", userId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      let totalTimeSpent = 0;
      let weeklyProgress = 0;
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.timeSpent) {
          totalTimeSpent += data.timeSpent;
        }
        if (data.lastAccessed && data.lastAccessed.toDate() > oneWeekAgo) {
          weeklyProgress += data.progress || 0;
        }
      });

      const certificatesQuery = query(
        collection(db, "certificates"),
        where("userId", "==", userId)
      );
      const certificatesSnapshot = await getDocs(certificatesQuery);

      let earnedCerts = 0;
      let inProgressCerts = 0;

      certificatesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "earned") {
          earnedCerts++;
        } else if (data.status === "in-progress") {
          inProgressCerts++;
        }
      });

      setStats({
        weeklyGoal: Math.min(weeklyProgress / progressSnapshot.size * 100 || 0, 100),
        timeSpent: totalTimeSpent,
        certificates: earnedCerts,
        certificatesInProgress: inProgressCerts,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchCourseProgress = async (userId: string) => {
    try {
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("learnerId", "==", userId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

      const coursesData: CourseProgress[] = [];

      for (const enrollDoc of enrollmentsSnapshot.docs) {
        const enrollment = enrollDoc.data();
        
        const courseDoc = await getDoc(doc(db, "courses", enrollment.courseId));
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          
          coursesData.push({
            id: enrollDoc.id,
            courseId: enrollment.courseId,
            courseName: courseData.title || "Untitled Course",
            courseImage: courseData.imageUrl,
            category: courseData.category || "General",
            progress: enrollment.progress || 0,
            currentModule: enrollment.currentModule || 1,
            totalModules: courseData.totalModules || 12,
            lastAccessed: enrollment.lastAccessed?.toDate() || new Date(),
          });
        }
      }

      // Sort by lastAccessed in memory instead of in query
      coursesData.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
      
      // Limit to 5 most recent
      const recentCourses = coursesData.slice(0, 5);

      setAllCourses(recentCourses);
      if (recentCourses.length > 0) {
        setCurrentCourse(recentCourses[0]);
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getFirstName = (fullName: string): string => {
    return fullName.split(" ")[0];
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      <section className="flex-1 p-6 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30 -mx-6 -mt-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-slate-900">AmTechy</span>
          </div>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <i className="fa-solid fa-bell w-6 h-6"></i>
          </button>
        </header>
        <BottomBar/>
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {userData ? getFirstName(userData.fullName) : "User"}! 👋
              </h1>
              <p className="text-slate-500">
                {userData?.streak ? `You're on a ${userData.streak}-day streak. Keep it up!` : "Start your learning journey today!"}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <span className="text-yellow-500">
                  <i className="fa-solid fa-fire w-5 h-5 fill-current"></i>
                </span>
                <span className="font-bold text-slate-700">{userData?.streak || 0} Days</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <span className="text-indigo-600">
                  <i className="fa-solid fa-bolt-lightning w-5 h-5 fill-current"></i>
                </span>
                <span className="font-bold text-slate-700">{userData?.xp || 0} XP</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <i className="fa-solid fa-bullseye w-6 h-6"></i>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stats.weeklyGoal > 0 ? `+${Math.round(stats.weeklyGoal)}%` : "0%"}
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Weekly Goal</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {Math.round(stats.weeklyGoal)}%{" "}
                <span className="text-sm font-normal text-slate-400">completed</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.weeklyGoal}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <i className="fa-solid fa-clock w-6 h-6"></i>
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Time Spent</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatTime(stats.timeSpent)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Last 7 days</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                  <i className="fa-solid fa-award w-6 h-6"></i>
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">Certificates</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.certificates}{" "}
                <span className="text-sm font-normal text-slate-400">earned</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.certificatesInProgress} in progress
              </p>
            </div>
          </div>

          {/* Continue Learning & AI Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">Continue Learning</h3>
                <button 
                  onClick={() => router.push("/mylearning")}
                  className="text-indigo-600 text-sm font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              
              {currentCourse ? (
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                    {currentCourse.courseImage ? (
                      <Image
                        src={currentCourse.courseImage}
                        width={192}
                        height={128}
                        className="w-full h-full object-cover"
                        alt={currentCourse.courseName}
                      />
                    ) : (
                      <Image
                        src={Learning}
                        className="w-full h-full object-cover"
                        alt="Course"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                        {currentCourse.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        • Module {currentCourse.currentModule} of {currentCourse.totalModules}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                      {currentCourse.courseName}
                    </h4>
                    <p className="text-slate-500 text-sm mb-4">
                      Continue where you left off and complete this module.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${currentCourse.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {Math.round(currentCourse.progress)}%
                      </span>
                    </div>
                    <button 
                      onClick={() => router.push(`/course/${currentCourse.courseId}`)}
                      className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Resume Lesson
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-slate-500 mb-4">No courses in progress</p>
                  <button 
                    onClick={() => router.push("/courses")}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>

            {/* AI Recommendation */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <i className="fa-solid fa-robot w-24 h-24"></i>
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <i className="fa-solid fa-sparkles w-3 h-3"></i>
                  AI Recommendation
                </div>
                <h3 className="font-bold text-lg mb-2">Based on your progress...</h3>
                <p className="text-indigo-100 text-sm mb-6">
                  {currentCourse
                    ? `You're making great progress in ${currentCourse.courseName}! Consider booking a session with a mentor to accelerate your learning.`
                    : "Start your learning journey by enrolling in a course that matches your goals!"}
                </p>

                <button 
                  onClick={() => router.push("/find-tutor")}
                  className="w-full py-2 bg-white text-indigo-900 text-sm font-bold rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Find a Mentor
                </button>
              </div>
            </div>
          </div>

          {allCourses.length > 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 mb-6">Recent Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCourses.slice(1, 4).map((course) => (
                  <div
                    key={course.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/course/${course.courseId}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                        {course.courseName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {course.courseName}
                        </h4>
                        <p className="text-xs text-slate-500">{course.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {Math.round(course.progress)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}