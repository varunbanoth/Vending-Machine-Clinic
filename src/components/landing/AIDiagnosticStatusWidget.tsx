import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Zap,
  Gauge,
  ShieldCheck,
  Radio,
  Sliders,
} from 'lucide-react';
import { Language } from '../../types';
import { playTouchClick, playGentleChime } from '../../utils/audio';
import { MagneticButton } from '../common/MagneticButton';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { AIPulseIndicator } from '../common/AIPulseIndicator';
import { Skeleton } from '../common/Skeleton';

interface AIDiagnosticStatusWidgetProps {
  language: Language;
}

export const AIDiagnosticStatusWidget: React.FC<AIDiagnosticStatusWidgetProps> = ({ language }) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [glucoseTelemetry, setGlucoseTelemetry] = useState(99.4);
  const [confidenceScore, setConfidenceScore] = useState(99.2);
  const [activeKioskFeed, setActiveKioskFeed] = useState(0);

  const feeds = [
    {
      kiosk: 'Kiosk #01 • Hyderabad HiTech Metro',
      test: 'Blood Glucose Assay (Amperometric)',
      reading: '104 mg/dL',
      status: 'Verified Normoglycemic',
      time: 'Just now',
    },
    {
      kiosk: 'Kiosk #02 • Bengaluru Indiranagar',
      test: 'Lipid Dual-Wavelength Spectrometry',
      reading: 'Total Chol: 168 mg/dL',
      status: 'Optimal Lipid Balance',
      time: '12s ago',
    },
    {
      kiosk: 'Kiosk #03 • Delhi Cyber Hub Metro',
      test: 'CBC Hemoglobin Optical Absorbance',
      reading: 'Hb: 14.2 g/dL',
      status: 'Normal Oxygen Saturation',
      time: '45s ago',
    },
  ];

  // Auto-rotate telemetry feed
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveKioskFeed((prev) => (prev + 1) % feeds.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateCalibration = () => {
    playTouchClick();
    setIsCalibrating(true);
    setTimeout(() => {
      setGlucoseTelemetry(Number((98.5 + Math.random() * 2.5).toFixed(1)));
      setConfidenceScore(Number((99.1 + Math.random() * 0.7).toFixed(1)));
      setIsCalibrating(false);
      playGentleChime();
    }, 1400);
  };

  const currentFeed = feeds[activeKioskFeed];

  return (
    <div
      id="ai-diagnostic-status-widget"
      className="relative overflow-hidden rounded-3xl glass-card border border-blue-500/30 p-6 md:p-8 text-white shadow-2xl backdrop-blur-2xl transition-all glow-blue-sm"
    >
      {/* Background glow lines */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <AIPulseIndicator size="lg" label="" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  {language === 'te' ? 'AI డయాగ్నోస్టిక్ మరియు హార్డ్‌వేర్ స్థితి' : 'Live AI Diagnostic & Optical Sensor Status'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 glow-cyan">
                  REAL-TIME CORE
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Spectrophotometric absorption (540nm/575nm) • Automated enzymatic biosensors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MagneticButton
              strength={0.2}
              onClick={handleSimulateCalibration}
              disabled={isCalibrating}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition glow-blue-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isCalibrating ? 'animate-spin' : ''}`} />
              <span>{isCalibrating ? 'Calibrating Sensors...' : 'Recalibrate Biosensor'}</span>
            </MagneticButton>
          </div>
        </div>

        {/* Real-time Telemetry Grid with Skeleton Loading State during Recalibration */}
        {isCalibrating ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="text" width="80%" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="text" width="80%" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="text" width="80%" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tile 1: Dual Wavelength Spectrometer */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3 hover:border-cyan-400/40 transition">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  Optical Spectrometer
                </span>
                <span className="text-emerald-400 text-[10px] font-mono">99.4% OPTIMAL</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">540 / 575</span>
                <span className="text-xs text-slate-400">nm Dual-band</span>
              </div>

              {/* Animated Pulse Line with Scanning Sweep */}
              <div className="h-9 w-full bg-slate-950 rounded-xl p-1 overflow-hidden relative flex items-center border border-white/5">
                <svg className="w-full h-full text-cyan-400" viewBox="0 0 200 40" fill="none">
                  <path
                    d="M 0 20 Q 20 20 35 20 L 45 5 L 55 35 L 65 10 L 75 25 L 85 20 L 120 20 L 130 8 L 140 32 L 150 20 L 200 20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-scanner-beam pointer-events-none"></div>
              </div>

              <p className="text-[11px] text-slate-400">
                Absorbance calibration verified against standard NIST hemoglobin reference.
              </p>
            </div>

            {/* Tile 2: Enzymatic Biosensor Engine with Animated Counter */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3 hover:border-blue-400/40 transition">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  Biosensor Amperometry
                </span>
                <span className="text-blue-400 text-[10px] font-mono">MICRO-CURRENT</span>
              </div>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter
                  value={glucoseTelemetry}
                  decimals={1}
                  duration={1200}
                  className="text-2xl font-black text-white"
                />
                <span className="text-xs text-slate-400">nA signal index</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Reaction Kinetics</span>
                  <span className="text-white font-bold font-mono">{confidenceScore}% match</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Glucose oxidase & cholesterol esterase catalytic current stable.
              </p>
            </div>

            {/* Tile 3: Gemini Diagnostic Synthesis with AI Pulse */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3 hover:border-amber-400/40 transition">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Gemini Medical AI
                </span>
                <span className="text-amber-300 text-[10px] font-mono">LIVE INFERENCE</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">&lt; 1.2</span>
                <span className="text-xs text-slate-400">sec synthesis latency</span>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/20 text-[11px] text-blue-200 leading-snug">
                "Multimodal engine parses spectrophotometric spikes into bilingual layman advice in English & Telugu."
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Doctor Telehealth Handshake</span>
                <span className="text-emerald-400 font-bold font-mono">READY (0s Queue)</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Kiosk Test Stream Ticker */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-300 font-bold">Live Fleet Stream:</span>
            <span className="text-white font-semibold">{currentFeed.kiosk}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-300">{currentFeed.test}</span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
              {currentFeed.reading}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
