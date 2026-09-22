import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Activity,
  Heart,
  Zap,
  QrCode,
  Phone,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  Download,
  Video,
  RefreshCw,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronRight,
  Fingerprint,
  Cpu,
  Receipt,
  ScanLine,
  Check,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, TestPackage, Report } from '../../types';
import { translations, testPackages } from '../../i18n/translations';
import {
  playTouchClick,
  playCartridgeSlide,
  playGentleChime,
  playProcessingWhir,
  playSuccessChime,
} from '../../utils/audio';
import { openPrintableReport } from '../../utils/pdfGenerator';
import { createBooking, saveReport, savePayment, createNotification } from '../../firebase/services';
import { generateBiomarkerSummary } from '../../api/ai';
import { EmergencyModal } from './EmergencyModal';
import { VideoConsultationModal } from '../mobile/VideoConsultationModal';
import { MagneticButton } from '../common/MagneticButton';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { AIPulseIndicator } from '../common/AIPulseIndicator';
import { Skeleton } from '../common/Skeleton';
import vmcLogo from '../../assets/images/vmc_official_logo_1789927279882.jpg';

interface KioskViewProps {
  language: Language;
  onToggleLanguage: () => void;
  onNavigateToMobile?: () => void;
}

type KioskStep = 'welcome' | 'auth' | 'select_test' | 'payment' | 'sample_collection' | 'results';

