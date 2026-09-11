import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PackageInspector3D } from './PackageInspector3D';
import { ScanResult } from '../api/types';

interface InfoSectionProps {
  onExploreWorkspace: () => void;
  activeScan?: ScanResult | null;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  onExploreWorkspace,
  activeScan = null,
}) => {
  return (
    <section className="bg-[#F5F5F5] px-6 py-24 w-full">
      <div className="max-w-[88rem] mx-auto">
        
        {/* Row 1: 2-col Grid (Header + Lead Paragraph) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          
          {/* Left: Heading + Black Pill Button */}
          <div>
            <h2
              className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8"
              style={{ letterSpacing: '-0.03em' }}
            >
              Meet Pramaan LMPC.
            </h2>

            <button
              onClick={onExploreWorkspace}
              className="inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-sm group"
            >
              <span>Discover it</span>
              <div className="bg-white rounded-full p-2 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </button>
          </div>

          {/* Right: Large Subtitle Paragraph */}
          <div>
            <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
              Pramaan is an automated compliance intelligence system that verifies packaged commodities against statutory rules, numeral heights, and mandatory declarations in milliseconds.
            </p>
          </div>

        </div>

        {/* Row 2: 4-col Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 (Spans 2 columns on lg) with Custom Background Image */}
          <div
            className="lg:col-span-2 rounded-2xl p-7 min-h-80 flex flex-col justify-between overflow-hidden shadow-sm relative"
            style={{
              backgroundImage: `url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Soft overlay to ensure readability */}
            <div className="absolute inset-0 bg-white/10 pointer-events-none" />

            <div className="relative z-10">
              <h3
                className="text-black text-2xl font-medium leading-snug"
                style={{ letterSpacing: '-0.02em' }}
              >
                Accuracy that blooms
              </h3>
            </div>

            <div className="relative z-10">
              <p className="text-black/70 text-base max-w-xs leading-relaxed">
                Sub-millimeter optical caliper measurement and instantaneous rule verification routed into court-admissible audit records.
              </p>
            </div>
          </div>

          {/* Card 2: Solid #2B2644 */}
          <div
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm"
            style={{ backgroundColor: '#2B2644' }}
          >
            <div>
              <h3 className="text-white text-2xl font-medium leading-snug whitespace-pre-line">
                Always calibrated,{'\n'}always verified.
              </h3>
            </div>
            <div>
              <p className="text-white/60 text-base leading-relaxed">
                Keep fully standard-anchored with GS1 37.29mm scale factors — zero guesswork or manual calipers.
              </p>
            </div>
          </div>

          {/* Card 3: Solid #2B2644 */}
          <div
            className="rounded-2xl p-7 min-h-80 flex flex-col justify-between shadow-sm"
            style={{ backgroundColor: '#2B2644' }}
          >
            <div>
              <h3 className="text-white text-2xl font-medium leading-snug whitespace-pre-line">
                Fully{'\n'}automated.
              </h3>
            </div>
            <div>
              <p className="text-white/60 text-base leading-relaxed">
                Skip the task of manual checking yourself. Pramaan validates Rule 6, Rule 7, and Second Schedule requirements in the background for you.
              </p>
            </div>
          </div>

        </div>

        {/* Interactive 3D Package Inspector Container */}
        <div className="mt-12 rounded-3xl overflow-hidden border border-black/10 shadow-lg">
          <PackageInspector3D scan={activeScan} interactive={true} />
        </div>

      </div>
    </section>
  );
};
