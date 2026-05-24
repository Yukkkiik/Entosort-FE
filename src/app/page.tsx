"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
}

interface ProblemCard {
  icon: string;
  stat: string;
  title: string;
  description: string;
}

interface StepCard {
  number: string;
  title: string;
  description: string;
  icon: string;
  detail: string;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Key Features", href: "#features" },
  { label: "The Minds", href: "#team" },
];

const PROBLEM_CARDS: ProblemCard[] = [
  {
    icon: "⚗️",
    stat: "8–10%",
    title: "Methane from Food Waste",
    description:
      "Global food waste decomposes in landfills, generating up to 10% of all greenhouse gas emissions — accelerating climate breakdown with every ton discarded.",
  },
  {
    icon: "🌊",
    stat: "20M ton/yr",
    title: "Unsustainable Feed Industry",
    description:
      "Fish meal and soybean dependence depletes oceans and deforests land. The feed industry urgently needs a scalable, circular protein alternative.",
  },
  {
    icon: "⏱️",
    stat: "60% slower",
    title: "Inefficient Manual Sorting",
    description:
      "Human-operated larva grading is inconsistent, fatigue-prone, and bottlenecks production. Quality control suffers at every stage of cultivation.",
  },
];

const STEP_CARDS: StepCard[] = [
  {
    number: "01",
    title: "Detection",
    description:
      "High-resolution computer vision cameras capture larval imagery in real time across the entire conveyor surface.",
    icon: "📷",
    detail: "Vision System",
  },
  {
    number: "02",
    title: "Classification",
    description:
      "A custom-trained neural network classifies each larva by size, development stage, and health status within milliseconds.",
    icon: "🧠",
    detail: "AI Engine",
  },
  {
    number: "03",
    title: "Sorting",
    description:
      "IoT-controlled pneumatic actuators physically separate larvae into designated channels — zero human intervention required.",
    icon: "⚡",
    detail: "IoT Control",
  },
];

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: "⚡",
    title: "Low Latency",
    description:
      "Edge-computed inference delivers sorting decisions in under 50ms, keeping production lines moving at full speed without bottlenecks.",
    metric: "<50ms",
    metricLabel: "Response Time",
  },
  {
    icon: "📡",
    title: "Real-time Monitoring",
    description:
      "Live dashboards stream sensor data, throughput metrics, and anomaly alerts so operators have complete visibility at all times.",
    metric: "24/7",
    metricLabel: "Live Uptime",
  },
  {
    icon: "🎯",
    title: "High Precision AI",
    description:
      "Our vision model achieves industry-leading classification accuracy, dramatically outperforming manual grading benchmarks.",
    metric: "97.4%",
    metricLabel: "Accuracy",
  },
];

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Fauzan A.", role: "AI & Computer Vision Lead", initials: "FA", color: "from-lime-400 to-green-500" },
  { name: "Rizky M.", role: "IoT & Hardware Engineer", initials: "RM", color: "from-emerald-400 to-teal-500" },
  { name: "Dinda P.", role: "Full-Stack Developer", initials: "DP", color: "from-green-400 to-lime-500" },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

// function useInView(options?: IntersectionObserverInit) {
//   const [node, setNode] = useState<HTMLDivElement | null>(null);
//   const [inView, setInView] = useState(false);

//   useEffect(() => {
//     if (!node) return;

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setInView(true);
//           observer.disconnect();
//         }
//       },
//       { threshold: 0.15, ...options }
//     );

//     observer.observe(node);

//     return () => observer.disconnect();
//   }, [node, options]);

//   return { ref: setNode, inView };
// }

// ─── Sub-components (defined inline) ─────────────────────────────────────────

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5 group">
      <div className="relative w-9 h-9">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-green-600 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute inset-0 flex items-center justify-center text-black font-black text-sm tracking-tight">
          ES
        </div>
      </div>
      <span className="font-black text-xl tracking-tight text-white">
        Ento<span className="text-lime-400">Sort</span>
      </span>
    </div>
  );
}

