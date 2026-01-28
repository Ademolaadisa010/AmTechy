"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedTutorsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const sampleTutors = [
    {
      name: "Sarah Johnson",
      title: "Senior Frontend Engineer",
      company: "Google",
      bio: "10+ years building scalable web applications. Specialized in React, TypeScript, and modern frontend architecture. Passionate about mentoring aspiring developers.",
      skills: ["React", "TypeScript", "JavaScript", "Next.js", "CSS", "UI/UX"],
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 80,
      expertise: ["Frontend Development", "React", "Career Coaching"],
      availability: "Available",
      verified: true,
      status: "active",
      profileImage: null,
    },
  ];

  const seedTutors = async () => {
    setLoading(true);
    setResult("");

    try {
      const tutorIds: string[] = [];

      for (const tutor of sampleTutors) {
        const docRef = await addDoc(collection(db, "tutors"), tutor);
        tutorIds.push(docRef.id);
      }

      setResult(
        `✅ Successfully added ${sampleTutors.length} tutors to Firestore!\n\nTutor IDs:\n${tutorIds.join("\n")}`
      );
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      console.error("Error seeding tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Seed Sample Tutors/Mentors
        </h1>
        <p className="text-slate-600 mb-6">
          This will add {sampleTutors.length} sample tutors to your Firestore database:
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Frontend Experts:</span>
            <span className="font-medium">2 tutors</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Backend/DevOps:</span>
            <span className="font-medium">2 tutors</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Data Science:</span>
            <span className="font-medium">1 tutor</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Mobile Development:</span>
            <span className="font-medium">1 tutor</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Design:</span>
            <span className="font-medium">1 tutor</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Career Coaching:</span>
            <span className="font-medium">1 tutor</span>
          </div>
        </div>

        <button
          onClick={seedTutors}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {loading ? "Adding Tutors..." : "Seed Tutors Database"}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.startsWith("✅")
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Only run this once! Running it multiple times
            will create duplicate tutors.
          </p>
        </div>
      </div>
    </div>
  );
}