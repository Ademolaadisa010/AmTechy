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
  onSnapshot,
} from "firebase/firestore";
import BottomBar from "../bottom-bar/page";

interface Certificate {
  id: string;
  courseTitle: string;
  courseName: string;
  completionDate: Date;
  certificateNumber: string;
  instructor: string;
  category: string;
  skills: string[];
  issueDate: Date;
  credentialUrl?: string;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  completionPercentage: number;
  lastAccessed: Date;
  status: "in-progress" | "completed" | "not-started";
}

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  isPremium: boolean;
  subscriptionStatus?: string;
}

export default function Certificates() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseProgress | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const WHATSAPP_NUMBER = "2349058704410";
  const WHATSAPP_MESSAGE_TEMPLATE = (name: string, courseName: string, percentage: number) => 
    `Hello! I have completed ${percentage}% of the ${courseName} course and would like to request my certificate. My name is ${name}.`;

  const categories = [
    { id: "all", label: "All Certificates" },
    { id: "frontend", label: "Frontend Development" },
    { id: "backend", label: "Backend Development" },
    { id: "data-science", label: "Data Science" },
    { id: "design", label: "Design" },
    { id: "mobile", label: "Mobile Development" },
  ];

  // ✅ FIXED: Use real-time listener for user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        // ✅ Use onSnapshot for real-time updates
        const userDocRef = doc(db, "users", currentUser.uid);
        
        const unsubscribeUser = onSnapshot(userDocRef, async (userDocSnap) => {
          if (!userDocSnap.exists()) {
            console.warn("User document not found");
            setLoading(false);
            return;
          }

          const userData = userDocSnap.data();

          // ✅ Check multiple field names for backward compatibility
          const isPremium = userData?.isPremium === true || userData?.plan === "premium";
          const subscriptionStatus = userData?.subscriptionStatus || (isPremium ? "active" : "inactive");

          setUser({
            uid: currentUser.uid,
            displayName: userData?.fullName || userData?.displayName || currentUser.displayName || "User",
            email: currentUser.email || "",
            isPremium: isPremium,
            subscriptionStatus: subscriptionStatus,
          });

          // ✅ Always try to fetch data - let data layer handle filtering
          if (isPremium) {
            await Promise.all([
              fetchCertificates(currentUser.uid),
              fetchCourseProgress(currentUser.uid),
            ]);
          }

          setLoading(false);
        });

        return () => unsubscribeUser();
      } catch (error) {
        console.error("Error setting up user listener:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

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
        courseName: doc.data().courseName || "",
        completionDate: doc.data().completionDate?.toDate?.() || new Date(),
        certificateNumber: doc.data().certificateNumber || "",
        instructor: doc.data().instructor || "Instructor",
        category: doc.data().category || "General",
        skills: doc.data().skills || [],
        issueDate: doc.data().issueDate?.toDate?.() || new Date(),
        credentialUrl: doc.data().credentialUrl,
      }));

      if (certificatesData.length === 0) {
        const mockCertificates: Certificate[] = [
          {
            id: "1",
            courseTitle: "Advanced React Development",
            courseName: "Complete React Masterclass",
            completionDate: new Date(2024, 0, 15),
            certificateNumber: "CERT-2024-001-RCT",
            instructor: "AmTechy Admin",
            category: "frontend",
            skills: ["React", "Hooks", "Redux", "TypeScript"],
            issueDate: new Date(2024, 0, 15),
          },
        ];
        setCertificates(mockCertificates);
      } else {
        setCertificates(certificatesData);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const fetchCourseProgress = async (userId: string) => {
    try {
      const progressQuery = query(
        collection(db, "progress"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(progressQuery);

      const progressData: CourseProgress[] = snapshot.docs.map((doc) => {
        const progress = doc.data().progress || 0;
        return {
          courseId: doc.data().courseId || "",
          courseName: doc.data().courseName || "Unknown Course",
          completionPercentage: progress,
          lastAccessed: doc.data().lastAccessed?.toDate?.() || new Date(),
          status: progress === 100 ? "completed" : "in-progress",
        };
      });

      if (progressData.length === 0) {
        const mockProgress: CourseProgress[] = [
          {
            courseId: "1",
            courseName: "Complete React Masterclass",
            completionPercentage: 100,
            lastAccessed: new Date(),
            status: "completed",
          },
          {
            courseId: "2",
            courseName: "Advanced TypeScript",
            completionPercentage: 65,
            lastAccessed: new Date(),
            status: "in-progress",
          },
          {
            courseId: "3",
            courseName: "Next.js 14 Mastery",
            completionPercentage: 45,
            lastAccessed: new Date(),
            status: "in-progress",
          },
        ];
        setCourseProgress(mockProgress);
      } else {
        setCourseProgress(progressData);
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  };

  const handleRequestCertificate = (course: CourseProgress) => {
    if (course.completionPercentage < 100) {
      alert(`You must complete 100% of the course. You are currently at ${course.completionPercentage}% completion.`);
      return;
    }

    setSelectedCourse(course);
    setShowRequestModal(true);
  };

  const sendWhatsAppMessage = (course: CourseProgress) => {
    const message = WHATSAPP_MESSAGE_TEMPLATE(user?.displayName || "User", course.courseName, course.completionPercentage);
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, "_blank");
    setShowRequestModal(false);
  };

  const filteredCertificates = filterCategory === "all"
    ? certificates
    : certificates.filter((cert) => cert.category === filterCategory);

  // ✅ PREMIUM MODAL COMPONENT
  const PremiumModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
        >
          <i className="fa-solid fa-xmark text-slate-600"></i>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-crown text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium Only</h2>
          <p className="text-slate-600">Certificates are an exclusive Premium feature</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-indigo-100">
          <div className="space-y-3">
            {[
              "View all certificates",
              "Track course progress",
              "Request certificates",
              "Download & share certificates",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-white text-sm"></i>
                </div>
                <span className="text-sm font-medium text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push("/pricing")}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all mb-3"
        >
          Upgrade to Premium
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  // ✅ CERTIFICATE REQUEST MODAL COMPONENT
  const CertificateRequestModal = ({ course }: { course: CourseProgress }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <button
          onClick={() => setShowRequestModal(false)}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
        >
          <i className="fa-solid fa-xmark text-slate-600"></i>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-certificate text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Certificate</h2>
          <p className="text-slate-600">You've completed {course.completionPercentage}% of {course.courseName}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-green-600 text-xl"></i>
            <div>
              <p className="font-semibold text-green-900">Ready for Certificate</p>
              <p className="text-sm text-green-700">You have completed all course requirements</p>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Your Name:</span>
            <span className="text-sm text-slate-900 font-semibold">{user?.displayName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Course:</span>
            <span className="text-sm text-slate-900 font-semibold">{course.courseName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Completion:</span>
            <span className="text-sm text-green-600 font-semibold">100%</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 text-center">
          Click the button below to contact us via WhatsApp and request your certificate. Our team will review and process your request.
        </p>

        <button
          onClick={() => sendWhatsAppMessage(course)}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-brands fa-whatsapp text-xl"></i>
          Request via WhatsApp
        </button>
      </div>
    </div>
  );

  // ✅ CERTIFICATE PREVIEW MODAL
  const CertificatePreview = ({ certificate }: { certificate: Certificate }) => (
    <div className="bg-white rounded-lg shadow-2xl p-12 max-w-4xl w-full relative">
      <button
        onClick={() => setShowPreview(false)}
        className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
      >
        <i className="fa-solid fa-xmark text-slate-600"></i>
      </button>

      <div className="border-8 border-double border-indigo-600 p-8 relative">
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-indigo-600"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-indigo-600"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-indigo-600"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-indigo-600"></div>

        <div className="text-center">
          <div className="mb-6">
            <i className="fa-solid fa-award text-indigo-600 text-6xl"></i>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-2">Certificate of Completion</h1>
          <p className="text-slate-600 mb-8">This is to certify that</p>
          
          <h2 className="text-4xl font-bold text-indigo-600 mb-8">{user?.displayName}</h2>
          
          <p className="text-slate-600 mb-4">has successfully completed the course</p>
          <h3 className="text-3xl font-bold text-slate-900 mb-8">{certificate.courseTitle}</h3>
          
          <div className="grid grid-cols-3 gap-8 mb-8 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Instructor</p>
              <p className="font-semibold text-slate-900">{certificate.instructor}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Completion Date</p>
              <p className="font-semibold text-slate-900">
                {certificate.completionDate.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Certificate ID</p>
              <p className="font-semibold text-slate-900">{certificate.certificateNumber}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            {certificate.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Verify this certificate at: learnskill.com/verify/{certificate.certificateNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  // ✅ NOT PREMIUM - SHOW PAYWALL
  if (!user || !user.isPremium) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0">
        <SideBar />
        <section className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <PremiumModal />
          </div>
        </section>
      </main>
    );
  }

  // ✅ PREMIUM USER - SHOW CERTIFICATES
  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      
      <section className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
              <p className="text-slate-600 mt-1">View and request certificates for completed courses</p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-crown text-yellow-300"></i>
              Premium
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-certificate text-2xl"></i>
                </div>
                <span className="text-3xl font-bold">{certificates.length}</span>
              </div>
              <p className="text-sm opacity-90">Earned Certificates</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-2xl"></i>
                </div>
                <span className="text-3xl font-bold">
                  {courseProgress.filter(c => c.completionPercentage === 100).length}
                </span>
              </div>
              <p className="text-sm opacity-90">Courses Completed</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-book-open text-2xl"></i>
                </div>
                <span className="text-3xl font-bold">{courseProgress.length}</span>
              </div>
              <p className="text-sm opacity-90">Enrolled Courses</p>
            </div>
          </div>

          {/* Course Progress Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Course Progress</h2>
            <div className="space-y-3">
              {courseProgress.map((course) => (
                <div key={course.courseId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{course.courseName}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Last accessed: {course.lastAccessed.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${
                        course.completionPercentage === 100 ? "text-green-600" : "text-indigo-600"
                      }`}>
                        {course.completionPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        course.completionPercentage === 100
                          ? "bg-gradient-to-r from-green-500 to-emerald-600"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600"
                      }`}
                      style={{ width: `${course.completionPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      {course.completionPercentage === 100 ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <i className="fa-solid fa-check-circle"></i>
                          Completed
                        </span>
                      ) : (
                        `${100 - course.completionPercentage}% remaining`
                      )}
                    </span>
                    {course.completionPercentage === 100 && (
                      <button
                        onClick={() => handleRequestCertificate(course)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <i className="fa-brands fa-whatsapp"></i>
                        Request Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earned Certificates Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Earned Certificates</h2>
            
            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-sm font-semibold text-slate-700 mr-2">Filter:</span>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilterCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      filterCategory === category.id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Certificates Grid */}
            {filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedCertificate(certificate);
                      setShowPreview(true);
                    }}
                  >
                    {/* Certificate Preview */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                      <div className="relative z-10">
                        <i className="fa-solid fa-award text-white text-4xl mb-4"></i>
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                          {certificate.courseTitle}
                        </h3>
                        <p className="text-white text-sm opacity-90">
                          {certificate.completionDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                          {certificate.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          ID: {certificate.certificateNumber}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {certificate.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {certificate.skills.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                            +{certificate.skills.length - 3}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertificate(certificate);
                          setShowPreview(true);
                        }}
                        className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <i className="fa-solid fa-eye mr-2"></i>
                        View Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-certificate text-slate-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Certificates Yet</h3>
                <p className="text-slate-600 mb-6">
                  Complete a course to earn your first certificate!
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

          {/* Info Banner */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-circle-info text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">How Certificate Requests Work</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Once you complete 100% of a course, click "Request Certificate" to contact us via WhatsApp. 
                  Our team will verify your completion and send your certificate within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
        <BottomBar />
      </section>

      {showPreview && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <CertificatePreview certificate={selectedCertificate} />
        </div>
      )}

      {showRequestModal && selectedCourse && (
        <CertificateRequestModal course={selectedCourse} />
      )}
    </main>
  );
}