import React, { useState } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Monitor,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { Language } from '../../types';
import { playTouchClick, playGentleChime } from '../../utils/audio';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLaunchKiosk: () => void;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({
  isOpen,
  onClose,
  language,
  onLaunchKiosk,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orgType, setOrgType] = useState('transit_metro');
  const [city, setCity] = useState('Hyderabad');
  const [preferredDate, setPreferredDate] = useState('2026-09-25');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playGentleChime();
    setIsSubmitted(true);
  };

  const handleTestDriveKiosk = () => {
    playTouchClick();
    onClose();
    onLaunchKiosk();
  };

  return (
    <div
      id="book-demo-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-sans"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl text-white overflow-hidden">
        {/* Glow ambient header */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">
                {language === 'te' ? 'డెమో బుక్ చేయండి' : 'Book a Live Kiosk Demo'}
              </h3>
              <p className="text-xs text-blue-200">
                {language === 'te'
                  ? 'మీ ఆసుపత్రి, మెట్రో లేదా టెక్ పార్క్‌లో కియోస్క్ టెస్ట్ డ్రైవ్ షెడ్యూల్ చేయండి'
                  : 'Schedule an executive demonstration or autonomous clinic deployment'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTouchClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white">
                {language === 'te' ? 'డెమో విజయవంతంగా బుక్ అయింది!' : 'Demonstration Confirmed!'}
              </h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you <strong className="text-white">{name || 'Doctor/Partner'}</strong>. Our healthcare solutions team will contact you at <strong className="text-blue-300">{phone || email || 'your contact'}</strong> to demonstrate the autonomous kiosk setup for {city}.
              </p>
            </div>

            {/* Instant Walkthrough CTA */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleTestDriveKiosk}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>{language === 'te' ? 'ఇప్పుడే కియోస్క్ పరీక్షించండి' : 'Test Drive 15" Kiosk Screen Now'}</span>
              </button>

              <button
                onClick={() => {
                  playTouchClick();
                  setIsSubmitted(false);
                  onClose();
                }}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-2xl transition"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Quick Instant Interactive Bypass */}
            <div className="p-3.5 bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Monitor className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white block">Want an immediate live interactive test?</span>
                  <span className="text-blue-200 text-[11px]">Experience the full 15" touchscreen workflow right now in your browser.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestDriveKiosk}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow transition shrink-0 cursor-pointer"
              >
                Launch Kiosk
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Full Name / Representative</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Rajesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Contact Number</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Official Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@metrohealth.org"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Deployment Environment</span>
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="transit_metro">Metro Rail / Transit Station</option>
                  <option value="tech_park">Corporate / IT Tech Park</option>
                  <option value="hospital_opd">Hospital OPD / Primary Care Clinic</option>
                  <option value="residential">Residential Township / Gated Community</option>
                  <option value="airport">Airport / Intercity Bus Terminal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target City</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Hyderabad">Hyderabad (HiTech City / Secunderabad)</option>
                  <option value="Bengaluru">Bengaluru (Indiranagar / Whitefield)</option>
                  <option value="Delhi NCR">Delhi NCR (Cyber Hub / Noida)</option>
                  <option value="Mumbai">Mumbai (BKC / Andheri)</option>
                  <option value="Chennai">Chennai (OMR / T. Nagar)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Preferred Demo Date</span>
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playTouchClick();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirm Demo Schedule</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
