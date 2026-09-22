import React, { useState } from 'react';
import {
  Monitor,
  Droplet,
  Activity,
  Stethoscope,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { Language } from '../../types';
import { playTouchClick } from '../../utils/audio';
import { MagneticButton } from '../common/MagneticButton';

interface KioskWorkflowProps {
  language: Language;
  onLaunchKiosk: () => void;
}

export const KioskWorkflow: React.FC<KioskWorkflowProps> = ({
  language,
  onLaunchKiosk,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps = [
    {
      stepNumber: '01',
      title: language === 'te' ? 'పరీక్షను ఎంచుకోండి & UPI చెల్లింపు' : 'Select Test & Instant UPI QR',
      shortTitle: 'Select & Pay',
      icon: Monitor,
      badge: 'Step 1 • 30 Seconds',
      description:
        language === 'te'
          ? '15-అంగుళాల టచ్‌స్క్రీన్ ఇంటర్‌ఫేస్‌లో బ్లడ్ షుగర్ (₹99), CBC (₹199), లిపిడ్ లేదా థైరాయిడ్ ఎంచుకోండి. ఫోన్‌పే, జీపే లేదా పేటీఎం ద్వారా స్కాన్ చేసి క్షణాల్లో చెల్లించండి.'
          : 'Approach the 15" high-definition touch display. Select your diagnostic package (Blood Sugar, CBC, Cholesterol, or Thyroid). Scan the dynamically generated UPI QR code via PhonePe, GPay, or Paytm.',
      metrics: [
        { label: 'Time Required', val: '30 sec' },
        { label: 'Payment Method', val: 'Instant UPI QR' },
        { label: 'Base Pricing', val: 'From ₹99' },
      ],
      tag: 'Touchscreen Interface',
    },
    {
      stepNumber: '02',
      title: language === 'te' ? 'బాధలేని మైక్రో-శాంపిల్ సేకరణ' : 'Painless Micro-Capillary Sample',
      shortTitle: 'Micro-Sampling',
      icon: Droplet,
      badge: 'Step 2 • 45 Seconds',
      description:
        language === 'te'
          ? 'సింగిల్-యూజ్ స్టెరైల్ మైక్రో-లాన్సెట్‌తో నొప్పిలేని వేలిముద్ర నమూనా. కేవలం 15-20 మైక్రోలీటర్ల రక్తం సరిపోతుంది. ఆటోమేటెడ్ కార్ట్రిడ్జ్ స్లాట్‌లోకి చొప్పించండి.'
          : 'Dispenses a sterile, single-use automated micro-lancet. Requires only 15–20 µL capillary blood. Insert the loaded diagnostic test cartridge into the lighted motorized receiver slot.',
      metrics: [
        { label: 'Sample Volume', val: '15-20 µL' },
        { label: 'Sterility', val: 'Single-use sealed' },
        { label: 'Insertion', val: 'Motorized dock' },
      ],
      tag: 'Zero Phlebotomy Fear',
    },
    {
      stepNumber: '03',
      title: language === 'te' ? 'ఎండోక్రైన్ & స్పెక్ట్రోమెట్రీ విశ్లేషణ' : 'Spectrometric & Biosensor Assay',
      shortTitle: 'Optical Analysis',
      icon: Activity,
      badge: 'Step 3 • 2.5 Minutes',
      description:
        language === 'te'
          ? 'డ్యూయల్-వేవ్‌లెంగ్త్ ఆప్టికల్ స్పెక్ట్రోమీటర్ మరియు ఎంజైమాటిక్ యాంపెరోమెట్రీ బయోసెన్సార్లు నమూనాను విశ్లేషిస్తాయి. క్లినికల్ ల్యాబ్ క్వాలిటీతో 99.2% ఖచ్చితమైన ఫలితాలు.'
          : 'High-precision dual-wavelength optical spectrometer (540/575 nm) and enzymatic amperometry execute multi-channel biochemical reactions with certified 99.2% clinical laboratory correlation.',
      metrics: [
        { label: 'Sensor Type', val: 'Dual Optical + Enzymatic' },
        { label: 'Accuracy', val: '99.2% Correlation' },
        { label: 'Process Time', val: '< 180 sec' },
      ],
      tag: 'Clinical-Grade Assay',
    },
    {
      stepNumber: '04',
      title: language === 'te' ? 'AI సారాంశం & లైవ్ డాక్టర్ సంప్రదింపు' : 'Gemini AI Synthesis & Doctor Video',
      shortTitle: 'AI & TeleHealth',
      icon: Stethoscope,
      badge: 'Step 4 • Instant Delivery',
      description:
        language === 'te'
          ? 'జెమిని AI ద్వారా తెలుగు మరియు ఇంగ్లీషులో సులభమైన ఆరోగ్య నివేదిక. కియోస్క్ స్క్రీన్ నుండే చీఫ్ డాక్టర్‌తో తక్షణ వీడియో సంప్రదింపు మరియు అధికారిక PDF సర్టిఫికెట్ డౌన్‌లోడ్.'
          : 'Gemini AI generates plain-language biomarker explanations in English and Telugu. Connect directly to an attending MD for video consultation in < 2 mins, and instantly print or WhatsApp your certified report.',
      metrics: [
        { label: 'Languages', val: 'English & తెలుగు' },
        { label: 'Doctor Connect', val: '< 2 min wait' },
        { label: 'Output', val: 'Certified PDF & WhatsApp' },
      ],
      tag: 'TeleHealth Complete',
    },
  ];

  const currentStep = steps[activeStepIndex];

  return (
    <div
      id="kiosk-visual-workflow-section"
      className="space-y-8 glass-card rounded-[32px] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl border border-white/10"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider glow-blue-sm">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {language === 'te' ? '4-దశల వైద్య ప్రక్రియ' : 'How VMC Operates in 4 Steps'}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {language === 'te'
              ? 'నమూనా సేకరణ నుండి వైద్యుల వీడియో సంప్రదింపుల వరకు పూర్తి ప్రక్రియ 5 నిమిషాల కంటే తక్కువ సమయంలో ముగుస్తుంది.'
              : 'From walk-in sample entry to certified medical doctor consultation in under 5 minutes — completely autonomous, hygienic, and certified.'}
          </p>
        </div>

        <MagneticButton
          strength={0.2}
          onClick={() => {
            playTouchClick();
            onLaunchKiosk();
          }}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/30 glow-blue-sm transition self-start md:self-auto"
        >
          <Monitor className="w-4 h-4" />
          <span>{language === 'te' ? 'కియోస్క్‌లో పరీక్షించండి' : 'Simulate in Kiosk Mode'}</span>
          <ArrowRight className="w-4 h-4" />
        </MagneticButton>
      </div>

      {/* 4 Steps Horizontal Progress Bar with Smooth Progress Indicator */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === activeStepIndex;
          return (
            <div
              key={step.stepNumber}
              onClick={() => {
                playTouchClick();
                setActiveStepIndex(idx);
              }}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                isActive
                  ? 'bg-blue-600/25 border-cyan-400/80 shadow-lg shadow-blue-500/20 glow-blue-sm scale-[1.02]'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.stepNumber}
                </span>
                <Icon
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                />
              </div>

              <div>
                <h4 className="font-bold text-sm text-white line-clamp-1">
                  {step.shortTitle}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {step.tag}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out rounded-full ${
                    isActive ? 'w-full bg-gradient-to-r from-blue-500 to-cyan-400 glow-cyan' : 'w-0'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Detail Inspector for Active Step */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-950/90 text-white border border-blue-500/30 relative overflow-hidden shadow-2xl glow-blue-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                {currentStep.badge}
              </span>
              <span className="text-xs text-slate-400">• High-Throughput Autonomous Pipeline</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentStep.title}
            </h3>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              {currentStep.description}
            </p>

            {/* Micro specs */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {currentStep.metrics.map((m, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                  <span className="text-[10px] text-cyan-300 block uppercase font-bold">{m.label}</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono">{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl text-center space-y-4 backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300 shadow-lg glow-blue-sm">
              {React.createElement(currentStep.icon, { className: 'w-8 h-8' })}
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">Experience Step {currentStep.stepNumber}</h5>
              <p className="text-xs text-slate-400 mt-1">
                Walk through this step interactively inside the full 15" kiosk UI.
              </p>
            </div>
            <MagneticButton
              strength={0.2}
              onClick={() => {
                playTouchClick();
                onLaunchKiosk();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition glow-blue-sm"
            >
              Test Step in Kiosk →
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
};
