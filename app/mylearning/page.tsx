import SideBar from "../sidebar/page";

export default function MyLearning(){
    return(
        <div>
            <main className="flex-1 flex bg-slate-50 min-w-0">
                <SideBar/>
                <section className="p-2">
                    <div id="view-learning" className=" h-[calc(100vh-140px)] flex flex-col animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <button className="flex items-center text-slate-500 hover:text-slate-900">
                                <i data-lucide="arrow-left" className="w-4 h-4 mr-2"></i> Back to Dashboard
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">Lesson 4.2: React Hooks</span>
                                <div className="w-32 bg-slate-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full w-[60%]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-y-auto p-6">
                                    <div className="prose max-w-none">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Understanding useEffect</h2>
                                        <p className="text-slate-600 mb-4">The <code>useEffect</code> hook lets you perform side effects in function components. Data fetching, setting up a subscription, and manually changing the DOM in React components are all examples of side effects.</p>
                                        
                                        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-blue-300 mb-6 overflow-x-auto">
                                            <p><span className="text-purple-400">import</span> React, useState, useEffect <span className="text-purple-400">from</span> 'react';</p>
                                            <p className="mt-2"><span className="text-purple-400">function</span> <span className="text-yellow-300">Example</span>() </p>
                                            <p className="pl-4"><span className="text-purple-400">const</span> [count, setCount] = <span className="text-blue-400">useState</span>(0);</p>
                                            <p className="pl-4 mt-2"><span className="text-slate-400">// Similar to componentDidMount and componentDidUpdate:</span></p>
                                            <p className="pl-4"><span className="text-blue-400">useEffect</span></p>
                                            <p className="pl-8">document.title = `You clicked $count times`;</p>
                                            <p className="pl-4"></p>
                                            <p></p>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Challenge</h3>
                                        <p className="text-slate-600">Modify the code below to update the document title only when the count changes.</p>
                                    </div>
                                </div>
                                
                                <div className="h-64 bg-slate-900 rounded-xl shadow-sm border border-slate-800 flex flex-col overflow-hidden">
                                    <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                                        <span className="text-xs font-mono text-slate-300">App.js</span>
                                        <button className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors">
                                            <i className="fa-solid fa-play w-3 h-3"></i>
                                             Run Code
                                        </button>
                                    </div>
                                    <div className="flex-1 p-4 font-mono text-sm text-slate-300 overflow-auto">
                                        <div className="flex">
                                            <div className="text-slate-600 select-none pr-4 text-right">1<br/>2<br/>3<br/>4<br/>5</div>
                                            <div>
                                                <span className="text-purple-400">function</span> <span className="text-yellow-300">App</span><br/>
                                                &nbsp;&nbsp;<span className="text-purple-400">return</span> (<br/>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-red-400">div</span>&gt;Hello World&lt;/<span className="text-red-400">div</span>&gt;<br/>
                                                &nbsp;&nbsp;);<br/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-primary-50 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#e0e7ff] rounded-full flex items-center justify-center text-primary-600">
                                        <i data-lucide="bot" className="w-5 h-5"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">AI Tutor</h3>
                                        <p className="text-xs text-slate-500">Always here to help</p>
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-[#e0e7ff] rounded-full flex-shrink-0 flex items-center justify-center text-[#4f46e5] text-xs">AI</div>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 border border-slate-100">
                                            Hi Kwame! I noticed you paused on the useEffect hook. Would you like a simpler explanation or an example?
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                        <img src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=100&h=100" className="w-8 h-8 rounded-full flex-shrink-0 object-cover"/>
                                        <div className="bg-[#4f46e5] p-3 rounded-2xl rounded-tr-none shadow-sm text-sm text-white">
                                            Yes, please explain the dependency array part.
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-[#e0e7ff] rounded-full flex-shrink-0 flex items-center justify-center text-[#4f46e5] text-xs">AI</div>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 border border-slate-100">
                                            Sure! The dependency array <code>[]</code> tells React when to re-run the effect.
                                            <br/><br/>
                                            • Empty <code>[]</code>: Runs once on mount.<br/>
                                            • <code>[prop]</code>: Runs when 'prop' changes.<br/>
                                            • No array: Runs on every render.
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 border-t border-slate-100 bg-white">
                                    <div className="relative">
                                        <input type="text" placeholder="Ask a question..." className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-[#6366f1] text-sm"/>
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4f46e5] hover:text-[#4338ca]">
                                            <i data-lucide="send" className="w-4 h-4"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}