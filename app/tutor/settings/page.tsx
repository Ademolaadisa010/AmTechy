"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updatePassword, updateEmail } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

type SettingsTab = "profile" | "pricing" | "notifications" | "account" | "privacy" | "payment";

interface TutorProfile {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  tagline: string;
  expertise: string[];
  experience: string;
  education: string;
  languages: string[];
  timezone: string;
  profilePhoto?: string;
}

interface PricingSettings {
  hourlyRate: number;
  groupRate: number;
  packageRates: {
    hours5: number;
    hours10: number;
    hours20: number;
  };
}

interface NotificationSettings {
  emailNotifications: {
    newBooking: boolean;
    bookingConfirmed: boolean;
    bookingCancelled: boolean;
    newMessage: boolean;
    newReview: boolean;
    paymentReceived: boolean;
  };
  smsNotifications: {
    upcomingSession: boolean;
    bookingRequest: boolean;
  };
  marketingEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
  allowReviews: boolean;
}

export default function TutorSettings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Settings
  const [profile, setProfile] = useState<TutorProfile>({
    displayName: "",
    email: "",
    phone: "",
    bio: "",
    tagline: "",
    expertise: [],
    experience: "",
    education: "",
    languages: [],
    timezone: "America/New_York",
  });

  // Pricing Settings
  const [pricing, setPricing] = useState<PricingSettings>({
    hourlyRate: 50,
    groupRate: 35,
    packageRates: {
      hours5: 225,
      hours10: 450,
      hours20: 850,
    },
  });

  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: {
      newBooking: true,
      bookingConfirmed: true,
      bookingCancelled: true,
      newMessage: true,
      newReview: true,
      paymentReceived: true,
    },
    smsNotifications: {
      upcomingSession: true,
      bookingRequest: true,
    },
    marketingEmails: false,
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowReviews: true,
  });

  // Account Settings
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  // New fields
  const [newExpertise, setNewExpertise] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchSettings(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSettings = async (userId: string) => {
    try {
      // Fetch tutor profile
      const profileDoc = await getDoc(doc(db, "tutor_profiles", userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setProfile({
          displayName: data.displayName || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          tagline: data.tagline || "",
          expertise: data.expertise || [],
          experience: data.experience || "",
          education: data.education || "",
          languages: data.languages || ["English"],
          timezone: data.timezone || "America/New_York",
          profilePhoto: data.profilePhoto,
        });

        if (data.pricing) {
          setPricing({
            hourlyRate: data.pricing.hourlyRate || 50,
            groupRate: data.pricing.groupRate || 35,
            packageRates: {
              hours5: data.pricing.packageRates?.hours5 || 225,
              hours10: data.pricing.packageRates?.hours10 || 450,
              hours20: data.pricing.packageRates?.hours20 || 850,
            },
          });
        }
      }

      // Set email from Firebase Auth
      if (auth.currentUser) {
        setProfile((prev) => ({
          ...prev,
          email: auth.currentUser?.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileRef = doc(db, "tutor_profiles", user.uid);
      await updateDoc(profileRef, {
        displayName: profile.displayName,
        phone: profile.phone,
        bio: profile.bio,
        tagline: profile.tagline,
        expertise: profile.expertise,
        experience: profile.experience,
        education: profile.education,
        languages: profile.languages,
        timezone: profile.timezone,
        updatedAt: new Date(),
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePricing = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileRef = doc(db, "tutor_profiles", user.uid);
      await updateDoc(profileRef, {
        pricing,
        updatedAt: new Date(),
      });

      alert("Pricing updated successfully!");
    } catch (error) {
      console.error("Error updating pricing:", error);
      alert("Failed to update pricing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileRef = doc(db, "tutor_profiles", user.uid);
      await updateDoc(profileRef, {
        notificationSettings: notifications,
        updatedAt: new Date(),
      });

      alert("Notification settings updated successfully!");
    } catch (error) {
      console.error("Error updating notifications:", error);
      alert("Failed to update notification settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileRef = doc(db, "tutor_profiles", user.uid);
      await updateDoc(profileRef, {
        privacySettings,
        updatedAt: new Date(),
      });

      alert("Privacy settings updated successfully!");
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      alert("Failed to update privacy settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setSaving(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      alert("Password updated successfully!");
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === "auth/requires-recent-login") {
        alert("Please log out and log back in before changing your password.");
      } else {
        alert("Failed to update password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, newExpertise.trim()],
      });
      setNewExpertise("");
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setProfile({
      ...profile,
      expertise: profile.expertise.filter((e) => e !== item),
    });
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile({
        ...profile,
        languages: [...profile.languages, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    if (profile.languages.length > 1) {
      setProfile({
        ...profile,
        languages: profile.languages.filter((l) => l !== lang),
      });
    }
  };

  const handleDeactivateAccount = () => {
    if (
      confirm(
        "Are you sure you want to deactivate your account? This action can be reversed by contacting support."
      )
    ) {
      alert("Account deactivation feature coming soon. Please contact support for assistance.");
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push("/tutor/dashboard")}
              className="flex items-center text-slate-600 hover:text-slate-900 mb-2"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "profile"
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-user"></i>
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab("pricing")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "pricing"
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-dollar-sign"></i>
                  <span>Pricing</span>
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "notifications"
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-bell"></i>
                  <span>Notifications</span>
                </button>

                <button
                  onClick={() => setActiveTab("privacy")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "privacy"
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-lock"></i>
                  <span>Privacy</span>
                </button>

                <button
                  onClick={() => setActiveTab("account")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "account"
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-gear"></i>
                  <span>Account</span>
                </button>

                <button
                  onClick={() => setActiveTab("payment")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "payment"
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <i className="fa-solid fa-credit-card"></i>
                  <span>Payment Methods</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Profile Information
                </h2>

                <div className="space-y-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) =>
                        setProfile({ ...profile, displayName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Expert JavaScript Developer & Educator"
                      value={profile.tagline}
                      onChange={(e) =>
                        setProfile({ ...profile, tagline: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell students about yourself, your teaching style, and experience..."
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>

                  {/* Expertise */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Areas of Expertise
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="e.g., React, Python, Data Science"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddExpertise()}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddExpertise}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {item}
                          <button
                            onClick={() => handleRemoveExpertise(item)}
                            className="hover:text-indigo-900"
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 5+ years"
                      value={profile.experience}
                      onChange={(e) =>
                        setProfile({ ...profile, experience: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Education
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., BS Computer Science, MIT"
                      value={profile.education}
                      onChange={(e) =>
                        setProfile({ ...profile, education: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    />
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Languages
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="e.g., Spanish, French"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddLanguage()}
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddLanguage}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {lang}
                          <button
                            onClick={() => handleRemoveLanguage(lang)}
                            className="hover:text-green-900"
                            disabled={profile.languages.length === 1}
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) =>
                        setProfile({ ...profile, timezone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    >
                      <option value="America/New_York">EST (GMT-5)</option>
                      <option value="America/Chicago">CST (GMT-6)</option>
                      <option value="America/Denver">MST (GMT-7)</option>
                      <option value="America/Los_Angeles">PST (GMT-8)</option>
                      <option value="Europe/London">GMT (GMT+0)</option>
                      <option value="Europe/Paris">CET (GMT+1)</option>
                      <option value="Asia/Dubai">GST (GMT+4)</option>
                      <option value="Asia/Kolkata">IST (GMT+5:30)</option>
                      <option value="Asia/Singapore">SGT (GMT+8)</option>
                      <option value="Asia/Tokyo">JST (GMT+9)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-save mr-2"></i>
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Pricing Settings */}
            {activeTab === "pricing" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Pricing Settings
                </h2>

                <div className="space-y-6">
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hourly Rate (1-on-1 Sessions)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={pricing.hourlyRate}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            hourlyRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Standard rate for individual tutoring sessions
                    </p>
                  </div>

                  {/* Group Rate */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Group Session Rate (per person)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={pricing.groupRate}
                        onChange={(e) =>
                          setPricing({
                            ...pricing,
                            groupRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Rate per student for group sessions (2+ students)
                    </p>
                  </div>

                  {/* Package Pricing */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Package Pricing
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            5 Hours Package
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                              $
                            </span>
                            <input
                              type="number"
                              min="50"
                              step="25"
                              value={pricing.packageRates.hours5}
                              onChange={(e) =>
                                setPricing({
                                  ...pricing,
                                  packageRates: {
                                    ...pricing.packageRates,
                                    hours5: parseFloat(e.target.value),
                                  },
                                })
                              }
                              className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 pt-6">
                          Save {((1 - pricing.packageRates.hours5 / (pricing.hourlyRate * 5)) * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            10 Hours Package
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                              $
                            </span>
                            <input
                              type="number"
                              min="100"
                              step="50"
                              value={pricing.packageRates.hours10}
                              onChange={(e) =>
                                setPricing({
                                  ...pricing,
                                  packageRates: {
                                    ...pricing.packageRates,
                                    hours10: parseFloat(e.target.value),
                                  },
                                })
                              }
                              className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 pt-6">
                          Save {((1 - pricing.packageRates.hours10 / (pricing.hourlyRate * 10)) * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            20 Hours Package
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                              $
                            </span>
                            <input
                              type="number"
                              min="200"
                              step="100"
                              value={pricing.packageRates.hours20}
                              onChange={(e) =>
                                setPricing({
                                  ...pricing,
                                  packageRates: {
                                    ...pricing.packageRates,
                                    hours20: parseFloat(e.target.value),
                                  },
                                })
                              }
                              className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 pt-6">
                          Save {((1 - pricing.packageRates.hours20 / (pricing.hourlyRate * 20)) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <i className="fa-solid fa-lightbulb mr-2"></i>
                      Tip: Offer package discounts to encourage students to book
                      multiple sessions upfront.
                    </p>
                  </div>

                  <button
                    onClick={handleSavePricing}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-save mr-2"></i>
                        Save Pricing
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(notifications.emailNotifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-slate-900">
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </div>
                              <div className="text-sm text-slate-600">
                                Receive email when this happens
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setNotifications({
                                  ...notifications,
                                  emailNotifications: {
                                    ...notifications.emailNotifications,
                                    [key]: !value,
                                  },
                                })
                              }
                              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                value ? "bg-indigo-600" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                  value ? "translate-x-7" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      SMS Notifications
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(notifications.smsNotifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-slate-900">
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </div>
                              <div className="text-sm text-slate-600">
                                Receive SMS when this happens
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setNotifications({
                                  ...notifications,
                                  smsNotifications: {
                                    ...notifications.smsNotifications,
                                    [key]: !value,
                                  },
                                })
                              }
                              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                value ? "bg-indigo-600" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                  value ? "translate-x-7" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Marketing Emails */}
                  <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">
                          Marketing Emails
                        </div>
                        <div className="text-sm text-slate-600">
                          Receive tips, updates, and promotional content
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({
                            ...notifications,
                            marketingEmails: !notifications.marketingEmails,
                          })
                        }
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          notifications.marketingEmails
                            ? "bg-indigo-600"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            notifications.marketingEmails
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-save mr-2"></i>
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Privacy Settings
                </h2>

                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Profile Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          setPrivacySettings({
                            ...privacySettings,
                            profileVisibility: "public",
                          })
                        }
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          privacySettings.profileVisibility === "public"
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <i className="fa-solid fa-globe text-2xl text-indigo-600 mb-2"></i>
                        <div className="font-medium text-slate-900 text-sm">
                          Public
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Visible to everyone
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          setPrivacySettings({
                            ...privacySettings,
                            profileVisibility: "private",
                          })
                        }
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          privacySettings.profileVisibility === "private"
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <i className="fa-solid fa-lock text-2xl text-indigo-600 mb-2"></i>
                        <div className="font-medium text-slate-900 text-sm">
                          Private
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Hidden from search
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Show Email Address
                          </div>
                          <div className="text-sm text-slate-600">
                            Display email on your public profile
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setPrivacySettings({
                              ...privacySettings,
                              showEmail: !privacySettings.showEmail,
                            })
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            privacySettings.showEmail
                              ? "bg-indigo-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              privacySettings.showEmail
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Show Phone Number
                          </div>
                          <div className="text-sm text-slate-600">
                            Display phone on your public profile
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setPrivacySettings({
                              ...privacySettings,
                              showPhone: !privacySettings.showPhone,
                            })
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            privacySettings.showPhone
                              ? "bg-indigo-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              privacySettings.showPhone
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interaction Settings */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Interactions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Allow Messages
                          </div>
                          <div className="text-sm text-slate-600">
                            Students can send you direct messages
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setPrivacySettings({
                              ...privacySettings,
                              allowMessages: !privacySettings.allowMessages,
                            })
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            privacySettings.allowMessages
                              ? "bg-indigo-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              privacySettings.allowMessages
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Allow Reviews
                          </div>
                          <div className="text-sm text-slate-600">
                            Students can leave reviews on your profile
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setPrivacySettings({
                              ...privacySettings,
                              allowReviews: !privacySettings.allowReviews,
                            })
                          }
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            privacySettings.allowReviews
                              ? "bg-indigo-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              privacySettings.allowReviews
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSavePrivacy}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-save mr-2"></i>
                        Save Privacy Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Account Settings
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Contact support to change your email address
                    </p>
                  </div>

                  {/* Change Password */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                      Change Password
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        />
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={
                          saving ||
                          !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword
                        }
                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-key mr-2"></i>
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-red-200 pt-6">
                    <h3 className="font-semibold text-red-900 mb-4">
                      Danger Zone
                    </h3>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="mb-4">
                        <h4 className="font-medium text-red-900 mb-1">
                          Deactivate Account
                        </h4>
                        <p className="text-sm text-red-700">
                          Temporarily deactivate your account. You can reactivate
                          anytime by contacting support.
                        </p>
                      </div>
                      <button
                        onClick={handleDeactivateAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        <i className="fa-solid fa-user-slash mr-2"></i>
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {activeTab === "payment" && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Payment Methods
                </h2>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <i className="fa-solid fa-info-circle mr-2"></i>
                      Configure how you receive payments from students. All
                      transactions are processed securely.
                    </p>
                  </div>

                  {/* Bank Account */}
                  <div className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-building-columns text-indigo-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Bank Account
                          </h3>
                          <p className="text-sm text-slate-600">
                            Direct bank transfer
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Add Account
                      </button>
                    </div>
                    <p className="text-sm text-slate-600">
                      No bank account connected
                    </p>
                  </div>

                  {/* PayPal */}
                  <div className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fa-brands fa-paypal text-blue-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">PayPal</h3>
                          <p className="text-sm text-slate-600">
                            Fast and secure payments
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Connect PayPal
                      </button>
                    </div>
                    <p className="text-sm text-slate-600">
                      No PayPal account connected
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">
                      Payment Processing
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Platform fee: 15% per transaction</li>
                      <li>• Payouts processed weekly</li>
                      <li>• Minimum payout: $50</li>
                      <li>• Payment security by Stripe</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}