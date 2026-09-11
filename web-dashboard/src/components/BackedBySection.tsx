import React from 'react';

const BACKER_ITEMS = [
  { name: 'Dept of Consumer Affairs', style: { fontFamily: '"Times New Roman", serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'LEGAL METROLOGY ACT', style: { fontFamily: '"Arial Black", sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px' } },
  { name: 'GS1 INDIA', style: { fontFamily: 'Impact, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px' } },
  { name: 'Bureau of Indian Standards', style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px' } },
  { name: 'Ministry of Consumer Affairs', style: { fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'LMPC RULES 2011', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' as const } },
  { name: 'E-COMMERCE SURVEILLANCE', style: { fontFamily: '"Courier New", monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'Weights & Measures Directorate', style: { fontFamily: 'Palatino, "Book Antiqua", serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } },
];

export const BackedBySection: React.FC = () => {
  return (
    <section className="bg-[#F5F5F5] px-6 py-12 w-full border-y border-black/5">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        
        {/* Left Col (1/4) */}
        <div className="text-black/70 text-base leading-relaxed whitespace-pre-line">
          Governed by statutory frameworks{'\n'}and national authorities.
        </div>

        {/* Right Col (3/4): Infinite Marquee */}
        <div className="md:col-span-3 overflow-hidden">
          <div className="backers-track">
            {/* Loop 1 */}
            {BACKER_ITEMS.map((item, idx) => (
              <span
                key={`backer1-${idx}`}
                className="mx-10 shrink-0 text-black/50 whitespace-nowrap"
                style={item.style}
              >
                {item.name}
              </span>
            ))}
            {/* Loop 2 (Duplicated for seamless infinite translation) */}
            {BACKER_ITEMS.map((item, idx) => (
              <span
                key={`backer2-${idx}`}
                className="mx-10 shrink-0 text-black/50 whitespace-nowrap"
                style={item.style}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
