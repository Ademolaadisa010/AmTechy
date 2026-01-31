"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

interface FlaggedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  image?: string;
  likes: string[];
  comments: any[];
  createdAt: any;
  flagged: boolean;
  flagReasons: string[];
  flagCount: number;
}

interface ContentModerationProps {
  onUpdate?: () => void;
}

export default function ContentModeration({ onUpdate }: ContentModerationProps) {
  const [posts, setPosts] = useState<FlaggedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<FlaggedPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchFlaggedPosts();
  }, []);

  const fetchFlaggedPosts = async () => {
    setLoading(true);
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("flagged", "==", true),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(postsQuery);
      
      const postsData: FlaggedPost[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        userName: doc.data().userName,
        userAvatar: doc.data().userAvatar,
        content: doc.data().content,
        image: doc.data().image,
        likes: doc.data().likes || [],
        comments: doc.data().comments || [],
        createdAt: doc.data().createdAt,
        flagged: doc.data().flagged,
        flagReasons: doc.data().flagReasons || [],
        flagCount: doc.data().flagCount || 1,
      }));
      
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching flagged posts:", error);
      alert("Failed to fetch flagged content.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setProcessing(true);
    try {
      await deleteDoc(doc(db, "posts", postId));
      alert("Post deleted successfully!");
      setShowModal(false);
      await fetchFlaggedPosts();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    } finally {
      setProcessing(false);
    }
  };

  const handleUnflagPost = async (postId: string) => {
    if (!confirm("Mark this post as safe and remove all flags?")) {
      return;
    }

    setProcessing(true);
    try {
      await updateDoc(doc(db, "posts", postId), {
        flagged: false,
        flagReasons: [],
        flagCount: 0,
        reviewedAt: serverTimestamp(),
      });
      alert("Post unflagged successfully!");
      setShowModal(false);
      await fetchFlaggedPosts();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error unflagging post:", error);
      alert("Failed to unflag post.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Content Moderation</h2>
        <p className="text-slate-600">Review and moderate flagged content</p>
      </div>

      {/* Stats */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-flag text-white text-xl"></i>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-900">{posts.length}</p>
            <p className="text-red-700">Flagged Posts Requiring Review</p>
          </div>
        </div>
      </div>

      {/* Flagged Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* User Info */}
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {post.userAvatar ? (
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    post.userName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{post.userName}</p>
                      <p className="text-xs text-slate-500">
                        {post.createdAt?.toDate?.()?.toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <i className="fa-solid fa-flag"></i>
                      {post.flagCount} {post.flagCount === 1 ? "flag" : "flags"}
                    </span>
                  </div>

                  {/* Flag Reasons */}
                  {post.flagReasons.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-600 mb-2">Flagged for:</p>
                      <div className="flex flex-wrap gap-2">
                        {post.flagReasons.map((reason, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-3">
                    <p className="text-slate-900 whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post content"
                        className="mt-3 rounded-lg max-w-md w-full"
                      />
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <span>
                      <i className="fa-solid fa-heart mr-1"></i>
                      {post.likes.length} likes
                    </span>
                    <span>
                      <i className="fa-solid fa-comment mr-1"></i>
                      {post.comments.length} comments
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <i className="fa-solid fa-eye mr-2"></i>
                      Review
                    </button>
                    <button
                      onClick={() => handleUnflagPost(post.id)}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <i className="fa-solid fa-check mr-2"></i>
                      Mark as Safe
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={processing}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <i className="fa-solid fa-trash mr-2"></i>
                      Delete Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <i className="fa-solid fa-check-circle text-green-500 text-5xl mb-4"></i>
          <h3 className="text-xl font-bold text-slate-900 mb-2">All Clear!</h3>
          <p className="text-slate-600">No flagged content to review at the moment</p>
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Review Flagged Content</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-xmark text-slate-600"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {selectedPost.userAvatar ? (
                    <img
                      src={selectedPost.userAvatar}
                      alt={selectedPost.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    selectedPost.userName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedPost.userName}</h4>
                  <p className="text-sm text-slate-600">
                    Posted {selectedPost.createdAt?.toDate?.()?.toLocaleString()}
                  </p>
                  <span className="mt-2 inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {selectedPost.flagCount} {selectedPost.flagCount === 1 ? "flag" : "flags"}
                  </span>
                </div>
              </div>

              {/* Flag Reasons */}
              <div>
                <h5 className="font-semibold text-slate-900 mb-3">Flag Reasons:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.flagReasons.map((reason, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <h5 className="font-semibold text-slate-900 mb-3">Content:</h5>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-900 whitespace-pre-wrap">{selectedPost.content}</p>
                  {selectedPost.image && (
                    <img
                      src={selectedPost.image}
                      alt="Post content"
                      className="mt-4 rounded-lg max-w-full"
                    />
                  )}
                </div>
              </div>

              {/* Engagement */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <i className="fa-solid fa-heart mr-2"></i>
                  {selectedPost.likes.length} likes
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <i className="fa-solid fa-comment mr-2"></i>
                  {selectedPost.comments.length} comments
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleUnflagPost(selectedPost.id)}
                  disabled={processing}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {processing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check mr-2"></i>
                      Mark as Safe
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {processing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash mr-2"></i>
                      Delete Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}