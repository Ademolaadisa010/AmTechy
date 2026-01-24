"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where,
} from "firebase/firestore";

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  image?: string;
  likes: string[];
  comments: Comment[];
  createdAt: any;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
}

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  image: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export default function Community() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [postContent, setPostContent] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const stories: Story[] = [
    { id: "1", userId: "1", userName: "Your Story", userAvatar: "", image: "" },
    { id: "2", userId: "2", userName: "Sarah Johnson", userAvatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff", image: "" },
    { id: "3", userId: "3", userName: "Michael Chen", userAvatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6&color=fff", image: "" },
    { id: "4", userId: "4", userName: "Emily Rodriguez", userAvatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899&color=fff", image: "" },
    { id: "5", userId: "5", userName: "David Okonkwo", userAvatar: "https://ui-avatars.com/api/?name=David+Okonkwo&background=10b981&color=fff", image: "" },
  ];

  const chatUsers: ChatUser[] = [
    { id: "1", name: "Sarah Johnson", avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff", lastMessage: "Hey! How are you?", time: "2m ago", unread: 2, online: true },
    { id: "2", name: "Michael Chen", avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6&color=fff", lastMessage: "Thanks for the help!", time: "1h ago", unread: 0, online: true },
    { id: "3", name: "Emily Rodriguez", avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899&color=fff", lastMessage: "See you tomorrow!", time: "3h ago", unread: 1, online: false },
    { id: "4", name: "David Okonkwo", avatar: "https://ui-avatars.com/api/?name=David+Okonkwo&background=10b981&color=fff", lastMessage: "Got it, thanks!", time: "1d ago", unread: 0, online: true },
    { id: "5", name: "Aisha Ndiaye", avatar: "https://ui-avatars.com/api/?name=Aisha+Ndiaye&background=f59e0b&color=fff", lastMessage: "Looking forward to it", time: "2d ago", unread: 0, online: false },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUser({
          uid: currentUser.uid,
          displayName: userDoc.data()?.name || currentUser.displayName || "User",
          photoURL: userDoc.data()?.photoURL || currentUser.photoURL,
        });
        await fetchPosts();
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(postsQuery);

      const postsData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId || "",
        userName: doc.data().userName || "Anonymous",
        userAvatar: doc.data().userAvatar,
        content: doc.data().content || "",
        image: doc.data().image,
        likes: doc.data().likes || [],
        comments: doc.data().comments || [],
        createdAt: doc.data().createdAt,
      }));

      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !user) return;

    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        content: postContent,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });

      setPostContent("");
      setShowCreatePost(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find((p) => p.id === postId);

      if (post?.likes.includes(user.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });
      }

      await fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;

    try {
      const postRef = doc(db, "posts", postId);
      const newComment = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName,
        content: commentText,
        createdAt: new Date(),
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
      });

      setCommentText("");
      await fetchPosts();
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.uid,
      content: messageText,
      timestamp: new Date(),
      read: false,
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  const handleSelectChat = (chatUser: ChatUser) => {
    setSelectedChat(chatUser);
    setMessages([
      { id: "1", senderId: chatUser.id, content: chatUser.lastMessage, timestamp: new Date(Date.now() - 3600000), read: true },
      { id: "2", senderId: user.uid, content: "Thanks! I appreciate it.", timestamp: new Date(Date.now() - 1800000), read: true },
    ]);
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Community</h1>
            <p className="text-slate-600 mt-1">Connect, share, and learn together</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-slate-200">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("feed")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "feed"
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Feed
                {activeTab === "feed" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "chat"
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Messages
                {activeTab === "chat" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("groups")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "groups"
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Groups
                {activeTab === "groups" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`pb-3 px-1 font-semibold transition-colors relative ${
                  activeTab === "events"
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Events
                {activeTab === "events" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Feed Tab */}
          {activeTab === "feed" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Stories */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {stories.map((story) => (
                      <div key={story.id} className="flex-shrink-0">
                        <div className="relative cursor-pointer group">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-white p-1">
                              <img
                                src={story.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.userName)}&background=6366f1&color=fff`}
                                alt={story.userName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            </div>
                          </div>
                          {story.userId === "1" && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                              <i className="fa-solid fa-plus text-white text-xs"></i>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-center mt-2 text-slate-700 font-medium w-20 truncate">
                          {story.userName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Post */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName)}&background=6366f1&color=fff`}
                      alt={user?.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-2.5 text-left text-slate-600 transition-colors"
                    >
                      What's on your mind, {user?.displayName?.split(" ")[0]}?
                    </button>
                  </div>
                  <div className="flex items-center justify-around border-t border-slate-200 pt-3">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <i className="fa-solid fa-video text-red-500"></i>
                      <span className="text-sm font-medium text-slate-700">Live</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <i className="fa-solid fa-image text-green-500"></i>
                      <span className="text-sm font-medium text-slate-700">Photo</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <i className="fa-solid fa-smile text-yellow-500"></i>
                      <span className="text-sm font-medium text-slate-700">Feeling</span>
                    </button>
                  </div>
                </div>

                {/* Create Post Modal */}
                {showCreatePost && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Create Post</h3>
                        <button
                          onClick={() => setShowCreatePost(false)}
                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
                        >
                          <i className="fa-solid fa-xmark text-slate-600"></i>
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName)}&background=6366f1&color=fff`}
                          alt={user?.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{user?.displayName}</p>
                          <p className="text-xs text-slate-500">Public</p>
                        </div>
                      </div>
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder={`What's on your mind, ${user?.displayName?.split(" ")[0]}?`}
                        className="w-full min-h-32 p-3 text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
                      />
                      <button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim()}
                        className="w-full mt-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts Feed */}
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={post.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userName)}&background=6366f1&color=fff`}
                                alt={post.userName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{post.userName}</p>
                                <p className="text-xs text-slate-500">
                                  {post.createdAt?.toDate?.()?.toLocaleDateString() || "Just now"}
                                </p>
                              </div>
                            </div>
                            <button className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center">
                              <i className="fa-solid fa-ellipsis text-slate-600"></i>
                            </button>
                          </div>
                          <p className="text-slate-900 mb-3 whitespace-pre-wrap">{post.content}</p>
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full rounded-lg object-cover mb-3"
                            />
                          )}
                        </div>

                        <div className="px-4 py-2 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                            <span>{post.likes.length} likes</span>
                            <span>{post.comments.length} comments</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-around border-t border-slate-200 py-2 px-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors ${
                              post.likes.includes(user?.uid) ? "text-indigo-600" : "text-slate-600"
                            }`}
                          >
                            <i className={`fa-${post.likes.includes(user?.uid) ? "solid" : "regular"} fa-heart`}></i>
                            <span className="text-sm font-medium">Like</span>
                          </button>
                          <button
                            onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                          >
                            <i className="fa-regular fa-comment"></i>
                            <span className="text-sm font-medium">Comment</span>
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                            <i className="fa-regular fa-share-from-square"></i>
                            <span className="text-sm font-medium">Share</span>
                          </button>
                        </div>

                        {selectedPost === post.id && (
                          <div className="border-t border-slate-200 p-4">
                            <div className="flex gap-2 mb-4">
                              <img
                                src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName)}&background=6366f1&color=fff`}
                                alt={user?.displayName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                                  placeholder="Write a comment..."
                                  className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => handleComment(post.id)}
                                  disabled={!commentText.trim()}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                            {post.comments.length > 0 && (
                              <div className="space-y-3">
                                {post.comments.map((comment) => (
                                  <div key={comment.id} className="flex gap-2">
                                    <img
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=6366f1&color=fff`}
                                      alt={comment.userName}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-2">
                                      <p className="text-sm font-semibold text-slate-900">{comment.userName}</p>
                                      <p className="text-sm text-slate-700">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-comments text-slate-400 text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No posts yet</h3>
                    <p className="text-slate-600 mb-6">Be the first to share something!</p>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                    >
                      Create Post
                    </button>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="hidden lg:block space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
                  <h3 className="font-bold text-slate-900 mb-4">Online Friends</h3>
                  <div className="space-y-3">
                    {chatUsers.filter(u => u.online).slice(0, 5).map((chatUser) => (
                      <div key={chatUser.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <div className="relative">
                          <img
                            src={chatUser.avatar}
                            alt={chatUser.name}
                            className="w-9 h-9 rounded-full"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{chatUser.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
              {/* Chat List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Messages</h2>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="text"
                      placeholder="Search messages..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto h-[calc(100%-120px)]">
                  {chatUsers.map((chatUser) => (
                    <div
                      key={chatUser.id}
                      onClick={() => handleSelectChat(chatUser)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                        selectedChat?.id === chatUser.id ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={chatUser.avatar}
                          alt={chatUser.name}
                          className="w-12 h-12 rounded-full"
                        />
                        {chatUser.online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-slate-900 truncate">{chatUser.name}</h3>
                          <span className="text-xs text-slate-500">{chatUser.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-600 truncate">{chatUser.lastMessage}</p>
                          {chatUser.unread > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                              {chatUser.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                      <img
                        src={selectedChat.avatar}
                        alt={selectedChat.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{selectedChat.name}</h3>
                        <p className="text-xs text-slate-500">
                          {selectedChat.online ? "Active now" : "Offline"}
                        </p>
                      </div>
                      <button className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-phone text-slate-600"></i>
                      </button>
                      <button className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-video text-slate-600"></i>
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl ${
                              message.senderId === user.uid
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.senderId === user.uid ? "text-indigo-200" : "text-slate-500"}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <button className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center">
                          <i className="fa-solid fa-plus text-indigo-600"></i>
                        </button>
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center">
                          <i className="fa-solid fa-image text-indigo-600"></i>
                        </button>
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-comments text-slate-400 text-3xl"></i>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Your Messages</h3>
                      <p className="text-slate-600">Select a conversation to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === "groups" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Your Groups</h2>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                    + Create Group
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-3"></div>
                    <h3 className="font-bold text-slate-900">Frontend Developers</h3>
                    <p className="text-sm text-slate-600 mb-2">15.2K members</p>
                    <p className="text-xs text-slate-500">Last activity: 2 hours ago</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-full h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mb-3"></div>
                    <h3 className="font-bold text-slate-900">Data Science Hub</h3>
                    <p className="text-sm text-slate-600 mb-2">8.7K members</p>
                    <p className="text-xs text-slate-500">Last activity: 1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-calendar text-indigo-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Events Coming Soon</h3>
                <p className="text-slate-600">Discover and join tech events near you</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}