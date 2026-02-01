'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  addDoc,
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
  availability?: string;
  hourlyRate?: number;
  preferredLanguages?: string[];
  yearsOfExperience?: number;
  rejectionReason?: string;
}

interface RejectionModal {
  show: boolean;
  applicationId: string | null;
}

interface ApplicationReviewProps {
  onUpdate?: () => void;
}

export default function ApplicationReview({ onUpdate }: ApplicationReviewProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<RejectionModal>({
    show: false,
    applicationId: null,
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
  setLoading(true);
  try {
    // Check authentication first
    const { auth } = await import('@/lib/firebase');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ User is not authenticated');
      alert('You must be logged in to view applications');
      setLoading(false);
      return;
    }
    
    console.log('✅ User authenticated:', currentUser.email);
    
    // TEMPORARILY REMOVE orderBy to test
    const applicationsQuery = query(
      collection(db, 'tutor_applications'),
      limit(200)
    );
    
    console.log('🔄 Fetching applications...');
    const snapshot = await getDocs(applicationsQuery);
    console.log('✅ Fetched', snapshot.docs.length, 'tutor_applications');
    console.log('📄 Documents:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const applicationsData: Application[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      applicantName: doc.data().applicantName || '',
      email: doc.data().email || '',
      phone: doc.data().phone,
      expertise: doc.data().expertise || [],
      experience: doc.data().experience || '',
      portfolioUrl: doc.data().portfolioUrl,
      resumeUrl: doc.data().resumeUrl,
      linkedinUrl: doc.data().linkedinUrl,
      bio: doc.data().bio || '',
      status: doc.data().status || 'pending',
      submittedAt: doc.data().submittedAt,
      motivation: doc.data().motivation || '',
      availability: doc.data().availability,
      hourlyRate: doc.data().hourlyRate,
      preferredLanguages: doc.data().preferredLanguages || [],
      yearsOfExperience: doc.data().yearsOfExperience,
      rejectionReason: doc.data().rejectionReason,
    }));

    setApplications(applicationsData);
  } catch (error: any) {
    console.error('❌ Error fetching applications:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      alert('Permission denied. Please check:\n1. You are logged in\n2. Firestore rules are deployed\n3. You have admin access');
    } else {
      alert('Failed to fetch applications: ' + error.message);
    }
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (application: Application) => {
    if (!confirm(`Approve ${application.applicantName}'s application and create tutor profile?`)) {
      return;
    }

    setProcessing(true);
    try {
      // 1. Update application status
      await updateDoc(doc(db, 'applications', application.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
      });

      // 2. Create tutor profile
      await addDoc(collection(db, 'tutors'), {
        name: application.applicantName,
        email: application.email,
        phone: application.phone || '',
        expertise: application.expertise,
        bio: application.bio,
        experience: application.experience,
        portfolioUrl: application.portfolioUrl || '',
        linkedinUrl: application.linkedinUrl || '',
        resumeUrl: application.resumeUrl || '',
        hourlyRate: application.hourlyRate || 0,
        availability: application.availability || '',
        preferredLanguages: application.preferredLanguages || [],
        yearsOfExperience: application.yearsOfExperience || 0,
        rating: 0,
        totalReviews: 0,
        totalSessions: 0,
        isActive: true,
        isVerified: true,
        createdAt: serverTimestamp(),
        applicationId: application.id,
      });

      alert(`✅ ${application.applicantName} approved! Tutor profile created successfully.`);
      
      // Refresh data
      await fetchApplications();
      if (onUpdate) onUpdate();
      setShowModal(false);
      setSelectedApp(null);

      // TODO: Send welcome email
      // You can add email sending logic here using Firebase Functions or a service like SendGrid
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectionModal = (applicationId: string) => {
    setRejectionModal({ show: true, applicationId });
    setRejectionReason('');
  };

  const closeRejectionModal = () => {
    setRejectionModal({ show: false, applicationId: null });
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!rejectionModal.applicationId) return;

    setProcessing(true);
    try {
      await updateDoc(doc(db, 'applications', rejectionModal.applicationId), {
        status: 'rejected',
        rejectionReason: rejectionReason,
        rejectedAt: serverTimestamp(),
      });

      alert('Application rejected and applicant will be notified.');
      
      // Refresh data
      await fetchApplications();
      if (onUpdate) onUpdate();
      setShowModal(false);
      setSelectedApp(null);
      closeRejectionModal();

      // TODO: Send rejection email
      // You can add email sending logic here
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.expertise.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return 'fa-check-circle';
      case 'rejected':
        return 'fa-times-circle';
      case 'under_review':
        return 'fa-clock';
      default:
        return 'fa-hourglass-half';
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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Review</h2>
        <p className="text-slate-600">Review and approve tutor applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search by name, email, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Applications</p>
          <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-blue-600">
            {applications.filter((a) => a.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {applications.filter((a) => a.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {applications.filter((a) => a.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Expertise
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {app.applicantName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-900">{app.applicantName}</p>
                        <p className="text-sm text-slate-500">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {/* {app.expertise.slice(0, 2).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))} */}
                      {app.expertise.length > 2 && (
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          +{app.expertise.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {app.yearsOfExperience ? `${app.yearsOfExperience} years` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {app.hourlyRate ? `$${app.hourlyRate}/hr` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(
                        app.status
                      )}`}
                    >
                      <i className={`fa-solid ${getStatusIcon(app.status)}`}></i>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {app.submittedAt?.toDate?.()?.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <i className="fa-solid fa-inbox text-slate-300 text-4xl mb-4"></i>
            <p className="text-slate-600">No applications found</p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-slate-200 p-6 z-10 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Application Review</h3>
                  <p className="text-slate-600 mt-1 text-sm">
                    Submitted on{' '}
                    {selectedApp.submittedAt?.toDate?.()?.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    }) || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                  disabled={processing}
                >
                  <i className="fa-solid fa-xmark text-slate-600"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Applicant Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 uppercase mb-4 flex items-center">
                  <i className="fa-solid fa-user mr-2"></i>
                  Applicant Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Full Name</label>
                    <p className="text-slate-900 font-medium mt-1">{selectedApp.applicantName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase">Email</label>
                    <p className="text-slate-900 mt-1">{selectedApp.email}</p>
                  </div>
                  {selectedApp.phone && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase">Phone</label>
                      <p className="text-slate-900 mt-1">{selectedApp.phone}</p>
                    </div>
                  )}
                  {selectedApp.yearsOfExperience && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase">Years of Experience</label>
                      <p className="text-slate-900 mt-1">{selectedApp.yearsOfExperience} years</p>
                    </div>
                  )}
                  {selectedApp.hourlyRate && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase">Proposed Hourly Rate</label>
                      <p className="text-slate-900 font-semibold mt-1">${selectedApp.hourlyRate}/hr</p>
                    </div>
                  )}
                  {selectedApp.availability && (
                    <div>
                      <label className="text-xs text-slate-500 uppercase">Availability</label>
                      <p className="text-slate-900 mt-1">{selectedApp.availability}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expertise & Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center">
                    <i className="fa-solid fa-code mr-2"></i>
                    Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedApp.preferredLanguages &&
                  selectedApp.preferredLanguages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center">
                        <i className="fa-solid fa-language mr-2"></i>
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.preferredLanguages.map((lang, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Bio */}
              {selectedApp.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center">
                    <i className="fa-solid fa-user-circle mr-2"></i>
                    Professional Bio
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {selectedApp.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Experience */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center">
                  <i className="fa-solid fa-briefcase mr-2"></i>
                  Work Experience
                </h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.experience}
                  </p>
                </div>
              </div>

              {/* Motivation */}
              {selectedApp.motivation && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center">
                    <i className="fa-solid fa-heart mr-2"></i>
                    Why AmTechy?
                  </h4>
                  <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                    <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {selectedApp.motivation}
                    </p>
                  </div>
                </div>
              )}

              {/* Links */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center">
                  <i className="fa-solid fa-link mr-2"></i>
                  Portfolio & Links
                </h4>
                <div className="space-y-2">
                  {selectedApp.portfolioUrl && (
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <i className="fa-solid fa-globe mr-2"></i>
                      Portfolio Website
                      <i className="fa-solid fa-external-link-alt ml-1 text-xs"></i>
                    </a>
                  )}
                  {selectedApp.linkedinUrl && (
                    <a
                      href={selectedApp.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <i className="fa-brands fa-linkedin mr-2"></i>
                      LinkedIn Profile
                      <i className="fa-solid fa-external-link-alt ml-1 text-xs"></i>
                    </a>
                  )}
                  {selectedApp.resumeUrl && (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <i className="fa-solid fa-file-pdf mr-2"></i>
                      View Resume/CV
                      <i className="fa-solid fa-external-link-alt ml-1 text-xs"></i>
                    </a>
                  )}
                  {!selectedApp.portfolioUrl &&
                    !selectedApp.linkedinUrl &&
                    !selectedApp.resumeUrl && (
                      <p className="text-slate-500 italic">No links provided</p>
                    )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="bg-slate-50 rounded-lg p-4">
                <label className="text-xs text-slate-500 uppercase">Current Status</label>
                <div className="mt-2">
                  <span
                    className={`px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full ${getStatusColor(
                      selectedApp.status
                    )}`}
                  >
                    <i className={`fa-solid ${getStatusIcon(selectedApp.status)} mr-2`}></i>
                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-900 uppercase mb-2 flex items-center">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                    Rejection Reason
                  </h4>
                  <p className="text-red-900">{selectedApp.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Actions */}
            {selectedApp.status === 'pending' && (
              <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleApprove(selectedApp)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check mr-2"></i>
                        Approve & Create Tutor Profile
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openRejectionModal(selectedApp.id)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <i className="fa-solid fa-times mr-2"></i>
                    Reject Application
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Approving will automatically create a tutor profile and send a welcome email
                </p>
              </div>
            )}

            {selectedApp.status !== 'pending' && (
              <div className="sticky bottom-0 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                <p className="text-center text-slate-600">
                  <i className={`fa-solid ${getStatusIcon(selectedApp.status)} mr-2`}></i>
                  This application has been {selectedApp.status}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Reject Application</h3>
              <p className="text-slate-600 mt-1 text-sm">
                Please provide a reason for rejection
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Insufficient experience in required technologies, portfolio doesn't demonstrate necessary skills..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                disabled={processing}
              />
              <p className="text-xs text-slate-500 mt-2">
                <i className="fa-solid fa-envelope mr-1"></i>
                This reason will be sent to the applicant via email
              </p>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3 rounded-b-xl">
              <button
                onClick={closeRejectionModal}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}