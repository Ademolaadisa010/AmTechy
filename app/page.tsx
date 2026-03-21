"use client"
import Image from "next/image";
import { motion } from "framer-motion";
import Hero from "@/public/hero.jpg";
import Logo from "@/public/logo.svg";
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

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true }
};

const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true }
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  whileInView: { opacity: 1, scale: 1 },
  transition: { duration: 0.6 },
  viewport: { once: true }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function HomePage(){
  return(
    <div className="w-full min-h-screen font-sans antialiased bg-white text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image src={Logo} width={50} alt="logo" />
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">AmTechy</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#1e40af] transition">Features</a>
              <a href="#tracks" className="text-gray-600 hover:text-[#1e40af] transition">Learning Tracks</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#1e40af] transition">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-[#1e40af] transition">Testimonials</a>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login">
                <button className="hidden md:block text-gray-600 hover:text-[#1e40af] cursor-pointer transition font-medium text-sm">Sign In</button>
              </Link>
              <Link href="/register">
                <button className="bg-[#1e40af] cursor-pointer text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-xs sm:text-base">Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-block bg-[#1e40af]/10 text-[#1e40af] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold"
              >
                AI-Powered Learning Platform
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                Find Your Tech Career Path with AI
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed"
              >
                Learn tech the smart way guided by AI or real tutors. Start your journey from beginner to professional with personalized learning paths.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link href="/register">
                  <button className="bg-[#1e40af] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl w-full sm:w-auto">Get Started Free</button>
                </Link>
                <Link href="/login">
                  <button className="bg-white text-[#1e40af] border-2 border-[#1e40af] px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-[#1e40af] hover:text-white transition font-semibold text-sm sm:text-lg w-full sm:w-auto">Take Career Quiz</button>
                </Link>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4"
              >
                <div className="flex -space-x-3">
                  <Image src={Hero} alt="Learner" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white"/>
                  <Image src={HeroSec} alt="Learner" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white"/>
                  <Image src={two} alt="Learner" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white"/>
                  <Image src={HeroSec} alt="Learner" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white"/>
                </div>
                <div className="text-center sm:text-left text-sm">
                  <div className="font-semibold text-gray-900">Join 10,000+ learners</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Starting their tech journey</div>
                </div>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block relative"
            >
              <Image src={HeroSec} alt="Learning with AI" className="rounded-2xl shadow-2xl"/>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white p-4 sm:p-6 rounded-xl shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#10b981]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 sm:w-6 h-5 sm:h-6 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="text-sm sm:text-base">
                    <div className="font-semibold text-gray-900">AI Career Match</div>
                    <div className="text-xs sm:text-sm text-gray-600">95% accuracy</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center"
          >
            <motion.div variants={staggerItem}>
              <div className="text-2xl sm:text-4xl font-bold text-[#1e40af] mb-2">10,000+</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm">Active Learners</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <div className="text-2xl sm:text-4xl font-bold text-[#7c3aed] mb-2">50+</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm">Learning Tracks</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <div className="text-2xl sm:text-4xl font-bold text-[#1e40af] mb-2">200+</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm">Expert Tutors</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <div className="text-2xl sm:text-4xl font-bold text-[#1e40af] mb-2">95%</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm">Success Rate</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">The Problem We Solve</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">Many aspiring tech professionals face the same challenge</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 sm:gap-8"
          >
            <motion.div variants={staggerItem} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-7 sm:w-8 h-7 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Don't Know Where to Start</h3>
              <p className="text-sm sm:text-base text-gray-600">With hundreds of tech careers available, beginners feel overwhelmed and confused about which path to choose.</p>
            </motion.div>
            <motion.div variants={staggerItem} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-7 sm:w-8 h-7 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Unstructured Learning</h3>
              <p className="text-sm sm:text-base text-gray-600">Random YouTube tutorials and scattered resources lead to gaps in knowledge and wasted time.</p>
            </motion.div>
            <motion.div variants={staggerItem} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-7 sm:w-8 h-7 sm:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Lack of Guidance</h3>
              <p className="text-sm sm:text-base text-gray-600">Learning alone without mentorship or feedback makes it hard to stay motivated and track progress.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">How AmTechy Helps You Succeed</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">A simple, proven approach to launch your tech career</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 sm:gap-8"
          >
            <motion.div 
              variants={staggerItem}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#1e40af] to-blue-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-xl sm:text-2xl font-bold">1</div>
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">AI Career Recommendation</h3>
                <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">Take our smart career quiz and let AI analyze your interests, skills, and goals to recommend the perfect tech path for you.</p>
                <Image src={Ai} alt="AI Analysis" className="rounded-lg"/>
              </div>
            </motion.div>
            <motion.div 
              variants={staggerItem}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#7c3aed] to-purple-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-xl sm:text-2xl font-bold">2</div>
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Structured Learning Tracks</h3>
                <p className="text-purple-100 mb-4 sm:mb-6 text-sm sm:text-base">Follow step-by-step curriculum designed by industry experts. Each track takes you from beginner to job-ready professional.</p>
                <Image src={Tracks} alt="Learning Path" className="rounded-lg"/>
              </div>
            </motion.div>
            <motion.div 
              variants={staggerItem}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#10b981] to-green-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-xl sm:text-2xl font-bold">3</div>
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Learn with AI or Tutors</h3>
                <p className="text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">Get instant help from our AI tutor 24/7, or book sessions with experienced human tutors for personalized guidance.</p>
                <Image src={Tutor} alt="Tutoring" className="rounded-lg"/>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Learning Tracks */}
      <section id="tracks" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Choose Your Learning Track</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">Explore our most popular career paths and start learning today</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
          >
            {/* Track Cards */}
            {[
              { color: "from-blue-500 to-blue-700", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", badge: "Beginner Friendly", title: "Web Development", desc: "Build modern websites and web applications using HTML, CSS, JavaScript, React, and Node.js.", career: "Developer", color_text: "text-[#1e40af]", color_bg: "bg-[#1e40af]", color_badge: "bg-blue-100 text-blue-700" },
              { color: "from-purple-500 to-pink-600", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", badge: "Creative", title: "UI/UX Design", desc: "Create beautiful, user-friendly interfaces using Figma, Adobe XD, and design thinking principles.", career: "Designer", color_text: "text-[#7c3aed]", color_bg: "bg-[#7c3aed]", color_badge: "bg-purple-100 text-purple-700" },
              { color: "from-green-500 to-teal-600", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", badge: "High Demand", title: "Data Analytics", desc: "Master data analysis, visualization, and insights using Python, SQL, Excel, and Power BI.", career: "Analyst", color_text: "text-[#10b981]", color_bg: "bg-[#10b981]", color_badge: "bg-green-100 text-green-700" },
            ].map((track, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group"
              >
                <div className={`h-32 sm:h-48 bg-gradient-to-br ${track.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 sm:w-20 h-12 sm:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={track.icon}></path>
                    </svg>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className={`${track.color_badge} text-xs font-semibold px-2 sm:px-3 py-1 rounded-full`}>{track.badge}</span>
                    <span className="text-xs sm:text-sm text-gray-500">6 months</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{track.title}</h3>
                  <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{track.desc}</p>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-3 sm:mb-4 gap-2">
                    <span className="font-semibold text-gray-700">Career:</span>
                    <span className={`${track.color_text} font-semibold`}>{track.career}</span>
                  </div>
                  <Link href="/login">
                    <button className={`w-full mt-4 sm:mt-6 ${track.color_bg} text-white py-2 sm:py-3 rounded-lg hover:opacity-90 transition font-semibold text-xs sm:text-base group-hover:shadow-lg`}>Start Learning</button>
                  </Link>
                </div>
              </motion.div>
            ))}
            
            {/* Coming Soon Card */}
            <motion.div
              variants={staggerItem}
              className="bg-gradient-to-br from-[#1e40af] to-[#7c3aed] rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white"
            >
              <svg className="w-12 sm:w-16 h-12 sm:h-16 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3">More Tracks Coming Soon</h3>
              <p className="text-blue-100 mb-4 sm:mb-6 text-xs sm:text-base">Cloud Computing, DevOps, AI/ML, Blockchain, and more!</p>
              <Link href="/register">
                <button className="bg-white text-[#1e40af] px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-100 transition font-semibold text-xs sm:text-base">Get Notified</button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Powerful Features to Accelerate Your Learning</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to go from beginner to job-ready professional</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              { title: "AI Tutor 24/7", desc: "Get instant answers to your coding questions, debug errors, and receive personalized explanations anytime, anywhere.", color: "from-blue-50 to-blue-100", icon_bg: "bg-[#1e40af]" },
              { title: "Expert Human Tutors", desc: "Book 1-on-1 sessions with experienced professionals for personalized mentorship and career guidance.", color: "from-purple-50 to-purple-100", icon_bg: "bg-[#7c3aed]" },
              { title: "Interactive Code Playground", desc: "Practice coding directly in your browser with real-time feedback and instant code execution.", color: "from-green-50 to-green-100", icon_bg: "bg-[#10b981]" },
              { title: "Job Board Access", desc: "Connect with hiring companies and access exclusive job opportunities tailored to your skill level.", color: "from-orange-50 to-orange-100", icon_bg: "bg-orange-600" },
              { title: "Gamified Learning", desc: "Earn points, badges, and certificates as you progress. Compete with peers on leaderboards.", color: "from-pink-50 to-pink-100", icon_bg: "bg-pink-600" },
              { title: "Real-World Projects", desc: "Build portfolio-worthy projects that demonstrate your skills to potential employers.", color: "from-indigo-50 to-indigo-100", icon_bg: "bg-indigo-600" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className={`bg-gradient-to-br ${feature.color} p-5 sm:p-8 rounded-2xl hover:shadow-lg transition`}
              >
                <div className={`w-12 sm:w-14 h-12 sm:h-14 ${feature.icon_bg} rounded-xl flex items-center justify-center mb-4 sm:mb-6`}>
                  <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1e40af] to-[#7c3aed] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-xl text-blue-100 max-w-3xl mx-auto">Your journey from beginner to professional in 4 simple steps</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8"
          >
            {["Take Career Quiz", "Get Personalized Path", "Learn & Practice", "Land Your Job"].map((step, idx) => (
              <motion.div 
                key={idx}
                variants={staggerItem}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold">{idx + 1}</div>
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{step}</h3>
                  <p className="text-blue-100 text-xs sm:text-base">
                    {idx === 0 && "Answer questions about your interests, skills, and goals. Our AI analyzes your responses."}
                    {idx === 1 && "Receive AI-recommended learning tracks matched to your profile and career aspirations."}
                    {idx === 2 && "Follow structured curriculum, complete projects, and get help from AI or human tutors."}
                    {idx === 3 && "Build portfolio, earn certificates, and apply to jobs through our exclusive job board."}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-10 sm:mt-16 text-center"
          >
            <Link href="/register">
              <button className="bg-white text-[#1e40af] px-6 sm:px-10 py-3 sm:py-4 rounded-xl hover:bg-gray-100 transition font-bold text-base sm:text-lg shadow-xl">Start Your Journey Now</button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Success Stories from Our Learners</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">Real people, real results, real career transformations</p>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              { image: Hero, name: "Amara Okafor", location: "Lagos, Nigeria", text: "I had zero coding experience and was completely lost. AmTechy's AI quiz recommended web development, and the structured path made everything so clear. Now I'm a frontend developer at a startup!", badge: "Web Development Graduate", color: "text-[#1e40af]", bg: "bg-[#1e40af]/10" },
              { image: two, name: "Kwame Mensah", location: "Accra, Ghana", text: "The AI tutor was a game-changer for me. I could learn at my own pace, get instant help at 2 AM, and the human tutors helped me with career advice. Best investment I ever made!", badge: "Data Analytics Graduate", color: "text-[#7c3aed]", bg: "bg-[#7c3aed]/10" },
              { image: Tutor, name: "Zainab Ahmed", location: "Nairobi, Kenya", text: "As a creative person, I thought tech wasn't for me. The UI/UX track changed my life! The projects were fun, and I landed a design job within 3 months of completing the course.", badge: "UI/UX Design Graduate", color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={staggerItem}
                className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                  <Image src={testimonial.image} alt={testimonial.name} className="w-12 sm:w-16 h-12 sm:h-16 rounded-full flex-shrink-0"/>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">{testimonial.location}</div>
                    <div className="flex text-yellow-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 sm:w-4 h-3 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-xs sm:text-base">{testimonial.text}</p>
                <div className={`${testimonial.bg} ${testimonial.color} px-3 py-1 rounded-full text-xs font-semibold inline-block`}>{testimonial.badge}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1e40af] via-[#7c3aed] to-[#10b981] text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Start Your Tech Journey Today</h2>
          <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">Join thousands of African learners who are transforming their careers with AI-powered guidance and expert mentorship.</p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8"
          >
            <Link href="/register">
              <button className="bg-white text-[#1e40af] px-6 sm:px-10 py-3 sm:py-4 rounded-xl hover:bg-gray-100 transition font-bold text-base sm:text-lg shadow-xl w-full sm:w-auto">Get Started Free</button>
            </Link>
            <Link href="/login">
              <button className="bg-transparent border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl hover:bg-white hover:text-[#1e40af] transition font-bold text-base sm:text-lg w-full sm:w-auto">Take Career Quiz</button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image src={Logo} width={50} alt="logo" />
                <span className="text-lg sm:text-xl font-bold text-white">AmTechy</span>
              </div>
              <p className="text-gray-400 mb-4 sm:mb-6 max-w-sm text-xs sm:text-base">Empowering African learners to launch successful tech careers through AI-powered guidance and expert mentorship.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Platform</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-[#1e40af] transition">Learning Tracks</a></li>
                <li><a href="#" className="hover:text-[#1e40af] transition">AI Tutor</a></li>
                <li><a href="#" className="hover:text-[#1e40af] transition">Job Board</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-[#1e40af] transition">About Us</a></li>
                <li><a href="#" className="hover:text-[#1e40af] transition">Blog</a></li>
                <li><a href="#" className="hover:text-[#1e40af] transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-[#1e40af] transition">Help Center</a></li>
                <li><a href="#" className="hover:text-[#1e40af] transition">Privacy</a></li>
                <li><a href="#" className="hover:text-[#1e40af] transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-400">
            <p>&copy; 2026 AmTechy. All rights reserved.</p>
            <p>Design by Abdulmalik with <i className="fa-solid fa-heart text-red-500"></i></p>
          </div>
        </div>
      </footer>
    </div>
  )
}