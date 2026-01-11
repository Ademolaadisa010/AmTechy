// Run this once to populate test data in your Firestore database
// You can create a separate page (e.g., /seed-data) and run this function
"use client";
import { db, auth } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";

export async function seedTestData() {
  const userId = auth.currentUser?.uid;
  
  if (!userId) {
    console.error("User must be logged in to seed data");
    return;
  }

  try {
    console.log("Starting to seed data...");

    // 1. Update user profile with streak and XP
    await setDoc(
      doc(db, "users", userId),
      {
        streak: 5,
        xp: 1240,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("✅ User profile updated");

    // 2. Create sample courses
    const course1Ref = await addDoc(collection(db, "courses"), {
      title: "Advanced React Patterns",
      description: "Master hooks, context API, and performance optimization techniques.",
      category: "Frontend Development",
      tutorId: "tutor123", // Replace with actual tutor ID if needed
      status: "published",
      totalModules: 12,
      imageUrl: null,
      price: 49.99,
      rating: 4.8,
      studentsEnrolled: 1234,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Course 1 created:", course1Ref.id);

    const course2Ref = await addDoc(collection(db, "courses"), {
      title: "Full Stack JavaScript",
      description: "Build complete web applications with Node.js, Express, and MongoDB.",
      category: "Full Stack",
      tutorId: "tutor123",
      status: "published",
      totalModules: 15,
      imageUrl: null,
      price: 79.99,
      rating: 4.9,
      studentsEnrolled: 856,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Course 2 created:", course2Ref.id);

    const course3Ref = await addDoc(collection(db, "courses"), {
      title: "Python for Data Science",
      description: "Learn data analysis, visualization, and machine learning with Python.",
      category: "Data Science",
      tutorId: "tutor456",
      status: "published",
      totalModules: 10,
      imageUrl: null,
      price: 59.99,
      rating: 4.7,
      studentsEnrolled: 645,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Course 3 created:", course3Ref.id);

    // 3. Create enrollments
    await addDoc(collection(db, "enrollments"), {
      learnerId: userId,
      courseId: course1Ref.id,
      tutorId: "tutor123",
      progress: 45,
      currentModule: 4,
      status: "active",
      enrolledAt: new Date().toISOString(),
      lastAccessed: new Date(),
    });
    console.log("✅ Enrollment 1 created");

    await addDoc(collection(db, "enrollments"), {
      learnerId: userId,
      courseId: course2Ref.id,
      tutorId: "tutor123",
      progress: 22,
      currentModule: 2,
      status: "active",
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    });
    console.log("✅ Enrollment 2 created");

    await addDoc(collection(db, "enrollments"), {
      learnerId: userId,
      courseId: course3Ref.id,
      tutorId: "tutor456",
      progress: 67,
      currentModule: 7,
      status: "active",
      enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });
    console.log("✅ Enrollment 3 created");

    // 4. Create progress records
    await addDoc(collection(db, "progress"), {
      userId: userId,
      courseId: course1Ref.id,
      progress: 45,
      timeSpent: 450, // in minutes
      lastAccessed: new Date(),
      completedLessons: ["lesson1", "lesson2", "lesson3"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await addDoc(collection(db, "progress"), {
      userId: userId,
      courseId: course2Ref.id,
      progress: 22,
      timeSpent: 180,
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedLessons: ["lesson1"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await addDoc(collection(db, "progress"), {
      userId: userId,
      courseId: course3Ref.id,
      progress: 67,
      timeSpent: 320,
      lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedLessons: ["lesson1", "lesson2", "lesson3", "lesson4", "lesson5"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Progress records created");

    // 5. Create certificates
    await addDoc(collection(db, "certificates"), {
      userId: userId,
      courseId: course3Ref.id,
      courseName: "Python for Data Science",
      status: "earned",
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      certificateUrl: "https://example.com/cert1.pdf",
      createdAt: new Date().toISOString(),
    });

    await addDoc(collection(db, "certificates"), {
      userId: userId,
      courseId: course2Ref.id,
      courseName: "Full Stack JavaScript",
      status: "earned",
      earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      certificateUrl: "https://example.com/cert2.pdf",
      createdAt: new Date().toISOString(),
    });

    await addDoc(collection(db, "certificates"), {
      userId: userId,
      courseId: course1Ref.id,
      courseName: "Advanced React Patterns",
      status: "in-progress",
      createdAt: new Date().toISOString(),
    });
    console.log("✅ Certificates created");

    console.log("🎉 All test data seeded successfully!");
    return {
      success: true,
      courseIds: [course1Ref.id, course2Ref.id, course3Ref.id],
    };
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

export function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleSeed = async () => {
    setLoading(true);
    setResult("");
    try {
      await seedTestData();
      setResult("✅ Data seeded successfully! Check your Firestore console.");
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Seed Test Data</h2>
      <p className="text-slate-600 mb-4">
        This will create sample courses, enrollments, progress, and certificates for testing.
      </p>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Seeding Data..." : "Seed Test Data"}
      </button>
      {result && (
        <div className="mt-4 p-4 bg-slate-100 rounded-lg">
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  );
}