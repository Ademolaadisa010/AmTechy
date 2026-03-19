import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface LessonInput {
  title: string;
  description: string;
  videoUrl: string; // YouTube embed or hosted video URL
  videoDuration?: number;
  objectives: string[];
  codeExample: string;
  content?: string;
  resources?: Array<{ title: string; url: string }>;
  thumbnail?: string;
  order?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Add a new lesson to a course
 * @param courseId - The course ID
 * @param lessonNumber - The lesson number (1-indexed)
 * @param lessonData - The lesson data
 * @returns Promise<void>
 */
export async function addLessonToDatabase(
  courseId: string,
  lessonNumber: number,
  lessonData: LessonInput
): Promise<void> {
  try {
    const lessonDocRef = doc(
      db,
      "courses",
      courseId,
      "lessons",
      `lesson_${lessonNumber}`
    );

    await setDoc(lessonDocRef, {
      ...lessonData,
      order: lessonNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`Lesson ${lessonNumber} added successfully`);
  } catch (error) {
    console.error("Error adding lesson:", error);
    throw error;
  }
}

/**
 * Update an existing lesson
 * @param courseId - The course ID
 * @param lessonNumber - The lesson number
 * @param lessonData - The partial lesson data to update
 * @returns Promise<void>
 */
export async function updateLessonInDatabase(
  courseId: string,
  lessonNumber: number,
  lessonData: Partial<LessonInput>
): Promise<void> {
  try {
    const lessonDocRef = doc(
      db,
      "courses",
      courseId,
      "lessons",
      `lesson_${lessonNumber}`
    );

    await updateDoc(lessonDocRef, {
      ...lessonData,
      updatedAt: Timestamp.now(),
    });

    console.log(`Lesson ${lessonNumber} updated successfully`);
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
}

/**
 * Get a specific lesson
 * @param courseId - The course ID
 * @param lessonNumber - The lesson number
 * @returns Promise<LessonInput | null>
 */
export async function getLessonFromDatabase(
  courseId: string,
  lessonNumber: number
): Promise<LessonInput | null> {
  try {
    const lessonDocRef = doc(
      db,
      "courses",
      courseId,
      "lessons",
      `lesson_${lessonNumber}`
    );

    const lessonDoc = await getDoc(lessonDocRef);

    if (lessonDoc.exists()) {
      return lessonDoc.data() as LessonInput;
    }

    return null;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}

/**
 * Get all lessons for a course
 * @param courseId - The course ID
 * @returns Promise<(LessonInput & { id: string })[]>
 */
export async function getAllLessonsForCourse(
  courseId: string
): Promise<(LessonInput & { id: string })[]> {
  try {
    const lessonsCollectionRef = collection(db, "courses", courseId, "lessons");
    const snapshot = await getDocs(lessonsCollectionRef);

    const lessons = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort(
        (a, b) =>
          ((a as any).order || 0) - ((b as any).order || 0)
      ) as (LessonInput & { id: string })[];

    return lessons;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
}

/**
 * Update video URL for a lesson (useful for uploading to Cloud Storage)
 * @param courseId - The course ID
 * @param lessonNumber - The lesson number
 * @param videoUrl - The new video URL
 * @returns Promise<void>
 */
export async function updateLessonVideoUrl(
  courseId: string,
  lessonNumber: number,
  videoUrl: string
): Promise<void> {
  try {
    const lessonDocRef = doc(
      db,
      "courses",
      courseId,
      "lessons",
      `lesson_${lessonNumber}`
    );

    await updateDoc(lessonDocRef, {
      videoUrl,
      updatedAt: Timestamp.now(),
    });

    console.log(`Video URL updated for lesson ${lessonNumber}`);
  } catch (error) {
    console.error("Error updating video URL:", error);
    throw error;
  }
}

/**
 * Batch add multiple lessons to a course
 * Useful for course setup or migration
 * @param courseId - The course ID
 * @param lessons - Array of lesson data
 * @returns Promise<void>
 */
export async function batchAddLessons(
  courseId: string,
  lessons: LessonInput[]
): Promise<void> {
  try {
    const batch = writeBatch(db);

    for (let i = 0; i < lessons.length; i++) {
      const lessonDocRef = doc(
        db,
        "courses",
        courseId,
        "lessons",
        `lesson_${i + 1}`
      );

      batch.set(lessonDocRef, {
        ...lessons[i],
        order: i + 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();

    console.log(`${lessons.length} lessons added successfully`);
  } catch (error) {
    console.error("Error batch adding lessons:", error);
    throw error;
  }
}

/**
 * Delete a lesson from a course
 * @param courseId - The course ID
 * @param lessonNumber - The lesson number
 * @returns Promise<void>
 */
export async function deleteLessonFromDatabase(
  courseId: string,
  lessonNumber: number
): Promise<void> {
  try {
    const lessonDocRef = doc(
      db,
      "courses",
      courseId,
      "lessons",
      `lesson_${lessonNumber}`
    );

    await deleteDoc(lessonDocRef);

    console.log(`Lesson ${lessonNumber} deleted successfully`);
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
}

/**
 * Search lessons by title or content
 * Note: This is a simple client-side search. For large datasets,
 * use Firestore full-text search or integrate Algolia
 * @param courseId - The course ID
 * @param searchTerm - The search term
 * @returns Promise<(LessonInput & { id: string })[]>
 */
export async function searchLessons(
  courseId: string,
  searchTerm: string
): Promise<(LessonInput & { id: string })[]> {
  try {
    const allLessons = await getAllLessonsForCourse(courseId);

    const filtered = allLessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.content?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    return filtered;
  } catch (error) {
    console.error("Error searching lessons:", error);
    throw error;
  }
}

/**
 * Example usage function showing how to add sample lessons
 */
export async function addSampleLessons(courseId: string): Promise<void> {
  const sampleLessons: LessonInput[] = [
    {
      title: "Module 1: Getting Started",
      description: "Introduction and setup",
      videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk",
      objectives: ["Understand basics", "Set up environment"],
      codeExample: 'console.log("Hello World");',
      content: "Welcome to the course!",
    },
    {
      title: "Module 2: Core Concepts",
      description: "Learn the fundamentals",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      objectives: ["Learn concepts", "Practice examples"],
      codeExample: "const greet = () => console.log('Hi');",
      content: "Deep dive into core concepts...",
    },
  ];

  await batchAddLessons(courseId, sampleLessons);
}