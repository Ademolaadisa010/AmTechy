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
    {
      name: "Michael Chen",
      title: "Data Science Lead",
      company: "Microsoft",
      bio: "Expert in ML, AI, and data analytics. Former researcher at MIT. Help students transition into data science careers with hands-on projects.",
      skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"],
      rating: 4.8,
      reviewCount: 98,
      hourlyRate: 90,
      expertise: ["Data Science", "Machine Learning", "Python"],
      availability: "Available",
      verified: true,
      status: "active",
      profileImage: null,
    },
    {
      name: "Emily Rodriguez",
      title: "Product Designer",
      company: "Airbnb",
      bio: "Award-winning designer with expertise in UX research, prototyping, and design systems. Mentor hundreds of designers into top tech companies.",
      skills: ["Figma", "UI/UX", "User Research", "Prototyping", "Design Systems"],
      rating: 5.0,
      reviewCount: 145,
      hourlyRate: 75,
      expertise: ["UI/UX Design", "Product Design", "Figma"],
      availability: "Available",
      verified: true,
      status: "active",
      profileImage: null,
    },
    {
      name: "David Okonkwo",
      title: "Backend Architect",
      company: "Amazon",
      bio: "Building distributed systems at scale. Expert in Node.js, Python, and cloud architecture. Based in Lagos, helping African developers level up.",
      skills: ["Node.js", "Python", "AWS", "Docker", "Kubernetes", "Microservices"],
      rating: 4.7,
      reviewCount: 89,
      hourlyRate: 70,
      expertise: ["Backend Development", "Cloud Computing", "DevOps"],
      availability: "Available",
      verified: true,
      status: "active",
      profileImage: null,
    },
    {
      name: "Aisha Ndiaye",
      title: "Mobile Engineering Manager",
      company: "Meta",
      bio: "Leading mobile teams at Meta. Specialized in React Native and Flutter. Helping developers build cross-platform apps that scale.",
      skills: ["React Native", "Flutter", "Mobile Development", "iOS", "Android"],
      rating: 4.9,
      reviewCount: 112,
      hourlyRate: 85,
      expertise: ["Mobile Development", "React Native", "Flutter"],
      availability: "Available",
      verified: true,
      status: "active",
      profileImage: null,
    },
    {
      name: "James Williams",
      title: "Full Stack Developer",
      company: "Stripe",
      bio: "Full-stack expert with deep knowledge in both frontend and backend. Help developers master the complete web development stack.",
      skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "GraphQL"],
      rating: 4.6,
      reviewCount: 76,
      hourlyRate: 65,
      expertise: ["Full Stack", "Web Development", "JavaScript"],
      availability: "Available",
      verified: false,
      status: "active",
      profileImage: null,
    },
    {
      name: "Priya Sharma",
      title: "Career Coach & Ex-FAANG Recruiter",
      company: "LinkedIn",
      bio: "Former recruiter at Google and Facebook. Now helping developers land their dream jobs with resume reviews, interview prep, and career strategy.",
      skills: ["Career Coaching", "Interview Prep", "Resume Review", "Networking"],
      rating: 5.0,
      reviewCount: 203,
      hourlyRate: 60,
      expertise: ["Career Coaching", "Interview Preparation", "Job Search"],
      availability: "Available",
      verified: true,
      status: "active",
      profileImage: null,
    },
    {
      name: "Carlos Martinez",
      title: "DevOps Engineer",
      company: "Netflix",
      bio: "Automating infrastructure and building CI/CD pipelines at Netflix. Teach practical DevOps skills that companies actually need.",
      skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux"],
      rating: 4.8,
      reviewCount: 67,
      hourlyRate: 75,
      expertise: ["DevOps", "Cloud Infrastructure", "Automation"],
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