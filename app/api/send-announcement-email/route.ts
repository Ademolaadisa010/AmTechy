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

// ✅ Convert plain text to proper HTML preserving formatting
function formatMessageToHtml(message: string): string {
  const lines = message.split("\n");
  let html = "";
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // ✅ Detect bullet/list lines: -, *, •, 1., 2., etc.
    const isBullet = /^(\s*)[-*•]\s+(.+)/.test(line);
    const isNumbered = /^(\s*)\d+[.)]\s+(.+)/.test(line);
    const isEmpty = line.trim() === "";

    if (isBullet || isNumbered) {
      if (!inList) {
        html += `<ul style="margin: 12px 0; padding-left: 24px;">`;
        inList = true;
      }
      // Extract text after bullet/number
      const text = line.replace(/^(\s*)[-*•\d.)\s]+/, "").trim();
      html += `<li style="margin-bottom: 6px; color: #374151; font-size: 15px; line-height: 1.6;">${escapeHtml(text)}</li>`;
    } else {
      // Close list if open
      if (inList) {
        html += `</ul>`;
        inList = false;
      }

      if (isEmpty) {
        // ✅ Empty line = paragraph gap
        html += `<div style="height: 12px;"></div>`;
      } else {
        // ✅ Normal line = paragraph
        html += `<p style="margin: 0 0 8px 0; color: #374151; font-size: 15px; line-height: 1.7;">${escapeHtml(line)}</p>`;
      }
    }
  }

  // Close any open list
  if (inList) html += `</ul>`;

  return html;
}

// ✅ Escape special HTML characters
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ✅ Professional email template
function generateEmail(name: string, title: string, message: string): string {
  const formattedMessage = formatMessageToHtml(message);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 40px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 8px 20px; margin-bottom: 16px;">
                <span style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">AmTechy</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 36px 40px 0 40px;">
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                Hi ${escapeHtml(name)}, 👋
              </p>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0; padding: 20px 24px; margin-bottom: 24px;">
                ${formattedMessage}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">
                This message was sent from the AmTechy platform.
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px;">
                Best regards, <strong style="color: #4f46e5;">The AmTechy Team</strong>
              </p>
              <div style="margin-top: 16px;">
                <a href="https://amtechy.name.ng" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;">
                  Visit AmTechy
                </a>
              </div>
              <p style="margin: 20px 0 0 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} AmTechy. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  console.log("API Route: POST /api/send-announcement-email");

  try {
    const body = await request.json();
    const { announcementId } = body;

    if (!announcementId) {
      return NextResponse.json(
        { error: "announcementId is required" },
        { status: 400 }
      );
    }

    console.log("Getting announcement:", announcementId);

    const announcementRef = doc(db, "announcements", announcementId);
    const announcementSnap = await getDoc(announcementRef);

    if (!announcementSnap.exists()) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const announcement = announcementSnap.data();
    console.log("Announcement found:", announcement.title);

    // Get users by target audience
    let usersQuery;
    if (announcement.targetAudience === "students") {
      usersQuery = query(collection(db, "users"), where("isTutor", "==", false));
    } else if (announcement.targetAudience === "tutors") {
      usersQuery = query(collection(db, "users"), where("isTutor", "==", true));
    } else if (announcement.targetAudience === "premium-users") {
      usersQuery = query(collection(db, "users"), where("isPremium", "==", true));
    } else {
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

    console.log(`Found ${users.length} users to email`);

    let successCount = 0;
    let failureCount = 0;

    // Send in batches of 5
    const batchSize = 5;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (user) => {
          try {
            const recipientName = user.fullName || user.displayName || "Learner";
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
            console.log(`✅ Sent to ${user.email}`);
          } catch (emailError) {
            failureCount++;
            console.error(`❌ Failed for ${user.email}:`, emailError);
          }
        })
      );
    }

    console.log(`Done: ${successCount} sent, ${failureCount} failed`);

    // Update announcement doc
    try {
      await updateDoc(announcementRef, {
        emailSent: true,
        emailCount: successCount,
        emailFailures: failureCount,
        emailSentAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error("Error updating announcement:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully",
      totalUsers: users.length,
      successCount,
      failureCount,
    });
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