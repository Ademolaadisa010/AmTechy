"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const STATS = [
  { value: "10K+", label: "Learners Enrolled",  icon: "fa-users",        color: "#6366f1" },
  { value: "50+",  label: "Expert Courses",      icon: "fa-book-open",    color: "#8b5cf6" },
  { value: "95%",  label: "Completion Rate",     icon: "fa-chart-line",   color: "#06b6d4" },
  { value: "4.9★", label: "Average Rating",      icon: "fa-star",         color: "#f59e0b" },
];

const VALUES = [
  {
    icon: "fa-bullseye",
    title: "Excellence First",
    description:
      "We deliver world-class educational content crafted for real-world impact. Every course, every feature, every interaction is designed to exceed expectations.",
    accent: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    icon: "fa-users",
    title: "Community Driven",
    description:
      "Learning is better together. AmTechy thrives on the strength of its community — mentors, learners, and professionals collaborating toward shared goals.",
    accent: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: "fa-lightbulb",
    title: "Innovation Always",
    description:
      "Technology evolves fast. We stay ahead so you don't have to. Our curriculum is continuously updated to reflect industry trends, tools, and best practices.",
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: "fa-shield-halved",
    title: "Trust & Integrity",
    description:
      "We build honest relationships with our learners. No empty promises — just genuine learning paths that lead to real outcomes and real careers.",
    accent: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
];

const TEAM = [
  {
    name: "Abdulrosheed Abdulmalik",
    role: "Founder, CEO & Lead Developer",
    school: "University of Ibadan",
    bio: "A passionate software engineer and entrepreneur from the University of Ibadan. Abdulrosheed built AmTechy from the ground up with one mission: to make world-class tech education accessible to every African learner. Combining deep technical expertise with a vision for inclusive learning, he leads product development, strategy, and growth.",
    initials: "AA",
    badges: ["Full-Stack Dev", "Entrepreneur", "UI/UX", "EdTech"],
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
];

const MILESTONES = [
  { year: "2023",      title: "AmTechy Founded",        description: "Abdulrosheed launched AmTechy from his dorm room at University of Ibadan with just 5 courses and a big dream.",                       color: "#6366f1" },
  { year: "Early 2024", title: "1,000 Learners",         description: "Within months, AmTechy grew to 1,000+ enrolled learners across Nigeria and West Africa.",                                              color: "#8b5cf6" },
  { year: "Mid 2024",  title: "Tutor Network Launched",  description: "Introduced the tutor marketplace, connecting expert instructors with eager learners 1-on-1.",                                          color: "#06b6d4" },
  { year: "Late 2024", title: "Premium Membership",      description: "Launched premium plans, certificates, and an exclusive job board for premium members.",                                                color: "#f59e0b" },
  { year: "2025",      title: "10K+ Learners & Growing", description: "AmTechy now serves 10,000+ learners, with new courses, features, and partnerships launching monthly.",                                  color: "#10b981" },
];

const SKILLS = [
  { label: "Frontend Development", pct: 92, color: "#6366f1" },
  { label: "Backend Engineering",  pct: 87, color: "#8b5cf6" },
  { label: "Data Science & AI",    pct: 78, color: "#06b6d4" },
  { label: "Mobile Development",   pct: 84, color: "#f59e0b" },
  { label: "UI/UX Design",         pct: 90, color: "#10b981" },
];

export default function AboutPage() {

  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const founderSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AmTechy",
    url: "https://amtechy.name.ng",
    founder: {
      "@type": "Person",
      name: "Abdulmalik"
    },
    description: "Amtechy is an AI-powered technology learning platform helping beginners discover and learrn tech skills.",
  }
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#07070f", color: "#f1f1f5" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(founderSchema),
        }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Bricolage+Grotesque:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .display-font { font-family: 'Bricolage Grotesque', sans-serif; }
        body, p, span, button, a { font-family: 'Bricolage Grotesque', sans-serif; }

        /* ── Scroll reveal ── */
        .reveal {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal.animate-in { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay: 0.05s; }
        .d2 { transition-delay: 0.12s; }
        .d3 { transition-delay: 0.20s; }
        .d4 { transition-delay: 0.28s; }

        /* ── Noise grain ── */
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* ── Glowing orbs ── */
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
          animation: drift 12s ease-in-out infinite alternate;
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -20px) scale(1.08); }
        }

        /* ── Nav link underline ── */
        .nav-link {
          position: relative; color: rgba(241,241,245,0.55);
          font-size: 0.875rem; font-weight: 500; transition: color 0.2s;
          background: none; border: none; cursor: pointer; padding: 0;
        }
        .nav-link:hover { color: #f1f1f5; }
        .nav-link::after {
          content: ''; position: absolute; bottom: -3px; left: 0;
          width: 0; height: 1.5px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }

        /* ── Stat card hover ── */
        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .stat-card:hover { transform: translateY(-6px); }

        /* ── Value card hover ── */
        .value-card { transition: transform 0.3s ease, border-color 0.3s ease; }
        .value-card:hover { transform: translateY(-4px); }
        .value-card:hover .val-icon { transform: scale(1.12) rotate(-4deg); }
        .val-icon { transition: transform 0.3s ease; }

        /* ── Timeline dot pulse ── */
        @keyframes dotpulse {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; }
          50%       { box-shadow: 0 0 0 8px transparent; }
        }

        /* ── Skill bar animation ── */
        .skill-bar { transition: width 1.4s cubic-bezier(0.22,1,0.36,1); }

        /* ── CTA button ── */
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white; font-weight: 700; border: none; cursor: pointer;
          transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
          opacity: 0; transition: opacity 0.3s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(99,102,241,0.4); }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-outline {
          background: transparent;
          border: 1.5px solid rgba(241,241,245,0.15);
          color: rgba(241,241,245,0.65); font-weight: 600; cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          border-color: rgba(241,241,245,0.4);
          color: #f1f1f5;
          transform: translateY(-2px);
        }

        /* ── Shimmer badge ── */
        .shimmer {
          background: linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.25) 50%, rgba(99,102,241,0.15) 100%);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        /* ── Quote block ── */
        .quote-block {
          border-left: 3px solid;
          border-image: linear-gradient(to bottom, #6366f1, #8b5cf6) 1;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 99px; }
      `}</style>

      <div className="grain" />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        background: "rgba(7,7,15,0.75)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "white", fontFamily: "Bricolage Grotesque, sans-serif" }}>A</div>
            <span style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#f1f1f5" }}>AmTechy</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
            {["Home","Courses","Help Center","Contact"].map(item => (
              <button key={item} onClick={() => router.push(`/${item.toLowerCase().replace(" ","-")}`)} className="nav-link">{item}</button>
            ))}
          </div>

          <button onClick={() => router.push("/login")} className="btn-primary" style={{ padding: "0.5rem 1.25rem", borderRadius: 10, fontSize: "0.875rem" }}>
            <span>Get Started →</span>
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", paddingTop: 160, paddingBottom: 100, paddingLeft: 24, paddingRight: 24, overflow: "hidden" }}>
        {/* Orbs */}
        <div className="orb" style={{ width: 500, height: 500, background: "#6366f1", opacity: 0.12, top: -100, left: -100, animationDelay: "0s" }} />
        <div className="orb" style={{ width: 400, height: 400, background: "#8b5cf6", opacity: 0.1, top: 100, right: -80, animationDelay: "4s" }} />
        <div className="orb" style={{ width: 300, height: 300, background: "#06b6d4", opacity: 0.07, bottom: -50, left: "40%", animationDelay: "2s" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          {/* Badge */}
          <div className="reveal shimmer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 99, border: "1px solid rgba(99,102,241,0.3)", marginBottom: 32, fontSize: "0.8rem", fontWeight: 600, color: "#a5b4fc" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
            Our Story — Building Africa's Tech Future
          </div>

          {/* Headline */}
          <h1 className="reveal d1 display-font" style={{ fontSize: "clamp(3rem,8vw,6rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 28 }}>
            Built for{" "}
            <span style={{ display: "block", backgroundImage: "linear-gradient(135deg,#818cf8 0%,#a78bfa 40%,#38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              African Learners
            </span>
          </h1>

          <p className="reveal d2" style={{ fontSize: "1.2rem", color: "rgba(241,241,245,0.55)", maxWidth: 620, margin: "0 auto 44px", lineHeight: 1.75 }}>
            AmTechy was born from a simple belief — that geography should never be a barrier to world-class technology education. We're building the future of learning, one student at a time.
          </p>

          <div className="reveal d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/courses")} className="btn-primary" style={{ padding: "0.9rem 2rem", borderRadius: 12, fontSize: "1rem" }}>
              <span>Explore Courses</span>
            </button>
            <button onClick={() => router.push("/login")} className="btn-outline" style={{ padding: "0.9rem 2rem", borderRadius: 12, fontSize: "1rem" }}>
              Join Community
            </button>
          </div>
        </div>

        {/* Floating decorative cards */}
        <div className="reveal d4" style={{ maxWidth: 900, margin: "64px auto 0", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, position: "relative", zIndex: 2 }}>
          {[
            { emoji: "🚀", text: "AI-Powered Learning", sub: "Smart career guidance" },
            { emoji: "🌍", text: "Pan-African Reach", sub: "Nigeria · Ghana · Kenya" },
            { emoji: "💼", text: "Job-Ready Skills", sub: "Employer-recognized certs" },
          ].map(c => (
            <div key={c.text} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 18px", backdropFilter: "blur(10px)", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{c.text}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(241,241,245,0.4)" }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {STATS.map((s, i) => (
            <div key={s.label} className={`reveal stat-card d${i+1}`} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}22`, borderRadius: 20, padding: "28px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${s.color}18 0%, transparent 65%)`, pointerEvents: "none" }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: "1.1rem" }} />
              </div>
              <div className="display-font" style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.82rem", color: "rgba(241,241,245,0.5)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="grid-responsive">
          <div>
            <div className="reveal" style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#818cf8", marginBottom: 16 }}>Our Mission</div>
            <h2 className="reveal d1 display-font" style={{ fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 24 }}>
              Closing the{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg,#6366f1,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                tech skills gap
              </span>{" "}in Africa
            </h2>
            <p className="reveal d2" style={{ color: "rgba(241,241,245,0.55)", lineHeight: 1.8, marginBottom: 18, fontSize: "1.02rem" }}>
              Millions of talented young Africans are locked out of the global tech economy — not because of lack of talent, but lack of access. AmTechy exists to change that.
            </p>
            <p className="reveal d3" style={{ color: "rgba(241,241,245,0.55)", lineHeight: 1.8, marginBottom: 36, fontSize: "1.02rem" }}>
              From Ibadan to Lagos, from Nairobi to Accra — we're building the infrastructure for Africa's next generation of software engineers, designers, data scientists, and tech entrepreneurs.
            </p>
            <div className="reveal d4" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Industry-relevant curriculum updated quarterly","Learn from practitioners, not just teachers","Certificates recognized by top employers","Premium job board connecting you to opportunities"].map(pt => (
                <div key={pt} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-check" style={{ color: "#818cf8", fontSize: "0.6rem" }} />
                  </div>
                  <span style={{ color: "rgba(241,241,245,0.7)", fontSize: "0.92rem" }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills visual */}
          <div className="reveal d2">
            <div style={{ background: "linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 24, padding: 36, backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#818cf8", marginBottom: 24 }}>Course Completion Rates</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {SKILLS.map(sk => (
                  <div key={sk.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.88rem", color: "rgba(241,241,245,0.75)", fontWeight: 500 }}>{sk.label}</span>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: sk.color }}>{sk.pct}%</span>
                    </div>
                    <div style={{ height: 7, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                      <div className="skill-bar" style={{ height: "100%", width: `${sk.pct}%`, background: `linear-gradient(90deg, ${sk.color}, ${sk.color}aa)`, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-circle-check" style={{ color: "#10b981" }} />
                </div>
                <span style={{ fontSize: "0.82rem", color: "rgba(241,241,245,0.45)" }}>Updated quarterly with industry benchmarks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 60, maxWidth: 520 }}>
            <div className="reveal" style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#818cf8", marginBottom: 16 }}>What We Stand For</div>
            <h2 className="reveal d1 display-font" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Our Core Values
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {VALUES.map((v, i) => (
              <div key={v.title} className={`reveal d${i+1} value-card`} style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: 20, padding: "32px 28px" }}>
                <div className="val-icon" style={{ width: 52, height: 52, borderRadius: 14, background: `${v.accent}20`, border: `1px solid ${v.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                  <i className={`fa-solid ${v.icon}`} style={{ color: v.accent, fontSize: "1.25rem" }} />
                </div>
                <h3 className="display-font" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>{v.title}</h3>
                <p style={{ color: "rgba(241,241,245,0.5)", lineHeight: 1.75, fontSize: "0.9rem" }}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <div className="reveal" style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#818cf8", marginBottom: 16 }}>The Person Behind AmTechy</div>
            <h2 className="reveal d1 display-font" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>Meet the Founder</h2>
          </div>

          {TEAM.map(member => (
            <div key={member.name} className="reveal d2" style={{ background: "linear-gradient(145deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 100%)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 28, padding: "48px 44px", backdropFilter: "blur(8px)", position: "relative", overflow: "hidden" }}>
              {/* Background accent */}
              <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: 100, height: 100, borderRadius: 20, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.25rem", fontWeight: 800, color: "white", marginBottom: 16, fontFamily: "Bricolage Grotesque, sans-serif", boxShadow: "0 20px 50px rgba(99,102,241,0.3)" }}>
                    {member.initials}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {Object.entries(member.social).map(([platform]) => (
                      <div key={platform} style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <i className={`fa-brands fa-${platform}`} style={{ color: "rgba(241,241,245,0.45)", fontSize: "0.85rem" }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 260 }}>
                  <h3 className="display-font" style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>{member.name}</h3>
                  <p style={{ color: "#818cf8", fontWeight: 600, marginBottom: 8, fontSize: "0.95rem" }}>{member.role}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(241,241,245,0.35)", fontSize: "0.82rem", marginBottom: 20 }}>
                    <i className="fa-solid fa-graduation-cap" />
                    <span>{member.school}</span>
                  </div>
                  <p style={{ color: "rgba(241,241,245,0.6)", lineHeight: 1.8, marginBottom: 22, fontSize: "0.95rem" }}>{member.bio}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {member.badges.map(badge => (
                      <span key={badge} style={{ padding: "5px 14px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, color: "#a5b4fc" }}>{badge}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div style={{ marginTop: 40, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="quote-block" style={{ paddingLeft: 24 }}>
                  <p style={{ fontSize: "1.15rem", color: "rgba(241,241,245,0.7)", fontStyle: "italic", lineHeight: 1.8, marginBottom: 14 }}>
                    "I built AmTechy because I believe every brilliant mind in Africa deserves the same opportunities as anyone else in the world. Education is the equalizer."
                  </p>
                  <span style={{ color: "#818cf8", fontWeight: 700, fontSize: "0.88rem" }}>— Abdulrosheed Abdulmalik, Founder & CEO</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="reveal" style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#818cf8", marginBottom: 16 }}>How We Got Here</div>
            <h2 className="reveal d1 display-font" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>Our Journey</h2>
          </div>

          <div style={{ position: "relative", paddingLeft: 40 }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 19, top: 20, bottom: 20, width: 2, background: "linear-gradient(to bottom, #6366f1, #8b5cf6, #06b6d4, #f59e0b, #10b981)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`reveal d${(i%4)+1}`} style={{ display: "flex", gap: 28, position: "relative" }}>
                  {/* Dot */}
                  <div style={{ position: "absolute", left: -40, top: 6, width: 18, height: 18, borderRadius: "50%", background: m.color, border: `3px solid #07070f`, boxShadow: `0 0 0 3px ${m.color}40`, flexShrink: 0, zIndex: 2 }} />
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: m.color, marginBottom: 6 }}>{m.year}</div>
                    <h3 className="display-font" style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>{m.title}</h3>
                    <p style={{ color: "rgba(241,241,245,0.5)", lineHeight: 1.75, fontSize: "0.9rem" }}>{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
        <div className="orb" style={{ width: 600, height: 600, background: "#6366f1", opacity: 0.1, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div className="reveal shimmer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 99, border: "1px solid rgba(99,102,241,0.3)", marginBottom: 32, fontSize: "0.8rem", fontWeight: 600, color: "#a5b4fc" }}>
            🎓 Join 10,000+ African learners
          </div>
          <h2 className="reveal d1 display-font" style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Ready to Start Your
            <span style={{ display: "block", backgroundImage: "linear-gradient(135deg,#818cf8,#a78bfa,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Learning Journey?
            </span>
          </h2>
          <p className="reveal d2" style={{ fontSize: "1.1rem", color: "rgba(241,241,245,0.5)", marginBottom: 44, lineHeight: 1.75 }}>
            Join thousands of learners across Africa building skills that matter in today's digital economy.
          </p>
          <div className="reveal d3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/login")} className="btn-primary" style={{ padding: "1rem 2.25rem", borderRadius: 14, fontSize: "1rem" }}>
              <span>Start Learning Free →</span>
            </button>
            <button onClick={() => router.push("/help-center")} className="btn-outline" style={{ padding: "1rem 2.25rem", borderRadius: 14, fontSize: "1rem" }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white", fontFamily: "Bricolage Grotesque, sans-serif" }}>A</div>
            <span className="display-font" style={{ fontWeight: 700, color: "#f1f1f5" }}>AmTechy</span>
          </div>
          <p style={{ color: "rgba(241,241,245,0.25)", fontSize: "0.82rem" }}>© 2025 AmTechy. Built with ❤️ by Abdulrosheed Abdulmalik.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {[{ label: "Privacy", href: "/privacy" },{ label: "Terms", href: "/terms" },{ label: "Help", href: "/help-center" }].map(link => (
              <button key={link.label} onClick={() => router.push(link.href)} style={{ background: "none", border: "none", color: "rgba(241,241,245,0.3)", fontSize: "0.82rem", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(241,241,245,0.75)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,241,245,0.3)")}>
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
}