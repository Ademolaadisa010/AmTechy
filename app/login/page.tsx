"use client";

import Image from "next/image";
import Learning from "@/public/learning.jpg";
import Link from "next/link";
import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is a tutor
      const tutorProfileDoc = await getDoc(doc(db, "tutor_profiles", user.uid));
      
      if (tutorProfileDoc.exists()) {
        // User is a tutor
        router.push("/tutor/dashboard");
      } else {
        // User is a learner
        router.push("/dashboard");
      }
    } catch (err: any) {
      // Handle specific Firebase auth errors
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email. Please register first.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled. Please contact support.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed login attempts. Please try again later.");
          break;
        default:
          setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user is a tutor
      const tutorProfileDoc = await getDoc(doc(db, "tutor_profiles", user.uid));
      
      if (tutorProfileDoc.exists()) {
        // User is a tutor
        router.push("/tutor/dashboard");
      } else {
        // User is a learner
        router.push("/dashboard");
      }
    } catch (err: any) {
      // Only log unexpected errors to keep console clean
      if (err.code !== "auth/popup-closed-by-user" && 
          err.code !== "auth/cancelled-popup-request" &&
          err.code !== "auth/account-exists-with-different-credential") {
        console.error("Google login error:", err);
      }

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        setError(
          email 
            ? `An account with ${email} already exists. Please sign in using the method you originally used (GitHub or Email/Password).`
            : "An account already exists with this email. Please use your original sign-in method."
        );
      } else if (err.code !== "auth/cancelled-popup-request") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user is a tutor
      const tutorProfileDoc = await getDoc(doc(db, "tutor_profiles", user.uid));
      
      if (tutorProfileDoc.exists()) {
        // User is a tutor
        router.push("/tutor/dashboard");
      } else {
        // User is a learner
        router.push("/dashboard");
      }
    } catch (err: any) {
      // Only log unexpected errors to keep console clean
      if (err.code !== "auth/popup-closed-by-user" && 
          err.code !== "auth/cancelled-popup-request" &&
          err.code !== "auth/account-exists-with-different-credential") {
        console.error("GitHub login error:", err);
      }

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        setError(
          email 
            ? `An account with ${email} already exists. Please sign in using the method you originally used (Google or Email/Password).`
            : "An account already exists with this email. Please use your original sign-in method."
        );
      } else if (err.code !== "auth/cancelled-popup-request") {
        setError("GitHub sign-in failed. Please try again.");
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
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-40">
          <Image src={Learning} className="w-full h-full object-cover" alt="Students learning" />
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
            Master Tech Skills with AI & Expert Tutors
          </h1>
          <p className="text-slate-300 text-lg">
            Join thousands of African learners building the future of technology.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Login to Your Account</h2>
            <p className="mt-2 text-slate-600">Continue your tech journey...</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none transition-all"
                  placeholder="name@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-[#4f46e5] hover:text-[#4338ca]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none transition-all"
                  placeholder="••••••••"
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-black text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#4f46e5] hover:text-[#4338ca] font-semibold">
              Register
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  fill="#4285F4"
                />
              </svg>
              Google
            </button>

            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}