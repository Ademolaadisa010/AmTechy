"use client";

import { useState } from "react";
import Image from "next/image";
import Learning from "@/public/learning.jpg";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!email) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many requests. Please try again later.");
          break;
        default:
          setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="auth-screen"
      className="flex flex-col md:flex-row min-h-[800px] bg-white relative z-50"
    >
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src={Learning}
            className="w-full h-full object-cover"
            alt="Students learning"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#312e81]-900/600 to-[#9333ea]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#4f46e5] font-bold text-xl">
              A
            </div>
            <span className="text-2xl font-bold tracking-tight">AmTechy</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Reset Your Password
          </h1>
          <p className="text-slate-300 text-lg">
            Don't worry! It happens to the best of us. Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Tips */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-yellow-400"></i>
            Password Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-400 mt-0.5"></i>
              <span>Use at least 8 characters</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-400 mt-0.5"></i>
              <span>Include numbers and symbols</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-check text-green-400 mt-0.5"></i>
              <span>Don't use common words</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
              <i className="fa-solid fa-key text-indigo-600 text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Forgot Password?
            </h2>
            <p className="mt-2 text-slate-600">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-circle-check text-green-600 text-xl mt-0.5"></i>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Email Sent!</h3>
                  <p className="text-sm">
                    We've sent a password reset link to <strong>{email}</strong>.
                    Check your inbox and click the link to reset your password.
                  </p>
                  <div className="mt-3 text-sm">
                    <p className="mb-2">Didn't receive the email?</p>
                    <ul className="space-y-1 text-green-600">
                      <li>• Check your spam folder</li>
                      <li>• Make sure you entered the correct email</li>
                      <li>• Wait a few minutes and try again</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fa-solid fa-envelope text-slate-400"></i>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="block w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none transition-all"
                    placeholder="name@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white bg-[#4f46e5] hover:bg-[#4338ca] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[#4f46e5] hover:text-[#4338ca] font-medium transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Back to Login
            </Link>
          </div>

          {/* Resend Link */}
          {success && (
            <div className="text-center pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                Try with a different email
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-circle-info text-blue-600 text-lg mt-0.5"></i>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">
                  Need Help?
                </h4>
                <p className="text-sm text-slate-700">
                  If you're having trouble resetting your password, contact our support team at{" "}
                  <a
                    href="mailto:support@amtechy.com"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    support@amtechy.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Branding */}
          <div className="md:hidden text-center pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-lg font-bold text-slate-900">AmTechy</span>
            </div>
            <p className="text-xs text-slate-500">
              Master Tech Skills with AI & Expert Tutors
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}