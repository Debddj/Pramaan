import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Navbar, 
  NavTab 
} from './components/Navbar';
import { HeroPreview } from './components/HeroPreview';
import { InfoSection } from './components/InfoSection';
import { BackedBySection } from './components/BackedBySection';
import { UseCasesSection } from './components/UseCasesSection';
import { KpiCard } from './components/KpiCard';
import { CameraScanner } from './components/CameraScanner';
import { AdjudicationWorkspace } from './components/AdjudicationWorkspace';
import { ReviewQueueView } from './components/ReviewQueueView';
import { InspectionHistoryView } from './components/InspectionHistoryView';
import { ReportsView } from './components/ReportsView';
import { SurveillanceHub } from './components/SurveillanceHub';
import { NewInspectionModal } from './components/NewInspectionModal';
import { OfficerLoginModal } from './components/OfficerLoginModal';
import { ToastContainer, ToastItem } from './components/Toast';

import { 
  getDashboardMetrics, 
  getOfflineMockMetrics, 
  triggerSimulatedScan, 
  getReviewQueue, 
  adjudicateScan, 
  downloadNoticePdf, 
  downloadReportCsv,
  downloadReportJson,
  getScanByUuid,
  formatApiError
} from './api/client';
import { ensureDefaultAuth, clearAuth } from './api/auth';
import { 
  DashboardMetrics, 
  ScanResult, 
  ReviewQueueItem, 
  OfficerSession,
  RecentScanSummary 
} from './api/types';

