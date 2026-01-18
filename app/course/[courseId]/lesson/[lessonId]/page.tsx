"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

interface CourseData {
  title: string;
  totalModules: number;
  category: string;
}

interface Enrollment {
  id: string;
  progress: number;
  currentModule: number;
}

export default function LessonPlayer() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const lessonId = parseInt(params?.lessonId as string);

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchCourseData();
        await fetchEnrollment(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [courseId, router]);

  const fetchCourseData = async () => {
    try {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (courseDoc.exists()) {
        const data = courseDoc.data();
        setCourse({
          title: data.title || "Untitled Course",
          totalModules: data.totalModules || 10,
          category: data.category || "General",
        });
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const fetchEnrollment = async (userId: string) => {
    try {
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("learnerId", "==", userId),
        where("courseId", "==", courseId)
      );
      const snapshot = await getDocs(enrollmentsQuery);

      if (!snapshot.empty) {
        const enrollDoc = snapshot.docs[0];
        setEnrollment({
          id: enrollDoc.id,
          progress: enrollDoc.data().progress || 0,
          currentModule: enrollDoc.data().currentModule || 1,
        });
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error);
    }
  };

  const handleCompleteLesson = async () => {
    if (!enrollment || !course) return;

    try {
      const newProgress = Math.round((lessonId / course.totalModules) * 100);
      const nextModule = lessonId < course.totalModules ? lessonId + 1 : lessonId;

      await updateDoc(doc(db, "enrollments", enrollment.id), {
        progress: newProgress,
        currentModule: nextModule,
        lastAccessed: new Date(),
      });

      // Update progress collection
      const progressQuery = query(
        collection(db, "progress"),
        where("userId", "==", auth.currentUser?.uid),
        where("courseId", "==", courseId)
      );
      const progressSnapshot = await getDocs(progressQuery);

      if (!progressSnapshot.empty) {
        const progressDoc = progressSnapshot.docs[0];
        await updateDoc(doc(db, "progress", progressDoc.id), {
          progress: newProgress,
          lastAccessed: new Date(),
          completedLessons: [...(progressDoc.data().completedLessons || []), `lesson${lessonId}`],
          updatedAt: new Date().toISOString(),
        });
      }

      if (lessonId < course.totalModules) {
        router.push(`/course/${courseId}/lesson/${nextModule}`);
      } else {
        alert("🎉 Congratulations! You've completed the course!");
        router.push("/mylearning");
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  const handleSendAIMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessages = [...aiMessages, { role: "user", content: userMessage }];
    setAiMessages(newMessages);
    setUserMessage("");
    setIsAIThinking(true);

    // Simulate AI response (replace with actual API call to Claude)
    setTimeout(() => {
      const responses = [
        "Great question! Let me explain that concept in simpler terms...",
        "I can help you with that! Here's what you need to understand...",
        "That's an important topic. Let me break it down for you...",
      ];

      setAiMessages([
        ...newMessages,
        {
          role: "ai",
          content: responses[Math.floor(Math.random() * responses.length)],
        },
      ]);
      setIsAIThinking(false);
    }, 1500);
  };

  const getLessonContent = () => {
    // This would normally come from Firestore, but for now we'll generate it
    return {
      title: `Module ${lessonId}: Core Concepts`,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
      description: `In this module, you'll learn essential ${course?.category} concepts that will help you build real-world applications.`,
      objectives: [
        "Understand fundamental concepts",
        "Apply knowledge through practice",
        "Build a mini-project",
        "Master best practices",
      ],
      codeExample: `// Example code for Module ${lessonId}
function example() {
  console.log("Hello, World!");
  return "Learning is fun!";
}

example();`,
    };
  };

  if (loading || !course || !enrollment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const lessonContent = getLessonContent();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/course/${courseId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-slate-600"></i>
              </button>
              <div>
                <h1 className="font-bold text-slate-900">{course.title}</h1>
                <p className="text-sm text-slate-600">
                  Module {lessonId} of {course.totalModules}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${enrollment.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {enrollment.progress}%
                </span>
              </div>
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-robot"></i>
                AI Tutor
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Lesson Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="aspect-video bg-slate-900">
                <iframe
                  className="w-full h-full"
                  src={lessonContent.videoUrl}
                  title="Lesson Video"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Lesson Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {lessonContent.title}
              </h2>
              <p className="text-slate-600 mb-6">{lessonContent.description}</p>

              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Learning Objectives
              </h3>
              <ul className="space-y-2 mb-6">
                {lessonContent.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-green-600 mt-1"></i>
                    <span className="text-slate-700">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Example */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-mono text-slate-300">example.js</span>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">
                  Copy Code
                </button>
              </div>
              <div className="p-4 bg-slate-900 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono">
                  {lessonContent.codeExample}
                </pre>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  if (lessonId > 1) {
                    router.push(`/course/${courseId}/lesson/${lessonId - 1}`);
                  }
                }}
                disabled={lessonId === 1}
                className="px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                Previous
              </button>
              <button
                onClick={handleCompleteLesson}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {lessonId < course.totalModules ? "Next Lesson" : "Complete Course"}
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>

          {/* Right: AI Chat & Course Outline */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Chat */}
            {showAIChat && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
                <div className="p-4 border-b border-slate-100 bg-indigo-50 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">AI Tutor</h3>
                    <p className="text-xs text-slate-500">Ask me anything!</p>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                  {aiMessages.length === 0 && (
                    <div className="text-center text-slate-500 text-sm mt-8">
                      <i className="fa-solid fa-comments text-3xl mb-2 opacity-50"></i>
                      <p>Need help? Ask your AI tutor!</p>
                    </div>
                  )}
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-slate-900 border border-slate-200"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAIThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendAIMessage()}
                      placeholder="Ask a question..."
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSendAIMessage}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Course Outline */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <h3 className="font-bold text-slate-900 mb-4">Course Modules</h3>
              <div className="space-y-2">
                {Array.from({ length: course.totalModules }, (_, i) => i + 1).map(
                  (moduleNum) => (
                    <button
                      key={moduleNum}
                      onClick={() =>
                        router.push(`/course/${courseId}/lesson/${moduleNum}`)
                      }
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        moduleNum === lessonId
                          ? "bg-indigo-50 border-2 border-indigo-600"
                          : moduleNum < enrollment.currentModule
                          ? "bg-green-50 hover:bg-green-100"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            moduleNum === lessonId ? "text-indigo-600" : "text-slate-900"
                          }`}
                        >
                          Module {moduleNum}
                        </span>
                        {moduleNum < enrollment.currentModule ? (
                          <i className="fa-solid fa-check-circle text-green-600"></i>
                        ) : moduleNum === lessonId ? (
                          <i className="fa-solid fa-play text-indigo-600"></i>
                        ) : (
                          <i className="fa-solid fa-lock text-slate-400"></i>
                        )}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}