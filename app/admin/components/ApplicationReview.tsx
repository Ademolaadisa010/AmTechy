'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  limit,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

interface Application {
  id: string;
  applicantName: string;
  email: string;
  phone?: string;
  expertise: string[];
  experience: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  bio: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: any;
  motivation: string;
  whyTeach?: string;
  whatMakesGreat?: string;
  availability: string;
  hourlyRate?: number;
  preferredLanguages?: string[];
  yearsOfExperience?: number;
  rejectionReason?: string;
  userId?: string;
  jobTitle?: string;
  company?: string;
  teachingStyle?: string;
  studentsCount?: number;
  taughtBefore?: string;
  teachingLocation?: string;
  location?: string;
  experienceLevel?: string;
}

interface ApplicationReviewProps {
  onUpdate?: () => void;
}

// ── Safe converters ───────────────────────────────────────────────────────────

function toStr(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    return Object.entries(val)
      .filter(([, v]) => v && typeof v === 'string')
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  }
  return '';
}

function toArr(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/** Map a raw Firestore document to a safe Application object */
function mapDoc(id: string, raw: any): Application {
  console.log('Mapping document:', id, raw); // Debug log
  
  // Extract from nested objects
  const personalInfo = raw.personalInfo || {};
  const professionalBg = raw.professionalBackground || {};
  const teachingExp = raw.teachingExperience || {};
  const expertise = raw.expertise || {};
  
  // Motivation object
  const motivationRaw = raw.motivation ?? {};
  const isMotivationObj = motivationRaw && typeof motivationRaw === 'object' && Object.keys(motivationRaw).length > 0;

  // Get availability from multiple places
  const availability = raw.availability ?? motivationRaw?.availability ?? teachingExp?.availability ?? '';

  // Build experience string from professional background
  const experienceStr = professionalBg.yearsExperience
    ? `${professionalBg.yearsExperience} years as ${professionalBg.jobTitle || 'Professional'} at ${professionalBg.company || 'Company'}`
    : raw.experience ?? '';

  // Get skills/expertise from nested structure
  const skillsArray = toArr(expertise.primarySkills ?? expertise?.skills ?? raw.primarySkills ?? raw.expertise ?? raw.skills);

  // Build the application object
  const app: Application = {
    id,
    applicantName: toStr(personalInfo.fullName || raw.fullName || raw.applicantName || raw.name) || 'Unknown',
    email: toStr(personalInfo.email || raw.email),
    phone: toStr(personalInfo.phone || raw.phone) || undefined,
    location: toStr(personalInfo.location || raw.location) || undefined,
    expertise: skillsArray,
    experience: experienceStr,
    portfolioUrl: toStr(professionalBg.portfolio || raw.portfolioUrl) || undefined,
    resumeUrl: toStr(raw.resumeUrl || raw.resume) || undefined,
    linkedinUrl: toStr(professionalBg.linkedIn || raw.linkedinUrl) || undefined,
    bio: toStr(raw.bio ?? raw.about ?? raw.description),
    status: raw.status ?? 'pending',
    submittedAt: raw.submittedAt ?? raw.createdAt ?? null,
    motivation: isMotivationObj ? '' : toStr(motivationRaw),
    whyTeach: isMotivationObj ? toStr(motivationRaw?.whyTeach) : undefined,
    whatMakesGreat: isMotivationObj ? toStr(motivationRaw?.whatMakesGreat) : undefined,
    availability,
    hourlyRate: typeof raw.hourlyRate === 'number' ? raw.hourlyRate : undefined,
    preferredLanguages: toArr(raw.preferredLanguages ?? raw.languages),
    yearsOfExperience: professionalBg.yearsExperience ?? raw.yearsOfExperience ?? undefined,
    rejectionReason: toStr(raw.rejectionReason) || undefined,
    userId: toStr(raw.userId ?? raw.uid) || undefined,
    jobTitle: toStr(professionalBg.jobTitle || raw.jobTitle) || undefined,
    company: toStr(professionalBg.company || raw.company) || undefined,
    teachingStyle: toStr(teachingExp.teachingStyle || raw.teachingStyle) || undefined,
    studentsCount: teachingExp.studentsCount ?? raw.studentsCount ?? undefined,
    taughtBefore: toStr(teachingExp.taughtBefore || raw.taughtBefore) || undefined,
    teachingLocation: toStr(teachingExp.teachingLocation || raw.teachingLocation) || undefined,
    experienceLevel: toStr(expertise.experienceLevel || raw.experienceLevel) || undefined,
  };

  console.log('Mapped application:', app);
  return app;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ApplicationReview({ onUpdate }: ApplicationReviewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { fetchApplications(); }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(
        query(collection(db, 'tutor_applications'), limit(300))
      );
      console.log(`Fetched ${snapshot.size} applications`);
      if (snapshot.size > 0) {
        console.log('Sample doc:', snapshot.docs[0].data());
      }
      const mappedApps = snapshot.docs.map((d) => mapDoc(d.id, d.data()));
      setApplications(mappedApps);
    } catch (err: any) {
      console.error('Fetch error:', err);
      showToast(
        'error',
        err.code === 'permission-denied'
          ? 'Permission denied — check Firestore rules.'
          : 'Failed to load: ' + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (application: Application) => {
    if (!confirm(`Approve ${application.applicantName}?`)) return;
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'tutor_applications', application.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
      });

      const profileRef = application.userId
        ? doc(db, 'tutor_profiles', application.userId)
        : doc(collection(db, 'tutor_profiles'));

      await setDoc(profileRef, {
        displayName: application.applicantName,
        email: application.email,
        phone: application.phone || '',
        expertise: application.expertise,
        bio: application.bio,
        experience: application.experience,
        portfolioUrl: application.portfolioUrl || '',
        linkedinUrl: application.linkedinUrl || '',
        resumeUrl: application.resumeUrl || '',
        jobTitle: application.jobTitle || '',
        company: application.company || '',
        teachingStyle: application.teachingStyle || '',
        studentsCount: application.studentsCount || 0,
        availability: application.availability,
        preferredLanguages: application.preferredLanguages || [],
        yearsOfExperience: application.yearsOfExperience || 0,
        experienceLevel: application.experienceLevel || 'intermediate',
        rating: 0,
        totalReviews: 0,
        totalSessions: 0,
        isActive: true,
        isVerified: true,
        createdAt: serverTimestamp(),
        applicationId: application.id,
        userId: application.userId || null,
      });

      if (application.userId) {
        try {
          await updateDoc(doc(db, 'users', application.userId), {
            role: 'tutor',
            isTutor: true,
          });
        } catch (_) { /* non-fatal */ }
      }

      showToast('success', `${application.applicantName} approved!`);
      await fetchApplications();
      onUpdate?.();
      setShowModal(false);
      setSelectedApp(null);
    } catch (err: any) {
      showToast('error', 'Failed to approve: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || !selectedApp) return;
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'tutor_applications', selectedApp.id), {
        status: 'rejected',
        rejectionReason,
        rejectedAt: serverTimestamp(),
      });
      showToast('success', 'Application rejected.');
      await fetchApplications();
      onUpdate?.();
      setShowRejectionModal(false);
      setShowModal(false);
      setSelectedApp(null);
      setRejectionReason('');
    } catch (err: any) {
      showToast('error', 'Failed to reject: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchFilter = filter === 'all' || app.status === filter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      app.applicantName.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.expertise.some((s) => s.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const statusStyle = (s: string) =>
    ({ approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', under_review: 'bg-amber-100 text-amber-700', pending: 'bg-blue-100 text-blue-700' }[s] ?? 'bg-slate-100 text-slate-600');

  const statusIcon = (s: string) =>
    ({ approved: 'fa-circle-check', rejected: 'fa-circle-xmark', under_review: 'fa-clock', pending: 'fa-hourglass-half' }[s] ?? 'fa-circle');

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Application Review</h2>
        <p className="text-slate-500 text-sm mt-0.5">Review and approve tutor applications</p>
      </div>

      {/* Stat / filter cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {([
          { key: 'all', label: 'Total', color: 'text-slate-900' },
          { key: 'pending', label: 'Pending', color: 'text-blue-600' },
          { key: 'approved', label: 'Approved', color: 'text-green-400' },
          { key: 'rejected', label: 'Rejected', color: 'text-red-600' },
        ] as const).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${filter === key ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'}`}
          >
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{counts[key]}</p>
          </button>
        ))}
      </div>

      {/* Search + refresh */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex gap-3 items-center">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search name, email or skill…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-arrows-rotate" /> Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading applications…</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Applicant', 'Skills', 'Experience', 'Teaching', 'Status', 'Submitted', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {app.applicantName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{app.applicantName}</p>
                          <p className="text-xs text-slate-500">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {app.expertise.slice(0, 2).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">{s}</span>
                        ))}
                        {app.expertise.length > 2 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">+{app.expertise.length - 2}</span>
                        )}
                        {app.expertise.length === 0 && <span className="text-xs text-slate-400 italic">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                      {app.yearsOfExperience ? `${app.yearsOfExperience} yrs` : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                      {app.taughtBefore === 'yes' ? `${app.studentsCount || 0} students` : 'No experience'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle(app.status)}`}>
                        <i className={`fa-solid ${statusIcon(app.status)}`} />
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {app.submittedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => { setSelectedApp(app); setShowModal(true); }}
                        className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-14">
              <i className="fa-solid fa-inbox text-slate-200 text-5xl mb-3" />
              <p className="text-slate-400 font-medium">No applications found</p>
              <p className="text-slate-300 text-sm mt-1">
                {searchQuery ? 'Try a different search' : `No ${filter === 'all' ? '' : filter} applications yet`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedApp.applicantName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedApp.applicantName}</h3>
                  <p className="text-sm text-slate-500">{selectedApp.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle(selectedApp.status)}`}>
                  <i className={`fa-solid ${statusIcon(selectedApp.status)}`} />
                  {selectedApp.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => { setShowModal(false); setSelectedApp(null); }}
                  disabled={processing}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-xmark text-slate-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Quick facts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: 'fa-briefcase', label: 'Job Title', value: selectedApp.jobTitle || '—' },
                  { icon: 'fa-building', label: 'Company', value: selectedApp.company || '—' },
                  { icon: 'fa-clock', label: 'Availability', value: selectedApp.availability ? `${selectedApp.availability} hrs/week` : '—' },
                  { icon: 'fa-phone', label: 'Phone', value: selectedApp.phone || '—' },
                ].map((f, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <i className={`fa-solid ${f.icon} text-xs`} />
                      <span className="text-[10px] uppercase font-semibold tracking-wider">{f.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Expertise/Skills */}
              {selectedApp.expertise.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">🛠️ Primary Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.expertise.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience & Teaching */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedApp.yearsOfExperience && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">💼 Experience</p>
                    <p className="text-sm text-amber-900">{selectedApp.yearsOfExperience} years</p>
                    {selectedApp.experience && <p className="text-xs text-amber-700 mt-1">{selectedApp.experience}</p>}
                  </div>
                )}
                {selectedApp.taughtBefore && (
                  <div className="bg-green-50 border-l-4 border-green-400 rounded-r-xl p-4">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">🎓 Teaching</p>
                    <p className="text-sm text-green-900">{selectedApp.taughtBefore === 'yes' ? 'Yes' : 'No'}</p>
                    {selectedApp.studentsCount && <p className="text-xs text-green-700 mt-1">{selectedApp.studentsCount} students taught</p>}
                    {selectedApp.teachingLocation && <p className="text-xs text-green-700">{selectedApp.teachingLocation}</p>}
                  </div>
                )}
              </div>

              {/* Teaching Style */}
              {selectedApp.teachingStyle && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">👨‍🏫 Teaching Style</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">{selectedApp.teachingStyle}</p>
                </div>
              )}

              {/* Bio */}
              {selectedApp.bio && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">📝 Bio</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4">{selectedApp.bio}</p>
                </div>
              )}

              {/* Motivation */}
              {(selectedApp.whyTeach || selectedApp.whatMakesGreat || selectedApp.motivation) && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">💡 Motivation & Questions</p>
                  <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl p-4 space-y-3">
                    {selectedApp.whyTeach && (
                      <div>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Why Do You Want to Teach?</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedApp.whyTeach}</p>
                      </div>
                    )}
                    {selectedApp.whatMakesGreat && (
                      <div>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">What Makes You a Great Teacher?</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedApp.whatMakesGreat}</p>
                      </div>
                    )}
                    {!selectedApp.whyTeach && !selectedApp.whatMakesGreat && selectedApp.motivation && (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedApp.motivation}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {selectedApp.portfolioUrl && (
                  <a href={selectedApp.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                    <i className="fa-solid fa-globe text-slate-500" /> Portfolio
                  </a>
                )}
                {selectedApp.linkedinUrl && (
                  <a href={selectedApp.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors">
                    <i className="fa-brands fa-linkedin text-blue-500" /> LinkedIn
                  </a>
                )}
                {selectedApp.resumeUrl && (
                  <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-700 transition-colors">
                    <i className="fa-solid fa-file-pdf text-red-500" /> Resume / CV
                  </a>
                )}
              </div>

              {/* Rejection reason */}
              {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">
                    <i className="fa-solid fa-circle-exclamation mr-1" /> Rejection Reason
                  </p>
                  <p className="text-sm text-red-800">{selectedApp.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedApp.status === 'pending' ? (
              <div className="border-t border-slate-100 p-5 flex-shrink-0 bg-slate-50 rounded-b-2xl flex gap-3">
                <button
                  onClick={() => handleApprove(selectedApp)}
                  disabled={processing}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? <><i className="fa-solid fa-spinner fa-spin" /> Processing…</> : <><i className="fa-solid fa-circle-check" /> Approve & Create Profile</>}
                </button>
                <button
                  onClick={() => setShowRejectionModal(true)}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-circle-xmark" /> Reject
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-100 p-4 flex-shrink-0 text-center text-sm text-slate-500">
                <i className={`fa-solid ${statusIcon(selectedApp.status)} mr-1`} />
                This application has already been <strong>{selectedApp.status}</strong>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Rejection Modal ── */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Reject Application</h3>
              <p className="text-slate-500 text-sm mt-0.5">Provide a reason — this will be recorded.</p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Insufficient experience in required technologies…"
                rows={4}
                disabled={processing}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <p className="text-xs text-slate-400 mt-1">{rejectionReason.length} characters</p>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => { setShowRejectionModal(false); setRejectionReason(''); }}
                disabled={processing}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {processing ? <><i className="fa-solid fa-spinner fa-spin" /> Rejecting…</> : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}