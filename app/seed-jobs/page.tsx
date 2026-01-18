"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedJobsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const sampleJobs = [
    // Full-Time Jobs
    {
      title: "Senior Frontend Developer",
      company: "TechCorp Africa",
      location: "Lagos, Nigeria",
      type: "full-time",
      level: "senior",
      salary: "$60,000 - $80,000/year",
      description: "We're looking for an experienced Frontend Developer to lead our web development team. You'll work on cutting-edge projects using React, TypeScript, and modern web technologies.",
      requirements: [
        "5+ years of experience with React and TypeScript",
        "Strong understanding of web performance optimization",
        "Experience with state management (Redux, Context API)",
        "Excellent problem-solving skills",
      ],
      skills: ["React", "TypeScript", "JavaScript", "CSS", "Redux", "Next.js"],
      remote: true,
      status: "active",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      applicationUrl: "https://example.com/apply",
    },
    {
      title: "Backend Engineer",
      company: "Fintech Solutions",
      location: "Nairobi, Kenya",
      type: "full-time",
      level: "mid",
      salary: "$45,000 - $65,000/year",
      description: "Join our fintech team to build scalable backend systems. Work with Node.js, MongoDB, and microservices architecture.",
      requirements: [
        "3+ years backend development experience",
        "Proficient in Node.js and Express",
        "Experience with MongoDB or PostgreSQL",
        "Understanding of REST APIs and microservices",
      ],
      skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "AWS", "Docker"],
      remote: false,
      status: "active",
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Data Scientist",
      company: "Analytics Pro",
      location: "Cape Town, South Africa",
      type: "full-time",
      level: "mid",
      salary: "$50,000 - $70,000/year",
      description: "Analyze large datasets and build ML models to drive business insights. Work with Python, TensorFlow, and cloud platforms.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "2+ years experience in data science",
        "Strong Python and SQL skills",
        "Experience with ML frameworks (TensorFlow, PyTorch)",
      ],
      skills: ["Python", "TensorFlow", "SQL", "Pandas", "Machine Learning", "Statistics"],
      remote: true,
      status: "active",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },

    // Internships
    {
      title: "Frontend Development Intern",
      company: "StartUp Hub",
      location: "Accra, Ghana",
      type: "internship",
      level: "entry",
      salary: "$500 - $800/month",
      description: "3-month paid internship for aspiring frontend developers. Learn React, work on real projects, and get mentorship from senior developers.",
      requirements: [
        "Basic knowledge of HTML, CSS, JavaScript",
        "Familiarity with React (projects or coursework)",
        "Passionate about web development",
        "Available for 3 months full-time",
      ],
      skills: ["HTML", "CSS", "JavaScript", "React", "Git"],
      remote: true,
      status: "active",
      postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Backend Development Intern",
      company: "DevSchool Africa",
      location: "Lagos, Nigeria",
      type: "internship",
      level: "entry",
      salary: "$600 - $900/month",
      description: "Learn backend development with Node.js and Python. Work alongside experienced engineers on production systems.",
      requirements: [
        "Understanding of programming fundamentals",
        "Basic knowledge of Node.js or Python",
        "Eager to learn and grow",
        "Good communication skills",
      ],
      skills: ["Node.js", "Python", "JavaScript", "SQL", "Git"],
      remote: false,
      status: "active",
      postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      title: "UI/UX Design Intern",
      company: "Creative Studio",
      location: "Remote",
      type: "internship",
      level: "entry",
      salary: "$400 - $700/month",
      description: "Join our design team to create beautiful user interfaces. Learn Figma, design systems, and user research.",
      requirements: [
        "Portfolio showcasing design work",
        "Basic knowledge of Figma or Adobe XD",
        "Understanding of design principles",
        "Creative mindset",
      ],
      skills: ["Figma", "UI Design", "UX Design", "Prototyping", "Adobe XD"],
      remote: true,
      status: "active",
      postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },

    // Part-Time & Contract
    {
      title: "React Developer (Part-Time)",
      company: "Remote Team",
      location: "Remote",
      type: "part-time",
      level: "mid",
      salary: "$25 - $40/hour",
      description: "Part-time React developer needed for ongoing project. Flexible hours, work 20-25 hours per week.",
      requirements: [
        "2+ years React experience",
        "Available 20-25 hours per week",
        "Strong communication skills",
        "Self-motivated and reliable",
      ],
      skills: ["React", "JavaScript", "TypeScript", "CSS", "Git"],
      remote: true,
      status: "active",
      postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Mobile App Developer",
      company: "AppBuilders Inc",
      location: "Johannesburg, South Africa",
      type: "full-time",
      level: "mid",
      salary: "$40,000 - $60,000/year",
      description: "Build cross-platform mobile apps with React Native. Work on exciting projects for startups and enterprises.",
      requirements: [
        "3+ years mobile development experience",
        "Expert in React Native",
        "Published apps on App Store/Play Store",
        "Knowledge of native iOS/Android development",
      ],
      skills: ["React Native", "JavaScript", "iOS", "Android", "Redux"],
      remote: false,
      status: "active",
      postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      title: "DevOps Engineer",
      company: "Cloud Systems",
      location: "Remote",
      type: "full-time",
      level: "senior",
      salary: "$70,000 - $90,000/year",
      description: "Manage cloud infrastructure, CI/CD pipelines, and ensure system reliability. Work with AWS, Docker, and Kubernetes.",
      requirements: [
        "5+ years DevOps experience",
        "Expert in AWS/Azure/GCP",
        "Strong Docker and Kubernetes skills",
        "Experience with CI/CD tools",
      ],
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Python"],
      remote: true,
      status: "active",
      postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Junior Full Stack Developer",
      company: "Web Agency",
      location: "Kigali, Rwanda",
      type: "full-time",
      level: "entry",
      salary: "$30,000 - $40,000/year",
      description: "Entry-level position for recent graduates. Build full-stack web applications using modern technologies.",
      requirements: [
        "Bachelor's degree or bootcamp graduate",
        "Basic knowledge of frontend and backend",
        "Portfolio of personal projects",
        "Eager to learn and grow",
      ],
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"],
      remote: false,
      status: "active",
      postedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  ];

  const seedJobs = async () => {
    setLoading(true);
    setResult("");

    try {
      const jobIds: string[] = [];

      for (const job of sampleJobs) {
        const docRef = await addDoc(collection(db, "jobs"), job);
        jobIds.push(docRef.id);
      }

      setResult(
        `✅ Successfully added ${sampleJobs.length} jobs to Firestore!\n\nJob IDs:\n${jobIds.join("\n")}`
      );
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      console.error("Error seeding jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Seed Sample Jobs & Internships
        </h1>
        <p className="text-slate-600 mb-6">
          This will add {sampleJobs.length} sample job postings to your Firestore database:
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Full-Time Jobs:</span>
            <span className="font-medium">
              {sampleJobs.filter((j) => j.type === "full-time").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Internships:</span>
            <span className="font-medium">
              {sampleJobs.filter((j) => j.type === "internship").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Part-Time:</span>
            <span className="font-medium">
              {sampleJobs.filter((j) => j.type === "part-time").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Remote Positions:</span>
            <span className="font-medium">
              {sampleJobs.filter((j) => j.remote).length}
            </span>
          </div>
        </div>

        <button
          onClick={seedJobs}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {loading ? "Adding Jobs..." : "Seed Jobs Database"}
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
            will create duplicate job postings.
          </p>
        </div>
      </div>
    </div>
  );
}