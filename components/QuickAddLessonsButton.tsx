"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, Timestamp, collection } from "firebase/firestore";

/**
 * QuickAddLessonsButton Component
 * 
 * Simply add this component to any page and it will show a button to instantly add lessons
 * 
 * Usage in any page:
 * import QuickAddLessonsButton from "@/components/QuickAddLessonsButton";
 * 
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <QuickAddLessonsButton courseId="1y3KiPBXPWGVTg8uYG7f" />
 *     </div>
 *   );
 * }
 */

interface QuickAddLessonsButtonProps {
  courseId: string;
}

export default function QuickAddLessonsButton({
  courseId,
}: QuickAddLessonsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const lessons = [
    {
      order: 1,
      title: "Module 1: Getting Started",
      description: "Introduction to the course. Learn what you'll accomplish in this module.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      videoDuration: 1800,
      objectives: ["Understand course overview", "Set up your environment", "Learn the basics"],
      codeExample: 'console.log("Welcome to Module 1!");\n\nfunction start() {\n  console.log("Let\'s begin!");\n}',
      content: "This is the introductory module where we set the foundation for everything to come.",
    },
    {
      order: 2,
      title: "Module 2: Core Concepts",
      description: "Deep dive into the fundamental concepts and principles.",
      videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
      videoDuration: 2400,
      objectives: ["Master core concepts", "Understand the theory", "See practical applications"],
      codeExample: "function learnConcepts() {\n  const concept = { name: 'Core Concept', importance: 'High' };\n  return concept;\n}",
      content: "In this module, we explore the core concepts that underpin everything in this course.",
    },
    {
      order: 3,
      title: "Module 3: Practical Application",
      description: "Apply what you've learned with hands-on examples.",
      videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk",
      videoDuration: 3000,
      objectives: ["Build a real project", "Apply best practices", "Debug and problem-solve"],
      codeExample: 'class Project {\n  constructor(name) {\n    this.name = name;\n  }\n  build() { return `${this.name} is ready!`; }\n}',
      content: "Now it's time to apply everything you've learned. We'll build a real project from scratch.",
    },
    {
      order: 4,
      title: "Module 4: Advanced Topics",
      description: "Take your skills to the next level with advanced techniques.",
      videoUrl: "https://www.youtube.com/embed/n3D_9f25A2A",
      videoDuration: 2700,
      objectives: ["Learn advanced patterns", "Optimize performance", "Implement best practices"],
      codeExample: "const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);\nconst result = compose(square, addTen, double)(5);",
      content: "We explore advanced techniques and patterns used by professionals in the industry.",
    },
    {
      order: 5,
      title: "Module 5: Capstone Project",
      description: "Complete your learning journey with a comprehensive project.",
      videoUrl: "https://www.youtube.com/embed/VGXnPZB2K-Y",
      videoDuration: 3600,
      objectives: ["Complete a full project", "Demonstrate mastery", "Prepare for real-world scenarios"],
      codeExample: "const CapstoneProject = {\n  implementation() { console.log('Building final project...'); },\n  test() { console.log('Testing complete!'); }\n};",
      content: "The capstone project brings together everything you've learned. Demonstrate mastery of all concepts.",
    },
  ];

  const handleAddLessons = async () => {
    setLoading(true);
    setMessage("");

    try {
      let successCount = 0;

      for (const lesson of lessons) {
        try {
          const lessonDocRef = doc(
            db,
            "courses",
            courseId,
            "lessons",
            `lesson_${lesson.order}`
          );

          await setDoc(lessonDocRef, {
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            videoDuration: lesson.videoDuration,
            objectives: lesson.objectives,
            codeExample: lesson.codeExample,
            content: lesson.content,
            order: lesson.order,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

          successCount++;
        } catch (error) {
          console.error(`Error adding lesson ${lesson.order}:`, error);
        }
      }

      if (successCount > 0) {
        setMessage(
          `✅ Successfully added ${successCount} lessons! Refresh to see them.`
        );
        setMessageType("success");
      } else {
        setMessage("❌ Failed to add lessons. Check console for errors.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleAddLessons}
        disabled={loading}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors font-semibold flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Adding Lessons...
          </>
        ) : (
          <>
            <span>🚀</span>
            Add 5 Sample Lessons to Database
          </>
        )}
      </button>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}