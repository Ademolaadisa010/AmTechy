"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import BottomBar from "../bottom-bar/page";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, addDoc, query, orderBy, limit, getDocs,
  serverTimestamp, doc, getDoc, updateDoc, arrayUnion,
  arrayRemove, where, deleteDoc, onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  title?: string;
  bio?: string;
  careerGoal?: string;
  skills?: string[];
  friends?: string[];
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userTitle?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: string[];
  comments: PostComment[];
  createdAt: any;
}

interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: any;
}

interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar?: string;
  fromTitle?: string;
  toId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: any;
}

interface Group {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  memberIds: string[];
  adminId: string;
  createdAt: any;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  timestamp: Date;
}

const avatarUrl = (name: string, bg = "6366f1") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=128`;

const timeAgo = (ts: any): string => {
  if (!ts) return "Just now";
  const date = ts?.toDate?.() || new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const GROUP_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
];

// ─── PostCard Component ────────────────────────────────────────────────────────
function PostCard({
  post,
  currentUser,
  onLike,
  onComment,
  onViewProfile,
}: {
  post: Post;
  currentUser: UserProfile;
  onLike: (postId: string) => Promise<void>;
  onComment: (postId: string, text: string) => Promise<void>;
  onViewProfile: (uid: string) => void;
}) {
  const [isLiking, setIsLiking] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const isLiked = post.likes.includes(currentUser.uid);

  const handleLikeClick = async () => {
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      await onComment(post.id, commentText);
      setCommentText("");
      setShowCommentInput(false);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile(post.userId)}>
          <img src={post.userAvatar || avatarUrl(post.userName)} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm">{post.userName}</p>
            {post.userTitle && <p className="text-xs text-slate-500">{post.userTitle}</p>}
          </div>
        </div>
        <p className="text-xs text-slate-500">{timeAgo(post.createdAt)}</p>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
        {post.mediaUrl && (
          <div className="mt-3 rounded-xl overflow-hidden">
            {post.mediaType === "image" ? (
              <img src={post.mediaUrl} alt="post media" className="w-full max-h-80 object-cover" />
            ) : (
              <video src={post.mediaUrl} controls className="w-full max-h-80 bg-black rounded-xl" />
            )}
          </div>
        )}
      </div>

      {/* Engagement */}
      <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
        <span>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            isLiked
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <i className={`fa-solid fa-heart ${isLiked ? "text-red-500" : ""}`}></i>
          Like
        </button>
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <i className="fa-solid fa-comment"></i>
          Comment
        </button>
      </div>

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 space-y-3 max-h-48 overflow-y-auto">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <img
                src={comment.userAvatar || avatarUrl(comment.userName)}
                alt={comment.userName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                onClick={() => onViewProfile(comment.userId)}
              />
              <div className="flex-1 bg-slate-50 rounded-lg p-2">
                <p className="text-xs font-semibold text-slate-900 cursor-pointer hover:text-indigo-600" onClick={() => onViewProfile(comment.userId)}>
                  {comment.userName}
                </p>
                <p className="text-sm text-slate-800 mt-0.5 break-words">{comment.content}</p>
                <p className="text-xs text-slate-500 mt-1">{timeAgo(comment.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      {showCommentInput && (
        <div className="px-4 py-3 border-t border-slate-100 space-y-2">
          <div className="flex gap-2">
            <img
              src={currentUser.photoURL || avatarUrl(currentUser.displayName)}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCommentSubmit();
                  }
                }}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || isCommenting}
                className="px-3 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors"
              >
                {isCommenting ? "..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreatePostModal({ user, onClose, onPost }: {
  user: UserProfile;
  onClose: () => void;
  onPost: (content: string, mediaUrl?: string, mediaType?: "image" | "video") => Promise<void>;
}) {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Please upload an image or video");
      return;
    }

    setMediaFile(file);
    setMediaType(isImage ? "image" : "video");

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!content.trim()) {
      alert("Please write something to post");
      return;
    }
    
    setPosting(true);
    try {
      let mediaUrl = undefined;
      if (mediaFile) {
        const fileName = `posts/${Date.now()}_${mediaFile.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(storageRef);
      }
      await onPost(content, mediaUrl, mediaType);
      setPosting(false);
      onClose();
      // Reset form
      setContent("");
      setMediaFile(null);
      setMediaPreview("");
      setMediaType(undefined);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to post. Please try again.");
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Create Post</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-xmark text-slate-600 text-sm"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <img src={user.photoURL || avatarUrl(user.displayName)} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">{user.displayName}</p>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">🌍 Public</span>
            </div>
          </div>

          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={4}
            placeholder={`What's on your mind, ${user.displayName.split(" ")[0]}?`}
            className="w-full text-slate-900 placeholder-slate-400 focus:outline-none resize-none text-base leading-relaxed border border-slate-200 rounded-lg p-3" 
          />

          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden">
              {mediaType === "image" ? (
                <img src={mediaPreview} alt="preview" className="w-full max-h-48 object-cover" />
              ) : (
                <video src={mediaPreview} controls className="w-full max-h-48 rounded-xl" />
              )}
              <button onClick={() => { setMediaFile(null); setMediaPreview(""); setMediaType(undefined); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/70">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Add:</span>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors">
              <i className="fa-solid fa-image"></i> Photo/Video
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <button 
            onClick={handlePost} 
            disabled={!content.trim() || posting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {posting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting…
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Community Component ──────────────────────────────────────────────────
export default function Community() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [friendSearch, setFriendSearch] = useState("");

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);

  const [selectedChat, setSelectedChat] = useState<UserProfile | null>(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState<{ groupId: string; groupName: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [messagePreview, setMessagePreview] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const messageFileInputRef = useRef<HTMLInputElement>(null);

  const pendingRequests = friendRequests.filter((r) => r.toId === currentUser?.uid && r.status === "pending");
  const friends = currentUser?.friends?.map((fid) => allUsers.find((u) => u.uid === fid)).filter(Boolean) as UserProfile[];
  const filteredFriends = friends.filter((f) => f.displayName.toLowerCase().includes(friendSearch.toLowerCase()));
  const nonFriends = allUsers.filter((u) => u.uid !== currentUser?.uid && !currentUser?.friends?.includes(u.uid));

  // ✅ REAL-TIME LISTENER FOR POSTS
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30)),
      (snapshot) => {
        const postsData = snapshot.docs.map((d) => ({
          id: d.id,
          userId: d.data().userId || "",
          userName: d.data().userName || "Anonymous",
          userAvatar: d.data().userAvatar,
          userTitle: d.data().userTitle,
          content: d.data().content || "",
          mediaUrl: d.data().mediaUrl,
          mediaType: d.data().mediaType as "image" | "video" | undefined,
          likes: d.data().likes || [],
          comments: d.data().comments || [],
          createdAt: d.data().createdAt,
        }));
        setPosts(postsData);
      },
      (error) => {
        console.error("Error listening to posts:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ✅ Auth and initial data fetch
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) {
        router.push("/login");
        return;
      }
      
      const ud = (await getDoc(doc(db, "users", fu.uid))).data() || {};
      setCurrentUser({
        uid: fu.uid,
        displayName: ud.fullName || ud.name || fu.displayName || "User",
        photoURL: ud.photoURL || fu.photoURL || undefined,
        title: ud.title,
        bio: ud.bio,
        careerGoal: ud.careerGoal,
        skills: ud.skills || [],
        friends: ud.friends || [],
      });

      await Promise.all([
        fetchAllUsers(),
        fetchGroups(),
        fetchFriendRequests(fu.uid),
      ]);

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ CREATE POST WITH REAL-TIME UPDATE
  const handleCreatePost = async (content: string, mediaUrl?: string, mediaType?: "image" | "video") => {
    if (!currentUser) return;
    
    try {
      await addDoc(collection(db, "posts"), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userAvatar: currentUser.photoURL || null,
        userTitle: currentUser.title || null,
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });
      // onSnapshot listener will update posts automatically
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  // ✅ LIKE POST (LIVE UPDATE)
  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const post = posts.find((p) => p.id === postId);
      const liked = post?.likes.includes(currentUser.uid);
      
      await updateDoc(doc(db, "posts", postId), {
        likes: liked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
      });
      // onSnapshot listener will update posts automatically
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // ✅ COMMENT ON POST (LIVE UPDATE)
  const handleComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "posts", postId), {
        comments: arrayUnion({
          id: Date.now().toString(),
          userId: currentUser.uid,
          userName: currentUser.displayName,
          userAvatar: currentUser.photoURL || null,
          content: text,
          createdAt: serverTimestamp(),
        }),
      });
      // onSnapshot listener will update posts automatically
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  const handleFriendAction = async (targetId: string, action: "send" | "unfriend") => {
    if (!currentUser) return;
    try {
      if (action === "send") {
        const existingRequest = await getDocs(
          query(
            collection(db, "friendRequests"),
            where("fromId", "==", currentUser.uid),
            where("toId", "==", targetId)
          )
        );
        if (existingRequest.docs.length > 0) {
          alert("Friend request already sent");
          return;
        }

        await addDoc(collection(db, "friendRequests"), {
          fromId: currentUser.uid,
          fromName: currentUser.displayName,
          fromAvatar: currentUser.photoURL || null,
          fromTitle: currentUser.title || null,
          toId: targetId,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        alert("Friend request sent!");
      } else {
        await updateDoc(doc(db, "users", currentUser.uid), {
          friends: arrayRemove(targetId),
        });
        await updateDoc(doc(db, "users", targetId), {
          friends: arrayRemove(currentUser.uid),
        });
        setCurrentUser((p) => p ? { ...p, friends: p.friends?.filter((id) => id !== targetId) } : p);
        await fetchAllUsers();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRespondRequest = async (req: FriendRequest, accept: boolean) => {
    try {
      await updateDoc(doc(db, "friendRequests", req.id), {
        status: accept ? "accepted" : "declined",
      });
      if (accept && currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          friends: arrayUnion(req.fromId),
        });
        await updateDoc(doc(db, "users", req.fromId), {
          friends: arrayUnion(currentUser.uid),
        });
        setCurrentUser((p) => p ? { ...p, friends: [...(p.friends || []), req.fromId] } : p);
        await fetchAllUsers();
      }
      setFriendRequests((p) => p.filter((r) => r.id !== req.id));
    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };

  const handleCreateGroup = async (name: string, desc: string, color: string, memberIds: string[]) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, "groups"), {
        name,
        description: desc,
        coverColor: color,
        memberIds: [currentUser.uid, ...memberIds],
        adminId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      await fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setAllUsers(
        snap.docs.map((d) => ({
          uid: d.id,
          displayName: d.data().fullName || d.data().displayName || "User",
          photoURL: d.data().photoURL,
          title: d.data().title,
          bio: d.data().bio,
          careerGoal: d.data().careerGoal,
          skills: d.data().skills || [],
          friends: d.data().friends || [],
        }))
      );
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  };

  const fetchGroups = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "groups"), orderBy("createdAt", "desc"))
      );
      setGroups(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || "",
          description: d.data().description || "",
          coverColor: d.data().coverColor || GROUP_COLORS[0],
          memberIds: d.data().memberIds || [],
          adminId: d.data().adminId || "",
          createdAt: d.data().createdAt,
        }))
      );
    } catch (e) {
      console.error("Error fetching groups:", e);
    }
  };

  const fetchFriendRequests = async (uid: string) => {
    try {
      const snap = await getDocs(
        query(
          collection(db, "friendRequests"),
          where("toId", "==", uid),
          where("status", "==", "pending")
        )
      );
      setFriendRequests(
        snap.docs.map((d) => ({
          id: d.id,
          fromId: d.data().fromId,
          fromName: d.data().fromName,
          fromAvatar: d.data().fromAvatar,
          fromTitle: d.data().fromTitle,
          toId: d.data().toId,
          status: d.data().status,
          createdAt: d.data().createdAt,
        }))
      );
    } catch (e) {
      console.error("Error fetching requests:", e);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-w-0 items-center justify-center">
        <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const TABS = [
    { id: "feed", label: "Feed", icon: "fa-house" },
    { id: "friends", label: "Friends", icon: "fa-user-group", badge: pendingRequests.length },
    { id: "groups", label: "Groups", icon: "fa-users" },
  ];

  return (
    <main className="flex-1 flex bg-slate-50 min-w-0">
      <SideBar />
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-slate-900">Community</h1>
            <p className="text-slate-500 mt-1 text-sm">Connect, share, and learn together</p>
          </div>
          <BottomBar />

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 p-1 mb-6 w-fit shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-xs`}></i>
                {tab.label}
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* ── FEED TAB ── */}
          {activeTab === "feed" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Create Post Box */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser?.photoURL || avatarUrl(currentUser?.displayName || "User")}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-2.5 text-left text-slate-500 text-sm transition-colors"
                    >
                      What's on your mind, {currentUser?.displayName.split(" ")[0]}?
                    </button>
                  </div>
                  <div className="flex items-center justify-around mt-3 pt-3 border-t border-slate-100">
                    {[
                      { icon: "fa-image", label: "Photo/Video", color: "text-blue-500" },
                      { icon: "fa-face-smile", label: "Feeling", color: "text-yellow-500" },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => setShowCreatePost(true)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <i className={`fa-solid ${btn.icon} ${btn.color} text-sm`}></i>
                        <span className="text-sm font-medium text-slate-600">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posts Feed */}
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser!}
                      onLike={handleLike}
                      onComment={handleComment}
                      onViewProfile={(uid) =>
                        setViewingProfile(allUsers.find((u) => u.uid === uid) || null)
                      }
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-comments text-indigo-400 text-2xl"></i>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">No posts yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Be the first to share something!</p>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                    >
                      Create Post
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="hidden lg:block space-y-4">
                {pendingRequests.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <h3 className="font-bold text-slate-900 mb-3 text-sm">
                      Friend Requests{" "}
                      <span className="text-indigo-600">({pendingRequests.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {pendingRequests.map((req) => (
                        <div key={req.id} className="flex items-center gap-3">
                          <img
                            src={req.fromAvatar || avatarUrl(req.fromName)}
                            alt={req.fromName}
                            className="w-9 h-9 rounded-full object-cover cursor-pointer"
                            onClick={() =>
                              setViewingProfile(
                                allUsers.find((u) => u.uid === req.fromId) || null
                              )
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {req.fromName}
                            </p>
                            {req.fromTitle && (
                              <p className="text-xs text-slate-400 truncate">{req.fromTitle}</p>
                            )}
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRespondRequest(req, true)}
                              className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700"
                            >
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleRespondRequest(req, false)}
                              className="w-7 h-7 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs hover:bg-slate-200"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">
                    Friends ({filteredFriends.length})
                  </h3>
                  {filteredFriends.length > 0 ? (
                    <div className="space-y-2">
                      {filteredFriends.slice(0, 6).map((f) => (
                        <div
                          key={f.uid}
                          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                          onClick={() => setViewingProfile(f)}
                        >
                          <div className="relative">
                            <img
                              src={f.photoURL || avatarUrl(f.displayName)}
                              alt={f.displayName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {f.displayName}
                            </p>
                            {f.title && (
                              <p className="text-xs text-slate-400 truncate">{f.title}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">No friends yet.</p>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">People You May Know</h3>
                  <div className="space-y-3">
                    {nonFriends.slice(0, 4).map((u) => (
                      <div key={u.uid} className="flex items-center gap-3">
                        <img
                          src={u.photoURL || avatarUrl(u.displayName)}
                          alt={u.displayName}
                          className="w-9 h-9 rounded-full object-cover cursor-pointer"
                          onClick={() => setViewingProfile(u)}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold text-slate-900 truncate cursor-pointer hover:text-indigo-600"
                            onClick={() => setViewingProfile(u)}
                          >
                            {u.displayName}
                          </p>
                          {u.title && (
                            <p className="text-xs text-slate-400 truncate">{u.title}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleFriendAction(u.uid, "send")}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FRIENDS TAB ── */}
          {activeTab === "friends" && (
            <div className="space-y-6 max-w-5xl">
              {pendingRequests.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {pendingRequests.length}
                    </span>
                    Friend Requests
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <img
                          src={req.fromAvatar || avatarUrl(req.fromName)}
                          alt={req.fromName}
                          className="w-12 h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
                          onClick={() =>
                            setViewingProfile(
                              allUsers.find((u) => u.uid === req.fromId) || null
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm">{req.fromName}</p>
                          {req.fromTitle && (
                            <p className="text-xs text-indigo-500 truncate">{req.fromTitle}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {timeAgo(req.createdAt)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleRespondRequest(req, true)}
                              className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondRequest(req, false)}
                              className="flex-1 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">
                    Your Friends
                    <span className="ml-2 text-indigo-600 font-normal">
                      ({filteredFriends.length})
                    </span>
                  </h2>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                      placeholder="Search friends…"
                      className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44"
                    />
                  </div>
                </div>

                {filteredFriends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFriends.map((f) => (
                      <div
                        key={f.uid}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setViewingProfile(f)}
                      >
                        <img
                          src={f.photoURL || avatarUrl(f.displayName)}
                          alt={f.displayName}
                          className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                        />
                        <p className="font-semibold text-slate-900 text-sm">{f.displayName}</p>
                        {f.title && (
                          <p className="text-xs text-slate-500 mt-0.5">{f.title}</p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFriendAction(f.uid, "unfriend");
                          }}
                          className="mt-3 w-full py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100"
                        >
                          Unfriend
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-500">No friends matching search</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── GROUPS TAB ── */}
          {activeTab === "groups" && (
            <div className="space-y-4 max-w-5xl">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Create Group
              </button>
              {groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setViewingGroup(group)}
                    >
                      <div
                        className={`h-24 bg-gradient-to-br ${group.coverColor}`}
                      ></div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900">{group.name}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                          {group.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-3">
                          {group.memberIds.length} member
                          {group.memberIds.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <i className="fa-solid fa-users text-slate-300 text-4xl mb-4"></i>
                  <p className="text-slate-600 font-medium">No groups yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {showCreatePost && currentUser && (
        <CreatePostModal user={currentUser} onClose={() => setShowCreatePost(false)} onPost={handleCreatePost} />
      )}
    </main>
  );
}