import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Camera, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { triggerSimulatedScan, uploadInspectionScan } from '../api/client';
import { ScanResult } from '../api/types';

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: ScanResult) => void;
  onError: (msg: string) => void;
}

export const NewInspectionModal: React.FC<NewInspectionModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  onError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('biscuits');
  const [pdpArea, setPdpArea] = useState<number>(150);
  const [presetScenario, setPresetScenario] = useState<'normal' | 'undersized' | 'off_size' | 'glare' | 'custom'>('normal');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0);

  if (!isOpen) return null;

  const PIPELINE_STAGES = [
    'Image received & SHA-256 evidence hashed',
    'Barcode detected & GS1 EAN-13 calibrated',
    'Optical calibration & scale factor computed',
    'Extracting statutory declarations (OCR & VLM)',
    'Evaluating statutory rules against LMPC 2011',
    'Confidence gate & statutory determination verified'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPresetScenario('custom');
    }
  };

  const selectPreset = (scenario: 'normal' | 'undersized' | 'off_size' | 'glare') => {
    setPresetScenario(scenario);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleStartInspection = async () => {
    setIsProcessing(true);
    setActiveStage(0);

    // Simulate animated pipeline progress steps while API processes
    const progressInterval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      let scanResult: ScanResult;

      if (selectedFile) {
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
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      onError(err?.message || 'Failed to complete packaging inspection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Initiate Product Inspection</h2>
              <p className="text-xs text-slate-400">Computer-vision packaging measurement & statutory analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1 rounded transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isProcessing ? (
          /* Multi-stage pipeline execution loader (Section 11) */
          <div className="py-6 space-y-6">
            <div className="text-center space-y-1">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-white">Analyzing Package Metrology...</h3>
              <p className="text-xs text-slate-400">Extracting legal declarations and validating statutory rules</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isCompleted = idx < activeStage;
                const isCurrent = idx === activeStage;
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                    )}
                    <span
                      className={`${
                        isCompleted
                          ? 'text-slate-200'
                          : isCurrent
                          ? 'text-blue-300 font-medium'
                          : 'text-slate-600'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Package Upload Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Upload Package Front/PDP Photo
              </label>
              <label className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition group">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={previewUrl}
                      alt="Uploaded package"
                      className="max-h-28 rounded border border-slate-700 object-contain shadow"
                    />
                    <span className="text-xs text-blue-400 font-medium group-hover:underline">
                      Click to replace photo ({selectedFile?.name})
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="p-2.5 rounded-full bg-slate-800 text-slate-300 group-hover:text-blue-400 group-hover:bg-blue-950/30 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200">
                        Click to upload package image
                      </span>
                      <span className="text-xs text-slate-400 block">or drag and drop PNG, JPG up to 10MB</span>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Quick Demo Packages Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Or Select Pre-Calibrated Inspection Sample
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => selectPreset('normal')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    presetScenario === 'normal'
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-200'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">Compliant Biscuit (100g)</div>
                  <div className="text-[10px] text-slate-400">GS1 EAN-13 • 2.5mm numeral ✓</div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset('undersized')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    presetScenario === 'undersized'
                      ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">Undersized Font (Rule 7)</div>
                  <div className="text-[10px] text-slate-400">1.5mm &lt; 2.0mm statutory min ⚠</div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset('off_size')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    presetScenario === 'off_size'
                      ? 'border-amber-500 bg-amber-950/20 text-amber-200'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">Off-Size Pack (2nd Sched)</div>
                  <div className="text-[10px] text-slate-400">Non-standard net weight pack ⚠</div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset('glare')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    presetScenario === 'glare'
                      ? 'border-blue-500 bg-blue-950/20 text-blue-200'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-semibold">Borderline Glare Pack</div>
                  <div className="text-[10px] text-slate-400">Confidence 74% • Triggers Queue ⚠</div>
                </button>
              </div>
            </div>

            {/* Category & PDP Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="biscuits">Biscuits & Cookies</option>
                  <option value="packaged_food">Packaged Foods</option>
                  <option value="personal_care">Personal Care & Soaps</option>
                  <option value="edible_oils">Edible Vegetable Oils</option>
                  <option value="detergents">Detergent & Cleansers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Estimated PDP Area (cm²)
                </label>
                <input
                  type="number"
                  value={pdpArea}
                  onChange={(e) => setPdpArea(Number(e.target.value) || 150)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                  min={10}
                  max={5000}
                />
              </div>
            </div>

            <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                Barcode-as-ruler automatically computes optical calibration factor (mm/px) using the GS1 standard barcode width.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartInspection}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
              >
                <span>Execute Inspection</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
