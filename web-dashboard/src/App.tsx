import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatCard } from './components/StatCard';
import { StatutoryBadge } from './components/StatutoryBadge';
import { getDashboardMetrics, triggerSimulatedScan } from './api/client';
import { DashboardMetrics, ScanResult } from './api/types';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  FileCheck2, 
  Scan as ScanIcon, 
  Ruler, 
  Search, 
  CheckCircle2, 
  FileDown, 
  Sliders
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'adjudication' | 'review'>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDashboardMetrics().then(setMetrics);
    handleSimulate('normal');
  }, []);

  const handleSimulate = async (scenario: 'normal' | 'undersized' | 'off_size' | 'exempt') => {
    setLoading(true);
    let params = {
      barcode: "8901030000001",
      category: "biscuits",
      detected_text_height_px: 50.0, // 2.5mm -> compliant
      pdp_area_sq_cm: 150.0
    };

    if (scenario === 'undersized') {
      params = {
        barcode: "8901030000002",
        category: "biscuits",
        detected_text_height_px: 30.0, // 30 * 0.05 = 1.5mm < 2.0mm required -> Rule 7 violation
        pdp_area_sq_cm: 150.0
      };
    } else if (scenario === 'off_size') {
      params = {
        barcode: "8901030000004",
        category: "biscuits",
        detected_text_height_px: 50.0,
        pdp_area_sq_cm: 150.0
      };
    }

    try {
      const res = await triggerSimulatedScan(params);
      setCurrentScan(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Inter']">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        reviewCount={metrics?.kpis.pending_officer_review || 2}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-white">
                  Regulatory Surveillance Overview
                </h1>
                <p className="text-xs text-slate-400">
                  National Legal Metrology compliance metrics across physical retail raids & marketplace feeds
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Rules Engine v1.0.0 Online
                </span>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Inspected SKUs"
                value={metrics?.kpis.total_inspections || 148}
                subtitle="Across 24 retail categories"
                icon={<FileCheck2 className="w-5 h-5" />}
                color="blue"
              />
              <StatCard
                title="Statutory Compliance Rate"
                value={`${metrics?.kpis.compliant_rate_percent || 68.4}%`}
                subtitle="LMPC 2011 compliance"
                icon={<ShieldCheck className="w-5 h-5" />}
                color="emerald"
                trend="+3.2% this month"
              />
              <StatCard
                title="Violations Identified"
                value={metrics?.kpis.violations_detected || 42}
                subtitle="Actionable legal notices"
                icon={<AlertOctagon className="w-5 h-5" />}
                color="rose"
              />
              <StatCard
                title="Officer Review Queue"
                value={metrics?.kpis.pending_officer_review || 5}
                subtitle="Borderline (<85% confidence)"
                icon={<Clock className="w-5 h-5" />}
                color="amber"
              />
            </div>

            {/* Violations by Rule Breakdown & Top Offending Brands */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                  <span>Top Statutory Infractions Codified</span>
                  <span className="text-[10px] font-mono text-slate-500">Legal Metrology Act, 2009</span>
                </h2>
                <div className="space-y-3">
                  {metrics?.violations_by_rule.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {item.rule}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{item.description}</div>
                          <div className="text-[11px] text-slate-400">Strict liability under Section 36 of Legal Metrology Act</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-rose-400 font-mono">{item.count}</span>
                        <span className="text-[10px] text-slate-500 block">violations</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Repeat Offender Watchlist
                </h2>
                <div className="space-y-3">
                  {metrics?.top_non_compliant_brands.map((b, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{b.brand}</div>
                        <div className="text-xs text-slate-400">{b.violations} statutory notices issued</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        b.risk_score === 'High'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {b.risk_score} Risk
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Adjudication Workspace */}
        {activeTab === 'adjudication' && (
          <div className="space-y-6">
            {/* Simulation Controller for Judge Demo */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">Live Evaluation Controller</span>
                <span className="text-xs text-slate-400">Trigger test packages to demonstrate optical metrology & rules enforcement</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulate('normal')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                >
                  Compliant Biscuit (100g)
                </button>
                <button
                  onClick={() => handleSimulate('undersized')}
                  className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg text-xs font-medium border border-rose-500/30 transition"
                >
                  Undersized Font (Rule 7)
                </button>
                <button
                  onClick={() => handleSimulate('off_size')}
                  className="px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded-lg text-xs font-medium border border-amber-500/30 transition"
                >
                  Off-Size Pack (2nd Sched)
                </button>
              </div>
            </div>

            {currentScan && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Optical Metrology & Barcode Ruler */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-blue-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Barcode-as-Ruler Optical Metrology
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-slate-400">GS1 EAN-13 Calibrated</span>
                  </div>

                  {/* Simulated Image Display with Caliper Overlay */}
                  <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
                    <div className="w-64 h-40 bg-slate-900 border-2 border-dashed border-blue-500/40 rounded-lg flex flex-col items-center justify-center p-3 relative">
                      <span className="text-[10px] text-slate-400 uppercase font-mono mb-1">Detected Packaging Bounding Box</span>
                      <div className="bg-slate-800/80 px-3 py-1 rounded text-center border border-slate-700">
                        <span className="text-xs font-bold text-white block">BRITANNIA GOOD DAY</span>
                        <span className="text-[11px] font-mono text-amber-400">Net Qty: 100g</span>
                      </div>
                      <div className="mt-3 w-36 h-10 bg-white rounded flex items-center justify-center text-slate-900 font-mono text-[9px] font-bold border-2 border-blue-500">
                        ||| | |||| | ||| || {currentScan.barcode}
                      </div>
                      {/* Caliper Annotations */}
                      <div className="absolute -top-2 right-2 bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                        1 px = {currentScan.scale_factor_mm_per_px?.toFixed(3)} mm
                      </div>
                    </div>
                  </div>

                  {/* Calibration Metrics Table */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">GS1 Standard Width</span>
                      <span className="text-xs font-mono font-bold text-slate-200">37.29 mm</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Measured Numeral</span>
                      <span className={`text-xs font-mono font-bold ${
                        (currentScan.measured_numeral_height_mm || 0) < 2.0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {currentScan.measured_numeral_height_mm?.toFixed(2)} mm
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Statutory Min (Table I)</span>
                      <span className="text-xs font-mono font-bold text-amber-400">2.00 mm</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Statutory Rule Citations & Admissible Result */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Statutory Determination
                      </h2>
                      <span className="text-[10px] text-slate-400 font-mono">Scan ID: {currentScan.scan_uuid}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                      currentScan.status === 'compliant'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {currentScan.status}
                    </span>
                  </div>

                  {/* Violations List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Recorded Statutory Findings
                    </h3>
                    {currentScan.violations.length === 0 ? (
                      <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>All mandatory declarations, font heights (Rule 7), and standard pack sizes compliant.</span>
                      </div>
                    ) : (
                      currentScan.violations.map((v, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1">
                          <div className="flex items-center justify-between">
                            <StatutoryBadge citation={v.citation} severity={v.severity} />
                            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">{v.severity}</span>
                          </div>
                          <p className="text-xs text-slate-200 mt-1">{v.violation_text}</p>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            Measured: <strong className="text-rose-300">{v.measured_value}</strong> | Required: <strong className="text-emerald-300">{v.required_value}</strong>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Legal Evidence Export */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-slate-500">
                      SHA-256: {currentScan.sha256_hash?.slice(0, 16)}...
                    </div>
                    <a
                      href={`http://localhost:8000/api/v1/reports/${currentScan.scan_uuid}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Generate Admissible Notice
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Review Queue */}
        {activeTab === 'review' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-lg font-bold text-white">Officer Triage & Adjudication Queue</h1>
                <p className="text-xs text-slate-400">
                  Borderline confidence scans (&lt;85%) intercepted before automated penalty issuance
                </p>
              </div>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
                2 Pending Reviews
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-400 font-bold">PRM-GLARE-88</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Specular Glare on Barcode</span>
                  </div>
                  <div className="text-xs text-slate-400">Barcode: 8901030048123 • Confidence: 74%</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded">Inspect Calipers</button>
                  <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded font-medium">Mark Verified</button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-400 font-bold">PRM-CYL-42</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Cylindrical Distortion on Shampoo Bottle</span>
                  </div>
                  <div className="text-xs text-slate-400">Barcode: 8901030099411 • Confidence: 78%</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded">Dewarp View</button>
                  <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs text-white rounded font-medium">Mark Verified</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
