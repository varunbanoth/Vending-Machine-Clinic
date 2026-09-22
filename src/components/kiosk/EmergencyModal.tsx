import React, { useEffect, useState } from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, Volume2, VolumeX, Ambulance, Radio } from 'lucide-react';
import { startEmergencySiren, stopEmergencySiren } from '../../utils/audio';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { createNotification } from '../../firebase/services';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, language }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'calling' | 'dispatched'>('idle');
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) {
        startEmergencySiren();
      }
      // Auto-trigger emergency telemetry log into Firestore
      createNotification({
        id: `sos_${Date.now()}`,
        userId: 'emergency_dispatch_team',
        title: 'EMERGENCY SOS Triggered at Kiosk #01',
        titleTe: 'కియోస్క్ #01 వద్ద అత్యవసర SOS మోగింది',
        message: 'Patient activated emergency SOS at HiTech City Metro Kiosk. Coordinates: 17.4435° N, 78.3772° E. Urgent triage response initiated.',
        messageTe: 'హైటెక్ సిటీ మెట్రో కియోస్క్ వద్ద అత్యవసర సహాయం అభ్యర్థించబడింది.',
        type: 'emergency',
        read: false,
        createdAt: new Date().toISOString(),
      }).catch((e) => console.warn('SOS log:', e));
    } else {
      stopEmergencySiren();
      setDispatchStatus('idle');
    }

    return () => {
      stopEmergencySiren();
    };
  }, [isOpen, soundEnabled]);

  const toggleSound = () => {
    if (soundEnabled) {
      stopEmergencySiren();
      setSoundEnabled(false);
    } else {
      startEmergencySiren();
      setSoundEnabled(true);
    }
  };

  const handleCallAmbulance = () => {
    setDispatchStatus('calling');
    setTimeout(() => {
      setDispatchStatus('dispatched');
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div
      id="emergency-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="emergency-modal-card"
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border-4 border-red-500 rounded-3xl shadow-2xl overflow-hidden animate-bounce-short"
      >
        {/* Pulsating Top Banner */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-yellow-300 animate-spin-slow" />
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase">
                {t.emergencySOS} • {language === 'te' ? 'అత్యవసర సహాయం' : 'CRITICAL EMERGENCY'}
              </h2>
              <p className="text-xs text-red-100 font-mono">
                KIOSK-01 • GPS: 17.4435° N, 78.3772° E (Cyber Towers)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="emergency-sound-toggle-btn"
              onClick={toggleSound}
              className="p-2 bg-red-700/80 hover:bg-red-800 text-white rounded-full transition"
              title={soundEnabled ? 'Mute Siren' : 'Enable Siren'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              id="emergency-close-btn"
              onClick={() => {
                stopEmergencySiren();
                onClose();
              }}
              className="p-2 bg-red-700/80 hover:bg-red-800 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-red-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-base md:text-lg font-bold text-red-900 dark:text-red-200">
                {language === 'te'
                  ? 'కియోస్క్ అత్యవసర ప్రోటోకాల్ ప్రారంభించబడింది'
                  : 'Kiosk Emergency Response Protocol Activated'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                {language === 'te'
                  ? 'వైద్య అత్యవసర సహాయం కోసం సమీపంలోని ఆసుపత్రి మరియు 108 అంబులెన్స్ టీమ్ అనుసంధానించబడింది. మీ లొకేషన్ ఆటోమేటిక్‌గా షేర్ చేయబడింది.'
                  : 'Nearest rapid medical responder and 108 ambulance dispatch have been alerted with this exact kiosk beacon. An emergency physician line is standby.'}
              </p>
            </div>
          </div>

          {dispatchStatus === 'dispatched' ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 rounded-2xl text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Ambulance className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                {language === 'te' ? 'అంబులెన్స్ పంపబడింది!' : 'Ambulance Unit Dispatched!'}
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Unit #AP-108-HYD is en route. Estimated arrival: <strong>4 minutes</strong>. Kiosk external red beacon is flashing to guide paramedics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                id="emergency-call-108-btn"
                onClick={handleCallAmbulance}
                disabled={dispatchStatus === 'calling'}
                className="flex items-center justify-center gap-3 p-5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-500/25 transition cursor-pointer"
              >
                <PhoneCall className="w-6 h-6 animate-pulse" />
                <span>
                  {dispatchStatus === 'calling'
                    ? (language === 'te' ? 'కనెక్ట్ చేస్తోంది...' : 'Connecting...')
                    : (language === 'te' ? '108 అంబులెన్స్ పిలవండి' : 'Dispatch 108 Ambulance')}
                </span>
              </button>

              <button
                id="emergency-call-doctor-btn"
                onClick={() => {
                  stopEmergencySiren();
                  onClose();
                }}
                className="flex items-center justify-center gap-3 p-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 transition cursor-pointer"
              >
                <Radio className="w-6 h-6" />
                <span>
                  {language === 'te' ? 'లైవ్ డాక్టర్‌తో మాట్లాడండి' : 'Immediate Doctor Call'}
                </span>
              </button>
            </div>
          )}

          {/* Quick First Aid Instructions */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {language === 'te' ? 'తక్షణ ఉపశమనం / ప్రథమ చికిత్స' : 'Immediate On-Screen First Aid Steps'}
            </h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>{language === 'te' ? 'కియోస్క్ కుర్చీలో సౌకర్యవంతంగా కూర్చోండి.' : 'Sit down calmly in front of the kiosk platform.'}</li>
              <li>{language === 'te' ? 'ఛాతీ నొప్పి లేదా ఆయాసం ఉంటే విశ్రాంతి తీసుకోండి.' : 'If experiencing chest tightness, lean back and take slow deep breaths.'}</li>
              <li>{language === 'te' ? 'పారామెడిక్స్ వచ్చే వరకు కియోస్క్ ప్రాంతంలోనే ఉండండి.' : 'Stay beside the kiosk; high-visibility distress beacon is active.'}</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="emergency-dismiss-btn"
              onClick={() => {
                stopEmergencySiren();
                onClose();
              }}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-sm font-semibold transition"
            >
              {language === 'te' ? 'రద్దు చేయి / మూసివేయి' : 'Deactivate & Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