export const KioskView: React.FC<KioskViewProps> = ({
  language,
  onToggleLanguage,
  onNavigateToMobile,
}) => {
  const [step, setStep] = useState<KioskStep>('welcome');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTest, setSelectedTest] = useState<TestPackage>(testPackages[0]);
  const [bookingId, setBookingId] = useState('');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auth state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [patientName, setPatientName] = useState('Guest Patient');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sample collection sub-step (1: Finger prick, 2: Sample inserted, 3: AI Processing)
  const [collectionStep, setCollectionStep] = useState<1 | 2 | 3>(1);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingLog, setProcessingLog] = useState('');

  // Report results state
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const t = translations[language];

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFullscreenToggle = () => {
    playTouchClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleStartCheckup = () => {
    playTouchClick();
    if (isLoggedIn) {
      setStep('select_test');
    } else {
      setStep('auth');
    }
  };

  const handleGuestLogin = () => {
    playTouchClick();
    setPatientName('Guest Patient #01');
    setIsLoggedIn(true);
    setStep('select_test');
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    playTouchClick();
    if (phoneNumber.length >= 10) {
      setOtpSent(true);
      setOtpCode('4829'); // Demo OTP for instant touch convenience
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    playTouchClick();
    setIsLoggedIn(true);
    setPatientName(`Patient (+91 ${phoneNumber.slice(-4)})`);
    setStep('select_test');
  };

  const handleSelectPackage = (pkg: TestPackage) => {
    playTouchClick();
    setSelectedTest(pkg);
    // Generate Booking ID
    const newBookingId = `VMC-BK-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingId(newBookingId);
    setStep('payment');
  };

  const handleSimulatePayment = async () => {
    playTouchClick();
    playGentleChime();

    // Save booking and payment to Firebase Firestore
    try {
      await createBooking({
        bookingId,
        userId: isLoggedIn ? 'user_kiosk_01' : 'guest_kiosk_01',
        userName: patientName,
        userPhone: phoneNumber || '+91 98765 00000',
        testType: selectedTest.name,
        status: 'pending',
        kiosk: 'Kiosk #01 (HiTech City Metro, Hyderabad)',
        payment: {
          amount: selectedTest.price,
          method: 'UPI',
          status: 'success',
          transactionId: `UPI-TXN-${Date.now().toString().slice(-6)}`,
          upiApp: 'Google Pay',
          paidAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      });

      await savePayment({
        paymentId: `PAY-${Date.now().toString().slice(-6)}`,
        bookingId,
        userId: 'user_kiosk_01',
        userName: patientName,
        amount: selectedTest.price,
        method: 'UPI (QR Code)',
        status: 'success',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore booking note:', err);
    }

    // Trigger slight confetti on payment confirmation
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    // Move to hardware sample collection step
    setStep('sample_collection');
    setCollectionStep(1);
    playCartridgeSlide();
  };

  // Hardware sample collection advancement
  const handleFingerPrickComplete = () => {
    playTouchClick();
    playCartridgeSlide();
    setCollectionStep(2);
  };

  const handleSampleInserted = () => {
    playTouchClick();
    playProcessingWhir();
    setCollectionStep(3);
    setProcessingProgress(0);
    setProcessingLog(t.calibratingSensors);

    // Progress simulation through hardware spectrometer stages
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setProcessingProgress(Math.min(progress, 100));

      if (progress === 24) {
        setProcessingLog('Illuminating microfluidic channel (450nm - 630nm)...');
      } else if (progress === 48) {
        setProcessingLog(t.analyzingSensors);
      } else if (progress === 76) {
        setProcessingLog(t.generatingAiSummary);
      } else if (progress >= 100) {
        clearInterval(interval);
        finalizeTestReport();
      }
    }, 150);
  };

  const finalizeTestReport = async () => {
    playSuccessChime();
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
    });

    setIsGeneratingAi(true);

    // Compute realistic mock diagnostic reading based on test type
    let testValue = '118 mg/dL';
    let biomarkerList: Report['biomarkers'] = [];

    if (selectedTest.id === 'blood-sugar') {
      const glucoseVal = Math.floor(100 + Math.random() * 45);
      testValue = `${glucoseVal} mg/dL`;
      biomarkerList = [
        {
          name: 'Fasting Blood Glucose',
          nameTe: 'ఉపవాస రక్త గ్లూకోజ్',
          value: `${glucoseVal}`,
          numericValue: glucoseVal,
          unit: 'mg/dL',
          normalRange: '70 - 99 mg/dL',
          status: glucoseVal > 125 ? 'high' : glucoseVal > 99 ? 'high' : 'normal',
        },
        {
          name: 'Estimated HbA1c',
          nameTe: 'అంచనా HbA1c',
          value: (glucoseVal / 22).toFixed(1),
          numericValue: parseFloat((glucoseVal / 22).toFixed(1)),
          unit: '%',
          normalRange: '< 5.7 %',
          status: glucoseVal > 125 ? 'high' : 'normal',
        },
      ];
    } else if (selectedTest.id === 'cbc') {
      testValue = 'Hb: 14.2 g/dL | WBC: 6,800';
      biomarkerList = [
        {
          name: 'Hemoglobin (Hb)',
          nameTe: 'హీమోగ్లోబిన్',
          value: '14.2',
          numericValue: 14.2,
          unit: 'g/dL',
          normalRange: '13.5 - 17.5 g/dL',
          status: 'normal',
        },
        {
          name: 'Total Leukocyte Count (WBC)',
          nameTe: 'తెల్ల రక్త కణాలు (WBC)',
          value: '6,800',
          numericValue: 6800,
          unit: 'cells/mcL',
          normalRange: '4,500 - 11,000 cells/mcL',
          status: 'normal',
        },
        {
          name: 'Platelet Count',
          nameTe: 'ప్లేట్‌లెట్స్ సంఖ్య',
          value: '2.4',
          numericValue: 2.4,
          unit: 'Lakh/mcL',
          normalRange: '1.5 - 4.5 Lakh/mcL',
          status: 'normal',
        },
      ];
    } else if (selectedTest.id === 'cholesterol') {
      testValue = '188 mg/dL (Desirable)';
      biomarkerList = [
        {
          name: 'Total Cholesterol',
          nameTe: 'మొత్తం కొలెస్ట్రాల్',
          value: '188',
          numericValue: 188,
          unit: 'mg/dL',
          normalRange: '< 200 mg/dL',
          status: 'normal',
        },
        {
          name: 'HDL (Good Cholesterol)',
          nameTe: 'మంచి కొలెస్ట్రాల్ (HDL)',
          value: '49',
          numericValue: 49,
          unit: 'mg/dL',
          normalRange: '> 40 mg/dL',
          status: 'normal',
        },
        {
          name: 'Triglycerides',
          nameTe: 'ట్రైగ్లిజరైడ్స్',
          value: '132',
          numericValue: 132,
          unit: 'mg/dL',
          normalRange: '< 150 mg/dL',
          status: 'normal',
        },
      ];
    } else {
      testValue = '2.14 μIU/mL (Normal TSH)';
      biomarkerList = [
        {
          name: 'Thyroid Stimulating Hormone (TSH)',
          nameTe: 'థైరాయిడ్ TSH హార్మోన్',
          value: '2.14',
          numericValue: 2.14,
          unit: 'μIU/mL',
          normalRange: '0.45 - 4.50 μIU/mL',
          status: 'normal',
        },
      ];
    }

    // Call Gemini AI
    const aiSummary = await generateBiomarkerSummary(
      selectedTest.name,
      testValue,
      selectedTest.normalRangeText,
      patientName
    );

    const generatedReport: Report = {
      reportId: `VMC-REP-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId,
      userId: 'user_kiosk_01',
      userName: patientName,
      userPhone: phoneNumber || '+91 98765 00000',
      testType: selectedTest.name,
      glucose: selectedTest.id === 'blood-sugar' ? testValue : undefined,
      cholesterol: selectedTest.id === 'cholesterol' ? testValue : undefined,
      cbc: selectedTest.id === 'cbc' ? testValue : undefined,
      thyroid: selectedTest.id === 'thyroid' ? testValue : undefined,
      summary: aiSummary.summaryEn,
      summaryTe: aiSummary.summaryTe,
      advice: aiSummary.advice,
      biomarkers: biomarkerList,
      pdfUrl: '#',
      status: 'verified',
      doctorNotes: 'Kiosk automated spectrophotometric assay within calibration standards.',
      doctorName: 'Dr. Ananya Sharma, MD',
      kioskLocation: 'Kiosk #01 (HiTech City Metro, Hyderabad)',
      createdAt: new Date().toISOString(),
    };

    setLatestReport(generatedReport);
    setIsGeneratingAi(false);
    setStep('results');

    // Persist to Firestore
    try {
      await saveReport(generatedReport);
      await createNotification({
        id: `notif_${Date.now()}`,
        userId: 'user_kiosk_01',
        title: `Test Completed: ${selectedTest.name}`,
        titleTe: `పరీక్ష పూర్తయింది: ${selectedTest.nameTe}`,
        message: `Your ${selectedTest.name} report from Kiosk #01 is ready with AI summary.`,
        messageTe: `కియోస్క్ #01 వద్ద మీ పరీక్ష ఫలితాలు సిద్ధంగా ఉన్నాయి.`,
        type: 'report_ready',
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore report save note:', err);
    }
  };

  const getTestIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplet':
        return <Droplet className="w-8 h-8 text-blue-500" />;
      case 'Activity':
        return <Activity className="w-8 h-8 text-emerald-500" />;
      case 'Heart':
        return <Heart className="w-8 h-8 text-rose-500" />;
      case 'Zap':
        return <Zap className="w-8 h-8 text-amber-500" />;
      default:
        return <Activity className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div
      id="kiosk-root-screen"
      className="relative min-h-[92vh] flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden rounded-3xl border-4 border-blue-600/30 shadow-[0_0_80px_rgba(37,99,235,0.25)] font-sans select-none"
    >
      {/* Futuristic Medical Grid & ECG Canvas Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a1a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a1a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
      </div>

      {/* TOP KIOSK STATUS BAR (15-Inch Touchscreen Header) */}
      <header
        id="kiosk-top-bar"
        className="relative z-10 px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-blue-900/40 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30 bg-slate-950 shrink-0 glow-cyan">
            <img
              src={vmcLogo}
              alt="VMC Kiosk Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                {t.appTitle}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-cyan-300 border border-blue-400/30 glow-blue-sm">
                KIOSK #01
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Healthcare For Everyone • {t.kioskLocation}</p>
          </div>
        </div>

        {/* Center Live Diagnostic Status */}
        <div className="hidden lg:flex items-center gap-6 px-5 py-2 bg-slate-950/70 border border-blue-500/20 rounded-2xl text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold text-slate-300">BIO-SENSORS READY</span>
          </div>
          <div className="text-slate-500">|</div>
          <div className="text-slate-400 font-mono">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* Right Action Controls: SOS + Language + Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Emergency SOS Button */}
          <button
            id="kiosk-sos-btn"
            onClick={() => {
              playTouchClick();
              setIsEmergencyOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs md:text-sm tracking-wider uppercase rounded-2xl shadow-lg shadow-red-600/40 border border-red-400/30 transition animate-pulse cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
            <span>{t.emergencySOS}</span>
          </button>

          {/* Language Toggle */}
          <button
            id="kiosk-lang-toggle-btn"
            onClick={() => {
              playTouchClick();
              onToggleLanguage();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white font-bold text-xs md:text-sm rounded-2xl border border-slate-700 transition cursor-pointer"
          >
            {language === 'en' ? 'తెలుగు' : 'English'}
          </button>

          {/* Fullscreen Kiosk Mode */}
          <button
            id="kiosk-fullscreen-toggle-btn"
            onClick={handleFullscreenToggle}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition"
            title="Toggle 15-inch Touchscreen View"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN KIOSK INTERACTION STAGE */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 max-w-6xl w-full mx-auto">
        {/* ===================== STEP 1: WELCOME SCREEN ===================== */}
        {step === 'welcome' && (
          <div className="flex flex-col items-center text-center space-y-8 animate-fadeIn">
            {/* Holographic Glowing Official Kiosk Logo Emblem */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_60px_rgba(34,211,238,0.35)] glow-cyan bg-slate-900 transition-transform duration-500 group-hover:scale-105">
                <img
                  src={vmcLogo}
                  alt="VMC Official Kiosk Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[10px] rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/40 border border-white/20">
                Instant 5-Min Tests
              </span>
            </div>

            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {t.welcomePatient}
              </h2>
              <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed">
                {t.welcomeSubtitle}
              </p>
            </div>

            {/* Quick stats ribbon */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 w-full max-w-xl py-3 px-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-blue-900/30 text-center">
              <div>
                <div className="text-xl md:text-2xl font-extrabold text-blue-400">99.4%</div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Lab Precision</div>
              </div>
              <div className="border-x border-slate-800">
                <div className="text-xl md:text-2xl font-extrabold text-emerald-400">
                  <AnimatedCounter value={3} /> - <AnimatedCounter value={8} /> Min
                </div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Rapid Results</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-extrabold text-cyan-400 flex items-center justify-center gap-1.5">
                  <AIPulseIndicator size="sm" label="" />
                  <span>AI + Doctor</span>
                </div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Instant Telehealth</div>
              </div>
            </div>

            {/* Giant Tactile Touch CTA with Magnetic Hover & Glow */}
            <div className="w-full max-w-md space-y-4 pt-2">
              <MagneticButton
                id="kiosk-start-health-check-btn"
                strength={0.2}
                onClick={handleStartCheckup}
                className="w-full py-6 px-8 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl md:text-2xl rounded-3xl shadow-[0_10px_35px_rgba(37,99,235,0.45)] border border-blue-300/30 flex items-center justify-center gap-4 transition glow-blue"
              >
                <span>{t.startCheckup}</span>
                <ArrowRight className="w-7 h-7 text-cyan-200" />
              </MagneticButton>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
                <MagneticButton
                  id="kiosk-guest-demo-btn"
                  strength={0.15}
                  onClick={handleGuestLogin}
                  className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition glow-blue-sm"
                >
                  ⚡ {t.guestDemo}
                </MagneticButton>
                <MagneticButton
                  id="kiosk-quick-phone-btn"
                  strength={0.15}
                  onClick={() => {
                    playTouchClick();
                    setStep('auth');
                  }}
                  className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition flex items-center gap-1.5 glow-blue-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.phoneLogin}</span>
                </MagneticButton>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 2: AUTH SCREEN ===================== */}
        {step === 'auth' && (
          <div className="max-w-md w-full mx-auto space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 mb-3">
                <Phone className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                {otpSent ? t.verifyOtp : t.phoneLogin}
              </h2>
              <p className="text-xs text-slate-400">
                {otpSent
                  ? `${t.enterOtp} +91 ${phoneNumber}`
                  : 'Enter your mobile number to retrieve previous health records or sign in.'}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-blue-900/40 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {t.enterPhone}
                    </label>
                    <div className="flex items-center bg-slate-950 border-2 border-slate-800 focus-within:border-blue-500 rounded-2xl px-4 py-3 text-lg font-mono">
                      <span className="text-slate-500 mr-2 font-bold">+91</span>
                      <input
                        id="kiosk-phone-input"
                        type="tel"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="bg-transparent text-white w-full focus:outline-none placeholder-slate-600 font-bold"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Quick preset phone buttons for kiosk testing */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => setPhoneNumber('9876543210')}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      98765 43210
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneNumber('9123456789')}
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      91234 56789
                    </button>
                  </div>

                  <button
                    id="kiosk-send-otp-btn"
                    type="submit"
                    disabled={phoneNumber.length < 10}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition cursor-pointer"
                  >
                    {t.sendOtp}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      6-Digit Security OTP
                    </label>
                    <input
                      id="kiosk-otp-input"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3.5 bg-slate-950 border-2 border-slate-800 focus:border-blue-500 rounded-2xl text-white font-bold"
                      autoFocus
                    />
                    <p className="text-[11px] text-emerald-400 mt-2 text-center">
                      Auto-filled demo OTP: <strong>4829</strong>
                    </p>
                  </div>

                  <button
                    id="kiosk-verify-otp-btn"
                    type="submit"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition cursor-pointer"
                  >
                    {t.verifyOtp}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  id="kiosk-continue-guest-btn"
                  onClick={handleGuestLogin}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  ⚡ Skip & Continue as Anonymous Guest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 3: TEST SELECTION ===================== */}
        {step === 'select_test' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Step 1 of 4 • Diagnostic Menu
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {t.selectTest}
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                {t.selectTestDesc}
              </p>
            </div>

            {/* Test Cards Grid with Glassmorphism & Soft Glow */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {testPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className="group relative glass-card glass-card-hover border-2 border-white/10 hover:border-cyan-400/80 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 cursor-pointer glow-blue-sm"
                >
                  <div>
                    {/* Top Icon & Duration */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 group-hover:border-cyan-400/50 transition glow-cyan">
                        {getTestIcon(pkg.iconName)}
                      </div>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 rounded-full text-xs font-semibold text-slate-300 border border-white/5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {language === 'te' ? pkg.durationTe : pkg.duration}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition">
                      {language === 'te' ? pkg.nameTe : pkg.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-2">
                      {language === 'te' ? pkg.descriptionTe : pkg.description}
                    </p>

                    {/* Parameters covered */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Included Biomarkers:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(language === 'te' ? pkg.parametersTe : pkg.parameters).slice(0, 2).map((param, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 bg-slate-950/70 rounded-md text-slate-300 border border-white/10"
                          >
                            {param}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Price & Select Action with Animated Counter */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-white">
                        ₹<AnimatedCounter value={pkg.price} />
                      </span>
                      <span className="text-[10px] text-slate-400 block">All inclusive</span>
                    </div>
                    <button
                      id={`select-test-${pkg.id}`}
                      className="px-4 py-2.5 bg-blue-600 group-hover:bg-cyan-500 group-hover:text-slate-950 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-md shadow-blue-500/20"
                    >
                      <span>Select</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== STEP 4: PAYMENT SCREEN ===================== */}
        {step === 'payment' && (
          <div className="max-w-2xl w-full mx-auto space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Step 2 of 4 • Mock UPI Checkout
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                {t.scanToPay}
              </h2>
              <p className="text-xs text-slate-400">{t.openUpiApp}</p>
            </div>

            <div className="glass-card border border-blue-500/30 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-2xl glow-blue-sm">
              {/* Animated QR Code Display with Scanner Beam Effect */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative p-4 bg-white rounded-3xl shadow-2xl overflow-hidden group border-2 border-cyan-400/40">
                  {/* Glowing Cyan Scanner Beam Line */}
                  <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 animate-scanner-beam z-20 shadow-[0_0_12px_#22d3ee] rounded-full">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-cyan-400/40 rounded-full blur-sm" />
                  </div>

                  {/* Corner Reticle Brackets (HUD overlay) */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500 rounded-tl z-20" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500 rounded-tr z-20" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500 rounded-bl z-20" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500 rounded-br z-20" />

                  {/* High Quality SVG Simulated UPI QR Code */}
                  <div className="w-48 h-48 flex items-center justify-center bg-white p-2">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Top Left Marker */}
                      <rect x="10" y="10" width="50" height="50" fill="#0f172a" rx="6" />
                      <rect x="20" y="20" width="30" height="30" fill="#ffffff" rx="2" />
                      <rect x="26" y="26" width="18" height="18" fill="#2563eb" rx="2" />

                      {/* Top Right Marker */}
                      <rect x="140" y="10" width="50" height="50" fill="#0f172a" rx="6" />
                      <rect x="150" y="20" width="30" height="30" fill="#ffffff" rx="2" />
                      <rect x="156" y="26" width="18" height="18" fill="#2563eb" rx="2" />

                      {/* Bottom Left Marker */}
                      <rect x="10" y="140" width="50" height="50" fill="#0f172a" rx="6" />
                      <rect x="20" y="150" width="30" height="30" fill="#ffffff" rx="2" />
                      <rect x="26" y="156" width="18" height="18" fill="#2563eb" rx="2" />

                      {/* Data dots pattern */}
                      <rect x="70" y="20" width="12" height="12" fill="#0f172a" />
                      <rect x="90" y="20" width="12" height="24" fill="#0f172a" />
                      <rect x="110" y="14" width="14" height="14" fill="#0f172a" />
                      <rect x="70" y="50" width="20" height="10" fill="#0f172a" />
                      <rect x="100" y="50" width="14" height="20" fill="#0f172a" />
                      <rect x="20" y="70" width="24" height="12" fill="#0f172a" />
                      <rect x="60" y="80" width="20" height="20" fill="#2563eb" />
                      <rect x="90" y="80" width="20" height="20" fill="#0f172a" />
                      <rect x="120" y="80" width="20" height="20" fill="#2563eb" />
                      <rect x="150" y="70" width="16" height="24" fill="#0f172a" />
                      <rect x="175" y="70" width="14" height="14" fill="#0f172a" />
                      <rect x="20" y="100" width="14" height="20" fill="#0f172a" />
                      <rect x="50" y="110" width="16" height="16" fill="#0f172a" />
                      <rect x="80" y="115" width="24" height="12" fill="#0f172a" />
                      <rect x="120" y="110" width="24" height="16" fill="#0f172a" />
                      <rect x="160" y="110" width="20" height="20" fill="#0f172a" />
                      <rect x="70" y="140" width="24" height="14" fill="#0f172a" />
                      <rect x="110" y="145" width="20" height="20" fill="#0f172a" />
                      <rect x="140" y="140" width="16" height="20" fill="#0f172a" />
                      <rect x="170" y="145" width="18" height="18" fill="#0f172a" />
                      <rect x="80" y="170" width="20" height="16" fill="#0f172a" />
                      <rect x="120" y="175" width="30" height="14" fill="#0f172a" />
                      <rect x="160" y="170" width="24" height="18" fill="#0f172a" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <ScanLine className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>UPI ID: vmc.kiosk01@icici</span>
                </div>
              </div>

              {/* Order Summary & Pay Action */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t.bookingId}</span>
                    <span className="font-mono font-bold text-cyan-300">{bookingId}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Selected Test</span>
                    <span className="font-bold text-blue-400">{selectedTest.name}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Patient</span>
                    <span className="font-bold text-slate-200">{patientName}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-300">Total Payable</span>
                    <span className="text-2xl font-black text-white">
                      ₹<AnimatedCounter value={selectedTest.price} />
                    </span>
                  </div>
                </div>

                <MagneticButton
                  id="simulate-upi-payment-btn"
                  strength={0.2}
                  onClick={handleSimulatePayment}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition glow-cyan"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>{t.mockPaymentBtn}</span>
                </MagneticButton>

                <button
                  id="cancel-payment-btn"
                  onClick={() => setStep('select_test')}
                  className="w-full py-2.5 text-xs text-slate-400 hover:text-white underline text-center cursor-pointer"
                >
                  Choose a different test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 5: SAMPLE COLLECTION (3-STEP ANIMATED PROCESS) ===================== */}
        {step === 'sample_collection' && (
          <div className="max-w-3xl w-full mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Step 3 of 4 • Robotic Sample Assay
              </span>
              <h2 className="text-3xl font-black text-white">{t.sampleCollectionTitle}</h2>
              <p className="text-sm text-slate-400">{t.sampleCollectionSubtitle}</p>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { num: 1, title: t.step1Title, active: collectionStep === 1, done: collectionStep > 1 },
                { num: 2, title: t.step2Title, active: collectionStep === 2, done: collectionStep > 2 },
                { num: 3, title: t.step3Title, active: collectionStep === 3, done: collectionStep > 3 },
              ].map((st) => (
                <div
                  key={st.num}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    st.active
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : st.done
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                    {st.done ? <Check className="w-4 h-4 text-emerald-400" /> : <span>{st.num}.</span>}
                    <span className="truncate">{st.title.split(':')[0]}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Hardware Simulation Stage */}
            <div className="bg-slate-900 border-2 border-blue-900/50 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
              {/* SUB-STEP 1: FINGER PRICK */}
              {collectionStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto text-blue-400 animate-pulse">
                    <Fingerprint className="w-12 h-12" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl font-bold text-white">{t.step1Title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{t.step1Desc}</p>
                  </div>
                  <div className="pt-4">
                    <MagneticButton
                      id="kiosk-finger-ready-btn"
                      strength={0.2}
                      onClick={handleFingerPrickComplete}
                      className="py-4 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-600/30 transition glow-blue cursor-pointer"
                    >
                      {t.fingerReadyBtn} →
                    </MagneticButton>
                  </div>
                </div>
              )}

              {/* SUB-STEP 2: SAMPLE INSERTED */}
              {collectionStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce-short glow-cyan">
                    <Droplet className="w-12 h-12" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl font-bold text-white">{t.step2Title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{t.step2Desc}</p>
                  </div>
                  <div className="pt-4">
                    <MagneticButton
                      id="kiosk-sample-inserted-btn"
                      strength={0.2}
                      onClick={handleSampleInserted}
                      className="py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/30 transition glow-cyan cursor-pointer"
                    >
                      {t.sampleInsertedBtn} →
                    </MagneticButton>
                  </div>
                </div>
              )}

              {/* SUB-STEP 3: AI SPECTROMETER PROCESSING WITH AI PULSE & SKELETON */}
              {collectionStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-center">
                    <AIPulseIndicator
                      size="lg"
                      label="Gemini AI Diagnostic Engine"
                      sublabel="Dual-wavelength 540nm/575nm optical spectrometry active"
                    />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-2xl font-bold text-white">{t.step3Title}</h3>
                    <p className="text-xs font-mono text-cyan-400 animate-pulse">{processingLog}</p>
                  </div>

                  {/* Realtime Progress Bar with Smooth Transitions */}
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-white/10 p-0.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out glow-cyan"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>Analyzing bio-specimen</span>
                      <span className="text-cyan-300 font-bold">
                        <AnimatedCounter value={processingProgress} suffix="%" />
                      </span>
                    </div>
                  </div>

                  {/* Skeleton Loading State Preview of Pending Biomarkers */}
                  <div className="max-w-md mx-auto pt-2 grid grid-cols-2 gap-3 text-left">
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="rectangular" height={24} />
                      <Skeleton variant="text" width="40%" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="rectangular" height={24} />
                      <Skeleton variant="text" width="40%" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== STEP 6: RESULTS & AI SUMMARY ===================== */}
        {step === 'results' && latestReport && (
          <div className="space-y-6 animate-fadeIn max-w-4xl w-full mx-auto">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                ✓ Diagnostic Verified • ISO 15189
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white">{t.testComplete}</h2>
              <p className="text-xs text-slate-400">Report ID: {latestReport.reportId} • Booking ID: {latestReport.bookingId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Value Card */}
              <div className="glass-card border border-blue-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl glow-blue-sm">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tested Biomarker
                  </div>
                  <h3 className="text-xl font-bold text-white">{latestReport.testType}</h3>
                </div>

                <div className="py-6 text-center">
                  <div className="text-4xl md:text-5xl font-black text-cyan-300 tracking-tight glow-cyan">
                    {latestReport.glucose || latestReport.cholesterol || latestReport.cbc || latestReport.thyroid || 'Optimal'}
                  </div>
                  <div className="mt-3 inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                    Standard Laboratory Assay
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 text-xs backdrop-blur-md">
                  <div className="text-slate-400 mb-1">{t.normalRange}:</div>
                  <div className="font-semibold text-slate-200">{selectedTest.normalRangeText}</div>
                </div>
              </div>

              {/* Gemini AI Bilingual Health Summary Card */}
              <div className="md:col-span-2 glass-card border border-blue-500/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl space-y-4 glow-blue-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                      <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span>{t.aiSummaryTitle} (English & తెలుగు)</span>
                    </div>
                    <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-mono border border-blue-400/30">
                      Gemini Multimodal
                    </span>
                  </div>

                  {/* English Summary */}
                  <div className="p-4 bg-slate-950/80 border border-white/10 rounded-2xl mb-3 space-y-1 backdrop-blur-md">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      English Summary:
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {latestReport.summary}
                    </p>
                  </div>

                  {/* Telugu Summary */}
                  <div className="p-4 bg-slate-950/80 border border-white/10 rounded-2xl space-y-1 backdrop-blur-md">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      తెలుగు వివరణ (Telugu Summary):
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-telugu">
                      {latestReport.summaryTe}
                    </p>
                  </div>

                  {latestReport.advice && (
                    <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-xl text-xs text-blue-300">
                      💡 <strong>Lifestyle Recommendation:</strong> {latestReport.advice}
                    </div>
                  )}
                </div>

                {/* Report Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <MagneticButton
                    id="kiosk-download-pdf-btn"
                    strength={0.2}
                    onClick={() => {
                      playTouchClick();
                      openPrintableReport(latestReport, language);
                    }}
                    className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer glow-blue-sm"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>{t.downloadPdf}</span>
                  </MagneticButton>

                  <MagneticButton
                    id="kiosk-book-consultation-btn"
                    strength={0.2}
                    onClick={() => {
                      playTouchClick();
                      setIsVideoModalOpen(true);
                    }}
                    className="py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer glow-blue"
                  >
                    <Video className="w-4 h-4" />
                    <span>{t.bookConsultation}</span>
                  </MagneticButton>
                </div>
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <button
                id="kiosk-back-to-home-btn"
                onClick={() => {
                  playTouchClick();
                  setStep('welcome');
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                ← {t.backToHome}
              </button>

              <div className="flex items-center gap-3">
                {onNavigateToMobile && (
                  <button
                    id="kiosk-view-in-mobile-btn"
                    onClick={() => {
                      playTouchClick();
                      onNavigateToMobile();
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
                  >
                    📱 Open Patient Mobile App to track history
                  </button>
                )}

                <button
                  id="kiosk-new-test-btn"
                  onClick={() => {
                    playTouchClick();
                    setStep('select_test');
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                >
                  {t.newCheckup}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 px-6 py-3 bg-slate-950/80 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          Vending Machine Clinic v2.5 • Hardware Serial: <span className="font-mono text-slate-400">VMC-HYD-K01</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Reagent Level: 92%
          </span>
          <span className="hidden sm:inline">Automatic Sanitization Cycle: Active</span>
        </div>
      </footer>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        language={language}
      />

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        language={language}
        report={latestReport}
        patientName={patientName}
      />
    </div>
  );
};
