import SideBar from "../sidebar/page";

export default function FindTutor(){
    return(
        <main className="flex-1 flex bg-slate-50 min-w-0">
            <SideBar/>
            <section className="p-2">
                <div id="view-tutors" className=" space-y-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Find a Mentor</h1>
                                <p className="text-slate-500">Book 1-on-1 sessions with industry experts.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <i className="fa-solid fa-filter w-4 h-4"></i>
                                     Filters
                                </button>
                                <div className="relative">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                                    <input type="text" placeholder="Search by skill..." className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#6366f1] text-sm w-64"/>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&h=150" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"/>
                                            <div>
                                                <h3 className="font-bold text-slate-900">Sarah K.</h3>
                                                <p className="text-sm text-slate-500">Senior React Dev @ TechCo</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <i className="fa-regular fa-star w-3 h-3 fill-yellow-400 text-yellow-400"></i>
                                                    <span className="text-xs font-bold text-slate-700">4.9</span>
                                                    <span className="text-xs text-slate-400">(120 reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">Specializing in React, Next.js, and helping beginners land their first frontend role. Let's review your code!</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">React</span>
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">Career Advice</span>
                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">Code Review</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div>
                                            <span className="text-lg font-bold text-slate-900">$40</span>
                                            <span className="text-xs text-slate-500">/ session</span>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">Book Now</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"/>
                                            <div>
                                                <h3 className="font-bold text-slate-900">David O.</h3>
                                                <p className="text-sm text-slate-500">Data Scientist @ DataFlow</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <i className="fa-regular fa-star w-3 h-3 fill-yellow-400 text-yellow-400"></i>

                                                    <span className="text-xs font-bold text-slate-700">5.0</span>
                                                    <span className="text-xs text-slate-400">(85 reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">I help students master Python, SQL, and Machine Learning concepts. Patient and beginner-friendly.</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">Python</span>
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">Data Science</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div>
                                            <span className="text-lg font-bold text-slate-900">$55</span>
                                            <span className="text-xs text-slate-500">/ session</span>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">Book Now</button>
                                    </div>
                                </div>
                            </div>

                             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex gap-4">
                                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"/>
                                            <div>
                                                <h3 className="font-bold text-slate-900">Amina Y.</h3>
                                                <p className="text-sm text-slate-500">Product Designer @ Creative</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <i className="fa-regular fa-star w-3 h-3 fill-yellow-400 text-yellow-400"></i>
                                                    <span className="text-xs font-bold text-slate-700">4.8</span>
                                                    <span className="text-xs text-slate-400">(210 reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">Expert in Figma and UI/UX principles. I can help you build a stunning portfolio to get hired.</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="px-2 py-1 bg-pink-50 text-pink-700 text-xs font-medium rounded">Figma</span>
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">UI/UX</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div>
                                            <span className="text-lg font-bold text-slate-900">$45</span>
                                            <span className="text-xs text-slate-500">/ session</span>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">Book Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </section>
        </main>

    )
}