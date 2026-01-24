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

export default function Certificates() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Certificates" },
    { id: "frontend", label: "Frontend Development" },
    { id: "backend", label: "Backend Development" },
    { id: "data-science", label: "Data Science" },
    { id: "design", label: "Design" },
    { id: "mobile", label: "Mobile Development" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUser({
          uid: currentUser.uid,
          displayName: userDoc.data()?.name || currentUser.displayName || "User",
          email: currentUser.email,
        });
        await fetchCertificates(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
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
        completionDate: doc.data().completionDate?.toDate() || new Date(),
        certificateNumber: doc.data().certificateNumber || "",
        instructor: doc.data().instructor || "Instructor",
        category: doc.data().category || "General",
        skills: doc.data().skills || [],
        issueDate: doc.data().issueDate?.toDate() || new Date(),
        credentialUrl: doc.data().credentialUrl,
      }));

      // Add mock certificates if none exist
      if (certificatesData.length === 0) {
        const mockCertificates: Certificate[] = [
          {
            id: "1",
            courseTitle: "Advanced React Development",
            courseName: "Complete React Masterclass",
            completionDate: new Date(2024, 0, 15),
            certificateNumber: "CERT-2024-001-RCT",
            instructor: "Sarah Johnson",
            category: "frontend",
            skills: ["React", "Hooks", "Redux", "TypeScript"],
            issueDate: new Date(2024, 0, 15),
          },
          {
            id: "2",
            courseTitle: "Python for Data Science",
            courseName: "Data Science Bootcamp",
            completionDate: new Date(2024, 1, 20),
            certificateNumber: "CERT-2024-002-PDS",
            instructor: "Michael Chen",
            category: "data-science",
            skills: ["Python", "Pandas", "NumPy", "Machine Learning"],
            issueDate: new Date(2024, 1, 20),
          },
          {
            id: "3",
            courseTitle: "UI/UX Design Fundamentals",
            courseName: "Complete Design Course",
            completionDate: new Date(2024, 2, 10),
            certificateNumber: "CERT-2024-003-UIX",
            instructor: "Emily Rodriguez",
            category: "design",
            skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
            issueDate: new Date(2024, 2, 10),
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

  const filteredCertificates = filterCategory === "all"
    ? certificates
    : certificates.filter((cert) => cert.category === filterCategory);

  const handleDownload = (certificate: Certificate) => {
    // In production, this would generate a PDF
    alert(`Downloading certificate: ${certificate.courseTitle}`);
  };

  const handleShare = (certificate: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `${certificate.courseTitle} Certificate`,
        text: `I just completed ${certificate.courseTitle}!`,
        url: window.location.href,
      });
    } else {
      alert("Share functionality not supported on this device");
    }
  };

  const CertificatePreview = ({ certificate }: { certificate: Certificate }) => (
    <div className="bg-white rounded-lg shadow-2xl p-12 max-w-4xl w-full relative">
      <button
        onClick={() => setShowPreview(false)}
        className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
      >
        <i className="fa-solid fa-xmark text-slate-600"></i>
      </button>

      {/* Certificate Design */}
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

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => handleDownload(certificate)}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <i className="fa-solid fa-download mr-2"></i>
          Download PDF
        </button>
        <button
          onClick={() => handleShare(certificate)}
          className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          <i className="fa-solid fa-share-nodes mr-2"></i>
          Share
        </button>
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

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      
      <section className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
            <p className="text-slate-600 mt-1">View and share your course completion certificates</p>
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
              <p className="text-sm opacity-90">Total Certificates</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-check-circle text-2xl"></i>
                </div>
                <span className="text-3xl font-bold">{certificates.length}</span>
              </div>
              <p className="text-sm opacity-90">Courses Completed</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-award text-2xl"></i>
                </div>
                <span className="text-3xl font-bold">
                  {new Set(certificates.map(c => c.category)).size}
                </span>
              </div>
              <p className="text-sm opacity-90">Skill Categories</p>
            </div>
          </div>

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

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(certificate);
                        }}
                        className="flex-1 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <i className="fa-solid fa-download mr-2"></i>
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(certificate);
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <i className="fa-solid fa-share-nodes"></i>
                      </button>
                    </div>
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
                Complete courses to earn certificates and showcase your skills
              </p>
              <button
                onClick={() => router.push("/courses")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          )}

          {/* Verification Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-shield-check text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Verify Certificates</h3>
                <p className="text-sm text-slate-700 mb-3">
                  All certificates can be verified using their unique certificate ID. Share your
                  certificate with confidence knowing that employers can verify its authenticity.
                </p>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Learn more about certificate verification →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Preview Modal */}
      {showPreview && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <CertificatePreview certificate={selectedCertificate} />
        </div>
      )}
    </main>
  );
}