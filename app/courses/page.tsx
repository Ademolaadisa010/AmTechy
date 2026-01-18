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
  addDoc,
  getDoc,
} from "firebase/firestore";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  tutorId: string;
  tutorName?: string;
  price: number;
  rating: number;
  studentsEnrolled: number;
  totalModules: number;
  imageUrl?: string;
  status: string;
  level?: string;
}

export default function BrowseCourses() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [userCareerGoal, setUserCareerGoal] = useState<string>("");

  const categories = [
    { id: "all", label: "All Courses", icon: "🎓" },
    { id: "Frontend Development", label: "Frontend", icon: "💻" },
    { id: "Backend Development", label: "Backend", icon: "⚙️" },
    { id: "Data Science", label: "Data Science", icon: "📊" },
    { id: "Mobile Development", label: "Mobile", icon: "📱" },
    { id: "Product Design", label: "Design", icon: "🎨" },
    { id: "DevOps", label: "DevOps", icon: "🔧" },
    { id: "AI & Machine Learning", label: "AI/ML", icon: "🤖" },
  ];

  const levels = [
    { id: "all", label: "All Levels" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserCareerGoal(user.uid);
        await fetchEnrolledCourses(user.uid);
        await fetchAllCourses();
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
        setUserCareerGoal(userDoc.data().careerGoal || "");
      }
    } catch (error) {
      console.error("Error fetching user career goal:", error);
    }
  };

  const fetchEnrolledCourses = async (userId: string) => {
    try {
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("learnerId", "==", userId)
      );
      const snapshot = await getDocs(enrollmentsQuery);
      const courseIds = snapshot.docs.map((doc) => doc.data().courseId);
      setEnrolledCourseIds(courseIds);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const coursesQuery = query(
        collection(db, "courses"),
        where("status", "==", "published")
      );
      const snapshot = await getDocs(coursesQuery);

      const coursesData: Course[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "Untitled Course",
        description: doc.data().description || "",
        category: doc.data().category || "General",
        tutorId: doc.data().tutorId || "",
        tutorName: doc.data().tutorName,
        price: doc.data().price || 0,
        rating: doc.data().rating || 4.5,
        studentsEnrolled: doc.data().studentsEnrolled || 0,
        totalModules: doc.data().totalModules || 10,
        imageUrl: doc.data().imageUrl,
        status: doc.data().status || "published",
        level: doc.data().level || "beginner",
      }));

      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!auth.currentUser) return;

    setEnrollingCourseId(courseId);
    try {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;

      // Create enrollment
      await addDoc(collection(db, "enrollments"), {
        learnerId: auth.currentUser.uid,
        courseId: courseId,
        tutorId: course.tutorId,
        progress: 0,
        currentModule: 1,
        status: "active",
        enrolledAt: new Date().toISOString(),
        lastAccessed: new Date(),
      });

      // Create progress record
      await addDoc(collection(db, "progress"), {
        userId: auth.currentUser.uid,
        courseId: courseId,
        progress: 0,
        timeSpent: 0,
        lastAccessed: new Date(),
        completedLessons: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
      router.push("/mylearning");
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll. Please try again.");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const getFilteredCourses = () => {
    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "all" || course.level === selectedLevel;
      const matchesSearch =
        searchQuery === "" ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesLevel && matchesSearch;
    });
  };

  const getRecommendedCourses = () => {
    const careerGoalMap: { [key: string]: string } = {
      frontend: "Frontend Development",
      backend: "Backend Development",
      "data-science": "Data Science",
      mobile: "Mobile Development",
      designer: "Product Design",
    };

    const recommendedCategory = careerGoalMap[userCareerGoal];
    if (!recommendedCategory) return [];

    return courses
      .filter((c) => c.category === recommendedCategory && !enrolledCourseIds.includes(c.id))
      .slice(0, 3);
  };

  const filteredCourses = getFilteredCourses();
  const recommendedCourses = getRecommendedCourses();

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading courses...</p>
        </div>
      </main>
    );
  }

  return (
    <div>
      <main className="flex-1 flex bg-slate-50 min-w-0">
        <SideBar />
        <section className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Browse Courses</h1>
              <p className="text-slate-600 mt-1">
                Discover courses to advance your skills
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fa-solid fa-sparkles text-indigo-600"></i>
                  <h2 className="text-xl font-bold text-slate-900">
                    Recommended For You
                  </h2>
                </div>
                <p className="text-slate-600 mb-6">
                  Based on your career goal and learning path
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/course/${course.id}`)}
                    >
                      <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                        {course.imageUrl ? (
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <i className="fa-solid fa-book text-white text-4xl"></i>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-indigo-600">
                          ${course.price}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <i className="fa-solid fa-star text-yellow-500"></i>
                          {course.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === category.id
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Difficulty Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedLevel === level.id
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {filteredCourses.map((course) => {
                  const isEnrolled = enrolledCourseIds.includes(course.id);
                  const isEnrolling = enrollingCourseId === course.id;

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Course Image */}
                      <div
                        className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative cursor-pointer"
                        onClick={() => router.push(`/course/${course.id}`)}
                      >
                        {course.imageUrl ? (
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="fa-solid fa-book text-white text-6xl opacity-50"></i>
                          </div>
                        )}
                        {isEnrolled && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ✓ Enrolled
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                            {course.category}
                          </span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded capitalize">
                            {course.level}
                          </span>
                        </div>

                        <h3
                          className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600"
                          onClick={() => router.push(`/course/${course.id}`)}
                        >
                          {course.title}
                        </h3>

                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-star text-yellow-500"></i>
                            <span className="font-medium">{course.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-users"></i>
                            <span>{course.studentsEnrolled.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fa-solid fa-book-open"></i>
                            <span>{course.totalModules} modules</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-slate-900">
                            ${course.price}
                          </span>
                          {isEnrolled ? (
                            <button
                              onClick={() => router.push("/mylearning")}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                              Go to Course
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnroll(course.id)}
                              disabled={isEnrolling}
                              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isEnrolling ? "Enrolling..." : "Enroll Now"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-search text-slate-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No courses found
                </h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedLevel("all");
                    setSearchQuery("");
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}