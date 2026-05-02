import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const issueCertificate = async (userId: string, courseId: string) => {
  // Fetch course details
  const courseSnap = await getDoc(doc(db, "courses", courseId));
  if (!courseSnap.exists()) return;
  const course = courseSnap.data();

  // Fetch user details
  const userSnap = await getDoc(doc(db, "users", userId));
  const user = userSnap.exists() ? userSnap.data() : {};

  await addDoc(collection(db, "certificates"), {
    userId,
    userName: user.fullName || user.displayName || "Learner",
    courseId,
    courseTitle: course.title || "Completed Course",
    category:   course.category || "General",
    skills:     course.skills || course.tags || [],
    instructor: course.instructor || course.tutorName || "AmTechy Instructor",
    completed:  true,
    completionDate: serverTimestamp(),
    issueDate:      serverTimestamp(),
    certificateNumber: `CERT-${courseId.slice(0, 6).toUpperCase()}-${Date.now()}`,
  });

  console.log("✅ Certificate issued for course:", courseId);
};