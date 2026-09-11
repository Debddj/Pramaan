import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  RotateCw, 
  ShieldCheck, 
  AlertOctagon, 
  Loader2, 
  Play, 
  ExternalLink
} from 'lucide-react';
import { 
  getSurveillanceListings, 
  scanSurveillanceListing, 
  bulkScanSurveillance, 
  getSurveillanceResults 
} from '../api/client';
import { 
  ListingItem, 
  SurveillanceScanResponse, 
  SurveillanceResultRecord 
} from '../api/types';

interface SurveillanceHubProps {
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

export const SurveillanceHub: React.FC<SurveillanceHubProps> = ({
  onError,
  onSuccess,
}) => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [scanningListingId, setScanningListingId] = useState<string | null>(null);
  const [isBulkScanning, setIsBulkScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<Record<string, SurveillanceScanResponse>>({});
  const [historicalLogs, setHistoricalLogs] = useState<SurveillanceResultRecord[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('all');

  const fetchListingsAndLogs = async () => {
    setLoadingListings(true);
    try {
      const [items, logs] = await Promise.all([
        getSurveillanceListings().catch(() => [
          {
            id: 'lst-amz-001',
            title: 'Bourbon Chocolate Cream Biscuits 120g',
            marketplace: 'Amazon India',
            url: 'https://amazon.in/dp/B08XYZ123',
            brand: 'Britannia',
            category: 'biscuits',
            mrp: 40,
            net_quantity: '120g',
            declared_origin: 'India',
          },
          {
            id: 'lst-flp-002',
            title: 'Imported Organic Almond Butter 200g',
            marketplace: 'Flipkart',
            url: 'https://flipkart.com/p/itm123456',
            brand: 'NutriPure',
            category: 'food_butter',
            mrp: 499,
            net_quantity: '200g',
            declared_origin: '', // Missing origin violation
          },
          {
            id: 'lst-bln-003',
            title: 'Sparkle Dishwash Liquid Gel 500ml',
            marketplace: 'Blinkit',
            url: 'https://blinkit.com/prn/123987',
            brand: 'Sparkle Home',
            category: 'cleaning_gel',
            mrp: 120,
            net_quantity: '500ml',
            declared_origin: 'India',
          }
        ]),
        getSurveillanceResults().catch(() => [])
      ]);
      setListings(items);
      setHistoricalLogs(logs);
    } catch (err: any) {
      onError(err?.message || 'Failed to load surveillance dataset.');
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListingsAndLogs();
  }, []);

  const handleScanSingle = async (item: ListingItem) => {
    setScanningListingId(item.id);
    try {
      const res = await scanSurveillanceListing(item.id, item.url);
      setScanResults((prev) => ({ ...prev, [item.id]: res }));
      if (res.status === 'compliant') {
        onSuccess(`Listing "${item.title.slice(0, 30)}..." verified compliant.`);
      } else {
        onError(`Violations identified in listing: ${res.violations.map(v => v.citation).join(', ')}`);
      }
      // Refresh historical logs
      const updatedLogs = await getSurveillanceResults().catch(() => []);
      setHistoricalLogs(updatedLogs);
    } catch (err: any) {
      onError(err?.message || 'Failed to scan listing.');
    } finally {
      setScanningListingId(null);
    }
  };

  const handleBulkScanAll = async () => {
    setIsBulkScanning(true);
    try {
      const res = await bulkScanSurveillance();
      const newMap: Record<string, SurveillanceScanResponse> = {};
      res.results.forEach((r) => {
        if (r.listing_id) newMap[r.listing_id] = r;
      });
      setScanResults((prev) => ({ ...prev, ...newMap }));
      onSuccess(`Bulk surveillance complete: ${res.compliant_count} compliant, ${res.violation_count} violations detected.`);
      const updatedLogs = await getSurveillanceResults().catch(() => []);
      setHistoricalLogs(updatedLogs);
    } catch (err: any) {
      onError(err?.message || 'Failed to run bulk surveillance scan.');
    } finally {
      setIsBulkScanning(false);
    }
  };

  const filteredListings = listings.filter((l) =>
    selectedMarketplace === 'all' ? true : l.marketplace.toLowerCase().includes(selectedMarketplace.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-gray-100 text-black border border-gray-200">
              <Globe className="w-5 h-5" />
            </span>
            <h2
              className="text-2xl md:text-3xl font-medium tracking-tight text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              E-Commerce Statutory Surveillance Hub
            </h2>
          </div>
          <p className="text-xs text-black/60">
            Real-time digital marketplace crawling & statutory declaration compliance audit under Rule 6(10) of LMPC 2011
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchListingsAndLogs}
            disabled={loadingListings}
            className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-black transition flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 text-gray-500 ${loadingListings ? 'animate-spin' : ''}`} />
            <span>Refresh Feeds</span>
          </button>

          <button
            onClick={handleBulkScanAll}
            disabled={isBulkScanning}
            className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {isBulkScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Auditing Marketplace Listings...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-white fill-white" />
                <span>Run Bulk Statutory Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Marketplace Selector Strip */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-full text-xs overflow-x-auto">
        {[
          { id: 'all', label: 'All Marketplaces' },
          { id: 'amazon', label: 'Amazon India' },
          { id: 'flipkart', label: 'Flipkart' },
          { id: 'blinkit', label: 'Blinkit' },
          { id: 'zepto', label: 'Zepto' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMarketplace(tab.id)}
            className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
              selectedMarketplace === tab.id
                ? 'bg-black text-white font-semibold shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((item) => {
          const result = scanResults[item.id];
          const isScanning = scanningListingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm hover:border-black/30 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-gray-100 text-black">
                    {item.marketplace}
                  </span>
                  {result && (
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        result.status === 'compliant'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {result.status}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-black line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-2 font-mono">
                    <span>Brand: {item.brand || 'Unbranded'}</span>
                    <span>•</span>
                    <span>MRP: ₹{item.mrp || '—'}</span>
                    <span>•</span>
                    <span>Qty: {item.net_quantity || '—'}</span>
                  </div>
                </div>

                {/* Statutory Check Result Card */}
                {result && result.violations.length > 0 && (
                  <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                      <span>{result.violations.length} Infraction(s) Codified</span>
                    </div>
                    {result.violations.map((v, i) => (
                      <div key={i} className="text-rose-700 text-[10px] leading-tight">
                        • {v.citation}: {v.violation_text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-400 hover:text-black font-medium flex items-center gap-1 transition"
                >
                  <span>Listing Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => handleScanSingle(item)}
                  disabled={isScanning}
                  className="px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isScanning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>Audit Listing</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Crawl Log Table */}
      {historicalLogs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black">
            Recent Automated E-Commerce Surveillance Audits
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Marketplace</th>
                  <th className="py-2.5 px-4 font-semibold">Listing Title</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Violations</th>
                  <th className="py-2.5 px-4 font-semibold">Audit Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {historicalLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="py-2.5 px-4 font-mono font-semibold text-black">
                      {log.marketplace}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-black max-w-xs truncate">
                      {log.product_title}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          log.status === 'compliant'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {log.violations_count > 0 ? (
                        <span className="text-rose-700 font-bold">{log.violations_count} detected</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-gray-400 text-[11px]">
                      {new Date(log.scraped_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