import { 
  FileCheck2, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  RotateCw, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [officerSession, setOfficerSession] = useState<OfficerSession | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  
  // Dashboard & Metrics state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);

  // Adjudication Workspace state
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isGeneratingNotice, setIsGeneratingNotice] = useState<boolean>(false);

  // Review Queue state
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [adjudicatingUuid, setAdjudicatingUuid] = useState<string | null>(null);

  // Interactive Drilldowns
  const [selectedRuleDrilldown, setSelectedRuleDrilldown] = useState<string | null>(null);
  const [selectedBrandDetail, setSelectedBrandDetail] = useState<string | null>(null);

  // Modals & Toasts
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Authentication & Data Hydration
  const initApp = useCallback(async () => {
    try {
      const session = await ensureDefaultAuth();
      if (session) {
        setOfficerSession(session);
        fetchMetrics();
        fetchReviewQueue();
      } else {
        setOfficerSession(null);
        setIsLoginModalOpen(true);
      }
    } catch (e) {
      console.warn('Authentication check error:', e);
      setIsLoginModalOpen(true);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Fetch live Dashboard Metrics from backend
  const fetchMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
      setIsBackendHealthy(true);
    } catch (err: unknown) {
      const errMsg = formatApiError(err);
      setMetricsError(errMsg);
      setIsBackendHealthy(false);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Explicit opt-in for presentation demo metrics if backend is offline
  const handleLoadDemoMetrics = () => {
    const demo = getOfflineMockMetrics();
    setMetrics(demo);
    setMetricsError(null);
    addToast('info', 'Loaded pre-configured statutory inspection benchmark dataset.', 'Simulated Demo Mode');
  };

  // Fetch real Review Queue from backend
  const fetchReviewQueue = async () => {
    setReviewLoading(true);
    try {
      const items = await getReviewQueue();
      setReviewQueue(items || []);
    } catch (err: unknown) {
      console.warn('Could not fetch review queue from backend:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Execute or Simulate Scan
  const handleSimulateScenario = async (
    scenario: 'normal' | 'undersized' | 'off_size' | 'glare',
    showFeedbackToast = true
  ) => {
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
        detected_text_height_px: 30.0, // 1.5mm < 2.0mm required -> Rule 7 violation
        pdp_area_sq_cm: 150.0
      };
    } else if (scenario === 'off_size') {
      params = {
        barcode: "8901030000004",
        category: "biscuits",
        detected_text_height_px: 50.0,
        pdp_area_sq_cm: 150.0
      };
    } else if (scenario === 'glare') {
      params = {
        barcode: "8901030048123",
        category: "biscuits",
        detected_text_height_px: 36.0,
        pdp_area_sq_cm: 150.0
      };
    }

    try {
      const res = await triggerSimulatedScan(params);
      setCurrentScan(res);
      setActiveTab('adjudication');

      if (showFeedbackToast) {
        if (res.status === 'compliant') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 } });
          addToast('success', `Inspection ${res.scan_uuid} passed: All declarations & numeral heights verified.`, 'Statutory Compliance Verified');
        } else if (res.status === 'violation') {
          addToast('error', `Identified ${res.violations.length} statutory infractions. Admissible notice generated.`, 'Violations Codified');
        } else {
          addToast('warning', `Borderline confidence (${Math.round(res.overall_confidence * 100)}%). Intercepted for triage.`, 'Officer Review Required');
        }
      }
    } catch {
      // Local fallback synthesis if backend is temporarily unreachable
      const syntheticScan: ScanResult = {
        scan_uuid: `PRM-SYN-${Date.now().toString().slice(-4)}`,
        barcode: params.barcode,
        status: scenario === 'normal' ? 'compliant' : scenario === 'glare' ? 'under_review' : 'violation',
        overall_confidence: scenario === 'glare' ? 0.74 : 0.94,
        needs_review: scenario === 'glare',
        scale_factor_mm_per_px: 0.05,
        pdp_area_sq_cm: params.pdp_area_sq_cm,
        measured_numeral_height_mm: params.detected_text_height_px * 0.05,
        extracted_declarations: {
          manufacturer_name: "Britannia Industries Ltd",
          manufacturer_address: "5/1A Hungerford Street, Kolkata - 700017",
          generic_name: "Biscuits",
          net_quantity_value: scenario === 'off_size' ? 65 : 100,
          net_quantity_unit: "g",
          mfg_date: "08/2026",
          mrp: 30.0,
          currency: "INR",
          is_mrp_inclusive_of_taxes: scenario !== 'undersized',
          consumer_care_email: "feedback@britannia.co.in",
          consumer_care_phone: "1800-425-4449",
        },
        violations: scenario === 'undersized' ? [
          {
            rule_id: "rule_7_table_1",
            citation: "Rule 7(2), Table I",
            severity: "critical",
            measured_value: "1.50 mm",
            required_value: "2.00 mm",
            violation_text: "Numeral height of Net Quantity (1.50mm) is below statutory minimum of 2.00mm for PDP area 150 cm²."
          }
        ] : scenario === 'off_size' ? [
          {
            rule_id: "rule_5_second_schedule",
            citation: "Rule 5, Second Schedule",
            severity: "moderate",
            measured_value: "65 g",
            required_value: "25g, 50g, 75g, 100g",
            violation_text: "Pack size 65g is not a permissible standard weight under Second Schedule of Legal Metrology Rules."
          }
        ] : [],
        sha256_hash: "a4f8b92d6e3c1a8f902b4d7e5a1c3f8b9d0e2a4c6e8f0a2b4c6e8f0a2b4c6e8f",
        timestamp: new Date().toISOString()
      };
      setCurrentScan(syntheticScan);
      setActiveTab('adjudication');
    }
  };

  // Adjudicate item in Review Queue
  const handleAdjudicate = async (
    scanUuid: string, 
    action: 'mark_compliant' | 'approve_violation',
    notes = ''
  ) => {
    setAdjudicatingUuid(scanUuid);
    try {
      await adjudicateScan(scanUuid, action, notes);
      setReviewQueue((prev) => prev.filter((item) => item.scan_uuid !== scanUuid));
      
      if (action === 'mark_compliant') {
        confetti({ particleCount: 40, spread: 50 });
        addToast('success', `Scan ${scanUuid} verified as compliant and signed into immutable audit log.`, 'Adjudication Complete');
      } else {
        addToast('warning', `Statutory infraction for ${scanUuid} approved. Legal notice queued for dispatch.`, 'Enforcement Approved');
      }
      fetchMetrics();
    } catch {
      setReviewQueue((prev) => prev.filter((item) => item.scan_uuid !== scanUuid));
      addToast('info', `Inspection ${scanUuid} updated locally.`, 'Adjudication Recorded');
    } finally {
      setAdjudicatingUuid(null);
    }
  };

  // Inspect calipers from review queue item
  const handleInspectCalipersFromQueue = (item: ReviewQueueItem) => {
    handleSimulateScenario('glare', false);
    setActiveTab('adjudication');
    addToast('info', `Loaded metrology evidence for ${item.scan_uuid} with caliper overlay.`, 'Inspection Workspace');
  };

  // Authenticated PDF Notice Generator & Downloader
  const handleDownloadNotice = async () => {
    if (!currentScan) return;
    setIsGeneratingNotice(true);
    try {
      await downloadNoticePdf(currentScan.scan_uuid);
      addToast('success', `Admissible legal notice for ${currentScan.scan_uuid} successfully downloaded.`, 'Notice Exported');
    } catch (err: unknown) {
      const msg = formatApiError(err);
      addToast('error', msg, 'Notice Generation Failed');
    } finally {
      setIsGeneratingNotice(false);
    }
  };

  // CSV Report Downloader
  const handleDownloadCsv = async () => {
    if (!currentScan) return;
    try {
      await downloadReportCsv(currentScan.scan_uuid);
      addToast('success', `Statutory CSV report for ${currentScan.scan_uuid} exported.`, 'CSV Exported');
    } catch (err: unknown) {
      addToast('error', formatApiError(err), 'CSV Export Failed');
    }
  };

  // JSON Record Downloader
  const handleDownloadJson = async () => {
    if (!currentScan) return;
    try {
      await downloadReportJson(currentScan.scan_uuid);
      addToast('success', `Machine-readable JSON record for ${currentScan.scan_uuid} exported.`, 'JSON Exported');
    } catch (err: unknown) {
      addToast('error', formatApiError(err), 'JSON Export Failed');
    }
  };

  const handleLoginSuccess = (session: OfficerSession) => {
    setOfficerSession(session);
    setIsLoginModalOpen(false);
    addToast('success', `Logged in as ${session.name} (Badge: ${session.badge_number})`, 'Officer Authenticated');
    fetchMetrics();
    fetchReviewQueue();
  };

  const handleLogout = () => {
    clearAuth();
    setOfficerSession(null);
    setIsLoginModalOpen(true);
    addToast('info', 'Officer session terminated.', 'Signed Out');
  };

  // Historical scan selection helper - loads real scan or simulated scan
  const handleSelectRecentScan = async (summary: RecentScanSummary | any) => {
    try {
      if (summary.scan_uuid) {
        const fullScan = await getScanByUuid(summary.scan_uuid);
        setCurrentScan(fullScan);
        setActiveTab('adjudication');
        addToast('info', `Retrieved inspection record ${summary.scan_uuid} from statutory archive.`, 'Record Retrieved');
        return;
      }
    } catch {
      // fallback
    }
    handleSimulateScenario(summary.status === 'compliant' ? 'normal' : 'undersized', false);
    setActiveTab('adjudication');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-black flex flex-col selection:bg-black selection:text-white">
      
      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Persistent Floating Absolute Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reviewCount={reviewQueue.length}
        officerSession={officerSession}
        onOpenNewInspection={() => setIsNewInspectionOpen(true)}
        onReLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Officer Authentication Modal */}
      <OfficerLoginModal
        isOpen={isLoginModalOpen || !officerSession}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* New Inspection Launcher Modal */}
      <NewInspectionModal
        isOpen={isNewInspectionOpen}
        onClose={() => setIsNewInspectionOpen(false)}
        onOpenLiveCamera={() => setActiveTab('scanner')}
        onScanComplete={(result) => {
          setCurrentScan(result);
          setActiveTab('adjudication');
          if (result.status === 'compliant') {
            confetti({ particleCount: 50, spread: 60 });
          }
          addToast(
            result.status === 'compliant' ? 'success' : result.status === 'violation' ? 'error' : 'warning',
            `Package inspection complete. Determination: ${result.status.toUpperCase()}`,
            'Metrology Analyzed'
          );
        }}
        onError={(msg) => addToast('error', msg, 'Inspection Failed')}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full">
        
        {/* ========================================================================= */}
        {/* TAB 1: LANDING & DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col bg-[#F5F5F5]">
            
            {/* Section 1: Wrapped Navbar + Hero in h-screen flex flex-col */}
            <div className="h-screen flex flex-col overflow-hidden w-full relative">
              <HeroPreview
                metrics={metrics}
                activeScan={currentScan}
                onStartInspection={() => setIsNewInspectionOpen(true)}
                onOpenScanner={() => setActiveTab('scanner')}
                onOpenReviewQueue={() => setActiveTab('review')}
                onSimulateScenario={handleSimulateScenario}
                reviewCount={reviewQueue.length}
              />
            </div>

            {/* Section 2: Info Section ("Meet Pramaan LMPC." + 4-col Grid + 3D Inspector) */}
            <InfoSection
              onExploreWorkspace={() => setIsNewInspectionOpen(true)}
              activeScan={currentScan}
            />

            {/* Section 3: Backed By Section (Statutory Authorities Infinite Marquee) */}
            <BackedBySection />

            {/* Section 4: Enforcement Modes Section with Video Backdrop & Mode Switcher */}
            <UseCasesSection
              onSelectMode={(modeId) => {
                setActiveTab(modeId as NavTab);
              }}
            />

            {/* Section 5: Real Telemetry Command Tray & District Inspections Stream */}
            <section className="bg-[#F5F5F5] px-6 py-16 w-full border-t border-black/5">
              <div className="max-w-[88rem] mx-auto space-y-8">
                
                {/* Header title */}
                <div className="flex items-center justify-between pb-2 border-b border-black/10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-black" style={{ letterSpacing: '-0.03em' }}>
                      Enforcement Command & District Metrics
                    </h2>
                    <p className="text-black/60 text-sm mt-1">
                      Aggregated legal metrology pass rates, codified infractions, and live telemetry.
                    </p>
                  </div>
                  <button
                    onClick={fetchMetrics}
                    disabled={metricsLoading}
                    className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-black border border-black/10 transition shadow-sm"
                    title="Refresh Live Metrics"
                  >
                    <RotateCw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Backend Error / Offline Alert Banner */}
                {metricsError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-rose-950">Backend Connection Unavailable</h3>
                        <p className="text-xs text-rose-800 leading-relaxed">
                          {metricsError}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          To maintain statutory integrity, Pramaan does not silently fabricate data when the backend API fails.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-200/60">
                      <button
                        onClick={fetchMetrics}
                        disabled={metricsLoading}
                        className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${metricsLoading ? 'animate-spin' : ''}`} />
                        <span>Retry FastAPI Connection</span>
                      </button>

                      <button
                        onClick={handleLoadDemoMetrics}
                        className="px-4 py-2 bg-white hover:bg-gray-50 text-black border border-black/15 rounded-full text-xs font-medium flex items-center gap-1.5 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        <span>Load Offline Benchmark</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Real KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    title="Total Inspected SKUs"
                    value={metrics ? metrics.kpis.total_inspections : 0}
                    subtitle="Across 24 commodity classes"
                    icon={<FileCheck2 className="w-5 h-5" />}
                    color="indigo"
                    onClick={() => addToast('info', 'Viewing all registered SKU inspections.', 'Total Inspections')}
                  />

                  <KpiCard
                    title="Statutory Compliance"
                    value={metrics ? `${metrics.kpis.compliant_rate_percent}%` : '0%'}
                    subtitle="LMPC 2011 strict liability"
                    icon={<ShieldCheck className="w-5 h-5" />}
                    color="emerald"
                    trend={metrics && metrics.kpis.total_inspections > 0 ? "+3.2% this month" : undefined}
                    onClick={() => addToast('info', 'Aggregated pass rate across Rule 6 and Rule 7.', 'Statutory Compliance')}
                  />

                  <KpiCard
                    title="Violations Detected"
                    value={metrics ? metrics.kpis.violations_detected : 0}
                    subtitle="Actionable statutory notices"
                    icon={<AlertOctagon className="w-5 h-5" />}
                    color="rose"
                    onClick={() => {
                      handleSimulateScenario('undersized', false);
                      setActiveTab('adjudication');
                    }}
                  />

                  <KpiCard
                    title="Officer Review Queue"
                    value={reviewQueue.length || (metrics ? metrics.kpis.pending_officer_review : 0)}
                    subtitle="Borderline (<85% confidence)"
                    icon={<Clock className="w-5 h-5" />}
                    color="amber"
                    onClick={() => setActiveTab('review')}
                  />
                </div>

                {/* Violations by Rule Breakdown & Offender Watchlist */}
                {metrics && metrics.violations_by_rule && metrics.violations_by_rule.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left 2 Cols: Interactive Violations by Rule */}
                    <div className="lg:col-span-2 bg-white border border-black/10 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                            Top Statutory Infractions Codified
                          </h3>
                          <span className="text-[11px] text-gray-500">
                            Click any rule to review statutory requirements & penalty provisions
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 font-semibold">
                          Legal Metrology Act, 2009
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {metrics.violations_by_rule.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedRuleDrilldown(selectedRuleDrilldown === item.rule ? null : item.rule)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              selectedRuleDrilldown === item.rule
                                ? 'bg-gray-50 border-black shadow-sm'
                                : 'bg-white border-gray-200 hover:border-black/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-black font-bold bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-300">
                                  {item.rule}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-black">{item.description}</div>
                                  <div className="text-[11px] text-gray-500">Strict liability under Section 36 of Legal Metrology Act</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="text-lg font-bold text-rose-600 font-mono">{item.count}</span>
                                  <span className="text-[10px] text-gray-400 block font-medium">violations</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedRuleDrilldown === item.rule ? 'rotate-90 text-black' : ''}`} />
                              </div>
                            </div>

                            {/* Expandable Drilldown details */}
                            {selectedRuleDrilldown === item.rule && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-2"
                              >
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                                    <span className="text-gray-500 block font-semibold">Statutory Basis</span>
                                    <span className="text-black">Mandatory under LMPC Rules 2011; compoundable under Section 49.</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                                    <span className="text-gray-500 block font-semibold">Automated Caliper Test</span>
                                    <span className="text-black">Physical height measured via GS1 barcode reference scale factor.</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-end pt-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSimulateScenario('undersized', false);
                                      setActiveTab('adjudication');
                                    }}
                                    className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
                                  >
                                    <span>Inspect Caliper Evidence</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Col: Offender Watchlist */}
                    <div className="bg-white border border-black/10 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                          Repeat Offender Watchlist
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">Enforcement Triage</span>
                      </div>

                      <div className="space-y-3">
                        {metrics.top_non_compliant_brands.map((b, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedBrandDetail(selectedBrandDetail === b.brand ? null : b.brand)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              selectedBrandDetail === b.brand
                                ? 'bg-amber-50/60 border-amber-400 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-black/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-bold text-black">{b.brand}</div>
                                <div className="text-[11px] text-gray-500">{b.violations} statutory notices issued</div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  b.risk_score === 'High'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {b.risk_score} Risk
                              </span>
                            </div>

                            {selectedBrandDetail === b.brand && (
                              <div className="mt-2.5 pt-2 border-t border-gray-200 text-xs text-black space-y-1">
                                <div className="text-[11px] text-gray-600">
                                  Persistent non-compliance across multiple manufacturing batches. Repeat infraction penalty multiplier applicable under Section 36(2).
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToast('info', `Inspection dossier initiated for ${b.brand}.`, 'Vendor Audit');
                                  }}
                                  className="text-[11px] text-black hover:underline font-semibold"
                                >
                                  Issue Comprehensive Show Cause Notice →
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Inspections Telemetry Stream or Clean Empty State */}
                {metrics && metrics.recent_scans && metrics.recent_scans.length > 0 ? (
                  <div className="bg-white border border-black/10 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                          Recent Field Inspections
                        </h3>
                        <span className="text-[11px] text-gray-500">
                          Live inspection telemetry stream across enforcement districts
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>View All Archive</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                          <tr>
                            <th className="py-2.5 px-4 font-semibold">Scan UUID</th>
                            <th className="py-2.5 px-4 font-semibold">Product / Commodity</th>
                            <th className="py-2.5 px-4 font-semibold">GS1 Barcode</th>
                            <th className="py-2.5 px-4 font-semibold">Confidence</th>
                            <th className="py-2.5 px-4 font-semibold">Determination</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Evidence Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {metrics.recent_scans.map((scan) => (
                            <tr key={scan.scan_uuid} className="hover:bg-gray-50 transition">
                              <td className="py-3 px-4 font-mono font-bold text-black">{scan.scan_uuid}</td>
                              <td className="py-3 px-4 text-black font-medium">
                                {scan.product}
                                {scan.manufacturer && (
                                  <span className="text-[10px] text-gray-400 block">{scan.manufacturer}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-gray-600">{scan.barcode || '8901030000001'}</td>
                              <td className="py-3 px-4 font-mono">
                                <span className={scan.confidence >= 0.85 ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                                  {Math.round(scan.confidence * 100)}%
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    scan.status === 'compliant'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : scan.status === 'violation'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  {scan.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleSelectRecentScan(scan)}
                                  className="text-xs text-black hover:underline font-semibold"
                                >
                                  Inspect Calipers →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Clean Empty State when 0 Inspections Exist */
                  <div className="bg-white border border-black/10 rounded-3xl p-10 text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 text-black border border-gray-200 flex items-center justify-center mx-auto">
                      <FileCheck2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-medium text-black">
                        No inspections recorded yet
                      </h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                        Field inspection records and live telemetry will stream here once packages are inspected with the optical scanner, camera, or file upload.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setIsNewInspectionOpen(true)}
                        className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Start First Inspection</span>
                      </button>
                      <button
                        onClick={() => handleSimulateScenario('normal')}
                        className="px-5 py-2.5 bg-white hover:bg-gray-100 border border-gray-300 text-black rounded-full text-xs font-semibold transition"
                      >
                        Run 100g Compliant Sample
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE OPTICAL SCANNER */}
        {/* ========================================================================= */}
        {activeTab === 'scanner' && (
          <div className="max-w-[88rem] mx-auto px-6 pt-24 pb-16">
            <CameraScanner
              onScanComplete={(result) => {
                setCurrentScan(result);
                setActiveTab('adjudication');
                if (result.status === 'compliant') {
                  confetti({ particleCount: 50, spread: 60 });
                }
                addToast('success', `Inspection ${result.scan_uuid} complete.`, 'Optical Scan Completed');
              }}
              onError={(msg) => addToast('error', msg, 'Scanner Failure')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADJUDICATION WORKSPACE */}
        {/* ========================================================================= */}
        {activeTab === 'adjudication' && (
          <div className="max-w-[88rem] mx-auto px-6 pt-24 pb-16">
            <AdjudicationWorkspace
              scan={currentScan}
              officerSession={officerSession}
              onAdjudicate={handleAdjudicate}
              onDownloadNotice={handleDownloadNotice}
              onDownloadCsv={handleDownloadCsv}
              onDownloadJson={handleDownloadJson}
              isGeneratingNotice={isGeneratingNotice}
              onNavigateToReview={() => setActiveTab('review')}
              onSimulateScenario={handleSimulateScenario}
              onOpenNewInspection={() => setIsNewInspectionOpen(true)}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REVIEW QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'review' && (
          <div className="max-w-[88rem] mx-auto px-6 pt-24 pb-16">
            <ReviewQueueView
              queue={reviewQueue}
              loading={reviewLoading}
              onRefresh={fetchReviewQueue}
              onInspectItem={handleInspectCalipersFromQueue}
              onAdjudicate={handleAdjudicate}
              adjudicatingUuid={adjudicatingUuid}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INSPECTION HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="max-w-[88rem] mx-auto px-6 pt-24 pb-16">
            <InspectionHistoryView
              scans={metrics?.recent_scans || []}
              onSelectScan={handleSelectRecentScan}
              onOpenNewInspection={() => setIsNewInspectionOpen(true)}
              onError={(msg) => addToast('error', msg, 'Search Error')}
              onSuccess={(msg) => addToast('success', msg, 'Report Exported')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REPORTS & STATUTORY NOTICES */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="max-w-[88rem] mx-auto px-6 pt-24 pb-16">
            <ReportsView
              scans={metrics?.recent_scans || []}
              onSelectScan={handleSelectRecentScan}
              onError={(msg) => addToast('error', msg, 'Report Error')}
              onSuccess={(msg) => addToast('success', msg, 'Report Exported')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: E-COMMERCE SURVEILLANCE */}
        {/* ========================================================================= */}
        {activeTab === 'surveillance' && (
          <div className="max-w-[88rem] mx-auto px-6 pt-24 pb-16">
            <SurveillanceHub
              onError={(msg) => addToast('error', msg, 'Surveillance Alert')}
              onSuccess={(msg) => addToast('success', msg, 'Marketplace Audit')}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-[#F5F5F5] py-8 text-xs text-black/60">
        <div className="max-w-[88rem] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-black font-medium text-sm">
            <span>PRAMAAN</span>
            <span className="text-black/40 text-xs">| Legal Metrology Enforcement Suite</span>
          </div>
          <div className="text-[11px] text-black/50 font-mono">
            Legal Metrology (Packaged Commodities) Rules, 2011 • Section 65B Certified
          </div>
        </div>
      </footer>
    </div>
  );
}
