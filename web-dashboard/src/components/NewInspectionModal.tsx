import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Camera,
  ArrowRight
} from 'lucide-react';
import { triggerSimulatedScan, uploadInspectionScan } from '../api/client';
import { ScanResult } from '../api/types';

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: ScanResult) => void;
  onError: (msg: string) => void;
  onOpenLiveCamera?: () => void;
}

export const NewInspectionModal: React.FC<NewInspectionModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  onError,
  onOpenLiveCamera,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('biscuits');
  const [pdpArea, setPdpArea] = useState<number>(150);
  const [presetScenario, setPresetScenario] = useState<'normal' | 'undersized' | 'off_size' | 'glare'>('normal');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0);

  if (!isOpen) return null;

  const PIPELINE_STAGES = [
    { title: 'Image Quality Verification', desc: 'SHA-256 evidence hashing & illumination check' },
    { title: 'GS1 Barcode Detection', desc: 'EAN-13 physical 37.29mm reference calibration' },
    { title: 'AI / OCR Text Extraction', desc: 'Optical character & numeral height recognition' },
    { title: 'Commodity Classification', desc: 'Second Schedule category assignment' },
    { title: 'Legal Metrology Rules Engine', desc: 'Rules 6, 7, 9 & Section 18 statutory checks' },
    { title: 'Statutory Determination & Gate', desc: 'Confidence thresholding & certificate creation' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStartInspection = async () => {
    setIsProcessing(true);
    setActiveStage(0);

    // Live animated pipeline progression
    const progressInterval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      let scanResult: ScanResult;

      if (activeTab === 'upload' && selectedFile) {
        scanResult = await uploadInspectionScan(selectedFile, {
          category,
          pdp_area_sq_cm: pdpArea,
        });
      } else {
        let params = {
          barcode: '8901030000001',
          category: category,
          detected_text_height_px: 50.0, // 2.5mm -> compliant
          pdp_area_sq_cm: pdpArea,
        };

        if (presetScenario === 'undersized') {
          params = {
            barcode: '8901030000002',
            category: 'biscuits',
            detected_text_height_px: 30.0, // 1.5mm < 2.0mm required -> Rule 7 violation
            pdp_area_sq_cm: pdpArea,
          };
        } else if (presetScenario === 'off_size') {
          params = {
            barcode: '8901030000004',
            category: 'biscuits',
            detected_text_height_px: 45.0,
            pdp_area_sq_cm: pdpArea,
          };
        } else if (presetScenario === 'glare') {
          params = {
            barcode: '8901030048123',
            category: 'biscuits',
            detected_text_height_px: 36.0,
            pdp_area_sq_cm: pdpArea,
          };
        }

        scanResult = await triggerSimulatedScan(params);
      }

      clearInterval(progressInterval);
      setActiveStage(PIPELINE_STAGES.length);
      setTimeout(() => {
        setIsProcessing(false);
        onScanComplete(scanResult);
        onClose();
      }, 400);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      onError(err?.message || 'Failed to complete packaging inspection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-white rounded-3xl border border-gray-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-black font-bold uppercase tracking-wider bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-300">
              Legal Metrology Optical Pipeline
            </span>
            <h2
              className="text-2xl font-medium tracking-tight text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              New Inspection
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-black p-2 rounded-full transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isProcessing ? (
          /* Multi-Stage Animated Pipeline Loader */
          <div className="py-4 space-y-5">
            <div className="text-center space-y-1">
              <Loader2 className="w-8 h-8 text-black animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-black">Processing Inspection Pipeline</h3>
              <p className="text-xs text-gray-500">Optical measurement, declaration extraction & statutory rules check</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isCompleted = idx < activeStage;
                const isCurrent = idx === activeStage;
                return (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                      )}
                    </div>
                    <div>
                      <span
                        className={`block font-semibold ${
                          isCompleted
                            ? 'text-gray-800'
                            : isCurrent
                            ? 'text-black font-bold'
                            : 'text-gray-400'
                        }`}
                      >
                        {stage.title}
                      </span>
                      <span className="text-[11px] text-gray-500">{stage.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Primary Entry Points: Camera vs Upload */}
            <div className="grid grid-cols-2 gap-3">
              {onOpenLiveCamera && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLiveCamera();
                  }}
                  className="p-4 rounded-2xl border-2 border-gray-200 hover:border-black text-left transition flex flex-col justify-between group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-black flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black block">Launch Camera</span>
                    <span className="text-[11px] text-gray-500">Live optical inspection</span>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                  activeTab === 'upload'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-black flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-black block">Upload Image</span>
                  <span className="text-[11px] text-gray-500">Inspect packaging photo</span>
                </div>
              </button>
            </div>

            {/* Presets Switcher Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs font-semibold text-gray-700">Or use benchmark presets:</span>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'preset' ? 'upload' : 'preset')}
                className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
              >
                <span>{activeTab === 'preset' ? 'Back to Upload' : 'View Statutory Presets'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeTab === 'upload' ? (
              /* File Upload Dropzone */
              <div>
                <label className="border-2 border-dashed border-gray-300 hover:border-black rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="space-y-2 text-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-36 rounded-lg mx-auto object-contain border border-gray-200 shadow-sm"
                      />
                      <span className="text-xs font-semibold text-black block">
                        {selectedFile?.name} (Click to change)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-black border border-gray-200 flex items-center justify-center mx-auto group-hover:scale-105 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-black font-semibold">
                        Click or drag packaging photo here
                      </div>
                      <div className="text-[11px] text-gray-400">
                        JPEG, PNG, or WebP with barcode & declarations
                      </div>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              /* Presets Grid */
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'normal', title: '100g Biscuits (Compliant)', desc: 'Valid numeral height & full declarations' },
                  { id: 'undersized', title: 'Rule 7 Undersized Font', desc: '1.5mm numeral height < 2.0mm required' },
                  { id: 'off_size', title: '2nd Sched Off-Pack', desc: 'Non-standard weight pack (65g)' },
                  { id: 'glare', title: 'Specular Glare (74%)', desc: 'Borderline confidence safety triage' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetScenario(p.id as any)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      presetScenario === p.id
                        ? 'bg-black text-white border-black font-semibold shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.title}</div>
                    <div className={`text-[10px] mt-0.5 ${presetScenario === p.id ? 'text-white/70' : 'text-gray-500'}`}>
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Metrology Parameters */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-700">
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black focus:outline-none"
                >
                  <option value="biscuits">Biscuits & Cookies</option>
                  <option value="soaps">Soaps & Detergents</option>
                  <option value="edible_oil">Edible Oil & Ghee</option>
                  <option value="general">General Commodity</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-700">
                  PDP Area: <span className="font-mono text-black font-bold">{pdpArea} cm²</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={pdpArea}
                  onChange={(e) => setPdpArea(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleStartInspection}
              className="w-full py-3.5 px-4 bg-black hover:bg-gray-800 active:scale-98 text-white rounded-full text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 group"
            >
              <span>Launch Legal Metrology Analysis</span>
              <div className="bg-white rounded-full p-1 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </div>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
