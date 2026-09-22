import React from 'react';
import {
  Monitor,
  Smartphone,
  Stethoscope,
  ShieldCheck,
  Home,
  ShieldAlert,
  Moon,
  Sun,
  Globe,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Language, UserRole } from '../../types';
import { translations } from '../../i18n/translations';
import { playTouchClick } from '../../utils/audio';
import { MagneticButton } from '../common/MagneticButton';
import vmcLogo from '../../assets/images/vmc_official_logo_1789927279882.jpg';

export type AppViewMode = 'landing' | 'kiosk' | 'mobile' | 'doctor' | 'admin';

interface NavbarProps {
  currentMode: AppViewMode;
  onSelectMode: (mode: AppViewMode) => void;
  language: Language;
  onToggleLanguage: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onTriggerEmergency: () => void;
  onOpenBookDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  language,
  onToggleLanguage,
  isDarkMode,
  onToggleDarkMode,
  onTriggerEmergency,
  onOpenBookDemo,
}) => {
  const t = translations[language];

  const modes: Array<{ id: AppViewMode; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'landing', label: t.landingMode, icon: Home },
    { id: 'kiosk', label: t.kioskMode, icon: Monitor },
    { id: 'mobile', label: t.mobileMode, icon: Smartphone },
    { id: 'doctor', label: t.doctorMode, icon: Stethoscope },
    { id: 'admin', label: t.adminMode, icon: ShieldCheck },
  ];

  return (
    <header
      id="main-app-navbar"
      className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => {
            playTouchClick();
            onSelectMode('landing');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-all duration-300 bg-slate-900 shrink-0 glow-cyan">
              <img
                src={vmcLogo}
                alt="VMC Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base md:text-lg text-white tracking-tight">
                VMC
              </span>
              <span className="hidden sm:inline text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-400/30 glow-blue-sm">
                Clinic
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 leading-none">
              Healthcare For Everyone
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
          {modes.map((item) => {
            const Icon = item.icon;
            const active = currentMode === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mode-${item.id}`}
                onClick={() => {
                  playTouchClick();
                  onSelectMode(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 glow-blue-sm border border-blue-400/50 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-200' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Book Demo + SOS + Lang + Theme */}
        <div className="flex items-center gap-2">
          {/* Magnetic Book Demo Button with Haptic Effect */}
          <MagneticButton
            id="nav-book-demo-btn"
            strength={0.2}
            onClick={() => {
              playTouchClick();
              onOpenBookDemo();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 glow-blue-sm transition-all border border-blue-400/30"
            title="Book a Kiosk Demo"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">{language === 'te' ? 'డెమో బుక్' : 'Book Demo'}</span>
            <span className="sm:hidden">Demo</span>
          </MagneticButton>

          {/* Emergency SOS Quick Button with Pulsing Beacon */}
          <MagneticButton
            id="nav-emergency-sos-btn"
            strength={0.15}
            onClick={() => {
              playTouchClick();
              onTriggerEmergency();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/40 transition-all border border-red-400/50 animate-pulse"
            title="Immediate 108 Ambulance Dispatch"
          >
            <ShieldAlert className="w-4 h-4 text-yellow-300" />
            <span className="hidden sm:inline">SOS</span>
          </MagneticButton>

          {/* Bilingual Language Switcher */}
          <button
            id="nav-lang-toggle-btn"
            onClick={() => {
              playTouchClick();
              onToggleLanguage();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
            title="Toggle English & Telugu"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            id="nav-dark-mode-btn"
            onClick={() => {
              playTouchClick();
              onToggleDarkMode();
            }}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-white/10 active:scale-95 cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Sub-Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-white/10 bg-slate-950/95 overflow-x-auto text-xs">
        {modes.map((item) => {
          const Icon = item.icon;
          const active = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playTouchClick();
                onSelectMode(item.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0 font-bold transition cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 glow-blue-sm'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
