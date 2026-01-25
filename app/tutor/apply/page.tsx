"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function TutorApplication() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  // Professional Background
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Expertise
  const [primarySkills, setPrimarySkills] = useState<string[]>([]);
  const [teachingSubjects, setTeachingSubjects] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("intermediate");

  // Teaching Experience
  const [taughtBefore, setTaughtBefore] = useState("");
  const [teachingLocation, setTeachingLocation] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");

  // Motivation
  const [whyTeach, setWhyTeach] = useState("");
  const [whatMakesGreat, setWhatMakesGreat] = useState("");
  const [availability, setAvailability] = useState("");

  const skillOptions = [
    "React", "JavaScript", "Python", "Java", "Node.js", "TypeScript",
    "UI/UX Design", "Data Science", "Machine Learning", "Mobile Development",
    "DevOps", "Cloud Computing", "Cybersecurity", "Blockchain", "AI",
    "Backend Development", "Frontend Development", "Full Stack", "Database",
  ];

  const subjectOptions = [
    "Web Development", "Mobile Development", "Data Science", "Machine Learning",
    "UI/UX Design", "Digital Marketing", "Business", "Photography",
    "Video Editing", "Graphic Design", "Game Development", "Cloud Computing",
  ];

  const totalSteps = 5;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || "");
        
        // Check if already applied
        const tutorDoc = await getDoc(doc(db, "tutor_applications", currentUser.uid));
        if (tutorDoc.exists()) {
          router.push("/tutor/application-status");
          return;
        }
        
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSkillToggle = (skill: string) => {
    if (primarySkills.includes(skill)) {
      setPrimarySkills(primarySkills.filter(s => s !== skill));
    } else {
      setPrimarySkills([...primarySkills, skill]);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    if (teachingSubjects.includes(subject)) {
      setTeachingSubjects(teachingSubjects.filter(s => s !== subject));
    } else {
      setTeachingSubjects([...teachingSubjects, subject]);
    }
  };

  const validateStep = () => {
    switch(step) {
      case 1:
        return fullName && email && phone && location;
      case 2:
        return jobTitle && company && yearsExperience;
      case 3:
        return primarySkills.length > 0 && teachingSubjects.length > 0;
      case 4:
        return taughtBefore && teachingLocation && studentsCount && teachingStyle;
      case 5:
        return whyTeach && whatMakesGreat && availability;
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

    setSubmitting(true);

    try {
      const applicationData = {
        userId: user.uid,
        personalInfo: {
          fullName,
          email,
          phone,
          location,
          profilePhoto,
        },
        professionalBackground: {
          jobTitle,
          company,
          yearsExperience: parseInt(yearsExperience),
          linkedIn,
          portfolio,
        },
        expertise: {
          primarySkills,
          teachingSubjects,
          experienceLevel,
        },
        teachingExperience: {
          taughtBefore,
          teachingLocation,
          studentsCount: parseInt(studentsCount),
          teachingStyle,
        },
        motivation: {
          whyTeach,
          whatMakesGreat,
          availability,
        },
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "tutor_applications", user.uid), applicationData);

      router.push("/tutor/application-status");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Become a Tutor</h1>
          <p className="text-lg text-slate-600">Share your knowledge and earn money teaching</p>
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

          {/* Step Labels */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {["Personal", "Professional", "Expertise", "Experience", "Motivation"].map((label, idx) => (
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
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
                <p className="text-slate-600">Tell us about yourself</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location (City, Country) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Lagos, Nigeria"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Profile Photo URL (optional)
                </label>
                <input
                  type="url"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-slate-500 mt-1">You can upload this later in your profile</p>
              </div>
            </div>
          )}

          {/* Step 2: Professional Background */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional Background</h2>
                <p className="text-slate-600">Your work experience and credentials</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select years</option>
                    <option value="1">1-2 years</option>
                    <option value="3">3-5 years</option>
                    <option value="6">6-10 years</option>
                    <option value="11">10+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  LinkedIn Profile (optional)
                </label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Portfolio/Website (optional)
                </label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          )}

          {/* Step 3: Expertise */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Expertise</h2>
                <p className="text-slate-600">What will you teach?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Primary Skills <span className="text-red-500">*</span>
                  <span className="text-slate-500 font-normal ml-2">(Select at least one)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        primarySkills.includes(skill)
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {primarySkills.includes(skill) && <i className="fa-solid fa-check mr-2"></i>}
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Teaching Subjects <span className="text-red-500">*</span>
                  <span className="text-slate-500 font-normal ml-2">(Select at least one)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjectOptions.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        teachingSubjects.includes(subject)
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {teachingSubjects.includes(subject) && <i className="fa-solid fa-check mr-2"></i>}
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setExperienceLevel("beginner")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      experienceLevel === "beginner"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌱</div>
                      <p className="font-semibold text-slate-900">Beginner</p>
                      <p className="text-xs text-slate-600 mt-1">1-2 years</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExperienceLevel("intermediate")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      experienceLevel === "intermediate"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🚀</div>
                      <p className="font-semibold text-slate-900">Intermediate</p>
                      <p className="text-xs text-slate-600 mt-1">3-5 years</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExperienceLevel("expert")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      experienceLevel === "expert"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">⭐</div>
                      <p className="font-semibold text-slate-900">Expert</p>
                      <p className="text-xs text-slate-600 mt-1">6+ years</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Teaching Experience */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Teaching Experience</h2>
                <p className="text-slate-600">Share your teaching background</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Have you taught before? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTaughtBefore("yes")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      taughtBefore === "yes"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">Yes, I have</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaughtBefore("no")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      taughtBefore === "no"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">No, but I'm ready</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Where have you taught? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Online", "Offline", "Both"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setTeachingLocation(loc.toLowerCase())}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        teachingLocation === loc.toLowerCase()
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{loc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Approximately how many students have you taught? <span className="text-red-500">*</span>
                </label>
                <select
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select range</option>
                  <option value="0">I'm just starting (0)</option>
                  <option value="10">1-10 students</option>
                  <option value="50">10-50 students</option>
                  <option value="100">50-100 students</option>
                  <option value="101">100+ students</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Describe your teaching style <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={teachingStyle}
                  onChange={(e) => setTeachingStyle(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="I believe in hands-on learning with real-world projects. I adapt my teaching pace to each student's needs and provide detailed feedback..."
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 50 characters</p>
              </div>
            </div>
          )}

          {/* Step 5: Motivation */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Motivation</h2>
                <p className="text-slate-600">Why do you want to teach?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Why do you want to become a tutor? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={whyTeach}
                  onChange={(e) => setWhyTeach(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="I'm passionate about sharing knowledge and helping others achieve their goals. Teaching allows me to give back to the community while continuing to learn..."
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What makes you a great teacher? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={whatMakesGreat}
                  onChange={(e) => setWhatMakesGreat(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="I have excellent communication skills, patience, and a genuine desire to see my students succeed. I break down complex topics into digestible pieces..."
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How many hours per week can you teach? <span className="text-red-500">*</span>
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select hours</option>
                  <option value="5">1-5 hours/week</option>
                  <option value="10">5-10 hours/week</option>
                  <option value="20">10-20 hours/week</option>
                  <option value="30">20-30 hours/week</option>
                  <option value="40">30+ hours/week (Full-time)</option>
                </select>
              </div>

              {/* Review Summary */}
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-info-circle text-blue-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">What happens next?</h3>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>✓ We'll review your application within 3-5 business days</li>
                      <li>✓ You'll receive an email notification about your status</li>
                      <li>✓ If approved, you'll set up your tutor profile and start teaching</li>
                      <li>✓ Our team may contact you for additional information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
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
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                <span>
                  <i className="fa-solid fa-paper-plane mr-2"></i>
                  Submit Application
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}