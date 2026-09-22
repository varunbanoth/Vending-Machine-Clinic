import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Clock,
  Filter,
  Search,
  User,
  Activity,
  Download,
  Send,
  Sparkles,
} from 'lucide-react';
import { Language, Report } from '../../types';
import { translations } from '../../i18n/translations';
import { subscribeToReports, updateReportDoctorNotes } from '../../firebase/services';
import { openPrintableReport } from '../../utils/pdfGenerator';
import { playTouchClick, playGentleChime } from '../../utils/audio';
import { VideoConsultationModal } from '../mobile/VideoConsultationModal';

interface DoctorPanelViewProps {
  language: Language;
}

export const DoctorPanelView: React.FC<DoctorPanelViewProps> = ({ language }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending_review' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const unsub = subscribeToReports((list) => {
      setReports(list);
      if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]);
        setClinicalNotes(list[0].doctorNotes || '');
      }
    });
    return () => unsub();
  }, [selectedReport]);

  const handleSelectReport = (rep: Report) => {
    playTouchClick();
    setSelectedReport(rep);
    setClinicalNotes(rep.doctorNotes || '');
  };

  const handleSaveNotes = async (status: 'verified' | 'flagged' = 'verified') => {
    if (!selectedReport) return;
    playTouchClick();
    setIsUpdating(true);
    try {
      await updateReportDoctorNotes(
        selectedReport.reportId,
        clinicalNotes,
        'Dr. Ananya Sharma, MD',
        status
      );
      playGentleChime();
      setSelectedReport((prev) => (prev ? { ...prev, doctorNotes: clinicalNotes, status } : null));
    } catch (err) {
      console.warn('Doctor note update:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.testType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div
      id="doctor-panel-view"
      className="max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-blue-700/40">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md">
            <Stethoscope className="w-8 h-8 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">Dr. Ananya Sharma, MD</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ● TeleHealth Active
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Chief Attending Physician • VMC Autonomous Network Central Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/10 text-center">
            <div className="text-lg font-black text-white">{reports.length}</div>
            <div className="text-blue-200">Total Reports</div>
          </div>
          <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/10 text-center">
            <div className="text-lg font-black text-emerald-300">
              {reports.filter((r) => r.status === 'verified').length}
            </div>
            <div className="text-blue-200">Verified</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Reports Queue vs Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient Reports List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t.doctorQueue}</span>
            </h3>
            <span className="text-xs text-slate-400">{filteredReports.length} cases</span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, ID, test..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-1.5 text-xs overflow-x-auto pb-1">
              {(['all', 'verified', 'pending_review', 'flagged'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                    filterStatus === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Item Cards */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredReports.map((rep) => {
              const isSelected = selectedReport?.reportId === rep.reportId;
              return (
                <div
                  key={rep.reportId}
                  onClick={() => handleSelectReport(rep)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-md'
                      : 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-200/80 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {rep.userName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rep.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : rep.status === 'flagged'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {rep.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {rep.testType}
                    </span>
                    <span className="font-mono text-[11px]">{rep.reportId}</span>
                  </div>

                  <div className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Reading:{' '}
                    <span className="text-blue-600 dark:text-blue-400">
                      {rep.glucose || rep.cholesterol || rep.cbc || rep.thyroid || 'Standard'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Patient Review & Clinical Notes */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          {selectedReport ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Patient Header & Quick Video Call Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedReport.userName}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono rounded-lg">
                      {selectedReport.reportId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Booking: {selectedReport.bookingId} • Location: {selectedReport.kioskLocation || 'Kiosk #01'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPrintableReport(selectedReport, language)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Download / Print PDF"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>PDF</span>
                  </button>

                  <button
                    id="doctor-launch-video-call"
                    onClick={() => {
                      playTouchClick();
                      setIsVideoModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Video Consult</span>
                  </button>
                </div>
              </div>

              {/* Biomarkers Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Spectrophotometric Sensor Readings
                </h4>
                <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>{selectedReport.testType}</span>
                    <span className="text-blue-600 dark:text-blue-400 text-lg">
                      {selectedReport.glucose || selectedReport.cholesterol || selectedReport.cbc || selectedReport.thyroid || 'Normal'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>Target Calibration: Clean baseline assay</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Optical Sensor ✓</span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Summary Review */}
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Gemini AI Preliminary Synthesis</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedReport.summary}
                </p>
                {selectedReport.advice && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Advice: {selectedReport.advice}
                  </p>
                )}
              </div>

              {/* Clinical Notes & Prescription Form */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Physician Clinical Review & Prescription Advice
                  </label>
                  <span className="text-[11px] text-slate-400">Saved directly into Firestore</span>
                </div>

                <textarea
                  rows={4}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter medical evaluation, dietary recommendations, or prescribed medication..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleSaveNotes('flagged')}
                    disabled={isUpdating}
                    className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Flag for Further Lab Tests</span>
                  </button>

                  <button
                    onClick={() => handleSaveNotes('verified')}
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUpdating ? 'Saving...' : 'Verify & Approve Report'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm">Select a diagnostic report from the queue to review</p>
            </div>
          )}
        </div>
      </div>

      {/* Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        language={language}
        report={selectedReport}
        patientName={selectedReport?.userName || 'Patient'}
      />
    </div>
  );
};
