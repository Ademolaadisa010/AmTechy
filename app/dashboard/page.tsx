import Image from "next/image";
import SideBar from "../sidebar/page";
import Learning from "@/public/data.jpg";

export default function Dashboard(){
    return(
        <main className="flex-1 flex bg-slate-50 min-w-0">
            <SideBar/>
            <section className="p-2">
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-slate-900">AmTechy</span>
                    </div>
                    <button className="p-2 text-slate-600">
                        <i className="fa-solid fa-bell w-6 h-6"></i>
                    </button>
                </header>

                <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Welcome back, Kwame! 👋</h1>
                            <p className="text-slate-500">You're on a 5-day streak. Keep it up!</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                <span className="text-yellow-500"><i className="fa-solid fa-fire w-5 h-5 fill-current"></i></span>
                                <span className="font-bold text-slate-700">5 Days</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                <span className="text-[#6366f1]"><i className="fa-solid fa-bolt-lightning w-5 h-5 fill-current"></i></span>
                                <span className="font-bold text-slate-700">1,240 XP</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <i className="fa-solid fa-bullseye w-6 h-6"></i>
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <h3 className="text-slate-500 text-sm font-medium">Weekly Goal</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-1">85% <span className="text-sm font-normal text-slate-400">completed</span></p>
                            <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                                <div className="bg-blue-600 h-2 rounded-full w-[85%]"></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                                    <i className="fa-solid fa-clock w-6 h-6"></i>
                                </div>
                            </div>
                            <h3 className="text-slate-500 text-sm font-medium">Time Spent</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-1">12h 30m</p>
                            <p className="text-xs text-slate-400 mt-1">Last 7 days</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                    <i className="fa-solid fa-award w-6 h-6"></i>
                                </div>
                            </div>
                            <h3 className="text-slate-500 text-sm font-medium">Certificates</h3>
                            <p className="text-2xl font-bold text-slate-900 mt-1">2 <span className="text-sm font-normal text-slate-400">earned</span></p>
                            <p className="text-xs text-slate-400 mt-1">1 in progress</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900">Continue Learning</h3>
                                <button className="text-[#4f46e5] text-sm font-medium hover:underline">View All</button>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                    <Image src={Learning} className="w-full h-full object-cover" alt="Coding"/>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-[#eef2ff] text-[#4338ca] text-xs font-bold rounded">Frontend Path</span>
                                        <span className="text-xs text-slate-500">• Module 4 of 12</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Advanced React Patterns</h4>
                                    <p className="text-slate-500 text-sm mb-4">Master hooks, context API, and performance optimization techniques.</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                                            <div className="bg-[#4f46e5] h-2 rounded-full w-[45%]"></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">45%</span>
                                    </div>
                                    <button className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                                        Resume Lesson
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#312e81] to-[#9333ea] rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <i className="fa-solid fa-robot w-24 h-24"></i>
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4">
                                    <i className="fa-solid fa-spray-can-sparkles w-3 h-3"></i>
                                    AI Recommendation
                                </div>
                                <h3 className="font-bold text-lg mb-2">Based on your progress...</h3>
                                <p className="text-[#e0e7ff] text-sm mb-6">You're excelling at JavaScript! Consider booking a session with a mentor to review your portfolio project.</p>
                                
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-4 flex items-center gap-3">
                                    <Image src={Learning} className="w-full h-full object-cover" alt="Coding"/>
                                    <div>
                                        <p className="font-bold text-sm">Sarah K.</p>
                                        <p className="text-xs text-[#6366f1]">Senior React Dev</p>
                                    </div>
                                </div>
                                
                                <button className="w-full py-2 bg-white text-[#312e81] text-sm font-bold rounded-lg hover:bg-[#eef2ff] transition-colors">
                                    Find a Mentor
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Learning Activity</h3>
                        <div className="h-64 w-full overflow-hidden">
                            <canvas id="activityChart"></canvas>
                        </div>
                    </div>
                </div>
            </section>
            
        </main>
    )
}