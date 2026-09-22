import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Stethoscope,
  ShieldCheck,
  Zap,
  Activity,
  Heart,
  Droplet,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Gauge,
  Cpu,
  Layers,
  PhoneCall,
  Users,
} from 'lucide-react';
import { Language, UserRole } from '../../types';
import { translations, testPackages } from '../../i18n/translations';
import { playTouchClick } from '../../utils/audio';
import { KioskWorkflow } from './KioskWorkflow';
import { AIDiagnosticStatusWidget } from './AIDiagnosticStatusWidget';
import { BookDemoModal } from './BookDemoModal';
import { MagneticButton } from '../common/MagneticButton';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { AIPulseIndicator } from '../common/AIPulseIndicator';
import kiosk3dImage from '../../assets/images/medical_kiosk_3d_1789926344796.jpg';
import vmcLogo from '../../assets/images/vmc_official_logo_1789927279882.jpg';

interface LandingHeroProps {
  language: Language;
  onSelectMode: (mode: 'kiosk' | 'mobile' | 'doctor' | 'admin') => void;
  onTriggerEmergency: () => void;
  onOpenBookDemo?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  onSelectMode,
  onTriggerEmergency,
  onOpenBookDemo,
}) => {
  const [isLocalBookDemoOpen, setIsLocalBookDemoOpen] = useState(false);
  const t = translations[language];

  const handleOpenDemo = () => {
    playTouchClick();
    if (onOpenBookDemo) {
      onOpenBookDemo();
    } else {
      setIsLocalBookDemoOpen(true);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-fadeIn font-sans max-w-7xl mx-auto pb-10">
      {/* ===================== TOP BRAND LOGO BANNER ===================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950/90 border border-cyan-500/30 p-4 sm:p-5 backdrop-blur-2xl shadow-xl glow-blue-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/30 shrink-0 glow-cyan bg-slate-900">
            <img
              src={vmcLogo}
              alt="VMC Official Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">VMC</span>
              <span className="text-sm sm:text-base font-bold text-cyan-300">Vending Machine Clinic</span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold">
                Healthcare For Everyone
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Autonomous Diagnostic Stations • 5-Minute Lab Results • A Smarter, Healthier Tomorrow
            </p>
          </div>
        </div>

        {/* 4 Pillars from the Official Logo */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs font-semibold text-slate-200 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10 glow-blue-sm">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Fast Testing</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10 glow-cyan-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reliable Results</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Accessible Care</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-white/10">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Healthier Communities</span>
          </div>
        </div>
      </div>

      {/* ===================== HERO SHOWCASE (SPLIT: CONTENT + 3D KIOSK) ===================== */}
      <div className="relative overflow-hidden rounded-[36px] bg-slate-950/80 backdrop-blur-2xl text-white p-6 sm:p-10 lg:p-12 border border-blue-500/30 shadow-[0_20px_50px_rgba(8,20,45,0.7)]">
        {/* Subtle Ambient Radial Glow Backdrops */}
        <div className="absolute top-0 right-1/4 -mt-24 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Vision, Value Proposition, Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Pulse Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-400/40 text-cyan-300 text-xs font-bold tracking-wider uppercase shadow-inner glow-blue-sm">
              <AIPulseIndicator size="sm" label="" />
              <span>Autonomous Healthcare Kiosk • Production Ready</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                {language === 'te' ? (
                  <>
                    వెండింగ్ మెషిన్ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">క్లినిక్</span>
                  </>
                ) : (
                  <>
                    Vending Machine <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">Clinic</span>
                  </>
                )}
              </h1>
              <p className="text-sm font-semibold tracking-wide uppercase text-cyan-400/90 flex items-center gap-2">
                <span>Self-Service Autonomous Diagnostic Network</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </p>
            </div>

            <p className="text-base sm:text-lg text-blue-100/90 font-normal leading-relaxed max-w-2xl">
              {language === 'te'
                ? 'ఆటోమేటెడ్ బయోసెన్సర్లు, జెమిని AI విశ్లేషణ మరియు తక్షణ వైద్యుల లైవ్ వీడియో సంప్రదింపులతో కూడిన భారతదేశపు మొట్టమొదటి స్వీయ-సేవా వైద్య కియోస్క్.'
                : 'India’s premier self-service autonomous diagnostic kiosk. Delivers certified lab tests in under 5 minutes with enzymatic amperometry, dual-wavelength spectrometry, Gemini AI health synthesis, and instant doctor consultations.'}
            </p>

            {/* Action Buttons with Magnetic Hover & Visual Haptic Feedback */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <MagneticButton
                id="landing-launch-kiosk-btn"
                strength={0.2}
                onClick={() => {
                  playTouchClick();
                  onSelectMode('kiosk');
                }}
                className="px-7 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-blue-500/35 glow-blue flex items-center gap-2.5 transition-all border border-cyan-400/30"
              >
                <Monitor className="w-5 h-5" />
                <span>{language === 'te' ? '15" కియోస్క్ తెరవండి' : 'Launch 15" Kiosk Screen'}</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>

              <MagneticButton
                id="landing-book-demo-btn"
                strength={0.2}
                onClick={handleOpenDemo}
                className="px-5 py-4 bg-slate-900/80 hover:bg-slate-800/90 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all glow-blue-sm"
              >
                <Calendar className="w-4 h-4 text-cyan-300" />
                <span>{language === 'te' ? 'డెమో బుక్ చేయండి' : 'Book Kiosk Demo'}</span>
              </MagneticButton>

              <MagneticButton
                id="landing-launch-mobile-btn"
                strength={0.15}
                onClick={() => {
                  playTouchClick();
                  onSelectMode('mobile');
                }}
                className="px-4 py-4 bg-slate-900/60 hover:bg-slate-850 text-blue-200 hover:text-white font-semibold text-sm rounded-2xl border border-blue-900/60 flex items-center gap-2 transition"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>{language === 'te' ? 'రోగి యాప్' : 'Patient App'}</span>
              </MagneticButton>

              <MagneticButton
                id="landing-sos-trigger-btn"
                strength={0.15}
                onClick={() => {
                  playTouchClick();
                  onTriggerEmergency();
                }}
                className="px-4 py-4 bg-red-600/80 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl border border-red-400/50 flex items-center gap-1.5 transition shadow-lg shadow-red-600/30"
                title="Simulated 108 Emergency Siren"
              >
                <ShieldAlert className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>{t.emergencySOS}</span>
              </MagneticButton>
            </div>
          </div>

          {/* Right Column: 3D Medical Kiosk Showcase + Floating Glass HUD Tags */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Halo Backlight with Slow Pulsing Breathing */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-cyan-500/20 rounded-[32px] blur-2xl transform scale-95 animate-pulse"></div>

            {/* Framed 3D Render Card */}
            <div className="relative w-full rounded-[28px] overflow-hidden border border-cyan-400/30 bg-slate-900/80 shadow-2xl backdrop-blur-2xl group glow-blue-sm">
              <img
                src={kiosk3dImage}
                alt="3D Autonomous Medical Diagnostic Kiosk"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay on bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85 pointer-events-none"></div>

              {/* Floating Status Glass HUD Tags */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md glow-cyan">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Spectrometer Calibrated</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-blue-400/40 text-blue-200 text-[11px] font-bold shadow-lg backdrop-blur-md">
                  15" HD Touch UI
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-950/90 border border-blue-500/40 backdrop-blur-md flex items-center justify-between text-xs glow-blue-sm">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <AIPulseIndicator size="sm" label="Gemini AI Core" />
                  </div>
                  <div className="text-[11px] text-blue-300 mt-0.5">Painless micro-capillary sampling</div>
                </div>
                <MagneticButton
                  strength={0.2}
                  onClick={() => {
                    playTouchClick();
                    onSelectMode('kiosk');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl transition shadow-md shadow-blue-500/30"
                >
                  Inspect Kiosk
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== KPI METRICS CARDS WITH ANIMATED COUNTERS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: 5 Min Turnaround */}
        <div className="p-6 rounded-3xl glass-card glass-card-hover text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Rapid Turnaround
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center glow-blue-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
            <span>&lt;</span>
            <AnimatedCounter value={5} duration={1200} />
            <span className="text-2xl font-bold text-slate-300 ml-1">Min</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            From sample insertion to certified laboratory diagnostic report and bilingual AI synthesis.
          </p>
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fast zero-queue processing
          </div>
        </div>

        {/* Metric 2: 99.2% Accuracy */}
        <div className="p-6 rounded-3xl glass-card glass-card-hover text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Clinical Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center glow-cyan">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-black tracking-tight text-white flex items-baseline">
            <AnimatedCounter value={99.2} decimals={1} suffix="%" duration={1600} />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Correlated against standard clinical laboratory auto-analyzers using dual-band spectrometry.
          </p>
          <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Certified enzymatic biosensors
          </div>
        </div>

        {/* Metric 3: 24/7 Autonomous */}
        <div className="p-6 rounded-3xl glass-card glass-card-hover text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Autonomous Access
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center glow-blue-sm">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
            <AnimatedCounter value={24} duration={1200} />
            <span className="text-2xl font-bold text-slate-400">/</span>
            <AnimatedCounter value={7} duration={1200} />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Always online at transit metro stations, airport concourses, IT parks, and residential hubs.
          </p>
          <div className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Self-sanitizing micro-chamber
          </div>
        </div>

        {/* Metric 4: 2 Min Doctor Video */}
        <div className="p-6 rounded-3xl glass-card glass-card-hover text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Doctor TeleHealth
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
            <span>&lt;</span>
            <AnimatedCounter value={2} duration={1000} />
            <span className="text-2xl font-bold text-slate-300 ml-1">Min</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Instant video consultation with attending MD directly through the kiosk screen or mobile app.
          </p>
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Certified e-Prescriptions
          </div>
        </div>
      </div>

      {/* ===================== 4-STEP VISUAL WORKFLOW ===================== */}
      <KioskWorkflow
        language={language}
        onLaunchKiosk={() => onSelectMode('kiosk')}
      />

      {/* ===================== ANIMATED AI DIAGNOSTIC STATUS WIDGET ===================== */}
      <AIDiagnosticStatusWidget language={language} />

      {/* ===================== 4 INTERACTIVE STAKEHOLDER PORTALS ===================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'te' ? 'అప్లికేషన్ మాడ్యూల్స్ ఎంచుకోండి' : 'Choose App Environment'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explore the 4 interconnected systems for patients, kiosks, doctors, and operations teams
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Kiosk Screen */}
          <div
            onClick={() => {
              playTouchClick();
              onSelectMode('kiosk');
            }}
            className="group p-6 glass-card glass-card-hover rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition glow-blue-sm">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Primary Kiosk Interface
              </span>
              <h3 className="text-xl font-bold text-white">
                {language === 'te' ? 'కియోస్క్ స్క్రీన్ (15")' : '15" Touch Kiosk'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-screen ATM touch interface with simulated UPI QR animation, 3-step animated sample collection, and instant bilingual reports.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>Open Kiosk UI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Mobile App */}
          <div
            onClick={() => {
              playTouchClick();
              onSelectMode('mobile');
            }}
            className="group p-6 glass-card glass-card-hover rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition glow-cyan">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                Customer Mobile
              </span>
              <h3 className="text-xl font-bold text-white">
                {language === 'te' ? 'రోగి మొబైల్ యాప్' : 'Patient Mobile App'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Health-inspired mobile experience with Health Score, downloadable PDF records, medicine reminders, and appointments.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Doctor Station */}
          <div
            onClick={() => {
              playTouchClick();
              onSelectMode('doctor');
            }}
            className="group p-6 glass-card glass-card-hover rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition glow-blue-sm">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Doctor Station
              </span>
              <h3 className="text-xl font-bold text-white">
                {language === 'te' ? 'వైద్యుల ప్యానెల్' : 'Doctor TeleHealth'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review pending kiosk reports, approve biomarkers, draft prescriptions, and start WebRTC video consultations with patients.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-indigo-400">
              <span>Doctor Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Admin Fleet Ops */}
          <div
            onClick={() => {
              playTouchClick();
              onSelectMode('admin');
            }}
            className="group p-6 glass-card glass-card-hover rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Operations & Fleet
              </span>
              <h3 className="text-xl font-bold text-white">
                {language === 'te' ? 'అడ్మిన్ డ్యాష్‌బోర్డ్' : 'Admin Fleet Ops'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live kiosk hardware status (temperature, reagent level), patient bookings, revenue stats, and synthetic test generator.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Admin Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* ===================== AVAILABLE DIAGNOSTIC MENU SHOWCASE ===================== */}
      <div className="glass-card rounded-[32px] p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-2xl font-black text-white">
              {language === 'te' ? 'పరీక్షల వివరాలు మరియు ధరలు' : 'Kiosk Diagnostic Menu & Instant Pricing'}
            </h3>
            <p className="text-xs text-slate-400">
              Micro-volume blood testing using optical spectrometry and enzymatic biosensors
            </p>
          </div>
          <span className="text-xs font-bold text-cyan-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30 glow-blue-sm">
            NABL-Correlated Clinical Standards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800">
                    {pkg.duration}
                  </span>
                  <span className="text-xl font-black text-white">₹{pkg.price}</span>
                </div>
                <h4 className="font-bold text-base text-white">
                  {language === 'te' ? pkg.nameTe : pkg.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {language === 'te' ? pkg.descriptionTe : pkg.description}
                </p>
              </div>

              <MagneticButton
                strength={0.15}
                onClick={() => {
                  playTouchClick();
                  onSelectMode('kiosk');
                }}
                className="w-full py-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-xl text-xs font-bold transition text-center glow-blue-sm"
              >
                Select at Kiosk →
              </MagneticButton>
            </div>
          ))}
        </div>
      </div>

      {/* Book Demo Modal */}
      <BookDemoModal
        isOpen={isLocalBookDemoOpen}
        onClose={() => setIsLocalBookDemoOpen(false)}
        language={language}
        onLaunchKiosk={() => onSelectMode('kiosk')}
      />
    </div>
  );
};
