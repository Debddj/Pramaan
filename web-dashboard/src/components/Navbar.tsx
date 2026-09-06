import React, { useState } from 'react';
import { ShieldCheck, Scale, AlertTriangle, BarChart3, PlusCircle, LogOut, KeyRound } from 'lucide-react';
import { OfficerSession } from '../api/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: 'dashboard' | 'adjudication' | 'review') => void;
  reviewCount: number;
  officerSession: OfficerSession | null;
  onOpenNewInspection: () => void;
  onReLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  reviewCount,
  officerSession,
  onOpenNewInspection,
  onReLogin,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-white tracking-tight">
                PRAMAAN
              </span>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/20 font-mono">
                SIH26034
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Department of Consumer Affairs • Legal Metrology Enforcement
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('adjudication')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'adjudication'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Adjudication</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Review Queue</span>
            {reviewCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {reviewCount}
              </span>
            )}
          </button>
        </nav>

        {/* Actions & Officer Profile */}
        <div className="flex items-center gap-3">
          {/* Primary Action Button */}
          <button
            onClick={onOpenNewInspection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Inspection</span>
          </button>

          {/* Officer Session Profile Card */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/80 transition text-left"
            >
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-slate-200">
                  {officerSession?.name || 'Inspector R. Sharma'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {officerSession?.badge_number || 'DL-LM-4821'} • Active
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow">
                RS
              </div>
            </button>

            {/* Officer Dropdown Details */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
                <div className="border-b border-slate-800 pb-2">
                  <div className="font-bold text-slate-200">{officerSession?.name || 'Inspector R. Sharma'}</div>
                  <div className="text-slate-400 text-[11px]">{officerSession?.email || 'officer@consumer.gov.in'}</div>
                  <div className="text-[10px] font-mono text-amber-400 mt-1">
                    Badge: {officerSession?.badge_number || 'DL-LM-4821'} (Enforcement Officer)
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>JWT Session Status:</span>
                    <span className="text-emerald-400 font-mono">Authenticated</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Role Permissions:</span>
                    <span className="text-slate-300 capitalize">{officerSession?.role || 'officer'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onReLogin();
                    }}
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-[11px] transition"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Re-authenticate
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onReLogin();
                    }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 text-[11px] transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
