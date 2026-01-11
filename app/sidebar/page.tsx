import Link from "next/link";

export default function SideBar(){
    return(
        <div>
            <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-auto">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-primary-600">
                        <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="text-xl font-bold text-slate-900">AmTechy</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link href="/dashboard">
                    <button className="nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-[#eef2ff] text-[#4338ca]">
                        <i className="fa-solid fa-house w-5 h-5"></i>
                        Dashboard
                    </button></Link>
                    <Link href="/mylearning">
                    <button className="nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <i className="fa-solid fa-book-open w-5 h-5"></i>
                        My Learning
                    </button></Link>
                    <Link href="/findTutor">
                    <button className="nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <i className="fa-solid fa-users w-5 h-5"></i>
                        Find Tutors
                    </button></Link>
                    <Link href="/jobs">
                    <button className="nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <i className="fa-solid fa-briefcase w-5 h-5"></i>
                        Jobs & Gigs
                    </button></Link>
                    <Link href="/community">
                    <button className="nav-item w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        <i className="fa-regular fa-comment w-5 h-5"></i>
                        Community
                    </button></Link>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-900 rounded-xl p-4 text-white mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-slate-400">Pro Plan</span>
                            <span className="bg-primary-500 text-xs px-2 py-0.5 rounded">Active</span>
                        </div>
                        <p className="text-sm font-medium mb-3">Upgrade to unlock AI Tutor Unlimited</p>
                        <button className="w-full py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100">Upgrade Now</button>
                    </div>
                    <Link href="/login">
                    <button className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors w-full">
                        <i className="fa-solid fa-arrow-right-from-bracket w-5 h-5"></i>
                        Sign Out
                    </button></Link>
                </div>
            </aside>
        </div>
    )
}