function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-[120px] opacity-30 pointer-events-none ${className}`}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

const heroSection = { ref: undefined, inView: true };
const problemSection = { ref: undefined, inView: true };
const solutionSection = { ref: undefined, inView: true };
const featureSection = { ref: undefined, inView: true };
const teamSection = { ref: undefined, inView: true };

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#080808] text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}>

      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=Sora:wght@400;600;700;800&display=swap');

        html { scroll-behavior: smooth; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(1.5deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.03); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(163, 230, 53, 0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(163, 230, 53, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(163, 230, 53, 0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-floatB { animation: floatB 8s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-scanline { animation: scanline 3s linear infinite; }
        .animate-ticker { animation: ticker 22s linear infinite; }
        .animate-gradient { animation: gradientShift 6s ease infinite; background-size: 200% 200%; }

        .fade-up { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }

        .fade-left { opacity: 0; transform: translateX(-24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-left.visible { opacity: 1; transform: translateX(0); }

        .scale-in { opacity: 0; transform: scale(0.9); transition: opacity 0.6s ease, transform 0.6s ease; }
        .scale-in.visible { opacity: 1; transform: scale(1); }

        .glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .glass-dark {
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .glow-lime { box-shadow: 0 0 24px rgba(163, 230, 53, 0.35); }
        .glow-lime-lg { box-shadow: 0 0 48px rgba(163, 230, 53, 0.25), 0 0 80px rgba(163, 230, 53, 0.10); }
        .text-gradient {
          background: linear-gradient(135deg, #a3e635 0%, #4ade80 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .border-gradient {
          border: 1px solid transparent;
          background: linear-gradient(#0f0f0f, #0f0f0f) padding-box,
                      linear-gradient(135deg, rgba(163,230,53,0.5), rgba(74,222,128,0.1), transparent) border-box;
        }
        .step-card:hover { transform: translateY(-8px) rotate(-0.5deg); }
        .feature-card:hover .feature-glow { opacity: 1; }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 128px;
        }
      `}</style>

      {/* ════════════════════════════════════════════════════
          01 · NAVBAR
      ════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 glass-dark shadow-2xl shadow-black/50"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={() => handleNav("#home")} className="focus:outline-none">
            <LogoMark />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-lime-400 group-hover:w-4/5 transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href='/login'
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-black text-sm font-bold hover:bg-lime-300 active:scale-95 transition-all duration-200 glow-lime"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
            <button
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg glass"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-400 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="glass-dark mx-4 mt-2 rounded-2xl p-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className="text-left px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNav("#features")}
              className="mt-2 px-4 py-3 rounded-xl bg-lime-400 text-black text-sm font-bold"
            >
              Get Started →
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════
          02 · HERO
      ════════════════════════════════════════════════════ */}
      <section id="home" className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 noise" />
        <GlowOrb className="w-[700px] h-[700px] bg-lime-500 -top-40 -left-40" />
        <GlowOrb className="w-[500px] h-[500px] bg-emerald-600 top-1/2 -right-60" />
        <GlowOrb className="w-[300px] h-[300px] bg-green-500 bottom-20 left-1/3" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(163,230,53,1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className={`space-y-8 transition-all duration-1000 ${heroSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-lime-400/20">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse-ring" />
              <span className="text-lime-400 text-xs font-semibold uppercase tracking-widest">
                AI-Powered AgriTech
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.07] tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              The Future of{" "}
              <span className="text-gradient">Automated BSF</span>{" "}
              <br className="hidden lg:block" />
              Larva Sorting with{" "}
              <span className="text-gradient">AI Precision</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
              EntoSort optimizes Black Soldier Fly cultivation through{" "}
              <span className="text-white font-medium">computer vision</span>,{" "}
              <span className="text-white font-medium">deep learning classification</span>, and{" "}
              <span className="text-white font-medium">IoT-driven automation</span> — turning organic waste into scalable protein at machine speed.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {[["97.4%", "Sorting Accuracy"], ["<50ms", "Latency"], ["3×", "Throughput"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black text-lime-400" style={{ fontFamily: "'Sora', sans-serif" }}>{val}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleNav("#solution")}
                className="group px-7 py-3.5 rounded-xl bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 active:scale-95 transition-all duration-200 glow-lime flex items-center gap-2"
              >
                Explore the Tech
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </button>
              <button
                onClick={() => handleNav("#problem")}
                className="px-7 py-3.5 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all"
              >
                The Problem
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Outer ring */}
            <div className="absolute w-[420px] h-[420px] rounded-full border border-lime-400/10 animate-spin-slow" />
            <div className="absolute w-[340px] h-[340px] rounded-full border border-lime-400/05 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "30s" }} />

            {/* Central visual */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 animate-floatB">
              {/* Main circle */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1a2e0a] to-[#0a1505] border border-lime-400/20 flex items-center justify-center glow-lime-lg overflow-hidden">
                {/* Camera / scan visual */}
                <div className="relative w-48 h-48">
                  {/* Outer frame */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-lime-400/40" />
                  {/* Corner markers */}
                  {["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"].map((pos) => (
                    <div key={pos} className={`absolute ${pos} w-5 h-5`}>
                      <div className="w-full h-0.5 bg-lime-400" />
                      <div className="w-0.5 h-full bg-lime-400" />
                    </div>
                  ))}

                  {/* Inner content */}
                  <div className="absolute inset-3 rounded-xl bg-black/60 flex flex-col items-center justify-center gap-2 overflow-hidden">
                    {/* Scan line */}
                    <div className="absolute left-0 right-0 h-px bg-lime-400/80 animate-scanline shadow-[0_0_8px_rgba(163,230,53,0.8)]" />

                    <div className="text-5xl">🦟</div>
                    <div className="text-xs text-lime-400 font-mono font-bold">SCANNING...</div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-lime-400"
                          style={{ animation: `blink 1.2s ${i * 0.3}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating data chips */}
              {[
                { label: "DETECTED: 142", pos: "-top-4 -right-8", delay: "0s" },
                { label: "SORTED: 98.2%", pos: "top-1/2 -right-12", delay: "1.2s" },
                { label: "STAGE: PREPUPAE", pos: "-bottom-4 -left-10", delay: "0.6s" },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className={`absolute ${chip.pos} glass px-3 py-1.5 rounded-full text-[10px] font-mono text-lime-400 border border-lime-400/20 animate-float whitespace-nowrap`}
                  style={{ animationDelay: chip.delay }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block mr-1.5 align-middle animate-pulse" />
                  {chip.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker Bar */}
        <div className="relative mt-8 overflow-hidden border-y border-white/5 py-3">
          <div className="flex animate-ticker gap-0 whitespace-nowrap">
            {Array(8).fill(["AI Sorting System", "Computer Vision", "IoT Integration", "Real-time Analytics", "BSF Cultivation", "Sustainable Protein", "Zero Waste Tech", "Edge Computing"]).flat().map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-xs font-medium text-gray-600 uppercase tracking-widest">
                {item}
                <span className="text-lime-400">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          03 · PROBLEM
      ════════════════════════════════════════════════════ */}
      <section id="problem" className="relative py-28 overflow-hidden bg-[#050505]">
        {/* Background atmospheric effects */}
        <div className="absolute inset-0 noise opacity-60" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(163,230,53,0.08) 0%, transparent 70%)",
          }}
        />

        <div
          className="max-w-7xl mx-auto px-6"
        >
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${problemSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-400 text-xs font-semibold uppercase tracking-widest">The Problem</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              A World <span className="text-red-400">Wasting</span> Its{" "}
              <br className="hidden md:block" />
              Most Valuable Resources
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Three compounding crises demand an intelligent solution — and the window to act is closing.
            </p>
          </div>

          {/* Problem cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {PROBLEM_CARDS.map((card, i) => (
              <div
                key={card.title}
                className={`group relative rounded-2xl p-8 border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-red-500/20 hover:bg-red-500/[0.03] transition-all duration-500 overflow-hidden cursor-default transition-all duration-700 ${
                  problemSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500 rounded-2xl" />

                {/* Stat */}
                <div className="relative">
                  <div className="text-6xl font-black text-white/5 group-hover:text-red-500/10 transition-colors duration-500 absolute -top-4 -right-4 select-none" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {card.stat}
                  </div>
                  <div className="text-4xl mb-4">{card.icon}</div>
                  <div className="text-2xl font-black text-red-400 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {card.stat}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                    {card.description}
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mt-20 flex items-center gap-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2 text-lime-400 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Enter EntoSort
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          04 · SOLUTION / HOW IT WORKS
      ════════════════════════════════════════════════════ */}
      <section id="solution" className="relative py-28 overflow-hidden">
        <GlowOrb className="w-[500px] h-[500px] bg-lime-500 -left-60 top-1/4" />
        <div className="absolute inset-0 noise" />

        <div
          className="relative max-w-7xl mx-auto px-6"
        >
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${solutionSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-lime-400/20 bg-lime-400/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-lime-400 text-xs font-semibold uppercase tracking-widest">How It Works</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              Three Steps to{" "}
              <span className="text-gradient">Intelligent</span>{" "}
              Sorting
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              A seamless pipeline from raw input to sorted output — powered end-to-end by AI and IoT with zero manual intervention.
            </p>
          </div>

          {/* Step cards */}
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-[16%] right-[16%] h-px -translate-y-1/2">
              <div className="w-full h-full bg-gradient-to-r from-lime-400/40 via-emerald-400/60 to-lime-400/40" />
              {/* Animated dots on line */}
              {[0, 33, 66].map((pct) => (
                <div
                  key={pct}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-lime-400 glow-lime"
                  style={{ left: `${pct + 17}%` }}
                />
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8 relative z-10">
              {STEP_CARDS.map((step, i) => (
                <div
                  key={step.number}
                  className={`step-card group relative rounded-3xl p-8 border-gradient bg-[#0d0d0d] hover:bg-[#111] transition-all duration-500 cursor-default ${
                    solutionSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
                  }`}
                  style={{
                    transitionDelay: `${i * 180}ms`,
                    transitionProperty: "opacity, transform",
                    transitionDuration: "700ms",
                  }}
                >
                  {/* Step number watermark */}
                  <div
                    className="absolute top-6 right-6 text-7xl font-black text-white/[0.03] group-hover:text-lime-400/[0.06] transition-colors duration-500 select-none"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-2xl mb-6 group-hover:bg-lime-400/20 group-hover:scale-110 transition-all duration-300">
                    {step.icon}
                  </div>

                  {/* Tag */}
                  <div className="text-xs font-bold text-lime-400/60 uppercase tracking-widest mb-2 font-mono">
                    {step.detail}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-black text-white mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
                    <span className="text-lime-400/40 mr-1">{step.number}</span>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                    {step.description}
                  </p>

                  {/* Bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-3xl bg-gradient-to-r from-transparent via-lime-400/0 to-transparent group-hover:via-lime-400/60 transition-all duration-500" />
                </div>
              ))}
            </div>
          </div>

          {/* System diagram strip */}
          <div className={`mt-20 rounded-3xl glass p-8 border border-white/5 transition-all duration-1000 delay-500 ${solutionSection.inView ? "opacity-100" : "opacity-0"}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {[
                { icon: "📦", label: "Larva Input", sublabel: "Conveyor Feed" },
                { icon: "→", label: "", sublabel: "" },
                { icon: "📷", label: "Vision Array", sublabel: "Multi-cam Setup" },
                { icon: "→", label: "", sublabel: "" },
                { icon: "🧠", label: "AI Engine", sublabel: "Edge Inference" },
                { icon: "→", label: "", sublabel: "" },
                { icon: "⚡", label: "Actuators", sublabel: "Pneumatic Sort" },
                { icon: "→", label: "", sublabel: "" },
                { icon: "📊", label: "Dashboard", sublabel: "Live Analytics" },
              ].map((node, i) =>
                node.label === "" ? (
                  <div key={i} className="hidden sm:block text-lime-400/30 text-xl font-mono">→</div>
                ) : (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-xl glass border border-lime-400/10 flex items-center justify-center text-xl">
                      {node.icon}
                    </div>
                    <div className="text-xs font-bold text-white">{node.label}</div>
                    <div className="text-[10px] text-gray-600">{node.sublabel}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          05 · KEY FEATURES
      ════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-28 bg-[#050505] overflow-hidden">
        <GlowOrb className="w-[600px] h-[600px] bg-emerald-600 -right-60 top-1/3" />
        <div className="absolute inset-0 noise opacity-60" />

        <div
          className="relative max-w-7xl mx-auto px-6"
        >
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${featureSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-lime-400/20 bg-lime-400/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-lime-400 text-xs font-semibold uppercase tracking-widest">Key Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              Built for{" "}
              <span className="text-gradient">Industrial</span>{" "}
              Performance
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Every module in EntoSort is engineered to operate at the edge of what&apos;s technically possible.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURE_CARDS.map((feat, i) => (
              <div
                key={feat.title}
                className={`feature-card group relative rounded-3xl p-8 bg-[#0d0d0d] border border-white/5 overflow-hidden cursor-default transition-all duration-700 hover:-translate-y-3 hover:border-lime-400/20 ${
                  featureSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
                onMouseEnter={() => setActiveFeature(i)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                {/* Glow overlay */}
                <div className="feature-glow absolute inset-0 bg-gradient-to-b from-lime-400/0 via-lime-400/[0.04] to-lime-400/0 opacity-0 transition-opacity duration-500 rounded-3xl" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-lime-400/0 group-hover:bg-lime-400/5 rounded-full blur-3xl transition-all duration-700" />

                {/* Metric */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-lime-400/20 transition-all duration-300">
                    {feat.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-lime-400" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {feat.metric}
                    </div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wide">{feat.metricLabel}</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                  {feat.description}
                </p>

                {/* Active indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-3xl bg-gradient-to-r from-transparent via-lime-400 to-transparent transition-opacity duration-300 ${activeFeature === i ? "opacity-100" : "opacity-0"}`} />
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className={`mt-16 relative rounded-3xl overflow-hidden transition-all duration-1000 delay-700 ${featureSection.inView ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400/20 via-emerald-500/10 to-lime-400/20 animate-gradient" />
            <div className="absolute inset-px rounded-3xl bg-[#0a0a0a]" />
            <div className="relative px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Ready to see EntoSort in action?
                </h3>
                <p className="text-gray-500 text-sm">Schedule a live demo and talk to the team.</p>
              </div>
              <button
                onClick={() => handleNav("#team")}
                className="shrink-0 px-8 py-4 rounded-2xl bg-lime-400 text-black font-bold text-sm hover:bg-lime-300 active:scale-95 transition-all glow-lime flex items-center gap-2"
              >
                Meet the Team
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          06 · THE MINDS
      ════════════════════════════════════════════════════ */}
      <section id="team" className="relative py-28 overflow-hidden">
        <GlowOrb className="w-[400px] h-[400px] bg-lime-500 left-1/2 -translate-x-1/2 -top-20" />
        <div className="absolute inset-0 noise" />

        <div
          className="relative max-w-7xl mx-auto px-6"
        >
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-1000 ${teamSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-lime-400/20 bg-lime-400/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-lime-400 text-xs font-semibold uppercase tracking-widest">The Minds</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              The Minds Behind{" "}
              <span className="text-gradient">EntoSort</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              A multidisciplinary team converging AI research, hardware engineering, and software craftsmanship to solve a real-world problem.
            </p>
          </div>

          {/* Grid: description + team */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Description card */}
            <div className={`lg:col-span-1 rounded-3xl p-8 bg-gradient-to-b from-lime-400/10 to-transparent border border-lime-400/15 flex flex-col justify-between gap-8 transition-all duration-700 ${teamSection.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
              <div>
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-black text-white mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Built with purpose.
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  EntoSort was born at the intersection of sustainability and cutting-edge technology. Our team is united by a single mission: making insect-based protein accessible, scalable, and intelligent.
                </p>
              </div>
              <div className="space-y-3">
                {["AI Research", "IoT Engineering", "Full-Stack Dev", "Agri-Tech"].map((tag) => (
                  <div key={tag} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* Team member cards */}
            {TEAM_MEMBERS.map((member, i) => (
              <div
                key={member.name}
                className={`group relative rounded-3xl p-8 bg-[#0d0d0d] border border-white/5 hover:border-lime-400/20 transition-all duration-500 hover:-translate-y-2 cursor-default ${
                  teamSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${(i + 1) * 150}ms` }}
              >
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-2xl font-black text-black group-hover:scale-105 transition-transform duration-300`}>
                    {member.initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-lime-400 border-2 border-[#0d0d0d] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className="text-gray-500 text-xs mb-6">{member.role}</p>

                {/* Skill bars */}
                <div className="space-y-2">
                  {[
                    { skill: "Research", pct: 90 },
                    { skill: "Engineering", pct: 85 },
                  ].map((s) => (
                    <div key={s.skill}>
                      <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                        <span>{s.skill}</span>
                        <span>{s.pct}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 rounded-full transition-all duration-1000"
                          style={{ width: teamSection.inView ? `${s.pct}%` : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl bg-lime-400/0 group-hover:bg-lime-400/[0.02] transition-colors duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          07 · FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="relative bg-lime-400 overflow-hidden">
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "128px",
          }}
        />

        {/* Top wave divider */}
        <div className="absolute -top-px left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48L1440 48L1440 0C1200 40 960 48 720 32C480 16 240 0 0 24L0 48Z" fill="#a3e635" />
          </svg>
        </div>

        <div className="relative pt-12 pb-10">
          <div className="max-w-7xl mx-auto px-6">
            {/* Main footer content */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="relative w-9 h-9">
                    <div className="absolute inset-0 bg-black rounded-xl rotate-6" />
                    <div className="absolute inset-0 flex items-center justify-center text-lime-400 font-black text-sm tracking-tight">
                      ES
                    </div>
                  </div>
                  <span className="font-black text-xl tracking-tight text-black">
                    Ento<span className="text-black/60">Sort</span>
                  </span>
                </div>
                <p className="text-black/60 text-sm leading-relaxed max-w-xs">
                  Intelligent BSF larva sorting powered by AI precision, computer vision, and IoT automation.
                </p>
                <div className="flex gap-3 mt-5">
                  {["𝕏", "in", "gh"].map((icon) => (
                    <button
                      key={icon}
                      className="w-9 h-9 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center text-sm font-bold text-black/70 hover:text-black transition-all"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Links */}
              {[
                {
                  title: "Product",
                  links: ["Features", "How It Works", "Pricing", "Roadmap"],
                },
                {
                  title: "Company",
                  links: ["About Us", "The Team", "Blog", "Contact"],
                },
                {
                  title: "Resources",
                  links: ["Documentation", "API Reference", "Research Papers", "GitHub"],
                },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="font-bold text-black text-sm mb-4 uppercase tracking-wider">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-black/60 hover:text-black text-sm transition-colors"
                          onClick={(e) => e.preventDefault()}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-black/10 mb-6" />

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-black/50 text-xs">
                © 2025 EntoSort. All rights reserved. Built for a sustainable future.
              </p>
              <div className="flex gap-6">
                {["Privacy Policy", "Terms of Use"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-black/50 hover:text-black text-xs transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}