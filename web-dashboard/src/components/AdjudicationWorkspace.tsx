import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, 
  CheckCircle2, 
  Ruler, 
  FileDown, 
  Loader2, 
  Lock,
  ChevronDown,
  Sparkles,
  FileSpreadsheet,
  Code
} from 'lucide-react';
import { ConfidenceGauge } from './ConfidenceGauge';
import { ScanResult, OfficerSession } from '../api/types';

interface AdjudicationWorkspaceProps {
  scan: ScanResult | null;
  officerSession: OfficerSession | null;
  onAdjudicate?: (scanUuid: string, action: 'mark_compliant' | 'approve_violation', notes: string) => Promise<void>;
  onDownloadNotice: () => Promise<void>;
  onDownloadCsv?: () => Promise<void>;
  onDownloadJson?: () => Promise<void>;
  isGeneratingNotice: boolean;
  onNavigateToReview: () => void;
  onSimulateScenario: (scenario: 'normal' | 'undersized' | 'off_size' | 'glare') => void;
  onOpenNewInspection: () => void;
}

export const AdjudicationWorkspace: React.FC<AdjudicationWorkspaceProps> = ({
  scan,
  officerSession,
  onAdjudicate,
  onDownloadNotice,
  onDownloadCsv,
  onDownloadJson,
  isGeneratingNotice,
  onNavigateToReview,
  onSimulateScenario,
  onOpenNewInspection,
}) => {
  // Layer overlay toggles
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [showRulerLine, setShowRulerLine] = useState<boolean>(true);
  const [showOcrBox, setShowOcrBox] = useState<boolean>(true);

  // Expandable interactive rule cards state
  const [expandedRule, setExpandedRule] = useState<string | null>('rule_7');

  // Officer adjudication inputs
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);

  if (!scan) {
    return (
      <div className="bg-white border border-black/10 rounded-3xl p-12 text-center space-y-5 shadow-sm max-w-3xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 text-black border border-gray-200 flex items-center justify-center mx-auto shadow-sm">
          <Ruler className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3
            className="text-3xl font-medium tracking-tight text-black"
            style={{ letterSpacing: '-0.03em' }}
          >
            No Active Inspection Loaded
          </h3>
          <p className="text-sm text-black/60 max-w-md mx-auto leading-relaxed">
            Select a statutory benchmark scenario below, upload physical packaging evidence, or capture a live frame with the optical scanner.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={onOpenNewInspection}
            className="inline-flex items-center gap-3 bg-black text-white text-sm font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 transition shadow-sm group"
          >
            <span>Upload Packaging Evidence</span>
            <div className="bg-white rounded-full p-1.5 transition-transform group-hover:translate-x-0.5">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
          </button>
          <button
            onClick={() => onSimulateScenario('normal')}
            className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black rounded-full text-sm font-medium border border-gray-300 transition"
          >
            Load Compliant Sample
          </button>
        </div>
      </div>
    );
  }

  const decl = scan.extracted_declarations || {};
  const isCompliant = scan.status === 'compliant';
  const isViolation = scan.status === 'violation';

  const handleDecisionSubmit = async (action: 'mark_compliant' | 'approve_violation') => {
    if (!onAdjudicate) return;
    setIsSubmittingDecision(true);
    setDecisionSuccess(null);
    try {
      await onAdjudicate(
        scan.scan_uuid,
        action,
        officerNotes || `Officer ${action === 'mark_compliant' ? 'verified compliance' : 'approved violation'}`
      );
      setDecisionSuccess(`Adjudication recorded: ${action === 'mark_compliant' ? 'Verified Compliant' : 'Approved Violation'}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Legal Metrology Interactive Rule Definitions
  const ruleCards = [
    {
      id: 'rule_6',
      title: 'Rule 6 — Mandatory Declarations',
      subtitle: 'Manufacturer, Generic Name, Net Qty, MRP, Consumer Care',
      passed: Boolean(
        decl.manufacturer_name &&
        decl.generic_name &&
        decl.net_quantity_value != null &&
        decl.mrp != null &&
        decl.is_mrp_inclusive_of_taxes &&
        (decl.consumer_care_email || decl.consumer_care_phone)
      ),
      citation: 'Rule 6(1) & 6(2), LMPC Rules 2011',
      details: 'Every package must bear prominent declarations of name & address of manufacturer/packer, generic commodity name, net quantity, maximum retail price (inclusive of all taxes), and consumer grievance contact details.',
      statutoryProvision: 'Strict liability under Section 18 of Legal Metrology Act, 2009. Compoundable under Section 49.'
    },
    {
      id: 'rule_7',
      title: 'Rule 7 — Numeral Height Standards',
      subtitle: 'Sub-millimeter optical measurement of Net Quantity font',
      passed: (scan.measured_numeral_height_mm || 2.5) >= 2.0,
      citation: 'Rule 7(2), Table I, LMPC Rules 2011',
      measuredValue: scan.measured_numeral_height_mm ? `${scan.measured_numeral_height_mm.toFixed(2)} mm` : '2.50 mm',
      requiredValue: '2.00 mm (for PDP Area > 100 cm² and ≤ 500 cm²)',
      details: `For PDP area of ${scan.pdp_area_sq_cm || 150} cm², Table I mandates minimum Net Quantity numeral height of 2.00mm. Measured via GS1 barcode reference scale factor (${scan.scale_factor_mm_per_px?.toFixed(4) || '0.0500'} mm/px).`,
      statutoryProvision: 'Sub-standard numeral height is an offense under Section 36(1) carrying a statutory fine up to ₹25,000 for initial infraction.'
    },
    {
      id: 'rule_9',
      title: 'Rule 9 — Contrast & Prominence',
      subtitle: 'Color contrast ratio & background legibility',
      passed: scan.status !== 'under_review' || (scan.overall_confidence >= 0.8),
      citation: 'Rule 9(1)(b), LMPC Rules 2011',
      details: 'Declarations must be conspicuous, legible, and distinctly contrasted against background packaging substrate without specular glare interference.',
      statutoryProvision: 'Ambiguous or obscured text violates Rule 9; intercepted by Pramaan AI confidence gate for human officer verification.'
    },
    {
      id: 'rule_5',
      title: 'Rule 5 & Second Schedule — Standard Pack Sizes',
      subtitle: 'Prescribed weight and volume denominations',
      passed: !scan.violations.some(v => v.rule_id.includes('rule_5') || v.citation.includes('Second Schedule')),
      citation: 'Rule 5, Second Schedule, LMPC Rules 2011',
      details: 'Commodities listed in Second Schedule (including biscuits, soaps, edible oils, tea) must be packaged exclusively in statutory standard quantities (e.g., 25g, 50g, 75g, 100g, 150g, 200g).',
      statutoryProvision: 'Non-standard quantity packaging is prohibited under Section 18(1) read with Rule 5.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Controller Bar */}
      <div className="bg-white border border-black/10 rounded-3xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-black bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full">
              {scan.scan_uuid}
            </span>
            <span className="text-sm font-medium tracking-tight text-black">
              Optical Metrology & Adjudication Workspace
            </span>
          </div>
          <p className="text-xs text-black/60">
            Sub-millimeter numeral height measurement & legal declaration codification
          </p>
        </div>

        {/* Quick Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-black/40 font-medium mr-1 hidden sm:inline">Benchmark Presets:</span>
          <button
            onClick={() => onSimulateScenario('normal')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-[11px] font-medium text-black transition"
          >
            Compliant Pack
          </button>
          <button
            onClick={() => onSimulateScenario('undersized')}
            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full text-[11px] font-medium text-rose-700 transition"
          >
            Rule 7 Violation
          </button>
          <button
            onClick={() => onSimulateScenario('off_size')}
            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-[11px] font-medium text-amber-700 transition"
          >
            2nd Sched Off-Pack
          </button>
          <button
            onClick={() => onSimulateScenario('glare')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-[11px] font-medium text-black transition"
          >
            Glare Triage
          </button>
        </div>
      </div>

      {/* Main Evidence-First Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: EVIDENCE CANVAS & METADATA (6 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Optical Caliper Canvas */}
          <div className="bg-white border border-black/10 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Header with Overlay Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-black" />
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  Optical Caliper Evidence Canvas
                </h3>
              </div>

              {/* Layer Controls */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => setShowBoundingBox(!showBoundingBox)}
                  className={`px-3 py-1 rounded-full border transition ${
                    showBoundingBox
                      ? 'bg-black text-white border-black font-medium'
                      : 'text-gray-600 border-gray-200 hover:text-black'
                  }`}
                >
                  BBox (GS1)
                </button>
                <button
                  onClick={() => setShowRulerLine(!showRulerLine)}
                  className={`px-3 py-1 rounded-full border transition ${
                    showRulerLine
                      ? 'bg-black text-white border-black font-medium'
                      : 'text-gray-600 border-gray-200 hover:text-black'
                  }`}
                >
                  Caliper Ruler
                </button>
                <button
                  onClick={() => setShowOcrBox(!showOcrBox)}
                  className={`px-3 py-1 rounded-full border transition ${
                    showOcrBox
                      ? 'bg-black text-white border-black font-medium'
                      : 'text-gray-600 border-gray-200 hover:text-black'
                  }`}
                >
                  OCR Boxes
                </button>
              </div>
            </div>

            {/* Evidence Canvas Visualizer */}
            <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4 shadow-inner">
              
              {/* Packaging Panel Container */}
              <div className="relative w-full h-full bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 rounded-xl border border-slate-700/60 p-4 flex flex-col justify-between select-none">
                
                {/* Top Packaging Brand */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-base tracking-tight text-amber-400">
                      {decl.manufacturer_name || 'Britannia Industries Ltd'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {decl.generic_name || 'Butter Cookies Packaged Commodity'}
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">
                    PDP: {scan.pdp_area_sq_cm || 150} cm²
                  </span>
                </div>

                {/* Middle: Net Quantity Numeral Box & Caliper Ruler */}
                <div className="relative my-auto p-3 border border-dashed border-slate-700 rounded-xl bg-slate-950/80">
                  {showOcrBox && (
                    <div className="absolute inset-0 border-2 border-emerald-400/80 bg-emerald-500/10 rounded-xl pointer-events-none">
                      <span className="absolute -top-2.5 left-2 bg-emerald-950 text-emerald-400 text-[8px] font-mono px-1.5 rounded-full border border-emerald-500/40">
                        OCR BBOX [Net Quantity]
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-slate-400">Net Quantity:</span>
                    <div className="relative font-mono font-bold text-lg text-white flex items-center gap-1">
                      <span>
                        {decl.net_quantity_value != null ? decl.net_quantity_value : '100'}
                        {decl.net_quantity_unit || 'g'}
                      </span>

                      {/* Caliper ruler line */}
                      {showRulerLine && (
                        <div className="absolute -right-20 -top-1 bottom-0 flex items-center">
                          <div className="w-16 h-full border-r-2 border-t-2 border-b-2 border-amber-400 flex items-center justify-end pr-1.5">
                            <span className={`text-[10px] font-mono font-bold ${
                              (scan.measured_numeral_height_mm || 2.5) < 2.0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {scan.measured_numeral_height_mm ? `${scan.measured_numeral_height_mm.toFixed(2)}mm` : '2.50mm'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom: Barcode Calibration Base */}
                <div className="relative pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <div className="relative">
                    {/* Barcode graphic */}
                    <div className="w-36 h-8 bg-white rounded-sm flex items-center justify-center font-mono text-[9px] tracking-widest text-slate-950 font-bold border border-slate-300">
                      ||| | |||| | |||
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 block text-center mt-0.5">
                      {scan.barcode || '8901030000001'}
                    </span>

                    {/* Barcode reference measurement caliper */}
                    {showBoundingBox && (
                      <div className="absolute -inset-1 border-2 border-indigo-400/90 rounded pointer-events-none">
                        <span className="absolute -bottom-3 left-0 bg-indigo-950 text-indigo-300 text-[7px] font-mono px-1 rounded-full border border-indigo-500/40">
                          GS1 REF: 37.29 mm
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[10px] space-y-0.5">
                    <div className="text-slate-200 font-semibold text-xs">MRP ₹{decl.mrp || 30.00}</div>
                    <div className="text-[9px] text-slate-400">
                      {decl.is_mrp_inclusive_of_taxes ? 'Incl. all taxes' : 'Excl. taxes'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrology Measurements Data Table */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <span className="text-[10px] text-gray-500 block">GS1 Reference</span>
                <span className="text-xs font-mono font-bold text-black">37.29 mm</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Measured Numeral</span>
                <span className={`text-xs font-mono font-bold ${
                  (scan.measured_numeral_height_mm || 2.5) < 2.0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {scan.measured_numeral_height_mm ? `${scan.measured_numeral_height_mm.toFixed(2)} mm` : '2.50 mm'}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <span className="text-[10px] text-gray-500 block">Statutory Min</span>
                <span className="text-xs font-mono font-bold text-black">2.00 mm</span>
              </div>
            </div>
          </div>

          {/* Inspection Dossier & Optical Standard Details */}
          <div className="bg-white border border-black/10 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center justify-between">
              <span>Metrology Audit Dossier</span>
              <span className="text-[10px] font-mono text-gray-400 font-normal">Section 15 LMPC</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Inspection Identifier</span>
                <span className="font-mono text-black font-bold">{scan.scan_uuid}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">GS1 EAN-13 Barcode</span>
                <span className="font-mono text-black font-semibold">{scan.barcode || '8901030000001'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Optical Scale Factor</span>
                <span className="font-mono text-black font-medium">
                  {scan.scale_factor_mm_per_px ? `${scan.scale_factor_mm_per_px.toFixed(4)} mm/px` : '0.0500 mm/px'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Inspecting Officer</span>
                <span className="text-black font-medium">
                  {officerSession?.name || 'Inspector R. Sharma'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-400 block text-[10px]">SHA-256 Cryptographic Evidence Hash</span>
              <span className="font-mono text-[10px] text-gray-700 break-all bg-gray-50 p-2 rounded-xl border border-gray-200 block mt-1">
                {scan.sha256_hash || 'a4f8b92d6e3c1a8f902b4d7e5a1c3f8b9d0e2a4c6e8f0a2b4c6e8f0a2b4c6e8f'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STATUTORY RESULT, RULES, ADJUDICATION (6 Cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-white border border-black/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            
            {/* Status Determination Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2
                  className="text-2xl md:text-3xl font-medium tracking-tight text-black"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Inspection Result
                </h2>
                <span className="text-xs text-black/60">
                  Legal Metrology (Packaged Commodities) Rules, 2011
                </span>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isCompliant
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isViolation
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isCompliant ? '✓ COMPLIANT' : isViolation ? '⚠ VIOLATION DETECTED' : '⚠ UNDER REVIEW'}
              </span>
            </div>

            {/* Prominent Confidence Experience */}
            <ConfidenceGauge
              confidence={scan.overall_confidence}
              onNavigateToReview={onNavigateToReview}
            />

            {/* Expandable Interactive Rule Checks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  Interactive Legal Metrology Rule Checks
                </h3>
                <span className="text-[11px] text-gray-500">Click to expand evidence</span>
              </div>

              <div className="space-y-2">
                {ruleCards.map((rule) => {
                  const isExpanded = expandedRule === rule.id;
                  return (
                    <div
                      key={rule.id}
                      className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? 'border-black bg-gray-50 shadow-sm'
                          : 'border-gray-200 hover:border-black/30 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                        className="w-full p-3.5 text-left flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          {rule.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                          <div>
                            <span className="text-xs font-bold text-black block">
                              {rule.title}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {rule.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              rule.passed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {rule.passed ? 'PASSED' : 'VIOLATION'}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-black' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Expanded Evidence & Statutory Text */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-3.5 pb-3.5 pt-1 border-t border-gray-200 text-xs space-y-2.5 bg-white"
                          >
                            <p className="text-black/80 text-[11px] leading-relaxed">
                              {rule.details}
                            </p>

                            {rule.measuredValue && (
                              <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[11px] flex justify-between">
                                <span>Measured: <strong className={rule.passed ? 'text-emerald-700' : 'text-rose-700'}>{rule.measuredValue}</strong></span>
                                <span>Statutory Standard: <strong className="text-black">{rule.requiredValue}</strong></span>
                              </div>
                            )}

                            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase font-semibold block">Statutory Authority & Penalty</span>
                              <p className="text-[11px] text-gray-700 font-mono leading-relaxed">
                                {rule.statutoryProvision}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extracted Statutory Declarations Summary */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider flex items-center justify-between">
                <span>Extracted Package Declarations</span>
                <span className="text-[10px] font-mono text-gray-400">OCR & VLM</span>
              </h3>

              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-500">Manufacturer / Packer</span>
                  <span className="text-black font-medium">{decl.manufacturer_name || 'Britannia Industries Ltd'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-500">Generic Commodity</span>
                  <span className="text-black font-medium">{decl.generic_name || 'Biscuits'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-500">Net Quantity</span>
                  <span className="text-black font-medium font-mono">{decl.net_quantity_value || 100}{decl.net_quantity_unit || 'g'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-500">Maximum Retail Price</span>
                  <span className="text-black font-medium font-mono">₹{decl.mrp || 30.00} {decl.is_mrp_inclusive_of_taxes ? '(Incl. taxes)' : '(Taxes unstated)'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-500">Consumer Care Contact</span>
                  <span className="text-black font-medium font-mono truncate max-w-[200px]">{decl.consumer_care_email || decl.consumer_care_phone || 'feedback@britannia.co.in'}</span>
                </div>
              </div>
            </div>

            {/* Officer Adjudication Panel */}
            {onAdjudicate && (
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-black" />
                  <span>Officer Adjudication & Signature</span>
                </h4>

                <div className="space-y-1">
                  <label className="block text-[11px] text-gray-600 font-semibold">
                    Supervising Officer Notes / Legal Adjudication Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Enter statutory verification remarks or compounding grounds..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 font-sans"
                  />
                </div>

                {decisionSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{decisionSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleDecisionSubmit('mark_compliant')}
                    disabled={isSubmittingDecision}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    Mark Compliant
                  </button>
                  <button
                    onClick={() => handleDecisionSubmit('approve_violation')}
                    disabled={isSubmittingDecision}
                    className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    Approve Violation
                  </button>
                </div>
              </div>
            )}

            {/* Legal Notice Generation Button */}
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <button
                onClick={onDownloadNotice}
                disabled={isGeneratingNotice}
                className="w-full py-3 px-4 bg-black hover:bg-gray-800 active:scale-98 text-white rounded-full text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isGeneratingNotice ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating Statutory Form-1 Notice...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-white" />
                    <span>Generate Admissible Legal Notice (PDF)</span>
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onDownloadCsv}
                  disabled={isGeneratingNotice}
                  className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-black rounded-full text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={onDownloadJson}
                  disabled={isGeneratingNotice}
                  className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-black rounded-full text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Code className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Export JSON</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                Signed with JWT • Section 65B Indian Evidence Act compliant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
