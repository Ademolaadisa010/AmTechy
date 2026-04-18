"use client";

import { useState } from "react";

interface CareerGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  skills: string[];
}

interface ExperienceLevel {
  id: string;
  title: string;
  description: string;
  duration: string;
}

interface Interest {
  id: string;
  title: string;
  icon: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Onboarding() {
  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showAIChat, setShowAIChat] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);

  const careerGoals: CareerGoal[] = [
    {
      id: "frontend",
      title: "Frontend Developer",
      description: "Build beautiful websites & UIs",
      icon: "💻",
      skills: ["HTML/CSS", "JavaScript", "React"],
    },
    {
      id: "backend",
      title: "Backend Developer",
      description: "Build server-side applications",
      icon: "⚙️",
      skills: ["Node.js", "Python", "Databases"],
    },
    {
      id: "data-science",
      title: "Data Scientist",
      description: "Analyze data & build AI models",
      icon: "📊",
      skills: ["Python", "Statistics", "Machine Learning"],
    },
    {
      id: "mobile",
      title: "Mobile Developer",
      description: "Create iOS & Android apps",
      icon: "📱",
      skills: ["React Native", "Flutter", "Swift"],
    },
    {
      id: "designer",
      title: "Product Designer",
      description: "Design user experiences (UX/UI)",
      icon: "🎨",
      skills: ["Figma", "User Research", "Prototyping"],
    },
    {
      id: "ai-help",
      title: "Not sure yet",
      description: "Let AI recommend a path",
      icon: "🤖",
      skills: [],
    },
  ];

  const experienceLevels: ExperienceLevel[] = [
    {
      id: "beginner",
      title: "Complete Beginner",
      description: "I'm just starting my tech journey",
      duration: "3-6 months to job-ready",
    },
    {
      id: "some-knowledge",
      title: "Some Knowledge",
      description: "I know the basics but need structure",
      duration: "2-4 months to job-ready",
    },
    {
      id: "intermediate",
      title: "Intermediate",
      description: "I've built projects but need refinement",
      duration: "1-3 months to job-ready",
    },
    {
      id: "advanced",
      title: "Advanced",
      description: "Looking to specialize or upskill",
      duration: "Ongoing learning",
    },
  ];

  const interests: Interest[] = [
    { id: "ai-ml", title: "AI & Machine Learning", icon: "🤖" },
    { id: "web3", title: "Web3 & Blockchain", icon: "⛓️" },
    { id: "mobile-apps", title: "Mobile Apps", icon: "📱" },
    { id: "cloud", title: "Cloud Computing", icon: "☁️" },
    { id: "cybersecurity", title: "Cybersecurity", icon: "🔒" },
    { id: "game-dev", title: "Game Development", icon: "🎮" },
    { id: "devops", title: "DevOps", icon: "🔧" },
    { id: "iot", title: "IoT", icon: "🌐" },
  ];

  const handleGoalSelect = (goalId: string): void => {
    if (goalId === "ai-help") {
      setShowAIChat(true);
      setAiMessages([
        {
          role: "ai",
          content:
            "Hi! I'm your AI career advisor. Let me help you find the perfect tech path. Tell me — what interests you most about technology? What kind of problems do you want to solve?",
        },
      ]);
    } else {
      setSelectedGoal(goalId);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!userMessage.trim()) return;
    const newMessages: Message[] = [...aiMessages, { role: "user", content: userMessage }];
    setAiMessages(newMessages);
    setUserMessage("");
    setIsAIThinking(true);

    setTimeout(() => {
      const responses: string[] = [
        "Based on what you've told me, I think Frontend Development could be a great fit! You'd get to create visual, interactive experiences. Would you like to explore this path?",
        "Your interests align well with Data Science! You'd work with data, analytics, and AI. This field is growing rapidly in Africa. Shall we dive deeper?",
        "It sounds like Product Design might be perfect for you! You'd combine creativity with problem-solving. Want to learn more about this career?",
      ];
      setAiMessages([
        ...newMessages,
        {
          role: "ai",
          content: responses[Math.floor(Math.random() * responses.length)],
        },
      ]);
      setIsAIThinking(false);
    }, 1500);
  };

  const handleAIRecommendation = (recommendation: string): void => {
    setSelectedGoal(recommendation);
    setShowAIChat(false);
    setStep(2);
  };

  const toggleInterest = (interestId: string): void => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = (): void => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = (): void => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = (): void => {
    const onboardingData = {
      careerGoal: selectedGoal,
      experienceLevel: selectedLevel,
      interests: selectedInterests,
      completedAt: new Date().toISOString(),
    };
    console.log("Onboarding completed:", onboardingData);
    window.location.href = "/dashboard";
  };

  const getStepTitle = (): string => {
    switch (step) {
      case 1: return "What's your career goal?";
      case 2: return "What's your experience level?";
      case 3: return "What interests you?";
      default: return "";
    }
  };

  const canProceed =
    (step === 1 && !!selectedGoal) ||
    (step === 2 && !!selectedLevel) ||
    step === 3;

  return (
    // ── Backdrop ────────────────────────────────────────────────────────────
    <div className="fixed inset-0 z-[60] bg-slate-900/90 flex items-center justify-center p-4 overflow-y-auto">

      {/* ── Modal shell ─────────────────────────────────────────────────── */}
      {/*
        KEY FIX:
        • On mobile  → full-width, natural height, scrolls with the backdrop
        • On desktop → max-w-3xl, max-h capped, internal scroll via flex-col
        • We use flex-col + min-h-0 so the content area can shrink and scroll
          without pushing the sticky footer off screen.
      */}
      <div className="relative bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col my-auto
                      max-h-[calc(100dvh-2rem)] sm:max-h-[90vh]">

        {/* ── AI Chat overlay ─────────────────────────────────────────── */}
        {showAIChat && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">AI Career Advisor</h3>
                    <p className="text-sm text-slate-500">Let&apos;s find your perfect path</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages — scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-0">
              {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAIThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      {[0, 0.1, 0.2].map((delay, i) => (
                        <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input footer — always visible */}
            <div className="p-4 sm:p-6 border-t border-slate-200 flex-shrink-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={() => handleAIRecommendation("frontend")}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                  Choose Frontend
                </button>
                <button onClick={() => handleAIRecommendation("data-science")}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                  Choose Data Science
                </button>
                <button onClick={() => handleAIRecommendation("designer")}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                  Choose Design
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Tell me about your interests..."
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Header — sticky, never scrolls away ─────────────────────── */}
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Customize Your Path</h2>
            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? "bg-indigo-600 w-6" : s < step ? "bg-indigo-300 w-2" : "bg-slate-200 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm sm:text-base font-medium text-indigo-600">{getStepTitle()}</p>
        </div>

        {/* ── Scrollable content area ──────────────────────────────────── */}
        {/*
          min-h-0 is critical: without it, a flex child won't shrink below
          its content size, so overflow-y-auto never kicks in.
        */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-8 py-5">

          {/* Step 1 — Career Goal */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {careerGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
                    selectedGoal === goal.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl sm:text-3xl flex-shrink-0">{goal.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="block font-semibold text-slate-900 text-sm sm:text-base mb-0.5">
                        {goal.title}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500 block mb-2 leading-snug">
                        {goal.description}
                      </span>
                      {goal.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {goal.skills.map((skill) => (
                            <span key={skill}
                              className="text-xs bg-white border border-indigo-100 px-2 py-0.5 rounded-full text-indigo-600">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedGoal === goal.id && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Experience Level */}
          {step === 2 && (
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
                    selectedLevel === level.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="block font-semibold text-slate-900 text-sm sm:text-base mb-0.5">
                        {level.title}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-500">{level.description}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-indigo-600 font-medium text-right leading-snug hidden sm:block">
                        {level.duration}
                      </span>
                      {selectedLevel === level.id && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Duration on mobile */}
                  <p className="text-xs text-indigo-500 mt-1.5 sm:hidden">{level.duration}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Interests */}
          {step === 3 && (
            <div>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">
                Select all topics that interest you (optional)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {interests.map((interest) => {
                  const active = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-3 border-2 rounded-xl text-left transition-all active:scale-[0.97] ${
                        active
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{interest.icon}</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-900 leading-snug">
                          {interest.title}
                        </span>
                        {active && (
                          <svg className="w-3.5 h-3.5 text-indigo-600 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer — sticky at bottom, never scrolls away ────────────── */}
        {/*
          flex-shrink-0 keeps this from being squished.
          border-t + bg-white gives a clear visual separation from content.
        */}
        <div className="px-5 sm:px-8 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Back */}
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <div /> /* spacer keeps Continue right-aligned on step 1 */
            )}

            {/* Continue / Get Started */}
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl
                           hover:bg-indigo-700 active:scale-[0.97] transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl
                           hover:bg-indigo-700 active:scale-[0.97] transition-all"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}