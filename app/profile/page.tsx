"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

interface Course {
  id: string;
  title: string;
  progress: number;
  thumbnail?: string;
}

interface Certificate {
  id: string;
  courseTitle: string;
  completionDate: Date;
}

interface Skill {
  name: string;
  level: number;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
        await fetchUserCourses(currentUser.uid);
        await fetchCertificates(currentUser.uid);
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
        setUserData(data);
        setSkills(data.skills || [
          { name: "React", level: 3 },
          { name: "JavaScript", level: 4 },
          { name: "Python", level: 2 },
          { name: "UI/UX Design", level: 3 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserCourses = async (userId: string) => {
    try {
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("learnerId", "==", userId)
      );
      const snapshot = await getDocs(enrollmentsQuery);

      const coursesData: Course[] = [];
      for (const enrollDoc of snapshot.docs) {
        const enrollment = enrollDoc.data();
        const courseDoc = await getDoc(doc(db, "courses", enrollment.courseId));
        
        if (courseDoc.exists()) {
          coursesData.push({
            id: courseDoc.id,
            title: courseDoc.data().title || "",
            progress: enrollment.progress || 0,
            thumbnail: courseDoc.data().thumbnail,
          });
        }
      }

      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchCertificates = async (userId: string) => {
    try {
      const certificatesQuery = query(
        collection(db, "certificates"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(certificatesQuery);

      const certificatesData: Certificate[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        courseTitle: doc.data().courseTitle || "",
        completionDate: doc.data().completionDate?.toDate() || new Date(),
      }));

      setCertificates(certificatesData);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const stats = {
    coursesEnrolled: courses.length,
    coursesCompleted: courses.filter(c => c.progress === 100).length,
    certificatesEarned: certificates.length,
    learningStreak: 7,
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
      
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Cover Image */}
          <div className="relative h-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-4 right-4">
              <button className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all border border-white border-opacity-30">
                <i className="fa-solid fa-camera mr-2"></i>
                Change Cover
              </button>
            </div>
          </div>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 -mt-20 relative z-10 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || user?.displayName || "User")}&background=6366f1&color=fff&size=128`}
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg">
                  <i className="fa-solid fa-camera"></i>
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">
                      {userData?.name || user?.displayName || "User"}
                    </h1>
                    <p className="text-slate-600 mb-2">{userData?.bio || "Learning enthusiast"}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      {userData?.location && (
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-location-dot"></i>
                          {userData.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-calendar"></i>
                        Joined {new Date(user?.metadata?.creationTime || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                      {userData?.website && (
                        <a href={userData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                          <i className="fa-solid fa-link"></i>
                          Website
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    <button
                      onClick={() => router.push("/settings")}
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                      <i className="fa-solid fa-share-nodes"></i>
                    </button>
                  </div>
                </div>

                {/* Social Links */}
                {(userData?.github || userData?.linkedin || userData?.twitter) && (
                  <div className="flex gap-3">
                    {userData?.github && (
                      <a href={`https://github.com/${userData.github}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <i className="fa-brands fa-github text-slate-700"></i>
                      </a>
                    )}
                    {userData?.linkedin && (
                      <a href={userData.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <i className="fa-brands fa-linkedin text-slate-700"></i>
                      </a>
                    )}
                    {userData?.twitter && (
                      <a href={`https://twitter.com/${userData.twitter}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <i className="fa-brands fa-twitter text-slate-700"></i>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.coursesEnrolled}</div>
              <div className="text-sm text-slate-600">Courses Enrolled</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.coursesCompleted}</div>
              <div className="text-sm text-slate-600">Courses Completed</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.certificatesEarned}</div>
              <div className="text-sm text-slate-600">Certificates</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{stats.learningStreak}</div>
              <div className="text-sm text-slate-600">Day Streak</div>
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
                onClick={() => setActiveTab("certificates")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "certificates" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Certificates
                {activeTab === "certificates" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "activity" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Activity
                {activeTab === "activity" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
                  <p className="text-slate-700 leading-relaxed">
                    {userData?.bio || "This user hasn't added a bio yet."}
                  </p>
                </div>

                {/* Current Learning */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Currently Learning</h2>
                  {courses.filter(c => c.progress < 100).slice(0, 3).length > 0 ? (
                    <div className="space-y-4">
                      {courses.filter(c => c.progress < 100).slice(0, 3).map((course) => (
                        <div key={course.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                            <i className="fa-solid fa-book"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{course.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-slate-700">{course.progress}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600 text-center py-8">No courses in progress</p>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-check-circle text-green-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Completed a course</p>
                        <p className="text-xs text-slate-500">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-book-open text-blue-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Started a new lesson</p>
                        <p className="text-xs text-slate-500">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-trophy text-yellow-600"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Earned a certificate</p>
                        <p className="text-xs text-slate-500">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Skills</h2>
                  <div className="space-y-3">
                    {skills.map((skill, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                          <span className="text-xs text-slate-500">Level {skill.level}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(skill.level / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Achievements</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <i className="fa-solid fa-trophy text-yellow-600 text-2xl"></i>
                      </div>
                      <p className="text-xs text-slate-600">First Course</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <i className="fa-solid fa-fire text-green-600 text-2xl"></i>
                      </div>
                      <p className="text-xs text-slate-600">7 Day Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <i className="fa-solid fa-star text-purple-600 text-2xl"></i>
                      </div>
                      <p className="text-xs text-slate-600">Top Learner</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl">
                      <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 mb-3">{course.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{course.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-book text-slate-400 text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Courses Yet</h3>
                  <p className="text-slate-600 mb-6">Start learning by enrolling in a course</p>
                  <button
                    onClick={() => router.push("/courses")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === "certificates" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
                      <i className="fa-solid fa-award text-4xl mb-3"></i>
                      <h3 className="font-bold text-lg">{cert.courseTitle}</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-600">Completed on {cert.completionDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-certificate text-slate-400 text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Certificates Yet</h3>
                  <p className="text-slate-600">Complete courses to earn certificates</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Learning Activity</h2>
              <div className="space-y-4">
                {[...Array(5)].map((_, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-book-open text-indigo-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Completed lesson in Advanced React</p>
                      <p className="text-sm text-slate-600 mt-1">Finished "Understanding Hooks and State Management"</p>
                      <p className="text-xs text-slate-500 mt-2">{idx + 1} days ago</p>
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