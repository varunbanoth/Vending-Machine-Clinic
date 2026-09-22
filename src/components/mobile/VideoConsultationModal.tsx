import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Stethoscope,
  Send,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Language, Report } from '../../types';
import { translations } from '../../i18n/translations';

interface VideoConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  report?: Report | null;
  patientName?: string;
}

export const VideoConsultationModal: React.FC<VideoConsultationModalProps> = ({
  isOpen,
  onClose,
  language,
  report,
  patientName = 'Patient',
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'doc' | 'user'; text: string; time: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const t = translations[language];

  useEffect(() => {
    if (!isOpen) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      setIsConnected(false);
      setCallDuration(0);
      return;
    }

    // Attempt to start local camera
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setCameraStream(stream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn('Camera preview not active or permission dismissed:', err);
      });

    // Simulate connecting to doctor
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initialGreeting =
        language === 'te'
          ? `నమస్కారం ${patientName}! మీ ${report?.testType || 'ఆరోగ్య'} ఫలితాలను నేను సమీక్షించాను. మీరు ప్రస్తుతం ఎలా భావిస్తున్నారు?`
          : `Hello ${patientName}! I have reviewed your ${report?.testType || 'diagnostic'} results from the kiosk. How are you feeling today?`;

      setChatMessages([
        {
          sender: 'doc',
          text: initialGreeting,
          time: now,
        },
      ]);

      setDoctorNotes(
        language === 'te'
          ? 'వైద్య సలహా: రోగి బయోమార్కర్లను సమీక్షించాము. సమతుల్య ఆహారం మరియు రోజువారీ వాకింగ్ సూచించబడింది.'
          : 'Clinical Assessment: Diagnostic kiosk biomarkers reviewed. Patient advised to maintain adequate hydration, dietary balance, and follow-up in 14 days.'
      );
    }, 2200);

    return () => {
      clearTimeout(connectTimer);
    };
  }, [isOpen, language, patientName, report]);

  // Call timer
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = inputText.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: now }]);
    setInputText('');

    // Doctor auto-reply
    setTimeout(() => {
      const reply =
        language === 'te'
          ? 'అర్థమైంది. మీ నివేదికను ఆధారం చేసుకుని తగిన జాగ్రత్తలు పాటించండి. అవసరమైతే ప్రిస్క్రిప్షన్ అప్‌డేట్ చేస్తాను.'
          : 'Understood. Please stay relaxed and keep a consistent water intake. I am updating your VMC digital clinical record.';
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'doc',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div
      id="video-consultation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="video-consultation-container"
        className="w-full max-w-5xl h-[92vh] max-h-[820px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Top Header */}
        <div className="bg-slate-800/80 px-6 py-3.5 flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm md:text-base">
                  Dr. Ananya Sharma, MD
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <UserCheck className="w-3 h-3" />
                  {isConnected ? (language === 'te' ? 'కనెక్ట్ అయింది' : 'Connected') : (language === 'te' ? 'కనెక్ట్ అవుతోంది...' : 'Connecting...')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Senior Physician • VMC TeleHealth Network • Reg #MCI-2018-8491
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-900/80 border border-slate-700 rounded-lg text-emerald-400 font-mono text-sm">
              {formatTimer(callDuration)}
            </div>
            <button
              id="video-close-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Video & Chat Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
          {/* Doctor Video Feed & Patient Pip */}
          <div className="lg:col-span-2 relative bg-slate-950 flex items-center justify-center overflow-hidden">
            {isConnected ? (
              <div className="relative w-full h-full flex items-center justify-center bg-radial from-slate-800 to-slate-950">
                {/* Doctor Visual Feed */}
                <div className="text-center space-y-4 p-8">
                  <div className="relative inline-block">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=350"
                      alt="Doctor Video"
                      className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-blue-500/80 shadow-2xl mx-auto ring-8 ring-blue-500/10"
                    />
                    <span className="absolute bottom-2 right-4 w-6 h-6 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-white text-xs">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Dr. Ananya Sharma</h4>
                    <p className="text-sm text-blue-400 font-medium">Cardiometabolic Specialist</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-950/60 border border-blue-800/60 rounded-full text-xs text-blue-300">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Live Reviewing {report?.testType || 'Biomarkers'}
                    </div>
                  </div>
                </div>

                {/* Live Vitals Overlay */}
                <div className="absolute top-4 left-4 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-2xl text-xs space-y-1.5 shadow-xl">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Telemetry Stream
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <span className="text-red-400">❤️ 74 bpm</span>
                    <span className="text-blue-400">🫁 99% SpO2</span>
                    <span className="text-emerald-400">🩺 120/80</span>
                  </div>
                </div>

                {/* Patient Picture-in-Picture */}
                <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-40 sm:h-28 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl">
                  {cameraStream && isVideoOn ? (
                    <video
                      ref={userVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs p-2 text-center">
                      <VideoOff className="w-5 h-5 mb-1 text-slate-500" />
                      <span>{patientName}</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white">
                    You
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-300 font-medium">
                  {language === 'te'
                    ? 'కియోస్క్ నుండి వైద్యుడితో సురక్షితమైన వీడియో లైన్ కలుపుతోంది...'
                    : 'Establishing encrypted WebRTC connection with attending doctor...'}
                </p>
                <span className="text-xs text-slate-500">HIPAA & ISO 27001 Compliant Healthcare Channel</span>
              </div>
            )}
          </div>

          {/* Clinical Chat & Consultation Notes */}
          <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 bg-slate-850">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{language === 'te' ? 'వైద్యుల సంప్రదింపు నోట్స్' : 'Consultation Notes & Chat'}</span>
              </div>
              {doctorNotes && (
                <div className="mt-2.5 p-2.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-200 leading-relaxed">
                  <strong>Rx Note:</strong> {doctorNotes}
                </div>
              )}
            </div>

            {/* Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                id="consultation-chat-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'te' ? 'వైద్యుడికి సందేశం పంపండి...' : 'Type a question for the doctor...'
                }
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                id="consultation-chat-send"
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Call Controls */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-center gap-4 border-t border-slate-800">
          <button
            id="video-mic-toggle"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition ${
              isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            id="video-camera-toggle"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3.5 rounded-full transition ${
              !isVideoOn ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            id="video-end-call"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm rounded-full shadow-lg shadow-red-600/30 transition"
          >
            <PhoneOff className="w-5 h-5" />
            <span>{language === 'te' ? 'కాల్ ముగించు' : 'End Consultation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
