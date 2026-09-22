import React, { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  Calendar,
  User,
  Bell,
  Sparkles,
  Download,
  Video,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Smartphone,
  Maximize2,
  ChevronRight,
  Activity,
  Heart,
  Droplet,
  Pill,
  Send,
} from 'lucide-react';
import { Language, Report, MedicationReminder, AppNotification } from '../../types';
import { translations } from '../../i18n/translations';
import { subscribeToReports, subscribeToBookings, getNotificationsByUser } from '../../firebase/services';
import { openPrintableReport } from '../../utils/pdfGenerator';
import { playTouchClick } from '../../utils/audio';
import { VideoConsultationModal } from './VideoConsultationModal';

interface MobileAppViewProps {
  language: Language;
  onToggleLanguage: () => void;
  onNavigateToKiosk?: () => void;
}

type MobileTab = 'home' | 'reports' | 'ai_summary' | 'appointments' | 'notifications' | 'profile';

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  language,
  onToggleLanguage,
  onNavigateToKiosk,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [deviceFrame, setDeviceFrame] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportForCall, setSelectedReportForCall] = useState<Report | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Medicine reminders state
  const [medications, setMedications] = useState<MedicationReminder[]>([
    { id: '1', name: 'Metformin 500mg', dosage: '1 tablet after dinner', time: '08:30 PM', takenToday: true },
    { id: '2', name: 'Atorvastatin 10mg', dosage: '1 tablet before bed', time: '10:00 PM', takenToday: false },
    { id: '3', name: 'Vitamin D3 60K', dosage: '1 capsule weekly with milk', time: 'Sunday 09:00 AM', takenToday: true },
  ]);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTime, setNewMedTime] = useState('');

  // AI chat assistant state for AI Health Summary page
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatLog, setAiChatLog] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text:
        language === 'te'
          ? 'నమస్కారం! నేను మీ VMC AI ఆరోగ్య సహాయకుడిని. మీ రక్త పరీక్ష ఫలితాలు, ఆహారపు అలవాట్లు లేదా ఆరోగ్య సలహాల గురించి అడగండి.'
          : 'Hello! I am your VMC AI Health Companion. Ask me anything regarding your kiosk test reports, glucose levels, or diet recommendations.',
      time: '10:00 AM',
    },
  ]);

  const t = translations[language];

  // Subscribe to real-time reports from Firestore
  useEffect(() => {
    const unsub = subscribeToReports((list) => {
      if (list && list.length > 0) {
        setReports(list);
      }
    });
    return () => unsub();
  }, []);

  const toggleMedication = (id: string) => {
    playTouchClick();
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, takenToday: !m.takenToday } : m))
    );
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    playTouchClick();
    setMedications((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newMedName.trim(),
        dosage: newMedDosage.trim() || '1 dose',
        time: newMedTime || '12:00 PM',
        takenToday: false,
      },
    ]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedTime('');
    setShowAddMedModal(false);
  };

  const handleAiChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;
    playTouchClick();
    const q = aiChatQuery.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiChatLog((prev) => [...prev, { sender: 'user', text: q, time: now }]);
    setAiChatQuery('');

    // Generate intelligent medical response
    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();
      if (lower.includes('sugar') || lower.includes('glucose') || lower.includes('diabetes')) {
        reply =
          language === 'te'
            ? 'మీ ఫాస్టింగ్ గ్లూకోజ్ స్థాయి 138 mg/dL నమోదైంది. శుద్ధి చేసిన చక్కెరలను తగ్గించండి, భోజనం తర్వాత 20 నిమిషాలు నడవండి మరియు తగినంత నీరు త్రాగండి.'
            : 'Based on your latest test (138 mg/dL), your glucose is mildly elevated. We recommend reducing glycemic index carbohydrates and scheduling a routine physician review.';
      } else if (lower.includes('cholesterol') || lower.includes('lipid')) {
        reply =
          language === 'te'
            ? 'మీ మొత్తం కొలెస్ట్రాల్ 185 mg/dL తో సాధారణ శ్రేణిలో ఉంది. మంచి కొలెస్ట్రాల్ (HDL) ఆరోగ్యంగా ఉంది.'
            : 'Your Total Cholesterol of 185 mg/dL is desirable. Maintain olive oil, nuts, and cardio exercise to preserve healthy HDL levels.';
      } else {
        reply =
          language === 'te'
            ? 'మీరు ఆరోగ్యకరమైన జీవనశైలిని పాటిస్తున్నారు. మీ రోజువారీ మందులను సమయానికి తీసుకోండి మరియు ప్రతి 3 నెలలకు ఒకసారి కియోస్క్‌లో పరీక్ష చేసుకోండి.'
            : 'Maintaining good sleep hygiene (7-8 hrs), steady hydration, and consistent medication timing will optimize your overall biomarker scores.';
      }

      setAiChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  const latestReport = reports[0];

  return (
    <div
      id="mobile-app-root"
      className="w-full flex flex-col items-center justify-center p-2 sm:p-4 text-slate-900 dark:text-slate-100 font-sans"
    >
      {/* Top Device & View Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-600 dark:text-blue-400">VMC Mobile</span>
          <span className="text-slate-400">• Google Health Aesthetic</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 hover:bg-slate-300 transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{deviceFrame ? 'Frame On' : 'Full Width'}</span>
          </button>
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-lg font-bold"
          >
            {language === 'en' ? 'తెలుగు' : 'EN'}
          </button>
        </div>
      </div>

      {/* Main Mobile Screen Container */}
      <div
        id="mobile-screen-container"
        className={`w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
          deviceFrame
            ? 'max-w-md h-[840px] rounded-[44px] border-[10px] border-slate-800 dark:border-slate-850 ring-1 ring-slate-700/50'
            : 'max-w-3xl min-h-[820px] rounded-3xl border border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Mobile Header (StatusBar & Profile) */}
        <header className="px-6 pt-5 pb-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              {language === 'te' ? 'రోగి ఖాతా' : 'Patient Portal'}
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Ravi Teja Kumar
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/30">
              RT
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* ======================= TAB 1: HOME ======================= */}
          {activeTab === 'home' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Overall Health Score Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-blue-100">
                      VMC Clinical Score
                    </span>
                    <h3 className="text-sm font-semibold text-blue-100 mt-2">
                      {t.healthScore}
                    </h3>
                    <div className="text-4xl font-black mt-1 tracking-tight flex items-baseline gap-1">
                      <span>84</span>
                      <span className="text-lg font-normal text-blue-200">/100</span>
                    </div>
                    <p className="text-xs text-blue-100 mt-1">
                      {language === 'te'
                        ? 'మంచి జీవక్రియ స్థితి. గ్లూకోజ్ నియంత్రణ అవసరం.'
                        : 'Good overall metabolic status. Slight glucose attention suggested.'}
                    </p>
                  </div>

                  {/* Circular visual ring */}
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white flex items-center justify-center font-black text-xl">
                    84%
                  </div>
                </div>
              </div>

              {/* Latest Diagnostic Report Highlight */}
              {latestReport && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      {language === 'te' ? 'ఇటీవలి పరీక్ష' : 'Latest Diagnostic Test'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(latestReport.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {latestReport.testType}
                      </h4>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                        {latestReport.glucose || latestReport.cholesterol || latestReport.cbc || latestReport.thyroid || 'Optimal'}
                      </div>
                    </div>
                    <button
                      onClick={() => openPrintableReport(latestReport, language)}
                      className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>

                  {/* AI Summary excerpt */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                      <Sparkles className="w-3 h-3" />
                      AI Insights
                    </div>
                    <p>{language === 'te' ? latestReport.summaryTe : latestReport.summary}</p>
                  </div>
                </div>
              )}

              {/* Medicine Reminders Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {t.medicineReminders}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddMedModal(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addReminder}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      onClick={() => toggleMedication(med.id)}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        med.takenToday
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-slate-600 dark:text-slate-400'
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            med.takenToday
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {med.takenToday && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${med.takenToday ? 'line-through text-slate-400' : ''}`}>
                            {med.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {med.dosage} • {med.time}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {med.takenToday ? (language === 'te' ? 'తీసుకున్నారు' : 'Taken') : (language === 'te' ? 'బాకీ' : 'Due')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Consultation Quick Action Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900 rounded-3xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    {language === 'te' ? 'వైద్యుల సంప్రదింపు కావాలా?' : 'Need a Doctor Consultation?'}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {language === 'te' ? 'లైవ్ వీడియో కాల్ లో డాక్టర్ ను కలవండి' : 'Connect immediately with Dr. Ananya Sharma'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    playTouchClick();
                    setSelectedReportForCall(latestReport);
                    setIsVideoOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? 'కాల్ ప్రారంభించు' : 'Start Call'}</span>
                </button>
              </div>

              {onNavigateToKiosk && (
                <div className="text-center pt-2">
                  <button
                    onClick={onNavigateToKiosk}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    ← Go to Kiosk Hardware Screen (15" Touchscreen)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 2: REPORTS ======================= */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {t.recentReports}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {reports.length} verified laboratory records
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.reportId}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:border-blue-400 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400 font-bold text-xs">
                          {rep.testType.split(' ')[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {rep.testType}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rep.reportId} • {new Date(rep.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-900">
                        {rep.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Result Biomarker Highlights */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Observed Value</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {rep.glucose || rep.cholesterol || rep.cbc || rep.thyroid || 'Completed'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Doctor Verified</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {rep.doctorName || 'Dr. Ananya Sharma'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => openPrintableReport(rep, language)}
                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        <span>{t.downloadPdf}</span>
                      </button>

                      <button
                        onClick={() => {
                          playTouchClick();
                          setSelectedReportForCall(rep);
                          setIsVideoOpen(true);
                        }}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Doctor</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= TAB 3: AI HEALTH SUMMARY ======================= */}
          {activeTab === 'ai_summary' && (
            <div className="space-y-4 animate-fadeIn flex flex-col h-full">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {t.aiSummaryTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Powered by Gemini 3.8 Flash • English & Telugu bilingual health explanations
                </p>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 overflow-y-auto space-y-3 min-h-[360px]">
                {aiChatLog.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        chat.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      {chat.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{chat.time}</span>
                  </div>
                ))}
              </div>

              {/* Prompt Suggestions */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-[11px]">
                {[
                  'What does my glucose reading mean?',
                  'How to reduce cholesterol naturally?',
                  'నా రక్త పరీక్ష ఫలితాలు సాధారణమేనా?',
                ].map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => setAiChatQuery(sugg)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 shrink-0 transition"
                  >
                    {sugg}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form onSubmit={handleAiChatSubmit} className="flex gap-2">
                <input
                  id="mobile-ai-input"
                  type="text"
                  value={aiChatQuery}
                  onChange={(e) => setAiChatQuery(e.target.value)}
                  placeholder={
                    language === 'te'
                      ? 'AI కి ప్రశ్న అడగండి...'
                      : 'Ask AI about your health report...'
                  }
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <button
                  type="submit"
                  className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ======================= TAB 4: APPOINTMENTS ======================= */}
          {activeTab === 'appointments' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {t.doctorConsultations}
                </h3>
                <p className="text-xs text-slate-500">
                  Certified telehealth physicians available on duty
                </p>
              </div>

              {/* Doctor Card 1 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
                    alt="Dr. Ananya Sharma"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Dr. Ananya Sharma, MD
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Cardiometabolic Specialist
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>⭐ 4.9 (840+ reviews)</span>
                      <span>• 12 yrs exp</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Available Right Now
                  </span>
                  <span>Free with Kiosk Checkup</span>
                </div>

                <button
                  onClick={() => {
                    playTouchClick();
                    setSelectedReportForCall(latestReport);
                    setIsVideoOpen(true);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>{t.joinCall}</span>
                </button>
              </div>

              {/* Doctor Card 2 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150"
                    alt="Dr. Rajesh Rao"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Dr. Rajesh Rao, MBBS
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">General Physician & Diabetologist</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>⭐ 4.8 (620+ reviews)</span>
                      <span>• 9 yrs exp</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playTouchClick();
                    setSelectedReportForCall(latestReport);
                    setIsVideoOpen(true);
                  }}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Book Consultation Call</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================= TAB 5: NOTIFICATIONS ======================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Notifications</h3>
              <div className="space-y-2.5">
                {[
                  {
                    title: 'Blood Sugar Report Ready',
                    desc: 'Your instant diagnostic test from Kiosk #01 is available. AI summary and PDF are ready.',
                    time: '1 hour ago',
                    unread: true,
                  },
                  {
                    title: 'Medicine Reminder',
                    desc: 'Time for Atorvastatin 10mg before bed.',
                    time: 'Yesterday',
                    unread: false,
                  },
                  {
                    title: 'Kiosk Receipt: ₹99',
                    desc: 'UPI payment of ₹99 confirmed for Glucose Check. Booking ID: VMC-BK-1021.',
                    time: '2 days ago',
                    unread: false,
                  },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border transition ${
                      notif.unread
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= TAB 6: PROFILE ======================= */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                  RT
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Ravi Teja Kumar
                  </h3>
                  <p className="text-xs text-slate-500">+91 98765 43210 • ravi.kumar@example.com</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Blood Group</span>
                    <span className="font-bold text-rose-500">O+</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Age</span>
                    <span className="font-bold">38 yrs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender</span>
                    <span className="font-bold">Male</span>
                  </div>
                </div>
              </div>

              {/* Preferences & Settings */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-2 text-xs shadow-sm">
                <div
                  onClick={onToggleLanguage}
                  className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between cursor-pointer transition"
                >
                  <span className="font-semibold">Preferred Language</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {language === 'en' ? 'English' : 'తెలుగు (Telugu)'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between cursor-pointer transition">
                  <span className="font-semibold">Emergency Contacts</span>
                  <span className="text-slate-500">2 Numbers saved</span>
                </div>

                <div className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between cursor-pointer transition">
                  <span className="font-semibold">Connected Kiosk Network</span>
                  <span className="text-emerald-500 font-bold">● Hyderabad (Active)</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav
          id="mobile-bottom-nav"
          className="px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around"
        >
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'ai_summary', label: 'AI Health', icon: Sparkles },
            { id: 'appointments', label: 'Doctors', icon: Calendar },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-tab-${item.id}`}
                onClick={() => {
                  playTouchClick();
                  setActiveTab(item.id as MobileTab);
                }}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.addReminder}
            </h3>
            <form onSubmit={handleAddMedication} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 650mg"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Dosage / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet after lunch"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Reminder Time</label>
                <input
                  type="text"
                  placeholder="e.g. 02:00 PM"
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        language={language}
        report={selectedReportForCall}
        patientName="Ravi Teja Kumar"
      />
    </div>
  );
};
