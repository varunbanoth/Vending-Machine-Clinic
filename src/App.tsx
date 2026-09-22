import React, { useState, useEffect } from 'react';
import { Language, UserRole } from './types';
import { Navbar, AppViewMode } from './components/layout/Navbar';
import { LandingHero } from './components/landing/LandingHero';
import { KioskView } from './components/kiosk/KioskView';
import { MobileAppView } from './components/mobile/MobileAppView';
import { DoctorPanelView } from './components/doctor/DoctorPanelView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { EmergencyModal } from './components/kiosk/EmergencyModal';
import { BookDemoModal } from './components/landing/BookDemoModal';
import { seedInitialDemoData } from './firebase/services';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppViewMode>('landing');
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vmc_theme');
      if (saved) return saved === 'dark';
      return true; // Default to dark mode matching the requested dark blue theme
    }
    return true;
  });
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);

  // Initialize Firebase demo data on startup
  useEffect(() => {
    seedInitialDemoData();
  }, []);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vmc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vmc_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      id="vmc-app-root"
      className="min-h-screen relative bg-slate-950 text-slate-100 flex flex-col transition-colors duration-200 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden"
    >
      {/* Floating Ambient Gradient Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full bg-blue-600/15 blur-[120px] animate-float-1" />
        <div className="absolute top-[35%] right-[-15%] w-[550px] h-[550px] rounded-full bg-cyan-500/12 blur-[130px] animate-float-2" />
        <div
          className="absolute bottom-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] animate-float-1"
          style={{ animationDelay: '7s' }}
        />
      </div>

      {/* Universal Top Navigation & Mode Switcher */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        language={language}
        onToggleLanguage={toggleLanguage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onTriggerEmergency={() => setIsEmergencyOpen(true)}
        onOpenBookDemo={() => setIsBookDemoOpen(true)}
      />

      {/* Main Mode Viewport */}
      <main className="relative z-10 flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
        {currentMode === 'landing' && (
          <LandingHero
            language={language}
            onSelectMode={(mode) => setCurrentMode(mode)}
            onTriggerEmergency={() => setIsEmergencyOpen(true)}
            onOpenBookDemo={() => setIsBookDemoOpen(true)}
          />
        )}

        {currentMode === 'kiosk' && (
          <KioskView
            language={language}
            onToggleLanguage={toggleLanguage}
            onNavigateToMobile={() => setCurrentMode('mobile')}
          />
        )}

        {currentMode === 'mobile' && (
          <MobileAppView
            language={language}
            onToggleLanguage={toggleLanguage}
            onNavigateToKiosk={() => setCurrentMode('kiosk')}
          />
        )}

        {currentMode === 'doctor' && <DoctorPanelView language={language} />}

        {currentMode === 'admin' && <AdminDashboardView language={language} />}
      </main>

      {/* Global Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        language={language}
      />

      {/* Global Book Demo Modal */}
      <BookDemoModal
        isOpen={isBookDemoOpen}
        onClose={() => setIsBookDemoOpen(false)}
        language={language}
        onLaunchKiosk={() => {
          setIsBookDemoOpen(false);
          setCurrentMode('kiosk');
        }}
      />
    </div>
  );
}
