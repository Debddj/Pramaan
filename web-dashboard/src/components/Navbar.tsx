import React from 'react';
import { ShieldCheck, Scale, AlertTriangle, FileText, BarChart3 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reviewCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, reviewCount }) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-white tracking-tight">PRAMAAN</span>
              <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-amber-500/20">SIH26034</span>
            </div>
            <p className="text-[10px] text-slate-400">Department of Consumer Affairs • Legal Metrology Enforcement Portal</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('adjudication')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'adjudication'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Adjudication Workspace
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition relative ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Review Queue
            {reviewCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {reviewCount}
              </span>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">Inspector R. Sharma</div>
            <div className="text-[10px] text-slate-400 font-mono">DL-LM-4821 • Active</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-sm">
            RS
          </div>
        </div>
      </div>
    </header>
  );
};
