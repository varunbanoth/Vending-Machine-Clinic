import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  HardDrive,
  RefreshCw,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Server,
  Zap,
} from 'lucide-react';
import { Language, Booking, Report, PaymentRecord, KioskHardwareStatus } from '../../types';
import { translations } from '../../i18n/translations';
import {
  getAllBookings,
  getAllReports,
  getAllPayments,
  createBooking,
  saveReport,
  savePayment,
} from '../../firebase/services';
import { openPrintableReport } from '../../utils/pdfGenerator';
import { playTouchClick, playGentleChime } from '../../utils/audio';

interface AdminDashboardViewProps {
  language: Language;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ language }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'patients' | 'kiosks' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Hardware telemetry for autonomous kiosks
  const [kiosks] = useState<KioskHardwareStatus[]>([
    {
      id: 'KIOSK-HYD-01',
      name: 'Kiosk #01',
      city: 'Hyderabad',
      location: 'HiTech City Metro Station',
      status: 'online',
      reagentsLevel: 92,
      lancetsRemaining: 184,
      tempCelsius: 22.4,
      testsToday: 46,
      lastPing: 'Just now',
    },
    {
      id: 'KIOSK-BLR-02',
      name: 'Kiosk #02',
      city: 'Bengaluru',
      location: 'Indiranagar 100ft Road',
      status: 'online',
      reagentsLevel: 78,
      lancetsRemaining: 112,
      tempCelsius: 21.8,
      testsToday: 38,
      lastPing: '2 mins ago',
    },
    {
      id: 'KIOSK-DEL-03',
      name: 'Kiosk #03',
      city: 'Delhi NCR',
      location: 'Cyber Hub Rapid Metro',
      status: 'online',
      reagentsLevel: 64,
      lancetsRemaining: 94,
      tempCelsius: 23.1,
      testsToday: 52,
      lastPing: '1 min ago',
    },
    {
      id: 'KIOSK-MUM-04',
      name: 'Kiosk #04',
      city: 'Mumbai',
      location: 'Bandra Kurla Complex (BKC)',
      status: 'maintenance',
      reagentsLevel: 14,
      lancetsRemaining: 18,
      tempCelsius: 24.0,
      testsToday: 19,
      lastPing: '15 mins ago',
    },
  ]);

  const t = translations[language];

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [b, r, p] = await Promise.all([getAllBookings(), getAllReports(), getAllPayments()]);
      setBookings(b || []);
      setReports(r || []);
      setPayments(p || []);
    } catch (err) {
      console.warn('Admin load note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0) + 14850;
  const totalCompleted = reports.length + 155;

  // Simulator: Generate mock kiosk test dynamically into Firestore
  const handleGenerateMockKioskTest = async () => {
    playTouchClick();
    setIsLoading(true);
    const mockNames = ['Pooja Reddy', 'Suresh Babu', 'Sneha Varma', 'Anand Rao', 'Kavitha Nair'];
    const mockTests = [
      { name: 'Blood Sugar', price: 99, val: '108 mg/dL' },
      { name: 'Cholesterol', price: 149, val: '172 mg/dL' },
      { name: 'CBC', price: 199, val: 'Hb: 13.9 g/dL' },
      { name: 'Thyroid', price: 249, val: '1.92 μIU/mL' },
    ];
    const pickedName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const pickedTest = mockTests[Math.floor(Math.random() * mockTests.length)];
    const newBkId = `VMC-BK-${Math.floor(2000 + Math.random() * 7000)}`;
    const newRepId = `VMC-REP-${Math.floor(2000 + Math.random() * 7000)}`;

    try {
      await createBooking({
        bookingId: newBkId,
        userId: 'simulated_patient',
        userName: pickedName,
        userPhone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
        testType: pickedTest.name,
        status: 'completed',
        kiosk: 'Kiosk #01 (HiTech City Metro, Hyderabad)',
        payment: {
          amount: pickedTest.price,
          method: 'UPI',
          status: 'success',
          transactionId: `UPI-${Date.now().toString().slice(-6)}`,
          upiApp: 'PhonePe',
          paidAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      });

      await saveReport({
        reportId: newRepId,
        bookingId: newBkId,
        userId: 'simulated_patient',
        userName: pickedName,
        testType: pickedTest.name,
        summary: `Simulated diagnostic completed at kiosk for ${pickedName}. Value ${pickedTest.val} observed within normative parameters.`,
        summaryTe: `${pickedName} కోసం కియోస్క్ వద్ద పరీక్ష పూర్తయింది. రీడింగ్ ${pickedTest.val} సాధారణ శ్రేణిలో ఉంది.`,
        advice: 'Maintain standard hydration and healthy diet.',
        status: 'verified',
        createdAt: new Date().toISOString(),
      });

      await savePayment({
        paymentId: `PAY-${Date.now().toString().slice(-6)}`,
        bookingId: newBkId,
        userId: 'simulated_patient',
        userName: pickedName,
        amount: pickedTest.price,
        method: 'UPI',
        status: 'success',
        createdAt: new Date().toISOString(),
      });

      playGentleChime();
      await loadAllData();
    } catch (err) {
      console.warn('Mock generation note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-dashboard-view"
      className="max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.adminMode}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              VMC Core Ops
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet monitoring, live patient transaction queue, and hardware diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            id="admin-generate-mock-test-btn"
            onClick={handleGenerateMockKioskTest}
            disabled={isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.generateMockTest}</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>{t.revenue}</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% this week
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>{t.totalTests}</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalCompleted}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            Avg 4.8 min turnaround
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>{t.activeKiosks}</span>
            <Server className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            3 / 4 Online
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">
            1 in scheduled replenishment
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Telehealth Queue</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            2 Doctors Active
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Zero wait time
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'overview', label: 'Fleet & Hardware Telemetry' },
          { id: 'patients', label: 'Patient Bookings Queue' },
          { id: 'reports', label: 'Diagnostic Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`px-4 py-2 rounded-xl transition ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== SUBTAB 1: HARDWARE TELEMETRY ===================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Autonomous Kiosks Hardware Fleet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kiosks.map((k) => (
              <div
                key={k.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{k.name}</h4>
                    <p className="text-[11px] text-slate-500">{k.city}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      k.status === 'online'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {k.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  📍 {k.location}
                </div>

                {/* Progress bars for reagents and lancets */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-500 text-[11px] mb-1">
                      <span>Spectrometer Reagents</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {k.reagentsLevel}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          k.reagentsLevel > 50
                            ? 'bg-blue-600'
                            : k.reagentsLevel > 20
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${k.reagentsLevel}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Micro-Lancets</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {k.lancetsRemaining} units
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Thermal Core</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {k.tempCelsius} °C
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 2: PATIENT BOOKINGS ===================== */}
      {activeSubTab === 'patients' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.patientQueue}
            </h3>
            <span className="text-xs text-slate-500">{bookings.length} registered bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Test Package</th>
                  <th className="p-3">Kiosk Origin</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {b.bookingId}
                    </td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      {b.userName}
                    </td>
                    <td className="p-3">{b.testType}</td>
                    <td className="p-3 text-slate-500 truncate max-w-[180px]">{b.kiosk}</td>
                    <td className="p-3 font-bold">₹{b.payment?.amount || 99}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 3: REPORTS ===================== */}
      {activeSubTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Verified Diagnostic Archive
            </h3>
            <span className="text-xs text-slate-500">{reports.length} laboratory reports</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.reportId}
                className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {rep.userName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{rep.reportId}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {rep.testType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {rep.summary}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => openPrintableReport(rep, language)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    View Official PDF →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
