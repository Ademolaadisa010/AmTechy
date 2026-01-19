"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

export default function DebugPermissions() {
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const addResult = (message: string, isError = false) => {
    setResults((prev) => [
      ...prev,
      `${isError ? "❌" : "✅"} ${message}`,
    ]);
  };

  const testPermissions = async () => {
    if (!user) {
      alert("Please log in first!");
      return;
    }

    setResults([]);
    setLoading(true);

    try {
      // Test 1: Read user document
      addResult(`Testing with User ID: ${user.uid}`);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        addResult(`Can READ users/${user.uid}: ${userDoc.exists() ? "Document exists" : "No document"}`);
      } catch (err: any) {
        addResult(`Can READ users/${user.uid}: ${err.message}`, true);
      }

      // Test 2: Write to user document
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            fullName: "Test User",
            email: user.email || "test@test.com",
            role: "tutor",
            authProvider: "email",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        addResult(`Can WRITE to users/${user.uid}`);
      } catch (err: any) {
        addResult(`Can WRITE to users/${user.uid}: ${err.message}`, true);
      }

      // Test 3: Read courses
      try {
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        addResult(`Can READ courses collection: ${coursesSnapshot.size} documents`);
      } catch (err: any) {
        addResult(`Can READ courses: ${err.message}`, true);
      }

      // Test 4: Read jobs
      try {
        const jobsSnapshot = await getDocs(collection(db, "jobs"));
        addResult(`Can READ jobs collection: ${jobsSnapshot.size} documents`);
      } catch (err: any) {
        addResult(`Can READ jobs: ${err.message}`, true);
      }

      // Test 5: Read enrollments
      try {
        const enrollmentsSnapshot = await getDocs(collection(db, "enrollments"));
        addResult(`Can READ enrollments collection: ${enrollmentsSnapshot.size} documents`);
      } catch (err: any) {
        addResult(`Can READ enrollments: ${err.message}`, true);
      }

      // Test 6: Write to enrollments
      try {
        const testEnrollmentId = `test_${Date.now()}`;
        await setDoc(doc(db, "enrollments", testEnrollmentId), {
          learnerId: user.uid,
          courseId: "test_course",
          tutorId: "test_tutor",
          progress: 0,
          currentModule: 1,
          status: "active",
          enrolledAt: new Date().toISOString(),
          lastAccessed: new Date(),
        });
        addResult(`Can WRITE to enrollments collection`);
      } catch (err: any) {
        addResult(`Can WRITE to enrollments: ${err.message}`, true);
      }

      // Test 7: Authentication status
      addResult(`Auth UID: ${user.uid}`);
      addResult(`Auth Email: ${user.email}`);
      addResult(`Auth Provider: ${user.providerData[0]?.providerId || "unknown"}`);

    } catch (error: any) {
      addResult(`Unexpected error: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            🔍 Firestore Permissions Debugger
          </h1>

          {!user ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                ⚠️ You need to be logged in to test permissions.
              </p>
              <a
                href="/login"
                className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Go to Login
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-indigo-900 font-medium">
                  Logged in as: {user.email}
                </p>
                <p className="text-sm text-indigo-700">UID: {user.uid}</p>
              </div>

              <button
                onClick={testPermissions}
                disabled={loading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Testing Permissions..." : "Run Permission Tests"}
              </button>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Test Results</h2>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg font-mono text-sm ${
                    result.startsWith("❌")
                      ? "bg-red-50 text-red-900"
                      : "bg-green-50 text-green-900"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium mb-2">
                📋 Next Steps:
              </p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Check which operations are failing (marked with ❌)</li>
                <li>Copy the error messages</li>
                <li>Verify your Firestore rules are published</li>
                <li>Make sure you're logged in with the correct account</li>
              </ol>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            🔧 Quick Fixes
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900 mb-1">1. Check Firestore Rules</p>
              <p className="text-sm text-slate-600">
                Go to Firebase Console → Firestore → Rules and make sure they're published
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900 mb-1">2. Wait for Propagation</p>
              <p className="text-sm text-slate-600">
                After publishing rules, wait 30-60 seconds before testing
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900 mb-1">3. Clear Browser Cache</p>
              <p className="text-sm text-slate-600">
                Sometimes cached rules cause issues. Try hard refresh (Ctrl+Shift+R)
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
          >
            Open Firebase Console
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}