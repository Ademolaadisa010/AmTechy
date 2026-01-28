// Create a page at /app/seed-courses/page.tsx and paste this code
// Visit /seed-courses in your browser and click the button to populate courses

"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedCoursesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const sampleCourses = [
    // Frontend Development
    {
      title: "Advanced React Patterns",
      description: "Master hooks, context API, and performance optimization techniques. Learn advanced React patterns used by top tech companies.",
      category: "Frontend Development",
      tutorId: "tutor123",
      tutorName: "Sarah Johnson",
      status: "published",
      totalModules: 12,
      price: 49.99,
      rating: 4.8,
      studentsEnrolled: 1234,
      level: "advanced",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Complete JavaScript Masterclass",
      description: "From basics to advanced: ES6+, async/await, promises, and modern JavaScript development.",
      category: "Frontend Development",
      tutorId: "tutor124",
      tutorName: "John Smith",
      status: "published",
      totalModules: 15,
      price: 39.99,
      rating: 4.9,
      studentsEnrolled: 2856,
      level: "beginner",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Vue.js 3 Complete Guide",
      description: "Build modern web applications with Vue.js 3, Composition API, and Pinia state management.",
      category: "Frontend Development",
      tutorId: "tutor125",
      tutorName: "Emily Chen",
      status: "published",
      totalModules: 10,
      price: 44.99,
      rating: 4.7,
      studentsEnrolled: 856,
      level: "intermediate",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Backend Development
    {
      title: "Node.js & Express Bootcamp",
      description: "Build scalable backend applications with Node.js, Express, MongoDB, and RESTful APIs.",
      category: "Backend Development",
      tutorId: "tutor126",
      tutorName: "Michael Brown",
      status: "published",
      totalModules: 14,
      price: 54.99,
      rating: 4.8,
      studentsEnrolled: 1567,
      level: "intermediate",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Python Backend Development",
      description: "Master Django and Flask frameworks for building robust backend systems and APIs.",
      category: "Backend Development",
      tutorId: "tutor127",
      tutorName: "David Lee",
      status: "published",
      totalModules: 16,
      price: 59.99,
      rating: 4.9,
      studentsEnrolled: 2134,
      level: "advanced",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Data Science
    {
      title: "Python for Data Science",
      description: "Learn data analysis, visualization, and machine learning with Python, pandas, and scikit-learn.",
      category: "Data Science",
      tutorId: "tutor128",
      tutorName: "Dr. Amanda Wilson",
      status: "published",
      totalModules: 18,
      price: 69.99,
      rating: 4.9,
      studentsEnrolled: 3421,
      level: "beginner",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Machine Learning A-Z",
      description: "Complete guide to ML algorithms, neural networks, and practical applications with real-world projects.",
      category: "Data Science",
      tutorId: "tutor129",
      tutorName: "Prof. James Taylor",
      status: "published",
      totalModules: 20,
      price: 79.99,
      rating: 4.8,
      studentsEnrolled: 2789,
      level: "advanced",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Data Analytics with SQL",
      description: "Master SQL for data analysis, complex queries, database design, and business intelligence.",
      category: "Data Science",
      tutorId: "tutor130",
      tutorName: "Rachel Green",
      status: "published",
      totalModules: 12,
      price: 39.99,
      rating: 4.7,
      studentsEnrolled: 1895,
      level: "intermediate",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Mobile Development
    {
      title: "React Native Mobile Development",
      description: "Build cross-platform mobile apps for iOS and Android using React Native and Expo.",
      category: "Mobile Development",
      tutorId: "tutor131",
      tutorName: "Alex Martinez",
      status: "published",
      totalModules: 13,
      price: 54.99,
      rating: 4.7,
      studentsEnrolled: 1456,
      level: "intermediate",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Flutter Complete Guide",
      description: "Create beautiful native apps with Flutter and Dart for iOS, Android, and web.",
      category: "Mobile Development",
      tutorId: "tutor132",
      tutorName: "Sophie Anderson",
      status: "published",
      totalModules: 15,
      price: 64.99,
      rating: 4.8,
      studentsEnrolled: 2156,
      level: "beginner",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // Product Design
    {
      title: "UI/UX Design Fundamentals",
      description: "Learn user-centered design, wireframing, prototyping, and design systems with Figma.",
      category: "Product Design",
      tutorId: "tutor133",
      tutorName: "Isabella Rodriguez",
      status: "published",
      totalModules: 11,
      price: 44.99,
      rating: 4.9,
      studentsEnrolled: 1678,
      level: "beginner",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Advanced Figma for Designers",
      description: "Master advanced Figma techniques, plugins, auto-layout, and design systems for professional work.",
      category: "Product Design",
      tutorId: "tutor134",
      tutorName: "Oliver Thompson",
      status: "published",
      totalModules: 9,
      price: 49.99,
      rating: 4.7,
      studentsEnrolled: 945,
      level: "advanced",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // DevOps
    {
      title: "Docker & Kubernetes Mastery",
      description: "Learn containerization, orchestration, CI/CD pipelines, and cloud deployment strategies.",
      category: "DevOps",
      tutorId: "tutor135",
      tutorName: "Chris Walker",
      status: "published",
      totalModules: 16,
      price: 69.99,
      rating: 4.8,
      studentsEnrolled: 1234,
      level: "advanced",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // AI & Machine Learning
    {
      title: "Deep Learning with TensorFlow",
      description: "Build neural networks, CNNs, RNNs, and implement cutting-edge AI models with TensorFlow.",
      category: "AI & Machine Learning",
      tutorId: "tutor136",
      tutorName: "Dr. Lisa Park",
      status: "published",
      totalModules: 22,
      price: "free",
      rating: 4.9,
      studentsEnrolled: 2567,
      level: "advanced",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Natural Language Processing",
      description: "Master NLP techniques, transformers, BERT, and build chatbots and text analysis applications.",
      category: "AI & Machine Learning",
      tutorId: "tutor137",
      tutorName: "Dr. Kevin Zhang",
      status: "published",
      totalModules: 17,
      price: 74.99,
      rating: 4.8,
      studentsEnrolled: 1789,
      level: "intermediate",
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const seedCourses = async () => {
    setLoading(true);
    setResult("");

    try {
      const courseIds: string[] = [];

      for (const course of sampleCourses) {
        const docRef = await addDoc(collection(db, "courses"), course);
        courseIds.push(docRef.id);
      }

      setResult(
        `✅ Successfully added ${sampleCourses.length} courses to Firestore!\n\nCourse IDs:\n${courseIds.join("\n")}`
      );
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      console.error("Error seeding courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Seed Sample Courses
        </h1>
        <p className="text-slate-600 mb-6">
          This will add {sampleCourses.length} sample courses to your Firestore database
          across different categories:
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Frontend Development:</span>
            <span className="font-medium">3 courses</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Backend Development:</span>
            <span className="font-medium">2 courses</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Data Science:</span>
            <span className="font-medium">3 courses</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Mobile Development:</span>
            <span className="font-medium">2 courses</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Product Design:</span>
            <span className="font-medium">2 courses</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">DevOps:</span>
            <span className="font-medium">1 course</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">AI & Machine Learning:</span>
            <span className="font-medium">2 courses</span>
          </div>
        </div>

        <button
          onClick={seedCourses}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {loading ? "Adding Courses..." : "Seed Courses Database"}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.startsWith("✅")
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <pre className="text-sm whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Only run this once! Running it multiple times
            will create duplicate courses.
          </p>
        </div>
      </div>
    </div>
  );
}