"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

interface Lesson {
  order: number;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration?: number;
  objectives: string[];
  codeExample: string;
  content: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  totalModules: number;
  price?: number;
  rating?: number;
  studentsEnrolled?: number;
  imageUrl?: string;
  status?: string;
  level?: string;
  tutorId?: string;
  tutorName?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function CourseManagement() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    totalModules: 5,
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState<Lesson>({
    order: 1,
    title: "",
    description: "",
    videoUrl: "",
    videoDuration: 3600,
    objectives: [],
    codeExample: "",
    content: "",
  });

  const [objectiveInput, setObjectiveInput] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesList = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      setCourses(coursesList);
    } catch (error) {
      console.error("Error loading courses:", error);
      showMessage("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title.trim()) {
      showMessage("Course title is required", "error");
      return;
    }

    try {
      setLoading(true);
      
      // Get current user (must be logged in to create course)
      if (!auth.currentUser) {
        showMessage("You must be logged in to create a course", "error");
        return;
      }

      const newCourse = {
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category || "General",
        totalModules: courseForm.totalModules,
        price: 0, // Default price
        rating: 5, // New courses start with 5 rating
        studentsEnrolled: 0, // No students initially
        imageUrl: "", // Optional image
        status: "published", // Make it visible immediately
        level: "beginner", // Default level
        tutorId: auth.currentUser.uid, // Set current user as tutor
        tutorName: auth.currentUser.displayName || "Instructor", // Tutor name
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "courses"), newCourse);
      
      setCourses([
        ...courses,
        { id: docRef.id, ...newCourse } as Course,
      ]);

      setCourseForm({
        title: "",
        description: "",
        category: "",
        totalModules: 5,
      });

      setShowCourseForm(false);
      showMessage("✅ Course created successfully! It's now visible to learners.", "success");
    } catch (error) {
      console.error("Error creating course:", error);
      showMessage("Failed to create course", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      showMessage("Please select a course first", "error");
      return;
    }

    if (!lessonForm.title.trim() || !lessonForm.videoUrl.trim()) {
      showMessage("Title and video URL are required", "error");
      return;
    }

    if (lessonForm.objectives.length === 0) {
      showMessage("Add at least one learning objective", "error");
      return;
    }

    try {
      setLoading(true);
      const lessonDocRef = doc(
        db,
        "courses",
        selectedCourse.id,
        "lessons",
        `lesson_${lessonForm.order}`
      );

      await setDoc(lessonDocRef, {
        ...lessonForm,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setLessonForm({
        order: 1,
        title: "",
        description: "",
        videoUrl: "",
        videoDuration: 3600,
        objectives: [],
        codeExample: "",
        content: "",
      });

      setShowLessonForm(false);
      showMessage("✅ Lesson added successfully!", "success");
    } catch (error) {
      console.error("Error adding lesson:", error);
      showMessage("Failed to add lesson", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "courses", courseId));
      setCourses(courses.filter((c) => c.id !== courseId));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
      showMessage("✅ Course deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting course:", error);
      showMessage("Failed to delete course", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = () => {
    if (objectiveInput.trim()) {
      setLessonForm({
        ...lessonForm,
        objectives: [...lessonForm.objectives, objectiveInput],
      });
      setObjectiveInput("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setLessonForm({
      ...lessonForm,
      objectives: lessonForm.objectives.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Course Management</h2>
          <p className="text-slate-600 mt-1">Create and manage courses and lessons</p>
        </div>
        <button
          onClick={() => setShowCourseForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          New Course
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Create Course Form */}
      {showCourseForm && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Course</h3>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                  placeholder="e.g., React Fundamentals"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={courseForm.category}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, category: e.target.value })
                  }
                  placeholder="e.g., Web Development"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, description: e.target.value })
                }
                placeholder="Brief description of the course"
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Modules
              </label>
              <input
                type="number"
                value={courseForm.totalModules || 5}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    totalModules: parseInt(e.target.value) || 5,
                  })
                }
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-colors"
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
              <button
                type="button"
                onClick={() => setShowCourseForm(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedCourse?.id === course.id
                ? "bg-indigo-50 border-indigo-600"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setSelectedCourse(course)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900">{course.title}</h3>
                <p className="text-sm text-slate-600">{course.category}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course.id);
                }}
                className="text-red-600 hover:text-red-700 text-lg"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3">{course.description}</p>
            <p className="text-xs text-slate-500">
              <i className="fa-solid fa-book mr-2"></i>
              {course.totalModules} Modules
            </p>
          </div>
        ))}
      </div>

      {/* Add Lesson Form */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Lessons for {selectedCourse.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Add lessons with videos to this course
              </p>
            </div>
            <button
              onClick={() => setShowLessonForm(!showLessonForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              {showLessonForm ? "Cancel" : "Add Lesson"}
            </button>
          </div>

          {showLessonForm && (
            <form onSubmit={handleAddLesson} className="space-y-6 mb-8 pb-8 border-b border-slate-200">
              {/* Lesson Title & Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, title: e.target.value })
                    }
                    placeholder="e.g., Module 1: Getting Started"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lesson Order
                  </label>
                  <input
                    type="number"
                    value={lessonForm.order || 1}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={lessonForm.description}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, description: e.target.value })
                  }
                  placeholder="Brief description of the lesson"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={lessonForm.videoUrl}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                  }
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  YouTube format: https://www.youtube.com/embed/VIDEO_ID
                </p>
              </div>

              {/* Video Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Duration (seconds)
                </label>
                <input
                  type="number"
                  value={lessonForm.videoDuration || 3600}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      videoDuration: parseInt(e.target.value) || 3600,
                    })
                  }
                  placeholder="3600"
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Learning Objectives *
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={objectiveInput}
                    onChange={(e) => setObjectiveInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddObjective())
                    }
                    placeholder="Enter an objective"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {lessonForm.objectives.map((obj, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg"
                    >
                      <span className="text-slate-700">{obj}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Example */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Code Example
                </label>
                <textarea
                  value={lessonForm.codeExample}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, codeExample: e.target.value })
                  }
                  placeholder="// Example code"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Detailed Content
                </label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, content: e.target.value })
                  }
                  placeholder="Detailed lesson content..."
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-colors"
                >
                  {loading ? "Adding..." : "Add Lesson"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonForm(false);
                    setLessonForm({
                      order: 1,
                      title: "",
                      description: "",
                      videoUrl: "",
                      videoDuration: 3600,
                      objectives: [],
                      codeExample: "",
                      content: "",
                    });
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Course Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>Total Modules:</strong> {selectedCourse.totalModules}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}