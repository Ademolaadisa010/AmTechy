"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function TutorProfileSetup() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  // Profile Info
  const [shortBio, setShortBio] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [teachingPhilosophy, setTeachingPhilosophy] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Pricing
  const [hourlyRate, setHourlyRate] = useState("");
  const [thirtyMinRate, setThirtyMinRate] = useState("");
  const [twoHourRate, setTwoHourRate] = useState("");
  const [packageDiscount, setPackageDiscount] = useState("0");

  // Availability
  const [timezone, setTimezone] = useState("UTC");
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: { available: false, hours: [] as string[] },
    tuesday: { available: false, hours: [] as string[] },
    wednesday: { available: false, hours: [] as string[] },
    thursday: { available: false, hours: [] as string[] },
    friday: { available: false, hours: [] as string[] },
    saturday: { available: false, hours: [] as string[] },
    sunday: { available: false, hours: [] as string[] },
  });
  const [bufferTime, setBufferTime] = useState("15");

  // Specializations
  const [topicsCovered, setTopicsCovered] = useState<string[]>([]);
  const [learningObjectives, setLearningObjectives] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const totalSteps = 4;
  const languageOptions = ["English", "Spanish", "French", "German", "Portuguese", "Chinese", "Arabic", "Hindi"];
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Check if application is approved
        const applicationDoc = await getDoc(doc(db, "tutor_applications", currentUser.uid));
        if (!applicationDoc.exists() || applicationDoc.data().status !== "approved") {
          router.push("/tutor/application-status");
          return;
        }

        // Check if profile already completed
        const profileDoc = await getDoc(doc(db, "tutor_profiles", currentUser.uid));
        if (profileDoc.exists() && profileDoc.data().setupCompleted) {
          router.push("/tutor/dashboard");
          return;
        }

        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLanguageToggle = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleDayToggle = (day: keyof typeof weeklySchedule) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day],
        available: !weeklySchedule[day].available,
      },
    });
  };

  const handleTimeSlotToggle = (day: keyof typeof weeklySchedule, time: string) => {
    const daySchedule = weeklySchedule[day];
    const hours = daySchedule.hours.includes(time)
      ? daySchedule.hours.filter(h => h !== time)
      : [...daySchedule.hours, time];
    
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: { ...daySchedule, hours },
    });
  };

  const handleTopicToggle = (topic: string) => {
    if (topicsCovered.includes(topic)) {
      setTopicsCovered(topicsCovered.filter(t => t !== topic));
    } else {
      setTopicsCovered([...topicsCovered, topic]);
    }
  };

  const calculateRates = (hourly: string) => {
    const rate = parseFloat(hourly);
    if (!isNaN(rate)) {
      setThirtyMinRate((rate * 0.5).toFixed(2));
      setTwoHourRate((rate * 2).toFixed(2));
    }
  };

  const validateStep = () => {
    switch(step) {
      case 1:
        return shortBio.length >= 50 && longDescription.length >= 200 && languages.length > 0;
      case 2:
        return hourlyRate && parseFloat(hourlyRate) > 0;
      case 3:
        return Object.values(weeklySchedule).some(day => day.available && day.hours.length > 0);
      case 4:
        return topicsCovered.length > 0 && learningObjectives.length >= 50;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert("Please fill in all required fields");
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        userId: user.uid,
        profile: {
          shortBio,
          longDescription,
          teachingPhilosophy,
          languages,
          videoUrl,
        },
        pricing: {
          hourlyRate: parseFloat(hourlyRate),
          thirtyMinRate: parseFloat(thirtyMinRate),
          twoHourRate: parseFloat(twoHourRate),
          packageDiscount: parseInt(packageDiscount),
        },
        availability: {
          timezone,
          weeklySchedule,
          bufferTime: parseInt(bufferTime),
        },
        specializations: {
          topicsCovered,
          learningObjectives,
          targetAudience,
        },
        status: "active",
        verified: false,
        setupCompleted: true,
        totalSessions: 0,
        totalStudents: 0,
        rating: 0,
        reviewCount: 0,
        totalEarnings: 0,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "tutor_profiles", user.uid), profileData);
      await setDoc(doc(db, "tutors", user.uid), {
        name: user.displayName || "Tutor",
        title: profileData.profile.shortBio.substring(0, 50),
        bio: profileData.profile.longDescription,
        skills: topicsCovered,
        rating: 0,
        reviewCount: 0,
        hourlyRate: parseFloat(hourlyRate),
        availability: "Available",
        verified: false,
        status: "active",
      });

      router.push("/tutor/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
          <p className="text-lg text-slate-600">Set up your tutor profile to start teaching</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-700">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {Math.round((step / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            {["Profile", "Pricing", "Availability", "Specializations"].map((label, idx) => (
              <div
                key={idx}
                className={`text-center text-xs font-medium ${
                  step > idx + 1 ? "text-green-600" : step === idx + 1 ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {step > idx + 1 && <i className="fa-solid fa-check-circle mr-1"></i>}
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          {/* Step 1: Profile & Bio */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile & Introduction</h2>
                <p className="text-slate-600">Tell students about yourself</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Short Bio (Tagline) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Expert React Developer with 10 years experience"
                />
                <p className="text-xs text-slate-500 mt-1">{shortBio.length}/100 characters (min 50)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Tell students about your background, experience, and what they can expect from your sessions..."
                />
                <p className="text-xs text-slate-500 mt-1">{longDescription.length} characters (min 200)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Teaching Philosophy (optional)
                </label>
                <textarea
                  value={teachingPhilosophy}
                  onChange={(e) => setTeachingPhilosophy(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="What's your approach to teaching? What makes your style unique?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Languages You Teach In <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        languages.includes(lang)
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {languages.includes(lang) && <i className="fa-solid fa-check mr-2"></i>}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Introduction Video URL (optional)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-slate-500 mt-1">YouTube, Vimeo, or Loom link</p>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Your Pricing</h2>
                <p className="text-slate-600">How much will you charge for sessions?</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-700">
                  <i className="fa-solid fa-lightbulb text-blue-600 mr-2"></i>
                  <strong>Tip:</strong> Research similar tutors in your field. Most tutors charge between $30-$100 per hour.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hourly Rate (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => {
                      setHourlyRate(e.target.value);
                      calculateRates(e.target.value);
                    }}
                    min="0"
                    step="5"
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-semibold"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    30 Minutes
                  </label>
                  <div className="text-2xl font-bold text-indigo-600">
                    ${thirtyMinRate || "0.00"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Auto-calculated (50% of hourly)</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    2 Hours
                  </label>
                  <div className="text-2xl font-bold text-indigo-600">
                    ${twoHourRate || "0.00"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Auto-calculated (2x hourly)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Package Discount (optional)
                </label>
                <select
                  value={packageDiscount}
                  onChange={(e) => setPackageDiscount(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="0">No discount</option>
                  <option value="5">5% off for 5+ sessions</option>
                  <option value="10">10% off for 10+ sessions</option>
                  <option value="15">15% off for 15+ sessions</option>
                  <option value="20">20% off for 20+ sessions</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Your Availability</h2>
                <p className="text-slate-600">When are you available to teach?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Africa/Lagos">Lagos (WAT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Weekly Schedule <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {Object.entries(weeklySchedule).map(([day, schedule]) => (
                    <div key={day} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule.available}
                            onChange={() => handleDayToggle(day as keyof typeof weeklySchedule)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="font-semibold text-slate-900 capitalize">{day}</span>
                        </label>
                      </div>
                      {schedule.available && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeSlotToggle(day as keyof typeof weeklySchedule, time)}
                              className={`px-3 py-1 text-sm rounded-lg font-medium transition-all ${
                                schedule.hours.includes(time)
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Buffer Time Between Sessions
                </label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="0">No buffer</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Specializations</h2>
                <p className="text-slate-600">What topics do you teach?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Topics You Cover <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["React Basics", "Advanced JavaScript", "Python Programming", "Data Structures", "Algorithms", "Web Development", "Mobile Development", "UI/UX Design", "Database Design", "API Development", "Testing", "DevOps"].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleTopicToggle(topic)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        topicsCovered.includes(topic)
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {topicsCovered.includes(topic) && <i className="fa-solid fa-check mr-2"></i>}
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Learning Objectives <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="What will students learn from you? What skills will they gain?"
                />
                <p className="text-xs text-slate-500 mt-1">{learningObjectives.length} characters (min 50)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Audience (optional)
                </label>
                <textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Who are your ideal students? e.g., Beginners, Professionals, Career changers..."
                />
              </div>

              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-check-circle text-green-600 text-2xl mt-1"></i>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Almost there!</h3>
                    <p className="text-sm text-slate-700 mb-3">
                      Once you complete your profile, you'll be able to:
                    </p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>✓ Start accepting bookings from students</li>
                      <li>✓ Set your own schedule and rates</li>
                      <li>✓ Earn money teaching what you love</li>
                      <li>✓ Build your reputation with reviews</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Next Step
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                <span>
                  <i className="fa-solid fa-rocket mr-2"></i>
                  Complete Setup & Go Live
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}