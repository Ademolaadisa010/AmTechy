import Link from "next/link";

export default function Onboarding(){
    return(
        <div>
            <div className="fixed flex inset-0 z-[60] bg-slate-900/90 items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Customize Your Path</h2>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5]"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-medium mb-4 text-[#4f46e5]">What's your primary career goal?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <button className="p-4 border-2 border-[#e0e7ff] bg-[#eef2ff] rounded-xl text-left hover:border-[#6366f1] transition-all">
                                <span className="block font-semibold text-[#312e81]">Frontend Developer</span>
                                <span className="text-sm text-slate-600">Build beautiful websites & UIs</span>
                            </button>
                            <button className="p-4 border-2 border-slate-100 rounded-xl text-left hover:border-[#6366f1] hover:bg-[#eef2ff] transition-all">
                                <span className="block font-semibold text-slate-900">Data Scientist</span>
                                <span className="text-sm text-slate-600">Analyze data & build AI models</span>
                            </button>
                            <button className="p-4 border-2 border-slate-100 rounded-xl text-left hover:border-[#6366f1] hover:bg-[#eef2ff] transition-all">
                                <span className="block font-semibold text-slate-900">Product Designer</span>
                                <span className="text-sm text-slate-600">Design user experiences (UX/UI)</span>
                            </button>
                            <button className="p-4 border-2 border-slate-100 rounded-xl text-left hover:border-[#6366f1] hover:bg-[#eef2ff] transition-all">
                                <span className="block font-semibold text-slate-900">Not sure yet</span>
                                <span className="text-sm text-slate-600">Let AI recommend a path</span>
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <Link href="/dashboard">
                            <button className="px-6 py-3 bg-[#4f46e5] text-white rounded-lg font-medium hover:bg-[#4338ca] transition-colors flex items-center">
                                Continue to Dashboard <i data-lucide="arrow-right" className="ml-2 w-4 h-4"></i>
                            </button></Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}