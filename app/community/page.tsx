"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../sidebar/page";
import BottomBar from "../bottom-bar/page";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, addDoc, query, orderBy, limit, getDocs,
  serverTimestamp, doc, getDoc, updateDoc, arrayUnion,
  arrayRemove, where, deleteDoc,
} from "firebase/firestore";

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
  content: string;
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
  "from-violet-500 to-fuchsia-600",
];

const CAREER_ICONS: Record<string, string> = {
  frontend: "⚛️",
  backend: "⚙️",
  "data-science": "📊",
  mobile: "📱",
  designer: "🎨",
  devops: "🛠️",
};

// ─── Friend Card ──────────────────────────────────────────────────────────────
function FriendCard({ friend, currentUser, mutualCount, onViewProfile, onMessage, onUnfriend }: {
  friend: UserProfile;
  currentUser: UserProfile;
  mutualCount: number;
  onViewProfile: (uid: string) => void;
  onMessage: (friend: UserProfile) => void;
  onUnfriend: (uid: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
      {/* Cover banner */}
      <div className="h-16 bg-gradient-to-r from-indigo-400 to-purple-500 relative">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        {/* Menu button */}
        <div className="absolute top-2 right-2">
          <button onClick={() => setShowMenu(!showMenu)}
            className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
            <i className="fa-solid fa-ellipsis text-xs"></i>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 w-36">
              <button onClick={() => { onViewProfile(friend.uid); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <i className="fa-solid fa-user text-slate-400 text-xs w-3"></i> View Profile
              </button>
              <button onClick={() => { onMessage(friend); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <i className="fa-solid fa-comment text-slate-400 text-xs w-3"></i> Message
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button onClick={() => { onUnfriend(friend.uid); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                <i className="fa-solid fa-user-minus text-red-400 text-xs w-3"></i> Unfriend
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className="-mt-8 mb-3 flex items-end justify-between">
          <img
            src={friend.photoURL || avatarUrl(friend.displayName)}
            alt={friend.displayName}
            className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover cursor-pointer"
            onClick={() => onViewProfile(friend.uid)}
          />
          <button
            onClick={() => onMessage(friend)}
            className="mb-1 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <i className="fa-solid fa-comment text-xs"></i> Message
          </button>
        </div>

        {/* Name & title */}
        <h3
          className="font-bold text-slate-900 text-base cursor-pointer hover:text-indigo-600 transition-colors leading-tight"
          onClick={() => onViewProfile(friend.uid)}
        >
          {friend.displayName}
        </h3>
        {friend.title && (
          <p className="text-xs text-indigo-500 font-medium mt-0.5">{friend.title}</p>
        )}

        {/* Career goal */}
        {friend.careerGoal && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-sm">{CAREER_ICONS[friend.careerGoal] || "💼"}</span>
            <span className="text-xs text-slate-600 capitalize font-medium">{friend.careerGoal.replace("-", " ")}</span>
          </div>
        )}

        {/* Bio */}
        {friend.bio && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{friend.bio}</p>
        )}

        {/* Skills */}
        {friend.skills && friend.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {friend.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                {skill}
              </span>
            ))}
            {friend.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-full">
                +{friend.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <i className="fa-solid fa-user-group text-slate-300 text-xs"></i>
            <span>{friend.friends?.length || 0} friends</span>
          </div>
          {mutualCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium">
              <i className="fa-solid fa-link text-xs"></i>
              <span>{mutualCount} mutual</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────
function ProfileModal({ profile, currentUserId, currentUserFriends, onClose, onFriendAction, onMessage }: {
  profile: UserProfile;
  currentUserId: string;
  currentUserFriends: string[];
  onClose: () => void;
  onFriendAction: (targetId: string, action: "send" | "unfriend") => void;
  onMessage?: (profile: UserProfile) => void;
}) {
  const isFriend = currentUserFriends.includes(profile.uid);
  const isSelf = profile.uid === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <img
              src={profile.photoURL || avatarUrl(profile.displayName)}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
            {!isSelf && (
              <div className="flex gap-2 mb-1">
                {onMessage && (
                  <button onClick={() => { onMessage(profile); onClose(); }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5">
                    <i className="fa-solid fa-comment text-xs"></i> Message
                  </button>
                )}
                <button
                  onClick={() => { onFriendAction(profile.uid, isFriend ? "unfriend" : "send"); onClose(); }}
                  className={`px-3 py-2 rounded-xl font-semibold text-xs transition-colors ${isFriend ? "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                  {isFriend ? "Unfriend" : "+ Add Friend"}
                </button>
              </div>
            )}
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-slate-900">{profile.displayName}</h2>
          {profile.title && <p className="text-sm text-indigo-600 font-medium mt-0.5">{profile.title}</p>}

          {/* Career goal */}
          {profile.careerGoal && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-base">{CAREER_ICONS[profile.careerGoal] || "💼"}</span>
              <span className="text-sm text-slate-600 capitalize">{profile.careerGoal.replace("-", " ")}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-600 mt-3 leading-relaxed bg-slate-50 rounded-xl px-3 py-2">{profile.bio}</p>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 rounded-xl py-3">
              <p className="text-xl font-bold text-slate-900">{profile.friends?.length || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Friends</p>
            </div>
            <div className="bg-slate-50 rounded-xl py-3">
              <p className="text-xl font-bold text-slate-900">{profile.skills?.length || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Skills</p>
            </div>
          </div>
        </div>
      </div>
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
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();
  const [urlInput, setUrlInput] = useState("");
  const [mediaMode, setMediaMode] = useState<"none" | "image" | "video">("none");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    await onPost(content, mediaUrl || undefined, mediaType);
    setPosting(false);
    onClose();
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

          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
            placeholder={`What's on your mind, ${user.displayName.split(" ")[0]}?`}
            className="w-full text-slate-900 placeholder-slate-400 focus:outline-none resize-none text-base leading-relaxed" />

          {mediaUrl && mediaType === "image" && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={mediaUrl} alt="preview" className="w-full max-h-48 object-cover" />
              <button onClick={() => { setMediaUrl(""); setMediaType(undefined); setUrlInput(""); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}
          {mediaUrl && mediaType === "video" && (
            <div className="relative rounded-xl overflow-hidden">
              <video src={mediaUrl} controls className="w-full max-h-48 rounded-xl" />
              <button onClick={() => { setMediaUrl(""); setMediaType(undefined); setUrlInput(""); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {mediaMode !== "none" && !mediaUrl && (
            <div className="flex gap-2">
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                placeholder={mediaMode === "image" ? "Paste image URL…" : "Paste video URL…"}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={() => { setMediaUrl(urlInput.trim()); setMediaType(mediaMode as "image" | "video"); }}
                disabled={!urlInput.trim()}
                className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">Add</button>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Add:</span>
            <button onClick={() => setMediaMode(mediaMode === "image" ? "none" : "image")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mediaMode === "image" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <i className="fa-solid fa-image"></i> Photo
            </button>
            <button onClick={() => setMediaMode(mediaMode === "video" ? "none" : "video")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mediaMode === "video" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <i className="fa-solid fa-video"></i> Video
            </button>
          </div>

          <button onClick={handlePost} disabled={!content.trim() || posting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {posting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Posting…</> : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Group Modal ───────────────────────────────────────────────────────
function CreateGroupModal({ currentUser, allUsers, onClose, onCreate }: {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onClose: () => void;
  onCreate: (name: string, description: string, color: string, memberIds: string[]) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = allUsers.filter(
    (u) => u.uid !== currentUser.uid && u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (uid: string) =>
    setSelectedMembers((p) => p.includes(uid) ? p.filter((id) => id !== uid) : [...p, uid]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Create Group</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-xmark text-slate-600 text-sm"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className={`h-20 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
            <p className="text-white font-bold text-lg">{name || "Group Name"}</p>
          </div>
          <div className="flex gap-2">
            {GROUP_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} ${color === c ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`} />
            ))}
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name *"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            placeholder="What is this group about?"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Add Members ({selectedMembers.length} selected)
            </label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" />
            <div className="max-h-36 overflow-y-auto space-y-1">
              {filtered.map((u) => (
                <div key={u.uid} onClick={() => toggle(u.uid)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedMembers.includes(u.uid) ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                  <img src={u.photoURL || avatarUrl(u.displayName)} alt={u.displayName} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.displayName}</p>
                    {u.title && <p className="text-xs text-slate-400 truncate">{u.title}</p>}
                  </div>
                  {selectedMembers.includes(u.uid) && <i className="fa-solid fa-check text-indigo-600 text-xs"></i>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={async () => { setCreating(true); await onCreate(name, description, color, selectedMembers); setCreating(false); onClose(); }}
            disabled={!name.trim() || creating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {creating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating…</> : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Group Detail Modal ───────────────────────────────────────────────────────
function GroupDetailModal({ group, allUsers, currentUserId, onClose, onAddMember, onLeave }: {
  group: Group; allUsers: UserProfile[]; currentUserId: string;
  onClose: () => void; onAddMember: (gid: string, uid: string) => Promise<void>; onLeave: (gid: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const members = allUsers.filter((u) => group.memberIds.includes(u.uid));
  const nonMembers = allUsers.filter((u) => !group.memberIds.includes(u.uid) && u.displayName.toLowerCase().includes(search.toLowerCase()));
  const isAdmin = group.adminId === currentUserId;
  const isMember = group.memberIds.includes(currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
        <div className={`h-24 bg-gradient-to-r ${group.coverColor} rounded-t-2xl relative flex items-center justify-center`}>
          <p className="text-white font-bold text-xl">{group.name}</p>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          {group.description && <p className="text-sm text-slate-600">{group.description}</p>}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{members.length} member{members.length !== 1 ? "s" : ""}</p>
            {!isMember && (
              <button onClick={() => onAddMember(group.id, currentUserId)}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">Join Group</button>
            )}
            {isMember && !isAdmin && (
              <button onClick={() => { onLeave(group.id); onClose(); }}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100">Leave Group</button>
            )}
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {members.map((m) => (
              <div key={m.uid} className="flex items-center gap-3">
                <img src={m.photoURL || avatarUrl(m.displayName)} alt={m.displayName} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{m.displayName}</p>
                  {m.title && <p className="text-xs text-slate-400 truncate">{m.title}</p>}
                </div>
                {m.uid === group.adminId && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Add Members</p>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users to add…"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" />
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {nonMembers.map((u) => (
                  <div key={u.uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <img src={u.photoURL || avatarUrl(u.displayName)} alt={u.displayName} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{u.displayName}</p>
                      {u.title && <p className="text-xs text-slate-400 truncate">{u.title}</p>}
                    </div>
                    <button onClick={() => onAddMember(group.id, u.uid)}
                      className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment, onViewProfile }: {
  post: Post; currentUser: UserProfile;
  onLike: (id: string) => void; onComment: (id: string, text: string) => void; onViewProfile: (uid: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const liked = post.likes.includes(currentUser.uid);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile(post.userId)}>
          <img src={post.userAvatar || avatarUrl(post.userName)} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition-colors">{post.userName}</p>
            {post.userTitle && <p className="text-xs text-indigo-500">{post.userTitle}</p>}
            <p className="text-xs text-slate-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button className="w-8 h-8 hover:bg-slate-100 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-ellipsis text-slate-400 text-sm"></i>
        </button>
      </div>
      <div className="px-4 pb-3">
        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>
      {post.mediaUrl && post.mediaType === "image" && <img src={post.mediaUrl} alt="Post" className="w-full max-h-80 object-cover" />}
      {post.mediaUrl && post.mediaType === "video" && <video src={post.mediaUrl} controls className="w-full max-h-80" />}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-50">
        <span>{post.likes.length} like{post.likes.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setShowComments(!showComments)} className="hover:text-slate-800">
          {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
        </button>
      </div>
      <div className="flex border-t border-slate-100">
        {[
          { icon: liked ? "fa-solid fa-heart" : "fa-regular fa-heart", label: "Like", action: () => onLike(post.id), active: liked },
          { icon: "fa-regular fa-comment", label: "Comment", action: () => setShowComments(!showComments), active: false },
          { icon: "fa-regular fa-share-from-square", label: "Share", action: () => {}, active: false },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.action}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-slate-50 transition-colors text-sm font-medium ${btn.active ? "text-rose-500" : "text-slate-500"}`}>
            <i className={btn.icon}></i><span>{btn.label}</span>
          </button>
        ))}
      </div>
      {showComments && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <img src={c.userAvatar || avatarUrl(c.userName)} alt={c.userName} className="w-7 h-7 rounded-full flex-shrink-0 object-cover" />
              <div className="flex-1 bg-slate-50 rounded-2xl px-3 py-2">
                <p className="text-xs font-bold text-slate-900">{c.userName}</p>
                <p className="text-xs text-slate-700 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <img src={currentUser.photoURL || avatarUrl(currentUser.displayName)} alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover" />
            <div className="flex-1 flex gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                placeholder="Write a comment…"
                className="flex-1 bg-slate-100 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button onClick={() => { if (commentText.trim()) { onComment(post.id, commentText); setCommentText(""); } }}
                disabled={!commentText.trim()}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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
  const [discoverSearch, setDiscoverSearch] = useState("");

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);

  const [selectedChat, setSelectedChat] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const pendingRequests = friendRequests.filter((r) => r.toId === currentUser?.uid && r.status === "pending");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) { router.push("/login"); return; }
      const ud = (await getDoc(doc(db, "users", fu.uid))).data() || {};
      setCurrentUser({
        uid: fu.uid,
        displayName: ud.name || fu.displayName || "User",
        photoURL: ud.photoURL || fu.photoURL || undefined,
        title: ud.title, bio: ud.bio, careerGoal: ud.careerGoal,
        skills: ud.skills || [], friends: ud.friends || [],
      });
      await Promise.all([fetchPosts(), fetchAllUsers(), fetchGroups(), fetchFriendRequests(fu.uid)]);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchPosts = async () => {
    try {
      const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30)));
      setPosts(snap.docs.map((d) => ({
        id: d.id, userId: d.data().userId || "", userName: d.data().userName || "Anonymous",
        userAvatar: d.data().userAvatar, userTitle: d.data().userTitle,
        content: d.data().content || "", mediaUrl: d.data().mediaUrl, mediaType: d.data().mediaType,
        likes: d.data().likes || [], comments: d.data().comments || [], createdAt: d.data().createdAt,
      })));
    } catch (e) { console.error(e); }
  };

  const fetchAllUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setAllUsers(snap.docs.map((d) => ({
        uid: d.id,
        displayName: d.data().fullName || d.data().displayName || "User",
        photoURL: d.data().photoURL, title: d.data().title, bio: d.data().bio,
        careerGoal: d.data().careerGoal, skills: d.data().skills || [], friends: d.data().friends || [],
      })));
    } catch (e) { console.error(e); }
  };

  const fetchGroups = async () => {
    try {
      const snap = await getDocs(query(collection(db, "groups"), orderBy("createdAt", "desc")));
      setGroups(snap.docs.map((d) => ({
        id: d.id, name: d.data().name || "", description: d.data().description || "",
        coverColor: d.data().coverColor || GROUP_COLORS[0],
        memberIds: d.data().memberIds || [], adminId: d.data().adminId || "", createdAt: d.data().createdAt,
      })));
    } catch (e) { console.error(e); }
  };

  const fetchFriendRequests = async (uid: string) => {
    try {
      const snap = await getDocs(query(collection(db, "friendRequests"), where("toId", "==", uid), where("status", "==", "pending")));
      setFriendRequests(snap.docs.map((d) => ({
        id: d.id, fromId: d.data().fromId, fromName: d.data().fromName,
        fromAvatar: d.data().fromAvatar, fromTitle: d.data().fromTitle,
        toId: d.data().toId, status: d.data().status, createdAt: d.data().createdAt,
      })));
    } catch (e) { console.error(e); }
  };

  const loadMessages = async (uid: string) => {
    const chatId = [currentUser!.uid, uid].sort().join("_");
    try {
      const snap = await getDocs(query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"), limit(50)));
      setMessages(snap.docs.map((d) => ({
        id: d.id, senderId: d.data().senderId, content: d.data().content,
        timestamp: d.data().timestamp?.toDate() || new Date(),
      })));
    } catch { setMessages([]); }
  };

  const handleCreatePost = async (content: string, mediaUrl?: string, mediaType?: "image" | "video") => {
    if (!currentUser) return;
    await addDoc(collection(db, "posts"), {
      userId: currentUser.uid, userName: currentUser.displayName,
      userAvatar: currentUser.photoURL || null, userTitle: currentUser.title || null,
      content, mediaUrl: mediaUrl || null, mediaType: mediaType || null,
      likes: [], comments: [], createdAt: serverTimestamp(),
    });
    await fetchPosts();
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    const liked = post?.likes.includes(currentUser.uid);
    await updateDoc(doc(db, "posts", postId), { likes: liked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid) });
    await fetchPosts();
  };

  const handleComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "posts", postId), {
      comments: arrayUnion({
        id: Date.now().toString(), userId: currentUser.uid, userName: currentUser.displayName,
        userAvatar: currentUser.photoURL || null, content: text, createdAt: new Date(),
      }),
    });
    await fetchPosts();
  };

  const handleFriendAction = async (targetId: string, action: "send" | "unfriend") => {
    if (!currentUser) return;
    if (action === "send") {
      const target = allUsers.find((u) => u.uid === targetId);
      await addDoc(collection(db, "friendRequests"), {
        fromId: currentUser.uid, fromName: currentUser.displayName,
        fromAvatar: currentUser.photoURL || null, fromTitle: currentUser.title || null,
        toId: targetId, status: "pending", createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, "users", currentUser.uid), { friends: arrayRemove(targetId) });
      await updateDoc(doc(db, "users", targetId), { friends: arrayRemove(currentUser.uid) });
      setCurrentUser((p) => p ? { ...p, friends: p.friends?.filter((id) => id !== targetId) } : p);
    }
  };

  const handleRespondRequest = async (req: FriendRequest, accept: boolean) => {
    await updateDoc(doc(db, "friendRequests", req.id), { status: accept ? "accepted" : "declined" });
    if (accept && currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), { friends: arrayUnion(req.fromId) });
      await updateDoc(doc(db, "users", req.fromId), { friends: arrayUnion(currentUser.uid) });
      setCurrentUser((p) => p ? { ...p, friends: [...(p.friends || []), req.fromId] } : p);
    }
    setFriendRequests((p) => p.filter((r) => r.id !== req.id));
  };

  const handleCreateGroup = async (name: string, desc: string, color: string, memberIds: string[]) => {
    if (!currentUser) return;
    await addDoc(collection(db, "groups"), {
      name, description: desc, coverColor: color,
      memberIds: [currentUser.uid, ...memberIds], adminId: currentUser.uid, createdAt: serverTimestamp(),
    });
    await fetchGroups();
  };

  const handleAddMember = async (gid: string, uid: string) => {
    await updateDoc(doc(db, "groups", gid), { memberIds: arrayUnion(uid) });
    await fetchGroups();
    setViewingGroup((p) => p && p.id === gid ? { ...p, memberIds: [...p.memberIds, uid] } : p);
  };

  const handleLeaveGroup = async (gid: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "groups", gid), { memberIds: arrayRemove(currentUser.uid) });
    await fetchGroups();
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !currentUser) return;
    const chatId = [currentUser.uid, selectedChat.uid].sort().join("_");
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: currentUser.uid, content: messageText.trim(), timestamp: serverTimestamp(),
    });
    setMessages((p) => [...p, { id: Date.now().toString(), senderId: currentUser.uid, content: messageText.trim(), timestamp: new Date() }]);
    setMessageText("");
  };

  const openChat = (friend: UserProfile) => {
    setSelectedChat(friend);
    loadMessages(friend.uid);
    setActiveTab("chat");
  };

  const getMutualCount = (friend: UserProfile) => {
    if (!currentUser?.friends) return 0;
    return (friend.friends || []).filter((fid) => currentUser.friends!.includes(fid)).length;
  };

  const friends = allUsers.filter((u) => currentUser?.friends?.includes(u.uid));
  const filteredFriends = friends.filter((f) =>
    f.displayName.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.title?.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.careerGoal?.toLowerCase().includes(friendSearch.toLowerCase()) ||
    f.skills?.some((s) => s.toLowerCase().includes(friendSearch.toLowerCase()))
  );
  const nonFriends = allUsers.filter((u) => u.uid !== currentUser?.uid && !currentUser?.friends?.includes(u.uid));
  const filteredDiscover = nonFriends.filter((u) =>
    u.displayName.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    u.title?.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    u.careerGoal?.toLowerCase().includes(discoverSearch.toLowerCase())
  );

  if (loading || !currentUser) {
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
    { id: "chat", label: "Messages", icon: "fa-comment" },
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                <i className={`fa-solid ${tab.icon} text-xs`}></i>
                {tab.label}
                {tab.badge ? <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{tab.badge}</span> : null}
              </button>
            ))}
          </div>

          {/* ── FEED ── */}
          {activeTab === "feed" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.photoURL || avatarUrl(currentUser.displayName)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <button onClick={() => setShowCreatePost(true)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-2.5 text-left text-slate-500 text-sm transition-colors">
                      What's on your mind, {currentUser.displayName.split(" ")[0]}?
                    </button>
                  </div>
                  <div className="flex items-center justify-around mt-3 pt-3 border-t border-slate-100">
                    {[{ icon: "fa-image", label: "Photo", color: "text-green-500" }, { icon: "fa-video", label: "Video", color: "text-red-500" }, { icon: "fa-face-smile", label: "Feeling", color: "text-yellow-500" }].map((btn) => (
                      <button key={btn.label} onClick={() => setShowCreatePost(true)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <i className={`fa-solid ${btn.icon} ${btn.color} text-sm`}></i>
                        <span className="text-sm font-medium text-slate-600">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {posts.length > 0 ? posts.map((post) => (
                  <PostCard key={post.id} post={post} currentUser={currentUser}
                    onLike={handleLike} onComment={handleComment} onViewProfile={(uid) => setViewingProfile(allUsers.find((u) => u.uid === uid) || null)} />
                )) : (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-comments text-indigo-400 text-2xl"></i>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">No posts yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Be the first to share something!</p>
                    <button onClick={() => setShowCreatePost(true)} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">Create Post</button>
                  </div>
                )}
              </div>
              <div className="hidden lg:block space-y-4">
                {pendingRequests.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <h3 className="font-bold text-slate-900 mb-3 text-sm">Friend Requests <span className="text-indigo-600">({pendingRequests.length})</span></h3>
                    <div className="space-y-3">
                      {pendingRequests.map((req) => (
                        <div key={req.id} className="flex items-center gap-3">
                          <img src={req.fromAvatar || avatarUrl(req.fromName)} alt={req.fromName} className="w-9 h-9 rounded-full object-cover cursor-pointer"
                            onClick={() => setViewingProfile(allUsers.find((u) => u.uid === req.fromId) || null)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{req.fromName}</p>
                            {req.fromTitle && <p className="text-xs text-slate-400 truncate">{req.fromTitle}</p>}
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleRespondRequest(req, true)} className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700"><i className="fa-solid fa-check"></i></button>
                            <button onClick={() => handleRespondRequest(req, false)} className="w-7 h-7 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs hover:bg-slate-200"><i className="fa-solid fa-xmark"></i></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">Friends ({friends.length})</h3>
                  {friends.length > 0 ? (
                    <div className="space-y-2">
                      {friends.slice(0, 6).map((f) => (
                        <div key={f.uid} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => setViewingProfile(f)}>
                          <div className="relative">
                            <img src={f.photoURL || avatarUrl(f.displayName)} alt={f.displayName} className="w-8 h-8 rounded-full object-cover" />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{f.displayName}</p>
                            {f.title && <p className="text-xs text-slate-400 truncate">{f.title}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-400 text-center py-2">No friends yet.</p>}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">People You May Know</h3>
                  <div className="space-y-3">
                    {nonFriends.slice(0, 4).map((u) => (
                      <div key={u.uid} className="flex items-center gap-3">
                        <img src={u.photoURL || avatarUrl(u.displayName)} alt={u.displayName} className="w-9 h-9 rounded-full object-cover cursor-pointer" onClick={() => setViewingProfile(u)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate cursor-pointer hover:text-indigo-600" onClick={() => setViewingProfile(u)}>{u.displayName}</p>
                          {u.title && <p className="text-xs text-slate-400 truncate">{u.title}</p>}
                        </div>
                        <button onClick={() => handleFriendAction(u.uid, "send")} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100">+ Add</button>
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
              {/* Pending requests */}
              {pendingRequests.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{pendingRequests.length}</span>
                    Friend Requests
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pendingRequests.map((req) => {
                      const reqProfile = allUsers.find((u) => u.uid === req.fromId);
                      return (
                        <div key={req.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <img src={req.fromAvatar || avatarUrl(req.fromName)} alt={req.fromName}
                            className="w-12 h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
                            onClick={() => reqProfile && setViewingProfile(reqProfile)} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{req.fromName}</p>
                            {req.fromTitle && <p className="text-xs text-indigo-500 truncate">{req.fromTitle}</p>}
                            {reqProfile?.careerGoal && (
                              <p className="text-xs text-slate-400 capitalize mt-0.5">{reqProfile.careerGoal.replace("-", " ")}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">{timeAgo(req.createdAt)}</p>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleRespondRequest(req, true)}
                                className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Accept</button>
                              <button onClick={() => handleRespondRequest(req, false)}
                                className="flex-1 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300">Decline</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Your friends */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">
                    Your Friends
                    <span className="ml-2 text-indigo-600 font-normal">({filteredFriends.length})</span>
                  </h2>
                  {/* Search */}
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input value={friendSearch} onChange={(e) => setFriendSearch(e.target.value)}
                      placeholder="Search friends…"
                      className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44" />
                  </div>
                </div>

                {filteredFriends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFriends.map((f) => (
                      <FriendCard
                        key={f.uid}
                        friend={f}
                        currentUser={currentUser}
                        mutualCount={getMutualCount(f)}
                        onViewProfile={(uid) => setViewingProfile(allUsers.find((u) => u.uid === uid) || null)}
                        onMessage={openChat}
                        onUnfriend={(uid) => handleFriendAction(uid, "unfriend")}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fa-solid fa-user-group text-slate-400 text-xl"></i>
                    </div>
                    <p className="text-slate-500 text-sm">
                      {friendSearch ? "No friends match your search." : "You haven't added any friends yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Discover */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">
                    Discover People
                    <span className="ml-2 text-slate-400 font-normal text-sm">({filteredDiscover.length})</span>
                  </h2>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input value={discoverSearch} onChange={(e) => setDiscoverSearch(e.target.value)}
                      placeholder="Search people…"
                      className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDiscover.map((u) => (
                    <div key={u.uid} className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                      <img src={u.photoURL || avatarUrl(u.displayName)} alt={u.displayName}
                        className="w-12 h-12 rounded-full object-cover cursor-pointer flex-shrink-0"
                        onClick={() => setViewingProfile(u)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate cursor-pointer hover:text-indigo-600" onClick={() => setViewingProfile(u)}>{u.displayName}</p>
                        {u.title && <p className="text-xs text-indigo-500 truncate">{u.title}</p>}
                        {u.careerGoal && (
                          <p className="text-xs text-slate-400 capitalize mt-0.5">
                            {CAREER_ICONS[u.careerGoal] || "💼"} {u.careerGoal.replace("-", " ")}
                          </p>
                        )}
                        {u.skills && u.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {u.skills.slice(0, 2).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">{s}</span>
                            ))}
                            {u.skills.length > 2 && <span className="text-xs text-slate-400">+{u.skills.length - 2}</span>}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleFriendAction(u.uid, "send")}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 flex-shrink-0">
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── GROUPS ── */}
          {activeTab === "groups" && (
            <div className="max-w-4xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-lg">{groups.length} Group{groups.length !== 1 ? "s" : ""}</h2>
                <button onClick={() => setShowCreateGroup(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 text-sm">
                  <i className="fa-solid fa-plus"></i> Create Group
                </button>
              </div>
              {groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group) => {
                    const isMember = group.memberIds.includes(currentUser.uid);
                    const memberProfiles = allUsers.filter((u) => group.memberIds.includes(u.uid)).slice(0, 3);
                    return (
                      <div key={group.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingGroup(group)}>
                        <div className={`h-24 bg-gradient-to-r ${group.coverColor} flex items-center justify-center`}>
                          <p className="text-white font-bold text-lg px-4 text-center leading-tight">{group.name}</p>
                        </div>
                        <div className="p-4">
                          {group.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{group.description}</p>}
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {memberProfiles.map((m) => (
                                <img key={m.uid} src={m.photoURL || avatarUrl(m.displayName)} alt={m.displayName} className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">{group.memberIds.length} member{group.memberIds.length !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="mt-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isMember ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                              {isMember ? "✓ Member" : "Not joined"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-users text-indigo-400 text-2xl"></i>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">No groups yet</h3>
                  <p className="text-slate-500 text-sm mb-4">Create a group to connect with others</p>
                  <button onClick={() => setShowCreateGroup(true)} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">Create First Group</button>
                </div>
              )}
            </div>
          )}

          {/* ── CHAT ── */}
          {activeTab === "chat" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
              <div className="border-r border-slate-100 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 mb-3">Messages</h2>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input type="text" placeholder="Search…" className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {allUsers.filter((u) => u.uid !== currentUser.uid).map((u) => (
                    <div key={u.uid} onClick={() => { setSelectedChat(u); loadMessages(u.uid); }}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${selectedChat?.uid === u.uid ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                      <div className="relative">
                        <img src={u.photoURL || avatarUrl(u.displayName)} alt={u.displayName} className="w-10 h-10 rounded-full object-cover" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{u.displayName}</p>
                        {u.title && <p className="text-xs text-slate-400 truncate">{u.title}</p>}
                      </div>
                      {currentUser.friends?.includes(u.uid) && <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                      <img src={selectedChat.photoURL || avatarUrl(selectedChat.displayName)} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{selectedChat.displayName}</p>
                        {selectedChat.title && <p className="text-xs text-slate-400">{selectedChat.title}</p>}
                      </div>
                      <button onClick={() => setViewingProfile(selectedChat)} className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">View Profile</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg) => {
                        const isMine = msg.senderId === currentUser.uid;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            {!isMine && <img src={selectedChat.photoURL || avatarUrl(selectedChat.displayName)} alt="" className="w-7 h-7 rounded-full mr-2 self-end flex-shrink-0 object-cover" />}
                            <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm"}`}>
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatBottomRef} />
                    </div>
                    <div className="p-4 border-t border-slate-100 flex items-center gap-3">
                      <input value={messageText} onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type a message…"
                        className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <button onClick={handleSendMessage} disabled={!messageText.trim()}
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-colors flex-shrink-0">
                        <i className="fa-solid fa-paper-plane text-sm"></i>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-comments text-indigo-400 text-2xl"></i>
                      </div>
                      <p className="font-bold text-slate-900 mb-1">Your Messages</p>
                      <p className="text-slate-500 text-sm">Select a person to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {showCreatePost && <CreatePostModal user={currentUser} onClose={() => setShowCreatePost(false)} onPost={handleCreatePost} />}
      {showCreateGroup && <CreateGroupModal currentUser={currentUser} allUsers={allUsers} onClose={() => setShowCreateGroup(false)} onCreate={handleCreateGroup} />}
      {viewingProfile && (
        <ProfileModal profile={viewingProfile} currentUserId={currentUser.uid} currentUserFriends={currentUser.friends || []}
          onClose={() => setViewingProfile(null)} onFriendAction={handleFriendAction} onMessage={openChat} />
      )}
      {viewingGroup && (
        <GroupDetailModal group={viewingGroup} allUsers={allUsers} currentUserId={currentUser.uid}
          onClose={() => setViewingGroup(null)} onAddMember={handleAddMember} onLeave={handleLeaveGroup} />
      )}
    </main>
  );
}