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
            "Hi! I'm your AI career advisor. Let me help you find the perfect tech path. Tell me - what interests you most about technology? What kind of problems do you want to solve?",
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

    // Simulate AI response (replace with actual API call)
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
    // Save onboarding data to Firebase
    const onboardingData = {
      careerGoal: selectedGoal,
      experienceLevel: selectedLevel,
      interests: selectedInterests,
      completedAt: new Date().toISOString(),
    };
    console.log("Onboarding completed:", onboardingData);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  };

  const getStepTitle = (): string => {
    switch (step) {
      case 1:
        return "What's your career goal?";
      case 2:
        return "What's your experience level?";
      case 3:
        return "What interests you?";
      default:
        return "";
    }
  };

  return (
    <div className="fixed flex inset-0 z-[60] bg-slate-900/90 items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
        {/* AI Chat Modal */}
        {showAIChat && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">AI Career Advisor</h3>
                    <p className="text-sm text-slate-600">Let&apos;s find your perfect path</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAIThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200">
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => handleAIRecommendation("frontend")}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100"
                >
                  Choose Frontend
                </button>
                <button
                  onClick={() => handleAIRecommendation("data-science")}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100"
                >
                  Choose Data Science
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Tell me about your interests..."
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Onboarding */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Customize Your Path</h2>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s === step ? "bg-indigo-600 w-6" : "bg-slate-200 w-2"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          <h3 className="text-lg font-medium mb-6 text-indigo-600">{getStepTitle()}</h3>

          {/* Step 1: Career Goal */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {careerGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedGoal === goal.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{goal.icon}</span>
                    <div className="flex-1">
                      <span className="block font-semibold text-slate-900 mb-1">
                        {goal.title}
                      </span>
                      <span className="text-sm text-slate-600 block mb-2">
                        {goal.description}
                      </span>
                      {goal.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {goal.skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-xs bg-white px-2 py-1 rounded-full text-indigo-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Experience Level */}
          {step === 2 && (
            <div className="space-y-3 mb-8">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    selectedLevel === level.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-semibold text-slate-900 mb-1">
                        {level.title}
                      </span>
                      <span className="text-sm text-slate-600">{level.description}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-indigo-600 font-medium">
                        {level.duration}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Select all topics that interest you (optional)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-3 border-2 rounded-xl text-left transition-all ${
                      selectedInterests.includes(interest.id)
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{interest.icon}</span>
                      <span className="text-sm font-medium text-slate-900">
                        {interest.title}
                      </span>
                      {selectedInterests.includes(interest.id) && (
                        <svg className="w-4 h-4 text-indigo-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-slate-600 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !selectedGoal) || (step === 2 && !selectedLevel)
                  }
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue 
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                >
                  Get Started 
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}