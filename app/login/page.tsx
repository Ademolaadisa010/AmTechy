"use client";

import Image from "next/image";
import Learning from "@/public/learning.jpg";
import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email & Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <section
      id="auth-screen"
      className="flex flex-col md:flex-row min-h-[800px] bg-white relative z-50"
    >
      {/* LEFT SIDE */}
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

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Login to Your Account</h2>
            <p className="mt-2 text-slate-600">Continue your tech journey...</p>
          </div>

          {/* FORM */}
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white bg-[#4f46e5] hover:bg-[#4338ca] transition-all"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-black">
            Doesn&apos;t have an account?{" "}
            <Link href="/register" className="text-[#312e81]">
              Register
            </Link>
          </p>

          {/* SOCIAL LOGIN */}
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
              className="flex items-center justify-center px-4 py-2 border rounded-lg bg-white hover:bg-slate-50"
            >
              Google
            </button>

            <button className="flex items-center justify-center px-4 py-2 border rounded-lg bg-white hover:bg-slate-50">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
