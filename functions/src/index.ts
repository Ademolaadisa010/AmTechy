import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import {
  onDocumentCreated,
  FirestoreEvent,
  QueryDocumentSnapshot,
} from "firebase-functions/v2/firestore";
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";

admin.initializeApp();
const db = admin.firestore();

// ── Nodemailer transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // your-email@gmail.com
    pass: process.env.EMAIL_PASSWORD, // your Gmail app password
  },
});

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Announcement {
  title: string;
  message: string;
  type: "general" | "enrollment" | "completion" | "progress" | "reminder";
  targetAudience: "all" | "students" | "tutors" | "premium-users";
  status: string;
  priority: string;
}

interface User {
  email: string;
  isTutor?: boolean;
  isPremium?: boolean;
  fullName?: string;
  displayName?: string;
  role?: string;
}

interface SendEmailData {
  announcementId: string;
  recipientEmail: string;
}

// ── Firestore trigger: runs when a new announcement is created ────────────────
export const onAnnouncementCreate = onDocumentCreated(
  "announcements/{announcementId}",
  async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data in snapshot, skipping.");
      return;
    }

    const announcement = snap.data() as Announcement;

    if (announcement.status !== "active") {
      console.log("Announcement is inactive, skipping email.");
      return;
    }

    try {
      const users = await getUsersByAudience(announcement.targetAudience);
      console.log(`Sending announcement to ${users.length} users`);

      // Send in batches of 10 to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await Promise.all(
          batch.map((user) =>
            sendEmail(user, announcement).catch((err) => {
              console.error(`Failed to send email to ${user.email}:`, err);
            })
          )
        );
      }

      console.log("✅ All announcement emails sent successfully");
    } catch (error) {
      console.error("Error sending announcement emails:", error);
      throw error;
    }
  }
);

// ── Callable: admin manually sends email to a specific user ──────────────────
export const sendAnnouncementEmailCallable = onCall(
  async (request: CallableRequest<SendEmailData>) => {
    // Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { announcementId, recipientEmail } = request.data;

    // Verify caller is admin
    const callerDoc = await db.collection("users").doc(request.auth.uid).get();
    const callerData = callerDoc.data() as User | undefined;

    if (callerData?.role !== "admin") {
      throw new HttpsError("permission-denied", "Only admins can send emails.");
    }

    // Fetch announcement
    const announcementDoc = await db
      .collection("announcements")
      .doc(announcementId)
      .get();

    if (!announcementDoc.exists) {
      throw new HttpsError("not-found", "Announcement not found.");
    }

    // Fetch recipient
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", recipientEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      throw new HttpsError("not-found", "User not found.");
    }

    const user = usersSnapshot.docs[0].data() as User;
    const announcement = announcementDoc.data() as Announcement;

    await sendEmail(user, announcement);

    return { success: true, message: "Email sent successfully." };
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fetch users filtered by target audience */
async function getUsersByAudience(targetAudience: string): Promise<User[]> {
  const usersRef = db.collection("users");

  // Build the right query per audience — typed as Query not CollectionReference
  let firestoreQuery: admin.firestore.Query<admin.firestore.DocumentData>;

  switch (targetAudience) {
    case "students":
      firestoreQuery = usersRef.where("isTutor", "==", false);
      break;
    case "tutors":
      firestoreQuery = usersRef.where("isTutor", "==", true);
      break;
    case "premium-users":
      firestoreQuery = usersRef.where("isPremium", "==", true);
      break;
    default: // "all"
      firestoreQuery = usersRef;
      break;
  }

  const snapshot = await firestoreQuery.get();
  const users: User[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data() as User;
    if (data.email) users.push(data);
  });

  return users;
}

/** Send a single announcement email */
async function sendEmail(user: User, announcement: Announcement): Promise<void> {
  const recipientName = user.fullName || user.displayName || "User";
  const subject      = getEmailSubject(announcement.type, announcement.title);
  const html         = generateEmailHTML(recipientName, announcement);

  await transporter.sendMail({
    from: `"AmTechy" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject,
    html,
  });

  console.log(`✅ Email sent to ${user.email}`);
}

/** Subject line per announcement type */
function getEmailSubject(type: string, title: string): string {
  const subjects: Record<string, string> = {
    general:    `📢 ${title}`,
    enrollment: `📚 ${title}`,
    completion: `🎓 ${title}`,
    progress:   `📈 ${title}`,
    reminder:   `⏰ ${title}`,
  };
  return subjects[type] ?? title;
}

/** Emoji icon per announcement type */
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    general:    "📢",
    enrollment: "📚",
    completion: "🎓",
    progress:   "📈",
    reminder:   "⏰",
  };
  return icons[type] ?? "📧";
}

/** CTA button per announcement type */
function getActionButton(type: string): string {
  const buttons: Record<string, string> = {
    general:    `<p><a href="https://amtechy.com/dashboard"    class="button">Go to Dashboard</a></p>`,
    enrollment: `<p><a href="https://amtechy.com/courses"      class="button">View Courses</a></p>`,
    completion: `<p><a href="https://amtechy.com/certificates" class="button">Get Your Certificate</a></p>`,
    progress:   `<p><a href="https://amtechy.com/progress"     class="button">View Your Progress</a></p>`,
    reminder:   `<p><a href="https://amtechy.com/dashboard"    class="button">Take Action Now</a></p>`,
  };
  return buttons[type] ?? "";
}

/** Full HTML email template */
function generateEmailHTML(name: string, announcement: Announcement): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; color: #333; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 28px auto; background: #fff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; padding: 44px 24px; text-align: center; }
        .header .icon { font-size: 36px; margin-bottom: 12px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 40px; }
        .greeting { font-size: 17px; margin-bottom: 20px; }
        .message { background: #f8f8ff; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 15px; line-height: 1.8; }
        .button { display: inline-block; background: #4f46e5; color: #fff !important; padding: 13px 34px; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 20px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; }
        .footer a { color: #4f46e5; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">${getTypeIcon(announcement.type)}</div>
          <h1>${announcement.title}</h1>
        </div>
        <div class="content">
          <p class="greeting">Hi ${name},</p>
          <div class="message">${announcement.message}</div>
          ${getActionButton(announcement.type)}
          <p style="color:#666;font-size:14px;margin-top:32px;">
            Best regards,<br />
            <strong>The AmTechy Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>You received this email because you're part of the AmTechy community.</p>
          <p><a href="https://amtechy.com/manage-preferences">Manage email preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}