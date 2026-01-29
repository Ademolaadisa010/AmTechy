import Link from "next/link";

export default function BottomBar(){
    return(
        <div>
            <nav className="md:hidden w-full bg-white border-t border-slate-200 flex justify-around p-3 fixed bottom-0 z-30">
                    <Link href="/dashboard">
                        <button className="flex flex-col items-center gap-1 text-primary-600">
                            <i className="fa-solid fa-house w-5 h-5"></i>
                            <span className="text-[10px] font-medium">Home</span>
                        </button>
                    </Link>
                    <Link href="/mylearning">
                        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900">
                            <i className="fa-solid fa-book-open w-5 h-5"></i>
                            <span className="text-[10px] font-medium">Learning</span>
                        </button>
                    </Link>
                    <Link href="/find-tutor">
                        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900">
                            <i data-lucide="users" className=""></i>
                            <i className="fa-solid fa-users w-5 h-5"></i>
                            <span className="text-[10px] font-medium">Tutors</span>
                        </button>
                    </Link>
                    <Link href="/jobs">
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900">
                        <i className="fa-solid fa-briefcase w-5 h-5"></i>
                        <span className="text-[10px] font-medium">Jobs</span>
                    </button></Link>
                    <Link href="/community">
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900">
                        <i data-lucide="users" className=""></i>
                        <i className="fa-solid fa-comment w-5 h-5"></i>
                        <span className="text-[10px] font-medium">Community</span>
                    </button></Link>
                    <Link href="/progress">
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900">
                        <i className="fa-solid fa-chart-line w-5 h-5"></i>
                        <span className="text-[10px] font-medium">Progress</span>
                    </button></Link>
                    <Link href="/profile">
                    <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900">
                        <i className="fa-solid fa-user w-5 h-5"></i>
                        <span className="text-[10px] font-medium">Profile</span>
                    </button></Link>
                </nav>
        </div>
    )
}