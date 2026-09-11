import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  ShieldCheck,
  LogOut,
  Key,
  Menu,
  X
} from 'lucide-react';
import { OfficerSession } from '../api/types';
import { LogoIcon } from './LogoIcon';

export type NavTab =
  | 'dashboard'
  | 'adjudication'
  | 'scanner'
  | 'review'
  | 'history'
  | 'reports'
  | 'surveillance';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  reviewCount: number;
  officerSession: OfficerSession | null;
  onOpenNewInspection: () => void;
  onReLogin: () => void;
  onLogout: () => void;
  isBackendHealthy?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  officerSession,
  onOpenNewInspection,
  onReLogin,
  onLogout,
  isBackendHealthy = true,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: Array<{ id: NavTab; label: string; badge?: number }> = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'adjudication', label: 'Inspect' },
    { id: 'scanner', label: 'Scanner' },
    { id: 'review', label: 'Reviews', badge: reviewCount },
    { id: 'history', label: 'History' },
    { id: 'reports', label: 'Reports' },
    { id: 'surveillance', label: 'Surveillance' },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 py-4 sm:py-5 pointer-events-auto">
      <div className="max-w-[88rem] mx-auto flex items-center justify-between">
        
        {/* Left: Custom Logo + Wordmark */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none text-left"
        >
          <LogoIcon className="w-6 h-6 sm:w-7 sm:h-7 text-black transition-transform duration-200 group-hover:scale-105" />
          <span className="text-xl sm:text-2xl font-medium tracking-tight text-black" style={{ letterSpacing: '-0.03em' }}>
            Pramaan
          </span>
        </button>

        {/* Center: Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative text-base font-medium transition-colors duration-200 ${
                  isActive ? 'text-black' : 'text-gray-700 hover:text-black'
                }`}
              >
                <span>{link.label}</span>
                {link.badge != null && link.badge > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-black text-white text-[11px] font-mono rounded-full">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-black rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Actions + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Indicator */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
              isBackendHealthy
                ? 'bg-white/80 text-emerald-800 border-emerald-200/80 backdrop-blur-sm'
                : 'bg-rose-50 text-rose-800 border-rose-200 backdrop-blur-sm'
            }`}
            title={isBackendHealthy ? 'FastAPI Backend Online' : 'Backend Unreachable'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{isBackendHealthy ? '8000 LIVE' : 'OFFLINE'}</span>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenNewInspection();
            }}
            className="bg-black text-white text-xs sm:text-base font-medium px-4 sm:px-7 py-2 sm:py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span>Inspect</span>
          </button>

          {/* Officer Session Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-2 sm:p-2.5 rounded-full bg-white/80 hover:bg-white text-black border border-black/10 backdrop-blur-sm transition shadow-sm"
              title="Officer Profile"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-gray-200 shadow-xl p-4 z-50 text-xs text-black"
                >
                  <div className="pb-3 border-b border-gray-100">
                    <div className="font-semibold text-sm text-black">
                      {officerSession?.name || 'Authorized Officer'}
                    </div>
                    <div className="text-gray-500 font-mono text-[11px]">
                      Badge: {officerSession?.badge_number || 'IND-LM-0428'}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {officerSession?.role || 'Senior Metrology Inspector'}
                    </div>
                  </div>

                  <div className="pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onReLogin();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700 flex items-center gap-2 transition"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Switch Credentials</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Terminate Session</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/80 hover:bg-white text-black border border-black/10 backdrop-blur-sm transition shadow-sm"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-3 p-4 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-xl space-y-2 z-50"
          >
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl text-left text-sm font-medium transition flex items-center justify-between ${
                      isActive
                        ? 'bg-black text-white font-semibold shadow-sm'
                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge != null && link.badge > 0 && (
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${
                        isActive ? 'bg-white text-black' : 'bg-black text-white'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 px-2">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Backend: {isBackendHealthy ? 'Online (8000)' : 'Offline'}</span>
              </span>
              <span className="font-mono">{officerSession?.badge_number || 'IND-LM-0428'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
