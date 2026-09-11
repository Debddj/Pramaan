import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Camera, Clock, Globe, FileText } from 'lucide-react';

interface UseCasesSectionProps {
  onSelectMode: (mode: string) => void;
}

const MODES = [
  { id: 'scanner', title: 'Field Optical Caliper', desc: 'Real-time camera scanner with GS1 37.29mm calibration reticle.', icon: Camera },
  { id: 'adjudication', title: 'Adjudication Split-View', desc: 'Metrology evidence inspection with 85% confidence gate.', icon: ShieldCheck },
  { id: 'review', title: 'Officer Review Queue', desc: 'Borderline triage queue for human supervisory adjudication.', icon: Clock },
  { id: 'surveillance', title: 'E-Commerce Surveillance', desc: 'Autonomous marketplace spider and bulk SKU compliance scraper.', icon: Globe },
  { id: 'reports', title: 'Statutory Notice Vault', desc: 'Section 65B certified legal notice generation and download.', icon: FileText },
];

export const UseCasesSection: React.FC<UseCasesSectionProps> = ({ onSelectMode }) => {
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const activeMode = MODES[activeModeIndex];

  return (
    <section className="bg-[#F5F5F5] px-6 py-24 w-full">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column */}
        <div className="md:pr-12 md:pt-2 flex flex-col justify-start">
          <span className="text-black/60 text-sm mb-2 font-medium">
            Pramaan in Practice
          </span>

          <h2
            className="text-5xl md:text-6xl font-medium leading-none mb-6 text-black"
            style={{ letterSpacing: '-0.04em' }}
          >
            Enforcement modes
          </h2>

          <p className="text-black/60 text-base leading-relaxed max-w-sm mb-8">
            Pramaan powers a wide range of modes for enforcement officers, port customs, enforcement tribunals, and continuous e-commerce marketplace monitoring.
          </p>

          {/* Mode Tabs List */}
          <div className="space-y-3">
            {MODES.map((mode, idx) => {
              const isSelected = idx === activeModeIndex;
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  onClick={() => {
                    setActiveModeIndex(idx);
                    onSelectMode(mode.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-white border-black/10 hover:border-black/30 text-black'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/15 text-white' : 'bg-black/5 text-black'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{mode.title}</div>
                      <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-black/60'}`}>
                        {mode.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-white translate-x-1' : 'text-black/40'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Background Video Card with Overlay */}
        <div className="relative rounded-3xl overflow-hidden min-h-[720px] shadow-xl w-full">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="object-cover absolute inset-0 w-full h-full"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
          />

          {/* Soft gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none" />

          {/* Overlay Content */}
          <div className="relative z-10 p-10 md:p-12 flex flex-col justify-between h-full min-h-[720px]">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-black/50 font-bold mb-2 block">
                Active Enforcement Workspace
              </span>
              <h3
                className="text-4xl md:text-5xl font-medium leading-tight mb-5 text-black"
                style={{ letterSpacing: '-0.03em' }}
              >
                {activeMode.title}
              </h3>
              <p className="text-black/70 text-base max-w-md mb-8 leading-relaxed">
                {activeMode.id === 'scanner' && 'Real-time video framing and automatic optical character recognition with sub-millimeter caliper overlay.'}
                {activeMode.id === 'adjudication' && 'Split-view metrology evidence comparing detected label declarations against Legal Metrology Rules.'}
                {activeMode.id === 'review' && 'Centralized queue for rapid triage of borderline confidence inspections with single-click sign-off.'}
                {activeMode.id === 'surveillance' && 'Autonomous spider crawling major online retail platforms to flag missing declarations and tax unstated violations.'}
                {activeMode.id === 'reports' && 'Generate admissible, Section 65B compliant inspection notices and audit dossiers.'}
              </p>
            </div>

            {/* Bottom Button with Circular Arrow Icon */}
            <div>
              <button
                onClick={() => onSelectMode(activeMode.id)}
                className="inline-flex items-center gap-3 text-black text-base font-medium group transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                  <ArrowRight className="w-4 h-4 text-black transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="underline-offset-4 group-hover:underline">Launch {activeMode.title}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
