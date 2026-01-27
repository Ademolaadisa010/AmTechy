"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

interface Application {
  status: "pending" | "under_review" | "approved" | "rejected";
  submittedAt: any;
  reviewedAt?: any;
  rejectionReason?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  professionalBackground: {
    jobTitle: string;
    company: string;
    yearsExperience: number;
  };
  expertise: {
    primarySkills: string[];
    teachingSubjects: string[];
  };
}

export default function ApplicationStatus() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Real-time listener for application status
        const applicationRef = doc(db, "tutor_applications", currentUser.uid);
        const unsubscribeSnapshot = onSnapshot(applicationRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            setApplication(docSnapshot.data() as Application);
            setLoading(false);
          } else {
            // No application found, redirect to apply page
            router.push("/tutor/apply");
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getStatusInfo = () => {
    switch (application?.status) {
      case "pending":
        return {
          icon: "fa-clock",
          color: "yellow",
          title: "Application Submitted",
          description: "Your application is in the queue and will be reviewed soon.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-600",
          iconBg: "bg-yellow-100",
        };
      case "under_review":
        return {
          icon: "fa-magnifying-glass",
          color: "blue",
          title: "Under Review",
          description: "Our team is currently reviewing your application.",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-600",
          iconBg: "bg-blue-100",
        };
      case "approved":
        return {
          icon: "fa-check-circle",
          color: "green",
          title: "Application Approved! 🎉",
          description: "Congratulations! You've been approved to become a tutor.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-600",
          iconBg: "bg-green-100",
        };
      case "rejected":
        return {
          icon: "fa-times-circle",
          color: "red",
          title: "Application Not Approved",
          description: "Unfortunately, your application was not approved at this time.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-600",
          iconBg: "bg-red-100",
        };
      default:
        return {
          icon: "fa-hourglass",
          color: "gray",
          title: "Processing",
          description: "We're processing your application.",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          textColor: "text-slate-600",
          iconBg: "bg-slate-100",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const timeline = [
    {
      step: 1,
      title: "Application Submitted",
      description: "You submitted your tutor application",
      completed: true,
      date: application?.submittedAt?.toDate().toLocaleDateString(),
    },
    {
      step: 2,
      title: "Initial Review",
      description: "Our team reviews your credentials",
      completed: ["under_review", "approved", "rejected"].includes(application?.status || ""),
      date: null,
    },
    {
      step: 3,
      title: "Background Verification",
      description: "Verifying your documents and background",
      completed: ["approved"].includes(application?.status || ""),
      date: null,
    },
    {
      step: 4,
      title: "Final Decision",
      description: application?.status === "approved" ? "Application approved!" : application?.status === "rejected" ? "Application not approved" : "Awaiting final decision",
      completed: ["approved", "rejected"].includes(application?.status || ""),
      date: application?.reviewedAt?.toDate().toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Application Status</h1>
          <p className="text-lg text-slate-600">Track your tutor application progress</p>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-2xl p-8 mb-8`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-24 h-24 ${statusInfo.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className={`fa-solid ${statusInfo.icon} ${statusInfo.textColor} text-4xl`}></i>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-3xl font-bold ${statusInfo.textColor} mb-2`}>
                {statusInfo.title}
              </h2>
              <p className="text-slate-700 text-lg mb-4">{statusInfo.description}</p>
              {application?.status === "approved" && (
                <button
                  onClick={() => router.push("/tutor/profile-setup")}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
                >
                  Complete Your Profile
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              )}
              {application?.status === "rejected" && (
                <button
                  onClick={() => router.push("/tutor/apply")}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Apply Again
                </button>
              )}
            </div>
          </div>

          {application?.status === "rejected" && application?.rejectionReason && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-red-200">
              <h3 className="font-semibold text-slate-900 mb-2">Reason for Rejection:</h3>
              <p className="text-slate-700">{application.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Application Timeline</h2>
          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.completed
                        ? "bg-green-100 border-2 border-green-600"
                        : "bg-slate-100 border-2 border-slate-300"
                    }`}
                  >
                    {item.completed ? (
                      <i className="fa-solid fa-check text-green-600 text-xl"></i>
                    ) : (
                      <span className="text-slate-500 font-bold">{item.step}</span>
                    )}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div
                      className={`w-0.5 h-16 ${
                        item.completed ? "bg-green-600" : "bg-slate-300"
                      }`}
                    ></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3
                    className={`font-bold text-lg ${
                      item.completed ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                  {item.date && (
                    <p className="text-xs text-slate-500 mt-2">
                      <i className="fa-solid fa-calendar mr-1"></i>
                      {item.date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Application Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Name:</span>
                  <span className="font-medium text-slate-900">
                    {application?.personalInfo.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-900">
                    {application?.personalInfo.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Location:</span>
                  <span className="font-medium text-slate-900">
                    {application?.personalInfo.location}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Professional Background</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Title:</span>
                  <span className="font-medium text-slate-900">
                    {application?.professionalBackground.jobTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Company:</span>
                  <span className="font-medium text-slate-900">
                    {application?.professionalBackground.company}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Experience:</span>
                  <span className="font-medium text-slate-900">
                    {application?.professionalBackground.yearsExperience}+ years
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-slate-700 mb-3">Skills & Subjects</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-600 mb-2">Primary Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {application?.expertise.primarySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-2">Teaching Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {application?.expertise.teachingSubjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        {application?.status === "pending" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-lightbulb text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-blue-600 mt-1"></i>
                    <span>
                      Our team will review your application within <strong>3-5 business days</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-blue-600 mt-1"></i>
                    <span>
                      You'll receive an email notification when your status changes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-blue-600 mt-1"></i>
                    <span>
                      We may contact you for additional information or documents
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-blue-600 mt-1"></i>
                    <span>
                      If approved, you'll complete your tutor profile and start teaching
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {application?.status === "under_review" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-info-circle text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Your application is being reviewed</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Our team is carefully reviewing your credentials, experience, and qualifications.
                  This process typically takes 1-3 business days.
                </p>
                <p className="text-sm text-slate-700">
                  We'll notify you via email as soon as a decision is made. Thank you for your
                  patience!
                </p>
              </div>
            </div>
          </div>
        )}

        {application?.status === "approved" && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-rocket text-green-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Ready to start teaching!</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Complete your tutor profile to start accepting students. You'll be able to:
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>✓ Set your hourly rate and availability</li>
                  <li>✓ Create your teaching portfolio</li>
                  <li>✓ Upload an introduction video</li>
                  <li>✓ Start accepting bookings from students</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => router.push("/tutor/dashboard")}
            className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            <i className="fa-solid fa-home mr-2"></i>
            Back to Dashboard
          </button>
          {application?.status !== "approved" && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <i className="fa-solid fa-refresh mr-2"></i>
              Refresh Status
            </button>
          )}
        </div>
      </div>
    </main>
  );
}