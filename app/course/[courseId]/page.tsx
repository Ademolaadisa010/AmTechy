"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import SideBar from "@/app/sidebar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

interface CourseData {
  title: string;
  description: string;
  category: string;
  tutorId: string;
  tutorName: string;
  price: number;
  rating: number;
  studentsEnrolled: number;
  totalModules: number;
  imageUrl?: string;
  level: string;
}

interface Enrollment {
  id: string;
  progress: number;
  currentModule: number;
  status: string;
}

export default function CourseDetail() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchCourseData();
        await checkEnrollment(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [courseId, router]);

  const fetchCourseData = async () => {
    try {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (courseDoc.exists()) {
        const data = courseDoc.data();
        setCourse({
          title: data.title || "Untitled Course",
          description: data.description || "",
          category: data.category || "General",
          tutorId: data.tutorId || "",
          tutorName: data.tutorName || "Unknown Tutor",
          price: data.price || 0,
          rating: data.rating || 4.5,
          studentsEnrolled: data.studentsEnrolled || 0,
          totalModules: data.totalModules || 10,
          imageUrl: data.imageUrl,
          level: data.level || "beginner",
        });
      } else {
        alert("Course not found");
        router.push("/courses");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const checkEnrollment = async (userId: string) => {
    try {
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("learnerId", "==", userId),
        where("courseId", "==", courseId)
      );
      const snapshot = await getDocs(enrollmentsQuery);

      if (!snapshot.empty) {
        const enrollDoc = snapshot.docs[0];
        setEnrollment({
          id: enrollDoc.id,
          progress: enrollDoc.data().progress || 0,
          currentModule: enrollDoc.data().currentModule || 1,
          status: enrollDoc.data().status || "active",
        });
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const handleStartCourse = async () => {
    if (!enrollment || !course) return;

    try {
      // Update last accessed
      await updateDoc(doc(db, "enrollments", enrollment.id), {
        lastAccessed: new Date(),
      });

      // Navigate to first lesson
      router.push(`/course/${courseId}/lesson/${enrollment.currentModule}`);
    } catch (error) {
      console.error("Error starting course:", error);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading course...</p>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Course not found</p>
        </div>
      </main>
    );
  }

  return (
    <div>
      <main className="flex-1 flex bg-slate-50 min-w-0">
        <SideBar />
        <section className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white">
            <div className="max-w-6xl mx-auto px-6 py-12">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-indigo-200 hover:text-white mb-6 transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Course Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full capitalize">
                      {course.level}
                    </span>
                  </div>

                  <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                  <p className="text-xl text-indigo-100 mb-6">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-star text-yellow-400"></i>
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-indigo-200">rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-users"></i>
                      <span className="font-medium">
                        {course.studentsEnrolled.toLocaleString()}
                      </span>
                      <span className="text-indigo-200">students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-book-open"></i>
                      <span className="font-medium">{course.totalModules}</span>
                      <span className="text-indigo-200">modules</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl font-bold">
                      {course.tutorName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-indigo-200">Instructor</p>
                      <p className="font-semibold">{course.tutorName}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Enrollment Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-6">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center">
                        <i className="fa-solid fa-book text-white text-6xl opacity-50"></i>
                      </div>
                    )}

                    {isEnrolled ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-700 mb-2">
                            <i className="fa-solid fa-check-circle"></i>
                            <span className="font-semibold">You're enrolled!</span>
                          </div>
                          <p className="text-sm text-green-600">
                            Continue from Module {enrollment?.currentModule}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Your Progress</span>
                            <span className="font-semibold">
                              {enrollment?.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3">
                            <div
                              className="bg-indigo-600 h-3 rounded-full transition-all"
                              style={{ width: `${enrollment?.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <button
                          onClick={handleStartCourse}
                          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          {enrollment?.progress === 0
                            ? "Start Learning"
                            : "Continue Learning"}
                        </button>

                        <button
                          onClick={() => router.push("/mylearning")}
                          className="w-full py-3 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                          Go to My Learning
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-6">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            ${course.price}
                          </div>
                          <p className="text-sm text-slate-600">One-time payment</p>
                        </div>

                        <button
                          onClick={() => router.push("/courses")}
                          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          Enroll Now
                        </button>

                        <p className="text-xs text-center text-slate-500">
                          30-day money-back guarantee
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* What You'll Learn */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    What You'll Learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Master core concepts and fundamentals",
                      "Build real-world projects from scratch",
                      "Learn industry best practices",
                      "Get hands-on coding experience",
                      "Understand advanced techniques",
                      "Prepare for professional work",
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <i className="fa-solid fa-check text-green-600 mt-1"></i>
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Curriculum */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Course Curriculum
                  </h2>
                  <div className="space-y-3">
                    {Array.from({ length: course.totalModules }, (_, i) => i + 1).map(
                      (moduleNum) => (
                        <div
                          key={moduleNum}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                              {moduleNum}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                Module {moduleNum}
                              </h3>
                              <p className="text-sm text-slate-600">
                                Essential concepts and practice
                              </p>
                            </div>
                          </div>
                          {isEnrolled && enrollment && moduleNum <= enrollment.currentModule ? (
                            <i className="fa-solid fa-play text-indigo-600"></i>
                          ) : (
                            <i className="fa-solid fa-lock text-slate-400"></i>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Requirements
                  </h2>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Basic computer skills and internet access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Willingness to learn and practice regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        No prior experience required - we'll teach you everything!
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Features */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">
                    Course Features
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-video text-indigo-600"></i>
                      <div>
                        <p className="font-medium text-slate-900">
                          Video Lessons
                        </p>
                        <p className="text-sm text-slate-600">
                          {course.totalModules}+ hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-code text-indigo-600"></i>
                      <div>
                        <p className="font-medium text-slate-900">
                          Coding Exercises
                        </p>
                        <p className="text-sm text-slate-600">Hands-on practice</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-certificate text-indigo-600"></i>
                      <div>
                        <p className="font-medium text-slate-900">Certificate</p>
                        <p className="text-sm text-slate-600">
                          Upon completion
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-infinity text-indigo-600"></i>
                      <div>
                        <p className="font-medium text-slate-900">
                          Lifetime Access
                        </p>
                        <p className="text-sm text-slate-600">Learn at your pace</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Share Course</h3>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      <i className="fa-brands fa-twitter"></i>
                    </button>
                    <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      <i className="fa-brands fa-facebook"></i>
                    </button>
                    <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                      <i className="fa-brands fa-linkedin"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}