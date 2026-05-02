import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Simple email template
function generateEmail(name: string, title: string, message: string): string {
  return `
    <h2>${title}</h2>
    <p>Hi ${name},</p>
    <p>${message}</p>
    <p>Best regards,<br>The AmTechy Team</p>
  `;
}

export async function POST(request: NextRequest) {
  console.log("API Route: POST /api/send-announcement-email");

  try {
    // Parse JSON
    const body = await request.json();
    const { announcementId } = body;

    if (!announcementId) {
      console.log("Missing announcementId");
      return NextResponse.json(
        { error: "announcementId is required" },
        { status: 400 }
      );
    }

    console.log("Getting announcement:", announcementId);

    // Get announcement from Firestore
    const announcementRef = doc(db, "announcements", announcementId);
    const announcementSnap = await getDoc(announcementRef);

    if (!announcementSnap.exists()) {
      console.log("Announcement not found");
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const announcement = announcementSnap.data();
    console.log("Announcement found:", announcement.title);

    // Get users
    let usersQuery;

    if (announcement.targetAudience === "students") {
      usersQuery = query(collection(db, "users"), where("isTutor", "==", false));
    } else if (announcement.targetAudience === "tutors") {
      usersQuery = query(collection(db, "users"), where("isTutor", "==", true));
    } else if (announcement.targetAudience === "premium-users") {
      usersQuery = query(collection(db, "users"), where("isPremium", "==", true));
    } else {
      // all users
      usersQuery = collection(db, "users");
    }

    const usersSnapshot = await getDocs(usersQuery);
    const users: any[] = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email) {
        users.push(userData);
      }
    });

    console.log(`Found ${users.length} users to send to`);

    // Send emails
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        const recipientName = user.fullName || user.displayName || "User";
        const emailHtml = generateEmail(
          recipientName,
          announcement.title,
          announcement.message
        );

        await transporter.sendMail({
          from: `"AmTechy" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `📢 ${announcement.title}`,
          html: emailHtml,
        });

        successCount++;
        console.log(`✅ Email sent to ${user.email}`);
      } catch (emailError) {
        failureCount++;
        console.error(`❌ Failed to send email to ${user.email}:`, emailError);
      }
    }

    console.log(`Sending complete: ${successCount} success, ${failureCount} failed`);

    // Update announcement
    try {
      await updateDoc(announcementRef, {
        emailSent: true,
        emailCount: successCount,
        emailFailures: failureCount,
        emailSentAt: serverTimestamp(),
      });
      console.log("Announcement updated");
    } catch (updateError) {
      console.error("Error updating announcement:", updateError);
    }

    // Return success response
    const responseData = {
      success: true,
      message: "Emails sent successfully",
      totalUsers: users.length,
      successCount,
      failureCount,
    };

    console.log("Returning response:", responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in API route:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { 
        error: "Failed to send emails",
        details: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}