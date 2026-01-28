"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";

interface Review {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto?: string;
  rating: number;
  comment: string;
  topic: string;
  sessionDate: Date;
  createdAt: Date;
  response?: {
    text: string;
    createdAt: Date;
  };
  helpful?: number;
}

type FilterRating = "all" | 5 | 4 | 3 | 2 | 1;
type SortBy = "recent" | "oldest" | "highest" | "lowest";

export default function TutorReviews() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<FilterRating>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchReviews(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, filterRating, sortBy, searchQuery]);

  const fetchReviews = async (tutorId: string) => {
    try {
      // Mock reviews data (replace with real Firestore query)
      // In production, fetch from tutor_reviews collection
      const mockReviews: Review[] = [
        {
          id: "1",
          studentId: "student1",
          studentName: "Sarah Johnson",
          studentPhoto: undefined,
          rating: 5,
          comment: "Excellent tutor! Very patient and knowledgeable. Helped me understand React hooks in depth. Would highly recommend!",
          topic: "React Fundamentals",
          sessionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          helpful: 12,
        },
        {
          id: "2",
          studentId: "student2",
          studentName: "Michael Chen",
          studentPhoto: undefined,
          rating: 5,
          comment: "Great experience! The tutor explained complex algorithms in a simple way. My coding skills have improved significantly.",
          topic: "Data Structures & Algorithms",
          sessionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          helpful: 8,
        },
        {
          id: "3",
          studentId: "student3",
          studentName: "Emily Rodriguez",
          studentPhoto: undefined,
          rating: 4,
          comment: "Very helpful session on JavaScript. Would have loved more practical examples, but overall great!",
          topic: "JavaScript Advanced",
          sessionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          response: {
            text: "Thank you for the feedback! I'll definitely include more practical examples in future sessions.",
            createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
          },
          helpful: 5,
        },
        {
          id: "4",
          studentId: "student4",
          studentName: "David Kim",
          studentPhoto: undefined,
          rating: 5,
          comment: "Amazing tutor! Clear explanations and great teaching style. Best investment in my learning journey.",
          topic: "Python for Beginners",
          sessionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
          helpful: 15,
        },
        {
          id: "5",
          studentId: "student5",
          studentName: "Lisa Anderson",
          studentPhoto: undefined,
          rating: 3,
          comment: "Good session, but the pacing was a bit fast for me. Still learned a lot though.",
          topic: "Node.js Basics",
          sessionDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
          helpful: 3,
        },
      ];

      setReviews(mockReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const filterAndSortReviews = () => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== "all") {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.studentName.toLowerCase().includes(query) ||
          review.comment.toLowerCase().includes(query) ||
          review.topic.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  };

  const handleRespondToReview = async () => {
    if (!selectedReview || !responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    setResponding(true);
    try {
      // In production, update the review in Firestore
      const updatedReviews = reviews.map((review) => {
        if (review.id === selectedReview.id) {
          return {
            ...review,
            response: {
              text: responseText.trim(),
              createdAt: new Date(),
            },
          };
        }
        return review;
      });

      setReviews(updatedReviews);
      setShowResponseModal(false);
      setResponseText("");
      setSelectedReview(null);

      alert("Response posted successfully!");
    } catch (error) {
      console.error("Error posting response:", error);
      alert("Failed to post response. Please try again.");
    } finally {
      setResponding(false);
    }
  };

  const getRatingStats = () => {
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return { average, total, distribution };
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-xl",
    };

    return (
      <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fa-solid fa-star ${
              star <= rating ? "text-yellow-500" : "text-slate-300"
            }`}
          ></i>
        ))}
      </div>
    );
  };

  const getTopTopics = () => {
    const topicCount: { [key: string]: number } = {};
    reviews.forEach((review) => {
      topicCount[review.topic] = (topicCount[review.topic] || 0) + 1;
    });

    return Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const stats = getRatingStats();
  const topTopics = getTopTopics();

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
            <h1 className="text-3xl font-bold text-slate-900">Reviews & Ratings</h1>
            <p className="text-slate-600 mt-1">
              See what your students are saying about you
            </p>
          </div>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Overall Rating */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Overall Rating</h3>
            <div className="text-center">
              <div className="text-6xl font-bold text-slate-900 mb-2">
                {stats.average.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.average), "lg")}
              <div className="text-sm text-slate-600 mt-2">
                Based on {stats.total} review{stats.total !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating as keyof typeof stats.distribution];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 w-8">
                      {rating}★
                    </span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-500 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Reviewed Topics */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Top Reviewed Topics</h3>
            {topTopics.length > 0 ? (
              <div className="space-y-3">
                {topTopics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 truncate flex-1">
                      {item.topic}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-600 text-sm">
                No reviews yet
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search reviews by student, comment, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            {/* Rating Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRating("all")}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filterRating === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating as FilterRating)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    filterRating === rating
                      ? "bg-yellow-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {rating}★
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Student Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {review.studentPhoto ? (
                      <img
                        src={review.studentPhoto}
                        alt={review.studentName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      review.studentName.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {review.studentName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating, "sm")}
                          <span className="text-xs text-slate-500">
                            {review.createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {review.topic}
                      </span>
                    </div>

                    <p className="text-slate-700 mb-4 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Helpful Count */}
                    {review.helpful && review.helpful > 0 && (
                      <div className="text-xs text-slate-500 mb-3">
                        <i className="fa-solid fa-thumbs-up mr-1"></i>
                        {review.helpful} {review.helpful === 1 ? "person" : "people"} found
                        this helpful
                      </div>
                    )}

                    {/* Tutor Response */}
                    {review.response ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fa-solid fa-reply text-blue-600"></i>
                          <span className="font-semibold text-slate-900 text-sm">
                            Your Response
                          </span>
                          <span className="text-xs text-slate-500">
                            {review.response.createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm">
                          {review.response.text}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setResponseText("");
                          setShowResponseModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        <i className="fa-solid fa-reply mr-2"></i>
                        Respond to Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-star text-slate-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No reviews found
              </h3>
              <p className="text-slate-600">
                {searchQuery || filterRating !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't received any reviews yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Respond to Review
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Original Review */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedReview.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {selectedReview.studentName}
                    </div>
                    {renderStars(selectedReview.rating, "sm")}
                  </div>
                </div>
                <p className="text-slate-700 text-sm">{selectedReview.comment}</p>
              </div>

              {/* Response Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  placeholder="Thank you for your feedback! I'm glad you found the session helpful..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Your response will be visible to all students
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <i className="fa-solid fa-lightbulb mr-2"></i>
                  Tip: Respond professionally and constructively. Thank the student
                  and address any concerns they may have raised.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResponseModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRespondToReview}
                disabled={responding || !responseText.trim()}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {responding ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    Post Response
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}