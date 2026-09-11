import React, { useState } from 'react';
import { 
  FileText, 
  FileDown, 
  FileSpreadsheet,
  Code,
  Loader2, 
  ShieldCheck
} from 'lucide-react';
import { downloadNoticePdf, downloadReportCsv, downloadReportJson } from '../api/client';
import { RecentScanSummary } from '../api/types';

interface ReportsViewProps {
  scans: RecentScanSummary[];
  onSelectScan: (scan: RecentScanSummary) => void;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  scans,
  onSelectScan,
  onError,
  onSuccess,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [customUuid, setCustomUuid] = useState<string>('');

  const handleDownload = async (scanUuid: string, type: 'pdf' | 'csv' | 'json') => {
    setDownloadingId(`${scanUuid}-${type}`);
    try {
      if (type === 'pdf') {
        await downloadNoticePdf(scanUuid);
        onSuccess(`Statutory Notice Form-1 for ${scanUuid} downloaded successfully.`);
      } else if (type === 'csv') {
        await downloadReportCsv(scanUuid);
        onSuccess(`Statutory CSV Report for ${scanUuid} downloaded successfully.`);
      } else if (type === 'json') {
        await downloadReportJson(scanUuid);
        onSuccess(`Machine-readable JSON record for ${scanUuid} downloaded successfully.`);
      }
    } catch (err: any) {
      onError(err?.message || `Failed to export ${type.toUpperCase()} for ${scanUuid}.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gray-100 text-black border border-gray-200">
              <FileText className="w-5 h-5" />
            </span>
            <h2
              className="text-2xl md:text-3xl font-medium tracking-tight text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Statutory Reports & Evidentiary Exports
            </h2>
          </div>
          <p className="text-xs text-black/60">
            Admissible certificates, Form-1 enforcement notices, and editable CSV/JSON audits under Section 65B of Indian Evidence Act
          </p>
        </div>
      </div>

      {/* Manual Notice Generator by UUID */}
      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
          Direct Notice Lookup & Export
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Enter Scan UUID (e.g. PRM-DEMO-001)..."
            value={customUuid}
            onChange={(e) => setCustomUuid(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 font-mono flex-1 max-w-sm"
          />
          <button
            onClick={() => customUuid.trim() && handleDownload(customUuid.trim(), 'pdf')}
            disabled={!customUuid.trim() || downloadingId === `${customUuid.trim()}-pdf`}
            className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {downloadingId === `${customUuid.trim()}-pdf` ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Generate PDF</span>
          </button>
          <button
            onClick={() => customUuid.trim() && handleDownload(customUuid.trim(), 'csv')}
            disabled={!customUuid.trim() || downloadingId === `${customUuid.trim()}-csv`}
            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-black rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {downloadingId === `${customUuid.trim()}-csv` ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => customUuid.trim() && handleDownload(customUuid.trim(), 'json')}
            disabled={!customUuid.trim() || downloadingId === `${customUuid.trim()}-json`}
            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-black rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {downloadingId === `${customUuid.trim()}-json` ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <Code className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Available Inspection Reports List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
          Recent Generated Notices & Evidentiary Files
        </h3>

        {scans.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-3xl border border-gray-200 text-xs text-gray-500">
            No inspection records currently available. Run an inspection to generate legal notices.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {scans.map((scan) => {
              return (
                <div
                  key={scan.scan_uuid}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-black">
                        {scan.scan_uuid}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-3 py-0.5 rounded-full border ${
                          scan.status === 'compliant'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : scan.status === 'violation'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {scan.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-800 font-medium">
                      {scan.product} — <span className="text-gray-400">{scan.manufacturer || 'Manufactured Commodity'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectScan(scan)}
                      className="px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-black transition"
                    >
                      View Evidence
                    </button>

                    <button
                      onClick={() => handleDownload(scan.scan_uuid, 'pdf')}
                      disabled={downloadingId === `${scan.scan_uuid}-pdf`}
                      className="px-3 py-1.5 rounded-full bg-black hover:bg-gray-800 text-xs font-semibold text-white transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      {downloadingId === `${scan.scan_uuid}-pdf` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownload(scan.scan_uuid, 'csv')}
                      disabled={downloadingId === `${scan.scan_uuid}-csv`}
                      className="px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-black transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {downloadingId === `${scan.scan_uuid}-csv` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>CSV</span>
                    </button>

                    <button
                      onClick={() => handleDownload(scan.scan_uuid, 'json')}
                      disabled={downloadingId === `${scan.scan_uuid}-json`}
                      className="px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-black transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {downloadingId === `${scan.scan_uuid}-json` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      ) : (
                        <Code className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legal & Regulatory Admissibility Notice */}
      <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
        <div className="font-semibold text-black flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>Statutory Notice Certification Standards</span>
        </div>
        <p className="leading-relaxed">
          Notices and data records generated by Pramaan include digital cryptographic hashes, ISO/IEC 15420 optical calibration factors, and statutory rule citations admissible before the Adjudicating Officer under Section 49 & Section 53 of the Legal Metrology Act, 2009.
        </p>
      </div>
    </div>
  );
};
