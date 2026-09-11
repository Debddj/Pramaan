import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DashboardMetrics, ScanResult } from '../api/types';

interface HeroPreviewProps {
  metrics: DashboardMetrics | null;
  activeScan?: ScanResult | null;
  onStartInspection: () => void;
  onOpenScanner: () => void;
  onOpenReviewQueue: () => void;
  onSimulateScenario: (scenario: 'normal' | 'undersized' | 'off_size' | 'glare') => void;
  reviewCount: number;
}

const BRAND_ITEMS = [
  { name: 'Dept of Consumer Affairs', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'LEGAL METROLOGY ACT', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'GS1 India 37.29mm', style: { fontFamily: '"Trebuchet MS", sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' } },
  { name: 'BIS STANDARDS', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Section 65B Evidence', style: { fontFamily: 'Palatino, "Book Antiqua", serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'LMPC Rules 2011', style: { fontFamily: 'Impact, "Arial Narrow", sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'Consumer Protection', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
];

export const HeroPreview: React.FC<HeroPreviewProps> = ({
  onStartInspection,
}) => {
  return (
    <div className="flex-1 px-4 sm:px-6 pt-16 sm:pt-20 pb-4 sm:pb-6 flex items-end w-full">
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden"
        style={{ minHeight: '560px', height: 'calc(100vh - 84px)' }}
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover absolute inset-0 w-full h-full"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        {/* Subtle warm light gradient overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent pointer-events-none" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-start justify-start h-full p-6 sm:p-8 md:p-12 pt-20 sm:pt-28 md:pt-32">
          
          {/* Main Headline */}
          <h1
            className="text-black text-4xl sm:text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-3 sm:mb-4"
            style={{ letterSpacing: '-0.04em' }}
          >
            Your Metrology<br />Works
          </h1>

          {/* Subheading Paragraph */}
          <p
            className="text-black/70 text-sm sm:text-base md:text-lg max-w-md mb-6 sm:mb-8 leading-relaxed"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
          >
            An automated, computer-vision enforcement engine built for Legal Metrology Packaged Commodities (LMPC 2011) verification and instant court-admissible audit logging.
          </p>

          {/* Pill button "Launch Scan" with Arrow Circle */}
          <button
            onClick={onStartInspection}
            className="inline-flex items-center gap-2.5 sm:gap-3 bg-black text-white text-sm sm:text-base md:text-lg font-medium pl-6 sm:pl-8 pr-2 py-1.5 sm:py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-md group"
          >
            <span>Launch Scan</span>
            <div className="bg-white rounded-full p-1.5 sm:p-2 transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
          </button>

          {/* Brand / Standards Marquee (below button) */}
          <div className="mt-10 sm:mt-16 md:mt-24 w-full max-w-md overflow-hidden">
            <div className="marquee-track">
              {/* Loop 1 */}
              {BRAND_ITEMS.map((item, idx) => (
                <span
                  key={`b1-${idx}`}
                  className="mx-5 sm:mx-7 shrink-0 text-black/60 whitespace-nowrap"
                  style={item.style}
                >
                  {item.name}
                </span>
              ))}
              {/* Loop 2 (Duplicated for seamless infinite translation) */}
              {BRAND_ITEMS.map((item, idx) => (
                <span
                  key={`b2-${idx}`}
                  className="mx-5 sm:mx-7 shrink-0 text-black/60 whitespace-nowrap"
                  style={item.style}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
