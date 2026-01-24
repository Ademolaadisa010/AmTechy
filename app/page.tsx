"use client"
import Image from "next/image";
import { motion } from "framer-motion";
import Hero from "@/public/hero.jpg";
import HeroSec from "@/public/hero-sec.jpg";
import two from "@/public/two.jpg";
import Ai from "@/public/ai.jpg";
import Tracks from "@/public/learning.jpg";
import Tutor from "@/public/tutor.jpg";
import Web from "@/public/web.jpg";
import Uiux from "@/public/uiux.jpg";
import Data from "@/public/data.jpg";
import App from "@/public/app.jpg";
import Link from "next/link";


export default function HomePage(){
  return(
    <div className="w-full min-h-screen font-sans antialiased bg-white text-gray-900">
      <motion.nav 
        initial={{y:-50, opacity:0}}
        whileInView={{y:0, opacity:1}}
        transition={{duration:1}}
      className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1e40af] to-[#7c3aed] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
            <span className="text-xl font-bold text-gray-900">AmTechy</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-[#1e40af] transition">Features</a>
            <a href="#tracks" className="text-gray-600 hover:text-[#1e40af] transition">Learning Tracks</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-[#1e40af] transition">How It Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-[#1e40af] transition">Testimonials</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
            <button className="hidden md:block text-gray-600 hover:text-[#1e40af] cursor-pointer transition font-medium">Sign In</button></Link>
            <Link href="/register"><button className="bg-[#1e40af] cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">Get Started</button></Link>
          </div>
        </div>
        </div>
      </motion.nav>


      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block bg-[#1e40af]/10 text-[#1e40af] px-4 py-2 rounded-full text-sm font-semibold">AI-Powered Learning Platform</div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">Find Your Tech Career Path with AI</h1>
                <p className="text-xl text-gray-600 leading-relaxed">Learn tech the smart way — guided by AI or real tutors. Start your journey from beginner to professional with personalized learning paths.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register"><button className="bg-[#1e40af] text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl">Get Started Free</button></Link>
                <Link href="/login"><button className="bg-white text-[#1e40af] border-2 border-[#1e40af] px-8 py-4 rounded-xl hover:bg-[#1e40af] hover:text-white transition font-semibold text-lg">Take Career Quiz</button></Link>
              </div>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-3">
                  <Image src={Hero} alt="Learner" className="w-10 h-10 rounded-full border-2 border-white"/>
                  <Image src={HeroSec} alt="Learner" className="w-10 h-10 rounded-full border-2 border-white"/>
                  <Image src={two} alt="Learner" className="w-10 h-10 rounded-full border-2 border-white"/>
                  <Image src={HeroSec} alt="Learner" className="w-10 h-10 rounded-full border-2 border-white"/>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">Join 10,000+ learners</div>
                  <div className="text-gray-600">Starting their tech journey</div>
                </div>
              </div>
            </div>
            <motion.div className="relative"
              initial={{x:100}}
              whileInView={{x:0}}
              transition={{duration:2}}
            >
              <Image src={HeroSec} alt="Learning with AI" className="rounded-2xl shadow-2xl"/>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#10b981]/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">AI Career Match</div>
                    <div className="text-sm text-gray-600">95% accuracy</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#1e40af] mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Active Learners</div>
            </div>
            <div>
            <div className="text-4xl font-bold text-[#7c3aed] mb-2">50+</div>
            <div className="text-gray-600 font-medium">Learning Tracks</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">200+</div>
            <div className="text-gray-600 font-medium">Expert Tutors</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#1e40af] mb-2">95%</div>
            <div className="text-gray-600 font-medium">Success Rate</div>
          </div>
        </div>
        </div>
      </section>


      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Many aspiring tech professionals face the same challenge</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{opacity:0, scale:0.5}}
              whileInView={{opacity:1, scale:1}}
              transition={{duration:1, type: "spring",}}
            className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Don't Know Where to Start</h3>
              <p className="text-gray-600">With hundreds of tech careers available, beginners feel overwhelmed and confused about which path to choose.</p>
            </motion.div>
            <motion.div 
              initial={{opacity:0, scale:0.5}}
              whileInView={{opacity:1, scale:1}}
              transition={{duration:1, type: "spring", delay:0.3}}
            className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unstructured Learning</h3>
              <p className="text-gray-600">Random YouTube tutorials and scattered resources lead to gaps in knowledge and wasted time.</p>
            </motion.div>
            <motion.div 
              initial={{opacity:0, scale:0.5}}
              whileInView={{opacity:1, scale:1}}
              transition={{duration:1, type: "spring",delay:0.6}}
            className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lack of Guidance</h3>
              <p className="text-gray-600">Learning alone without mentorship or feedback makes it hard to stay motivated and track progress.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AmTechy Helps You Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">A simple, proven approach to launch your tech career</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{opacity:0, x:-50}}
              whileInView={{opacity:1, x:0}}
              transition={{duration:1}}
            className="relative">
              <div className="bg-gradient-to-br from-[#1e40af] to-blue-600 text-white p-8 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">1</div>
                  <h3 className="text-2xl font-bold mb-4">AI Career Recommendation</h3>
                  <p className="text-blue-100 mb-6">Take our smart career quiz and let AI analyze your interests, skills, and goals to recommend the perfect tech path for you.</p>
                  <Image src={Ai} alt="AI Analysis" className="rounded-lg"/>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-[#1e40af]">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
                </svg>
              </div>
            </motion.div>
        <motion.div 
          initial={{opacity:0, y:50}}
              whileInView={{opacity:1, y:0}}
              transition={{duration:1, delay:0.1}}
        className="relative">
          <div className="bg-gradient-to-br from-[#7c3aed] to-purple-600 text-white p-8 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">2</div>
            <h3 className="text-2xl font-bold mb-4">Structured Learning Tracks</h3>
            <p className="text-purple-100 mb-6">Follow step-by-step curriculum designed by industry experts. Each track takes you from beginner to job-ready professional.</p>
            <Image src={Tracks} alt="Learning Path" className="rounded-lg"/>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-[#7c3aed]">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
            </svg>
          </div>
        </motion.div>
        <motion.div
          initial={{opacity:0, x:50}}
          whileInView={{opacity:1, x:0}}
          transition={{duration:1, delay:0.2}}
        >
          <div className="bg-gradient-to-br from-[#10b981] to-green-600 text-white p-8 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6 text-2xl font-bold">3</div>
              <h3 className="text-2xl font-bold mb-4">Learn with AI or Tutors</h3>
              <p className="text-green-100 mb-6">Get instant help from our AI tutor 24/7, or book sessions with experienced human tutors for personalized guidance.</p>
              <Image src={Tutor} alt="Tutoring" className="rounded-lg"/>
            </div>
          </motion.div>
        </div>
        </div>
      </section>


      <section id="tracks" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Learning Track</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore our most popular career paths and start learning today</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
        <Image src={Web} alt="Web Development" className="w-full h-full object-cover opacity-20"/>
        <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
        </div>
        </div>
        <div className="p-6">
        <div className="flex items-center justify-between mb-3">
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Beginner Friendly</span>
        <span className="text-sm text-gray-500">6 months</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Web Development</h3>
        <p className="text-gray-600 mb-4">Build modern websites and web applications using HTML, CSS, JavaScript, React, and Node.js.</p>
        <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Career Outcome:</span>
        <span className="text-sm text-[#1e40af] font-semibold">Frontend/Backend Developer</span>
        </div>
        <Link href="/login"><button className="w-full mt-6 bg-[#1e40af] text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold group-hover:shadow-lg">Start Learning</button></Link>
        </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
        <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 relative overflow-hidden">
        <Image src={Uiux} alt="UI/UX Design" className="w-full h-full object-cover opacity-20"/>
        <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
        </svg>
        </div>
        </div>
        <div className="p-6">
        <div className="flex items-center justify-between mb-3">
        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">Creative</span>
        <span className="text-sm text-gray-500">5 months</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">UI/UX Design</h3>
        <p className="text-gray-600 mb-4">Create beautiful, user-friendly interfaces using Figma, Adobe XD, and design thinking principles.</p>
        <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Career Outcome:</span>
        <span className="text-sm text-[#7c3aed] font-semibold">Product Designer</span>
        </div>
        <Link href="/login"><button className="w-full mt-6 bg-[#7c3aed] text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold group-hover:shadow-lg">Start Learning</button></Link>
        </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
        <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 relative overflow-hidden">
        <Image src={Data} alt="Data Analytics" className="w-full h-full object-cover opacity-20"/>
        <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        </div>
        </div>
        <div className="p-6">
        <div className="flex items-center justify-between mb-3">
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">High Demand</span>
        <span className="text-sm text-gray-500">6 months</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Data Analytics</h3>
        <p className="text-gray-600 mb-4">Master data analysis, visualization, and insights using Python, SQL, Excel, and Power BI.</p>
        <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Career Outcome:</span>
        <span className="text-sm text-[#10b981] font-semibold">Data Analyst</span>
        </div>
        <Link href="/register"><button className="w-full mt-6 bg-[#10b981] text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold group-hover:shadow-lg">Start Learning</button></Link>
        </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
        <div className="h-48 bg-gradient-to-br from-indigo-500 to-blue-600 relative overflow-hidden">
        <Image src={App} alt="Mobile Development" className="w-full h-full object-cover opacity-20"/>
        <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
        </div>
        </div>
        <div className="p-6">
        <div className="flex items-center justify-between mb-3">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">Intermediate</span>
        <span className="text-sm text-gray-500">7 months</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Mobile Development</h3>
        <p className="text-gray-600 mb-4">Build native and cross-platform mobile apps using React Native, Flutter, or Swift/Kotlin.</p>
        <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Career Outcome:</span>
        <span className="text-sm text-indigo-600 font-semibold">Mobile Developer</span>
        </div>
        <Link href="/register"><button className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold group-hover:shadow-lg">Start Learning</button></Link>
        </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group">
        <div className="h-48 bg-gradient-to-br from-red-500 to-orange-600 relative overflow-hidden">
        <Image src={Hero} alt="Cybersecurity" className="w-full h-full object-cover opacity-20"/>
        <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        </div>
        </div>
        <div className="p-6">
        <div className="flex items-center justify-between mb-3">
        <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">Advanced</span>
        <span className="text-sm text-gray-500">8 months</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cybersecurity</h3>
        <p className="text-gray-600 mb-4">Learn ethical hacking, network security, and how to protect systems from cyber threats.</p>
        <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Career Outcome:</span>
        <span className="text-sm text-red-600 font-semibold">Security Analyst</span>
        </div>
        <Link href="login"><button className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold group-hover:shadow-lg">Start Learning</button></Link>
        </div>
        </div>
        <div className="bg-gradient-to-br from-[#1e40af] to-[#7c3aed] rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition p-8 flex flex-col items-center justify-center text-center text-white">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <h3 className="text-2xl font-bold mb-3">More Tracks Coming Soon</h3>
        <p className="text-blue-100 mb-6">Cloud Computing, DevOps, AI/ML, Blockchain, and more exciting paths are on the way!</p>
        <Link href="/register"><button className="bg-white text-[#1e40af] px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">Get Notified</button></Link>
        </div>
        </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features to Accelerate Your Learning</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to go from beginner to job-ready professional</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
        <div className="w-14 h-14 bg-[#1e40af] rounded-xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">AI Tutor 24/7</h3>
        <p className="text-gray-700">Get instant answers to your coding questions, debug errors, and receive personalized explanations anytime, anywhere.</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
        <div className="w-14 h-14 bg-[#7c3aed] rounded-xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Human Tutors</h3>
        <p className="text-gray-700">Book 1-on-1 sessions with experienced professionals for personalized mentorship and career guidance.</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
        <div className="w-14 h-14 bg-[#10b981] rounded-xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Code Playground</h3>
        <p className="text-gray-700">Practice coding directly in your browser with real-time feedback and instant code execution.</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl">
        <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Job Board Access</h3>
        <p className="text-gray-700">Connect with hiring companies and access exclusive job opportunities tailored to your skill level.</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl">
        <div className="w-14 h-14 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
        </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Gamified Learning</h3>
        <p className="text-gray-700">Earn points, badges, and certificates as you progress. Compete with peers on leaderboards.</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl">
        <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Real-World Projects</h3>
        <p className="text-gray-700">Build portfolio-worthy projects that demonstrate your skills to potential employers.</p>
        </div>
        </div>
        </div>
      </section>


      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1e40af] to-[#7c3aed] text-white">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">Your journey from beginner to professional in 4 simple steps</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div className="text-center"
          initial={{opacity:0}}
          whileInView={{opacity:1}}
        >
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">1</div>
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-3">Take Career Quiz</h3>
        <p className="text-blue-100">Answer questions about your interests, skills, and goals. Our AI analyzes your responses.</p>
        </div>
        </motion.div>
        <motion.div className="text-center"
          initial={{opacity:0}}
          whileInView={{opacity:1}}
          transition={{delay:0.3}}
        >
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">2</div>
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-3">Get Personalized Path</h3>
        <p className="text-blue-100">Receive AI-recommended learning tracks matched to your profile and career aspirations.</p>
        </div>
        </motion.div>
        <motion.div className="text-center"
          initial={{opacity:0}}
          whileInView={{opacity:1}}
          transition={{delay:0.6, type: "spring"}}
        >
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">3</div>
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-3">Learn & Practice</h3>
        <p className="text-blue-100">Follow structured curriculum, complete projects, and get help from AI or human tutors.</p>
        </div>
        </motion.div>
        <motion.div className="text-center"
          initial={{opacity:0}}
          whileInView={{opacity:1}}
          transition={{delay:0.9, type: "spring"}}
        >
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">4</div>
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-3">Land Your Job</h3>
        <p className="text-blue-100">Build portfolio, earn certificates, and apply to jobs through our exclusive job board.</p>
        </div>
        </motion.div>
        </div>
        <div className="mt-16 text-center">
        <Link href="/register"><button className="bg-white text-[#1e40af] px-10 py-4 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl">Start Your Journey Now</button></Link>
        </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories from Our Learners</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Real people, real results, real career transformations</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
        <Image src={Hero} alt="Amara" className="w-16 h-16 rounded-full mr-4"/>
        <div>
        <div className="font-bold text-gray-900">Amara Okafor</div>
        <div className="text-sm text-gray-600">Lagos, Nigeria</div>
        <div className="flex text-yellow-400 mt-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        </div>
        </div>
        </div>
        <p className="text-gray-700 mb-4">"I had zero coding experience and was completely lost. AmTechy's AI quiz recommended web development, and the structured path made everything so clear. Now I'm a frontend developer at a startup!"</p>
        <div className="bg-[#1e40af]/10 text-[#1e40af] px-3 py-1 rounded-full text-sm font-semibold inline-block">Web Development Graduate</div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
        <Image src={Hero} alt="Kwame" className="w-16 h-16 rounded-full mr-4"/>
        <div>
        <div className="font-bold text-gray-900">Kwame Mensah</div>
        <div className="text-sm text-gray-600">Accra, Ghana</div>
        <div className="flex text-yellow-400 mt-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        </div>
        </div>
        </div>
        <p className="text-gray-700 mb-4">"The AI tutor was a game-changer for me. I could learn at my own pace, get instant help at 2 AM, and the human tutors helped me with career advice. Best investment I ever made!"</p>
        <div className="bg-[#7c3aed]/10 text-[#7c3aed] px-3 py-1 rounded-full text-sm font-semibold inline-block">Data Analytics Graduate</div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
        <Image src={Hero} alt="Zainab" className="w-16 h-16 rounded-full mr-4"/>
        <div>
        <div className="font-bold text-gray-900">Zainab Ahmed</div>
        <div className="text-sm text-gray-600">Nairobi, Kenya</div>
        <div className="flex text-yellow-400 mt-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        </div>
        </div>
        </div>
        <p className="text-gray-700 mb-4">"As a creative person, I thought tech wasn't for me. The UI/UX track changed my life! The projects were fun, and I landed a design job within 3 months of completing the course."</p>
        <div className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 rounded-full text-sm font-semibold inline-block">UI/UX Design Graduate</div>
        </div>
        </div>
        </div>
      </section>


      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1e40af] via-[#7c3aed] to-[#10b981] text-white">
        <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Your Tech Journey Today</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of African learners who are transforming their careers with AI-powered guidance and expert mentorship.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Link href="/register"><button className="bg-white text-[#1e40af] px-10 py-4 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl">Get Started Free</button></Link>
        <Link href="login"><button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl hover:bg-white hover:text-[#1e40af] transition font-bold text-lg">Take Career Quiz</button></Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-blue-100">
        <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <span>No credit card required</span>
        </div>
        <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <span>Cancel anytime</span>
        </div>
        <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <span>14-day money-back guarantee</span>
        </div>
        </div>
        </div>
      </section>


      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-2">
        <div className="flex items-center space-x-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#1e40af] to-[#7c3aed] rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">A</span>
        </div>
        <span className="text-xl font-bold text-white">AmTechy</span>
        </div>
        <p className="text-gray-400 mb-6 max-w-sm">Empowering African learners to launch successful tech careers through AI-powered guidance and expert mentorship.</p>
        <div className="flex space-x-4">
        <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1e40af] transition">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1e40af] transition">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        </a>
        <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1e40af] transition">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/></svg>
        </a>
        <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1e40af] transition">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        </div>
        </div>
        <div>
        <h4 className="text-white font-bold mb-4">Platform</h4>
        <ul className="space-y-2">
        <li><a href="#" className="hover:text-[#1e40af] transition">Learning Tracks</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">AI Tutor</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Human Tutors</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Job Board</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Pricing</a></li>
        </ul>
        </div>
        <div>
        <h4 className="text-white font-bold mb-4">Company</h4>
        <ul className="space-y-2">
        <li><a href="#" className="hover:text-[#1e40af] transition">About Us</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Careers</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Blog</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Press Kit</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Partners</a></li>
        </ul>
        </div>
        <div>
        <h4 className="text-white font-bold mb-4">Support</h4>
        <ul className="space-y-2">
        <li><a href="#" className="hover:text-[#1e40af] transition">Help Center</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Contact Us</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Privacy Policy</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Terms of Service</a></li>
        <li><a href="#" className="hover:text-[#1e40af] transition">Cookie Policy</a></li>
        </ul>
        </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; 2024 AmTechy. All rights reserved.</p>
        <p className="text-gray-400 text-sm mb-4 md:mb-0">Design by Abdulmalik with Peace and Love. <i className="fa-solid fa-heart"></i></p>
        <div className="flex items-center space-x-4 text-sm">
        <a href="#" className="hover:text-[#1e40af] transition">English</a>
        <span className="text-gray-600">|</span>
        <a href="#" className="hover:text-[#1e40af] transition">Français</a>
        <span className="text-gray-600">|</span>
        <a href="#" className="hover:text-[#1e40af] transition">العربية</a>
        </div>
        </div>
        </div>
      </footer>

    </div>
  )
}