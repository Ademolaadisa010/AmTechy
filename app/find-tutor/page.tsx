"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

interface Tutor {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  profileImage?: string;
  expertise: string[];
  availability: string;
  verified: boolean;
}

export default function FindTutor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [userCareerGoal, setUserCareerGoal] = useState("");

  const skillCategories = [
    { id: "all", label: "All Tutors", icon: "👨‍🏫" },
    { id: "react", label: "React", icon: "⚛️" },
    { id: "python", label: "Python", icon: "🐍" },
    { id: "data-science", label: "Data Science", icon: "📊" },
    { id: "ui-ux", label: "UI/UX Design", icon: "🎨" },
    { id: "career", label: "Career Advice", icon: "💼" },
    { id: "backend", label: "Backend", icon: "⚙️" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserCareerGoal(user.uid);
        await fetchTutors();
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterTutors();
  }, [tutors, searchQuery, selectedSkill]);

  const fetchUserCareerGoal = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserCareerGoal(userDoc.data().careerGoal || "");
      }
    } catch (error) {
      console.error("Error fetching user career goal:", error);
    }
  };

  const fetchTutors = async () => {
    try {
      // Fetch all tutors (remove status filter for now)
      const tutorsQuery = query(collection(db, "tutors"));
      const snapshot = await getDocs(tutorsQuery);

      console.log("Total tutors found:", snapshot.docs.length);

      const tutorsData: Tutor[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
        title: doc.data().title || "",
        company: doc.data().company || "",
        bio: doc.data().bio || "",
        skills: doc.data().skills || [],
        rating: doc.data().rating || 4.5,
        reviewCount: doc.data().reviewCount || 0,
        hourlyRate: doc.data().hourlyRate || 40,
        profileImage: doc.data().profileImage,
        expertise: doc.data().expertise || [],
        availability: doc.data().availability || "Available",
        verified: doc.data().verified || false,
      }));

      setTutors(tutorsData);
      setFilteredTutors(tutorsData);
    } catch (error) {
      console.error("Error fetching tutors:", error);
    }
  };

  const filterTutors = () => {
    let filtered = [...tutors];

    if (selectedSkill !== "all") {
      filtered = filtered.filter((tutor) =>
        tutor.skills.some((skill) =>
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tutor.skills.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          tutor.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTutors(filtered);
  };

  const getRecommendedTutors = () => {
    const careerKeywords: { [key: string]: string[] } = {
      frontend: ["react", "javascript", "frontend", "ui"],
      backend: ["backend", "node", "python", "api"],
      "data-science": ["python", "data science", "machine learning"],
      mobile: ["mobile", "react native", "flutter"],
      designer: ["figma", "ui/ux", "design"],
    };

    const keywords = careerKeywords[userCareerGoal] || [];
    if (keywords.length === 0) return [];

    return tutors
      .filter((tutor) => {
        const skillsText = tutor.skills.join(" ").toLowerCase();
        return keywords.some((keyword) => skillsText.includes(keyword));
      })
      .slice(0, 3);
  };

  const recommendedTutors = getRecommendedTutors();

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tutors...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      <section className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Find a Mentor</h1>
              <p className="text-slate-600 mt-1">
                Book 1-on-1 sessions with industry experts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <i className="fa-solid fa-filter"></i>
                Filters
              </button>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by skill or name..."
                  className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-64"
                />
              </div>
            </div>
          </div>

          {recommendedTutors.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-sparkles text-indigo-600"></i>
                <h2 className="text-xl font-bold text-slate-900">
                  Recommended For You
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                Based on your {userCareerGoal} learning path
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/book-tutor?tutorId=${tutor.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={
                          tutor.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=6366f1&color=fff`
                        }
                        alt={tutor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {tutor.name}
                        </h3>
                        <p className="text-xs text-slate-600">{tutor.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                          <span className="text-xs font-bold text-slate-700">
                            {tutor.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">
                      ${tutor.hourlyRate}/session
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Filter */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Filter by Skill
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedSkill(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSkill === category.id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              {filteredTutors.length} mentor{filteredTutors.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          </div>

          {/* Tutors Grid */}
          {filteredTutors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/book-tutor?tutorId=${tutor.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <img
                          src={
                            tutor.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.name)}&background=6366f1&color=fff`
                          }
                          alt={tutor.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{tutor.name}</h3>
                            {tutor.verified && (
                              <i
                                className="fa-solid fa-circle-check text-indigo-600"
                                title="Verified Tutor"
                              ></i>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {tutor.title} @ {tutor.company}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
                            <span className="text-xs font-bold text-slate-700">
                              {tutor.rating}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({tutor.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {tutor.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {tutor.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {tutor.skills.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          +{tutor.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-lg font-bold text-slate-900">
                          ${tutor.hourlyRate}
                        </span>
                        <span className="text-xs text-slate-500">/ session</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/book-tutor?tutorId=${tutor.id}`);
                        }}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-user-tie text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No tutors found
              </h3>
              <p className="text-slate-600 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSkill("all");
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}