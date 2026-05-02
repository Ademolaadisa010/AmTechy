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
  onSnapshot,
  getDoc,
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
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebug = (msg: string) => {
    console.log("[Certificates]", msg);
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const categories = [
    { id: "all", label: "All Certificates" },
    { id: "frontend", label: "Frontend" },
    { id: "backend", label: "Backend" },
    { id: "data-science", label: "Data Science" },
    { id: "design", label: "Design" },
    { id: "mobile", label: "Mobile" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push("/login"); return; }
      addDebug(`Auth OK — UID: ${currentUser.uid}`);
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, async (snap) => {
          if (!snap.exists()) { setLoading(false); return; }
          const data = snap.data();
          const isPremium = data?.isPremium === true || data?.plan === "premium";
          setUser({
            uid: currentUser.uid,
            displayName: data?.fullName || data?.displayName || currentUser.displayName || "User",
            email: currentUser.email || "",
            isPremium,
            subscriptionStatus: data?.subscriptionStatus || (isPremium ? "active" : "inactive"),
          });
          await fetchCertificates(currentUser.uid, data);
          setLoading(false);
        });
        return () => unsubscribeUser();
      } catch (e) {
        addDebug(`Setup error: ${e}`);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const mapCertificate = (id: string, data: Record<string, any>): Certificate => ({
    id,
    courseTitle: data.courseTitle || data.title || data.courseName || data.name || "Completed Course",
    courseName: data.courseName || data.courseTitle || data.title || "",
    completionDate:
      data.completionDate?.toDate?.() ||
      data.completedAt?.toDate?.() ||
      data.finishedAt?.toDate?.() ||
      data.updatedAt?.toDate?.() ||
      new Date(),
    certificateNumber:
      data.certificateNumber || data.certId || `CERT-${id.slice(0, 8).toUpperCase()}`,
    instructor: data.instructor || data.tutorName || "AmTechy Instructor",
    category: data.category || data.track || "General",
    skills: data.skills || data.tags || data.topics || [],
    issueDate: data.issueDate?.toDate?.() || data.completionDate?.toDate?.() || new Date(),
    credentialUrl: data.credentialUrl,
  });

  const fetchCertificates = async (userId: string, userData: Record<string, any>) => {
    addDebug("--- Starting certificate fetch ---");
    const found: Certificate[] = [];

    // ── 1. Check user doc for completedCourses / certificates arrays ──
    const arrayFields = ["completedCourses", "certificates", "earnedCertificates", "completedTracks"];
    for (const field of arrayFields) {
      const arr = userData?.[field];
      if (Array.isArray(arr) && arr.length > 0) {
        addDebug(`Found user.${field} array with ${arr.length} items`);
        for (const item of arr) {
          if (typeof item === "string") {
            // It's a course ID — look it up
            try {
              const cSnap = await getDoc(doc(db, "courses", item));
              if (cSnap.exists()) found.push(mapCertificate(cSnap.id, cSnap.data()));
            } catch {}
          } else if (typeof item === "object" && item !== null) {
            found.push(mapCertificate(item.id || item.courseId || `item-${found.length}`, item));
          }
        }
        if (found.length > 0) { addDebug(`Got ${found.length} from user.${field}`); setCertificates(found); return; }
      }
    }
    addDebug("No completedCourses/certificates arrays in user doc");

    // ── 2. certificates collection — userId field ──
    try {
      const snap = await getDocs(query(collection(db, "certificates"), where("userId", "==", userId)));
      addDebug(`certificates (userId): ${snap.size} docs`);
      snap.docs.forEach((d) => found.push(mapCertificate(d.id, d.data())));
    } catch (e) { addDebug(`certificates/userId error: ${e}`); }

    if (found.length > 0) { setCertificates(found); return; }

    // ── 3. certificates collection — uid field ──
    try {
      const snap = await getDocs(query(collection(db, "certificates"), where("uid", "==", userId)));
      addDebug(`certificates (uid): ${snap.size} docs`);
      snap.docs.forEach((d) => found.push(mapCertificate(d.id, d.data())));
    } catch (e) { addDebug(`certificates/uid error: ${e}`); }

    if (found.length > 0) { setCertificates(found); return; }

    // ── 4. courseProgress — completed:true ──
    // REQUIRES Firestore rule: allow read if resource.data.userId == request.auth.uid
    try {
      const snap = await getDocs(query(
        collection(db, "courseProgress"),
        where("userId", "==", userId),
        where("completed", "==", true)
      ));
      addDebug(`courseProgress (completed:true): ${snap.size} docs`);
      for (const d of snap.docs) {
        const data = d.data();
        let courseTitle = data.courseTitle || data.title || "";
        if (!courseTitle && data.courseId) {
          try {
            const cSnap = await getDoc(doc(db, "courses", data.courseId));
            if (cSnap.exists()) courseTitle = cSnap.data().title || "";
          } catch {}
        }
        found.push(mapCertificate(d.id, { ...data, courseTitle }));
      }
    } catch (e) { addDebug(`courseProgress error: ${e} ← FIX FIRESTORE RULES`); }

    if (found.length > 0) { setCertificates(found); return; }

    // ── 5. progress collection ──
    try {
      const snap = await getDocs(query(
        collection(db, "progress"),
        where("userId", "==", userId),
        where("completed", "==", true)
      ));
      addDebug(`progress (completed:true): ${snap.size} docs`);
      snap.docs.forEach((d) => found.push(mapCertificate(d.id, d.data())));
    } catch (e) { addDebug(`progress error: ${e}`); }

    if (found.length > 0) { setCertificates(found); return; }

    // ── 6. enrollments — status:completed ──
    try {
      const snap = await getDocs(query(
        collection(db, "enrollments"),
        where("userId", "==", userId),
        where("status", "==", "completed")
      ));
      addDebug(`enrollments (status:completed): ${snap.size} docs`);
      for (const d of snap.docs) {
        const data = d.data();
        let courseTitle = data.courseTitle || data.title || "";
        if (!courseTitle && data.courseId) {
          try {
            const cSnap = await getDoc(doc(db, "courses", data.courseId));
            if (cSnap.exists()) courseTitle = cSnap.data().title || "";
          } catch {}
        }
        found.push(mapCertificate(d.id, { ...data, courseTitle }));
      }
    } catch (e) { addDebug(`enrollments error: ${e}`); }

    if (found.length > 0) { setCertificates(found); return; }

    // ── 7. userCourses collection ──
    try {
      const snap = await getDocs(query(
        collection(db, "userCourses"),
        where("userId", "==", userId),
        where("completed", "==", true)
      ));
      addDebug(`userCourses (completed:true): ${snap.size} docs`);
      snap.docs.forEach((d) => found.push(mapCertificate(d.id, d.data())));
    } catch (e) { addDebug(`userCourses error: ${e}`); }

    if (found.length > 0) { setCertificates(found); return; }

    // ── 8. courses where completedBy array contains userId ──
    try {
      const snap = await getDocs(query(
        collection(db, "courses"),
        where("completedBy", "array-contains", userId)
      ));
      addDebug(`courses (completedBy): ${snap.size} docs`);
      snap.docs.forEach((d) => found.push(mapCertificate(d.id, d.data())));
    } catch (e) { addDebug(`courses/completedBy error: ${e}`); }

    addDebug(`--- Total found: ${found.length} ---`);
    if (found.length === 0) {
      addDebug("NEXT STEP: Open Firebase Console → Firestore → check which collection has your completed course data, then share the collection name");
    }
    setCertificates(found);
  };

  const downloadCertificate = (certificate: Certificate) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#4f46e5");
    grad.addColorStop(0.5, "#7c3aed");
    grad.addColorStop(1, "#06b6d4");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#e0e7ff";
    ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

    const headerGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGrad.addColorStop(0, "#4f46e5");
    headerGrad.addColorStop(1, "#7c3aed");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(40, 40, canvas.width - 80, 8);

    ctx.fillStyle = "#1e1b4b";
    ctx.font = "bold 62px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Certificate of Completion", canvas.width / 2, 175);
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(canvas.width / 2 - 200, 195, 400, 3);

    ctx.font = "italic 22px Georgia, serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("This is to certify that", canvas.width / 2, 260);

    ctx.font = "bold 58px Georgia, serif";
    ctx.fillStyle = "#4f46e5";
    ctx.fillText(user?.displayName || "Learner", canvas.width / 2, 345);

    ctx.font = "italic 22px Georgia, serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("has successfully completed the course", canvas.width / 2, 410);

    ctx.font = certificate.courseTitle.length > 45 ? "bold 32px Georgia, serif" : "bold 42px Georgia, serif";
    ctx.fillStyle = "#111827";
    ctx.fillText(certificate.courseTitle, canvas.width / 2, 490);

    ctx.font = "16px Arial, sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "left";
    ctx.fillText("INSTRUCTOR", 180, 590);
    ctx.textAlign = "center";
    ctx.fillText("COMPLETION DATE", canvas.width / 2, 590);
    ctx.textAlign = "right";
    ctx.fillText("CERTIFICATE ID", canvas.width - 180, 590);

    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "left";
    ctx.fillText(certificate.instructor, 180, 615);
    ctx.textAlign = "center";
    ctx.fillText(certificate.completionDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), canvas.width / 2, 615);
    ctx.textAlign = "right";
    ctx.fillText(certificate.certificateNumber, canvas.width - 180, 615);

    if (certificate.skills.length > 0) {
      ctx.font = "15px Arial, sans-serif";
      ctx.fillStyle = "#4f46e5";
      ctx.textAlign = "center";
      ctx.fillText(certificate.skills.slice(0, 5).join("  ·  "), canvas.width / 2, 690);
    }

    ctx.fillStyle = "#e0e7ff";
    ctx.fillRect(40, 730, canvas.width - 80, 1);
    ctx.fillStyle = headerGrad;
    ctx.fillRect(40, canvas.height - 48, canvas.width - 80, 8);

    ctx.font = "13px Arial, sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.fillText(`Verify at: amtechy.com/verify/${certificate.certificateNumber}`, canvas.width / 2, 775);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificate.courseTitle.replace(/\s+/g, "_")}_Certificate.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const filteredCertificates =
    filterCategory === "all"
      ? certificates
      : certificates.filter((c) =>
          c.category.toLowerCase().includes(filterCategory.toLowerCase())
        );

  const PremiumModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={() => router.push("/dashboard")} className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center">
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
            {["View all certificates","Download certificates","Share on LinkedIn","Verify credentials"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-check text-white text-sm"></i>
                </div>
                <span className="text-sm font-medium text-slate-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => router.push("/pricing")} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all mb-3">Upgrade to Premium</button>
        <button onClick={() => router.push("/dashboard")} className="w-full py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">Back to Home</button>
      </div>
    </div>
  );

  const CertificatePreview = ({ certificate }: { certificate: Certificate }) => (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 max-w-4xl w-full relative">
      <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center z-10">
        <i className="fa-solid fa-xmark text-slate-600"></i>
      </button>
      <div id={`certificate-${certificate.id}`} className="border-8 border-double border-indigo-600 p-6 sm:p-10 relative mb-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-indigo-400"></div>
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-indigo-400"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-indigo-400"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-indigo-400"></div>
        <div className="text-center py-4">
          <i className="fa-solid fa-award text-indigo-600 text-5xl mb-4 block"></i>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>Certificate of Completion</h1>
          <div className="w-48 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-500 mb-2 italic">This is to certify that</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-6" style={{ fontFamily: "Georgia, serif" }}>{user?.displayName}</h2>
          <p className="text-slate-500 mb-3 italic">has successfully completed the course</p>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-8" style={{ fontFamily: "Georgia, serif" }}>{certificate.courseTitle}</h3>
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm border-t border-slate-100 pt-6">
            <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Instructor</p><p className="font-semibold text-slate-900">{certificate.instructor}</p></div>
            <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Completed</p><p className="font-semibold text-slate-900">{certificate.completionDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p></div>
            <div><p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Certificate ID</p><p className="font-semibold text-slate-900 text-xs">{certificate.certificateNumber}</p></div>
          </div>
          {certificate.skills.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
              {certificate.skills.slice(0, 5).map((s, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">{s}</span>
              ))}
            </div>
          )}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Verify at: amtechy.com/verify/{certificate.certificateNumber}</p>
          </div>
        </div>
      </div>
      <button onClick={() => downloadCertificate(certificate)} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <i className="fa-solid fa-download"></i> Download Certificate
      </button>
    </div>
  );

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading certificates...</p>
        </div>
      </main>
    );
  }

  if (!user || !user.isPremium) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0">
        <SideBar />
        <section className="flex-1 overflow-y-auto p-6"><PremiumModal /></section>
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      <section className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
              <p className="text-slate-500 mt-1">Download and share your earned certificates</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs rounded-lg border border-yellow-200 hover:bg-yellow-200 transition-colors font-medium"
              >
                🐛 Debug ({debugInfo.length})
              </button>
              <div className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold flex items-center gap-2">
                <i className="fa-solid fa-crown text-yellow-300"></i>
                Premium
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          {showDebug && (
            <div className="mb-6 bg-slate-900 text-green-400 rounded-xl p-4 font-mono text-xs overflow-auto max-h-80 border border-slate-700">
              <p className="text-yellow-400 font-bold mb-3">🐛 Debug Log — remove before production</p>
              {debugInfo.map((l, i) => (
                <div key={i} className={
                  l.includes("error") || l.includes("ERROR") || l.includes("permission")
                    ? "text-red-400"
                    : l.includes("Found") || l.includes("Got")
                    ? "text-emerald-400"
                    : "text-green-400"
                }>{l}</div>
              ))}

              {/* Rules fix */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-yellow-400 font-bold mb-2">📋 Required Firestore Security Rules</p>
                <p className="text-slate-400 mb-2">Firebase Console → Firestore Database → Rules → add:</p>
                <pre className="text-cyan-300 whitespace-pre-wrap">{`match /courseProgress/{doc} {
  allow read, write: if request.auth != null
    && resource.data.userId == request.auth.uid;
}
match /enrollments/{doc} {
  allow read: if request.auth != null
    && resource.data.userId == request.auth.uid;
}
match /certificates/{doc} {
  allow read: if request.auth != null
    && resource.data.userId == request.auth.uid;
}
match /users/{userId}/{subcollection=**} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}`}</pre>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-1">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-certificate text-xl"></i>
                </div>
                <span className="text-3xl font-bold">{certificates.length}</span>
              </div>
              <p className="text-sm opacity-80">Earned Certificates</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-1">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-download text-xl"></i>
                </div>
                <span className="text-3xl font-bold">{certificates.length}</span>
              </div>
              <p className="text-sm opacity-80">Ready to Download</p>
            </div>
          </div>

          {/* Filter */}
          {certificates.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-sm font-semibold text-slate-700 mr-1 flex-shrink-0">Filter:</span>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                      filterCategory === cat.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid or empty state */}
          {filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((cert) => (
                <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                    <div className="relative z-10">
                      <i className="fa-solid fa-award text-white text-4xl mb-3 block"></i>
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{cert.courseTitle}</h3>
                      <p className="text-white/75 text-sm">
                        {cert.completionDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">{cert.category}</span>
                      <span className="text-xs text-slate-400 truncate">ID: {cert.certificateNumber}</span>
                    </div>
                    {cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cert.skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{s}</span>
                        ))}
                        {cert.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">+{cert.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedCertificate(cert); setShowPreview(true); }}
                        className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <i className="fa-solid fa-eye text-sm"></i> View
                      </button>
                      <button
                        onClick={() => downloadCertificate(cert)}
                        className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <i className="fa-solid fa-download text-sm"></i> Download
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Certificates Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-3">
                You completed a course but no certificate record was found. This is likely a Firestore security rules issue or the certificate wasn't written to the database when the course was completed.
              </p>
              <ol className="text-slate-400 text-sm text-left max-w-xs mx-auto mb-6 space-y-1 list-decimal list-inside">
                <li>Open the debug panel and check for red errors</li>
                <li>Apply the Firestore rules shown in the debug panel</li>
                <li>Check Firebase Console to find where your data lives</li>
              </ol>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => setShowDebug(true)}
                  className="px-5 py-2.5 bg-yellow-50 text-yellow-700 rounded-lg font-medium hover:bg-yellow-100 transition-colors text-sm border border-yellow-200"
                >
                  🐛 View Debug Info
                </button>
                <button
                  onClick={() => router.push("/courses")}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Browse Courses
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="fa-solid fa-circle-info text-blue-500 text-lg"></i>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Download & Share Your Certificates</h3>
              <p className="text-sm text-slate-500">Download certificates as images to share on LinkedIn or your portfolio. Each has a unique verification ID.</p>
            </div>
          </div>
        </div>
        <BottomBar />
      </section>

      {showPreview && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <CertificatePreview certificate={selectedCertificate} />
        </div>
      )}
    </main>
  );
}