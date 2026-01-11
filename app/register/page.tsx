import Image from "next/image";
import Learning from "@/public/learning.jpg"
import Link from "next/link";

export default function Register(){
    return(
        <div>
            <section id="auth-screen" className="flex flex-col md:flex-row min-h-[800px] bg-white relative z-50">
                <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                    <div className="absolute inset-0 opacity-40">
                        <Image src={Learning} className="w-full h-full object-cover" alt="Students learning"/>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#312e81]-900/600 to-[#9333ea]"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#4f46e5] font-bold text-xl">A</div>
                            <span className="text-2xl font-bold tracking-tight">AmTechy</span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-4">Master Tech Skills with AI & Expert Tutors</h1>
                        <p className="text-slate-300 text-lg">Join thousands of African learners building the future of technology.</p>
                    </div>
                    <div className="relative z-10 flex gap-4">
                        <div className="flex -space-x-4">
                            <Image className="w-10 h-10 rounded-full border-2 border-slate-900" src={Learning} alt="User"/>
                            <Image className="w-10 h-10 rounded-full border-2 border-slate-900" src={Learning} alt="User"/>
                            <Image className="w-10 h-10 rounded-full border-2 border-slate-900" src={Learning} alt="User"/>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-bold">10k+ Learners</span>
                            <span className="text-xs text-slate-400">Joined this month</span>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
                            <p className="mt-2 text-slate-600">Start your tech journey today.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="role-btn active ring-2 ring-[#4f46e5] bg-[#eef2ff] p-4 rounded-xl border border-transparent hover:bg-[#eef2ff] transition-all text-left group">
                                <div className="w-10 h-10 rounded-full bg-[#e0e7ff]-100 text-[#4f46e5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-graduation-cap"></i>
                                </div>
                                <h3 className="font-semibold text-slate-900">Learner</h3>
                                <p className="text-xs text-slate-500 mt-1">I want to learn skills</p>
                            </button>
                            <button className="role-btn p-4 rounded-xl border border-slate-200 hover:border-[#312e81]-300 hover:bg-slate-50 transition-all text-left group">
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-person-chalkboard"></i>
                                </div>
                                <h3 className="font-semibold text-slate-900">Tutor</h3>
                                <p className="text-xs text-slate-500 mt-1">I want to teach</p>
                            </button>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                    <input type="text" className="mt-1 block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none transition-all" placeholder="e.g. Kwame Osei"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                    <input type="email" className="mt-1 block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none transition-all" placeholder="name@example.com"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <input type="password" className="mt-1 block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] outline-none transition-all" placeholder="••••••••"/>
                                </div>
                            </div>

                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4f46e5] hover:bg-[#4338ca] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366f1] transition-all transform hover:scale-[1.02]">
                                Create Account
                            </button>
                        </form>

                        <p className="text-black">Already Have an Account? <Link href="/login" className="text-[#312e81]">Login</Link></p>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#4285F4"/></svg>
                                Google
                            </button>
                            <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                                GitHub
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}