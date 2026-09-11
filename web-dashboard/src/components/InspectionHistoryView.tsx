import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Search, 
  Eye, 
  Plus, 
  FileDown, 
  FileSpreadsheet, 
  Code, 
  Loader2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { RecentScanSummary, RepositoryScanItem } from '../api/types';
import { searchScans, downloadNoticePdf, downloadReportCsv, downloadReportJson } from '../api/client';

interface InspectionHistoryViewProps {
  scans: RecentScanSummary[];
  onSelectScan: (scan: any) => void;
  onOpenNewInspection: () => void;
  onError?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
}

export const InspectionHistoryView: React.FC<InspectionHistoryViewProps> = ({
  scans: fallbackScans,
  onSelectScan,
  onOpenNewInspection,
  onError,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'compliant' | 'violation' | 'under_review'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [dbScans, setDbScans] = useState<RepositoryScanItem[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchDbScans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchScans({
        q: searchTerm.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit,
      });
      setDbScans(res.scans);
      setTotalCount(res.total);
      setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDbScans();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchDbScans]);

  const handleDownload = async (uuid: string, type: 'pdf' | 'csv' | 'json') => {
    setDownloadingId(`${uuid}-${type}`);
    try {
      if (type === 'pdf') await downloadNoticePdf(uuid);
      else if (type === 'csv') await downloadReportCsv(uuid);
      else if (type === 'json') await downloadReportJson(uuid);
      onSuccess?.(`Downloaded ${type.toUpperCase()} report for ${uuid}`);
    } catch (e: any) {
      onError?.(e?.message || `Failed to download ${type.toUpperCase()}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // If backend search fails, use fallback in-memory search
  const displayedItems: Array<RecentScanSummary | RepositoryScanItem> = isBackendConnected
    ? dbScans
    : fallbackScans.filter((s) => {
        const matchesSearch =
          s.scan_uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.manufacturer && s.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.barcode && s.barcode.includes(searchTerm));
        const matchesStatus =
          statusFilter === 'all' ? true : s.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
      });

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gray-100 text-black border border-gray-200">
              <History className="w-5 h-5" />
            </span>
            <h2
              className="text-2xl md:text-3xl font-medium tracking-tight text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Historical Inspection Archive & Repository
            </h2>
          </div>
          <p className="text-xs text-black/60">
            Searchable legal metrology repository under LMPC Rules, 2011 with optical caliper audit trails and multi-format exports.
          </p>
        </div>

        <button
          onClick={onOpenNewInspection}
          className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by UUID, Product, Manufacturer, Barcode..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-full text-xs">
          {[
            { id: 'all', label: 'All Scans' },
            { id: 'compliant', label: 'Compliant' },
            { id: 'violation', label: 'Violations' },
            { id: 'under_review', label: 'Under Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id as any);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                statusFilter === tab.id
                  ? 'bg-black text-white font-semibold shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-gray-50 rounded-3xl border border-gray-200">
          <Loader2 className="w-6 h-6 text-black animate-spin" />
          <span className="text-xs text-black/60 font-medium">Querying Statutory Scan Repository...</span>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-gray-50 rounded-3xl border border-gray-200">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-black border border-gray-200 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-medium text-black">No Records Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            No inspection records match the current search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Scan UUID</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Product / Brand</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">GS1 Barcode</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Confidence</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Determination</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Time</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions & Exports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {displayedItems.map((scan) => {
                const isCompliant = scan.status === 'compliant';
                const isViolation = scan.status === 'violation';

                return (
                  <tr key={scan.scan_uuid} className="hover:bg-gray-50/80 transition group">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">
                      {scan.scan_uuid}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-black">{scan.product}</div>
                      {scan.manufacturer && (
                        <div className="text-[11px] text-gray-400">{scan.manufacturer}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {scan.barcode || '8901030000001'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className={scan.confidence >= 0.85 ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                        {Math.round(scan.confidence * 100)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isCompliant
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isViolation
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCompliant ? 'bg-emerald-500' : isViolation ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{scan.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                      {scan.time || '10:14:22'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectScan(scan)}
                          title="Inspect Evidence in 3D / Metrology Workspace"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white hover:bg-gray-800 font-semibold rounded-full transition text-[11px] shadow-sm"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => handleDownload(scan.scan_uuid, 'pdf')}
                          disabled={downloadingId === `${scan.scan_uuid}-pdf`}
                          title="Generate Statutory PDF Notice"
                          className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition border border-gray-200"
                        >
                          {downloadingId === `${scan.scan_uuid}-pdf` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 text-rose-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(scan.scan_uuid, 'csv')}
                          disabled={downloadingId === `${scan.scan_uuid}-csv`}
                          title="Export CSV Report"
                          className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition border border-gray-200"
                        >
                          {downloadingId === `${scan.scan_uuid}-csv` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(scan.scan_uuid, 'json')}
                          disabled={downloadingId === `${scan.scan_uuid}-json`}
                          title="Export JSON Metadata"
                          className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition border border-gray-200"
                        >
                          {downloadingId === `${scan.scan_uuid}-json` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Code className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {isBackendConnected && totalCount > limit && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
          <div>
            Showing <span className="font-semibold text-black">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-black">{Math.min(page * limit, totalCount)}</span> of{' '}
            <span className="font-semibold text-black">{totalCount}</span> inspections
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
