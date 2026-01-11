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
  getDoc 
} from "firebase/firestore";

interface Course {
  id: string;
  courseId: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  currentModule: number;
  totalModules: number;
  imageUrl?: string;
  lastAccessed: Date;
  status: string;
}

export default function MyLearning() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [careerGoal, setCareerGoal] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserCareerGoal(user.uid);
        await fetchEnrolledCourses(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserCareerGoal = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setCareerGoal(userDoc.data().careerGoal || "");
      }
    } catch (error) {
      console.error("Error fetching career goal:", error);
    }
  };

  const fetchEnrolledCourses = async (userId: string) => {
    try {
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
            id: enrollDoc.id,
            courseId: enrollment.courseId,
            title: courseData.title || "Untitled Course",
            description: courseData.description || "",
            category: courseData.category || "General",
            progress: enrollment.progress || 0,
            currentModule: enrollment.currentModule || 1,
            totalModules: courseData.totalModules || 12,
            imageUrl: courseData.imageUrl,
            lastAccessed: enrollment.lastAccessed?.toDate() || new Date(),
            status: enrollment.status || "active",
          });
        }
      }

      // Sort by last accessed
      coursesData.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const getFilteredCourses = () => {
    switch (selectedFilter) {
      case "in-progress":
        return courses.filter((c) => c.progress > 0 && c.progress < 100);
      case "completed":
        return courses.filter((c) => c.progress === 100);
      default:
        return courses;
    }
  };

  const getCareerGoalDisplay = (goal: string): string => {
    const goalMap: { [key: string]: string } = {
      frontend: "Frontend Development",
      backend: "Backend Development",
      "data-science": "Data Science",
      mobile: "Mobile Development",
      designer: "Product Design",
    };
    return goalMap[goal] || "Learning";
  };

  const filteredCourses = getFilteredCourses();

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your courses...</p>
        </div>
      </main>
    );
  }

  return (
    <div>
      <main className="flex-1 flex bg-slate-50 min-w-0">
        <SideBar />
        <section className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
                <p className="text-slate-600 mt-1">
                  {careerGoal 
                    ? `Your ${getCareerGoalDisplay(careerGoal)} journey`
                    : "Continue your learning journey"}
                </p>
              </div>
              <button
                onClick={() => router.push("/courses")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-book-open text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
                    <p className="text-sm text-slate-600">Enrolled Courses</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-check-circle text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {courses.filter((c) => c.progress === 100).length}
                    </p>
                    <p className="text-sm text-slate-600">Completed</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-chart-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {courses.filter((c) => c.progress > 0 && c.progress < 100).length}
                    </p>
                    <p className="text-sm text-slate-600">In Progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  selectedFilter === "all"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                All Courses ({courses.length})
              </button>
              <button
                onClick={() => setSelectedFilter("in-progress")}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  selectedFilter === "in-progress"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                In Progress ({courses.filter((c) => c.progress > 0 && c.progress < 100).length})
              </button>
              <button
                onClick={() => setSelectedFilter("completed")}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  selectedFilter === "completed"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Completed ({courses.filter((c) => c.progress === 100).length})
              </button>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/course/${course.courseId}`)}
                  >
                    {/* Course Image */}
                    <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-book text-white text-5xl opacity-50"></i>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-indigo-600">
                        {Math.round(course.progress)}%
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                          {course.category}
                        </span>
                        {course.progress === 100 && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded flex items-center gap-1">
                            <i className="fa-solid fa-check-circle"></i> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>
                            Module {course.currentModule} of {course.totalModules}
                          </span>
                          <span>{Math.round(course.progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/course/${course.courseId}/lesson/${course.currentModule}`);
                        }}
                        className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                      >
                        {course.progress === 0 ? "Start Course" : "Continue Learning"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-book-open text-slate-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {selectedFilter === "all" 
                    ? "No courses yet" 
                    : `No ${selectedFilter === "completed" ? "completed" : "in-progress"} courses`}
                </h3>
                <p className="text-slate-600 mb-6">
                  {selectedFilter === "all"
                    ? "Start your learning journey by enrolling in a course"
                    : "You don't have any courses in this category yet"}
                </p>
                <button
                  onClick={() => router.push("/courses")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}