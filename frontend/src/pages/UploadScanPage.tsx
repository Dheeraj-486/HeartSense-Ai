import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileImage, FileText, CheckCircle, 
  AlertCircle, ArrowRight, ShieldAlert, Sparkles, MessageSquare, Download
} from 'lucide-react';
import { predictionsService, reportsService } from '../services/api';
import { Prediction } from '../types';

const UploadScanPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [result, setResult] = useState<Prediction | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    setResult(null);

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError("File size exceeds 8MB. Please upload a smaller image.");
      return;
    }

    // Any file format is supported

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('NON_IMAGE');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setUploadProgress(10); // Initial progress

    try {
      // Execute upload prediction
      const response = await predictionsService.uploadScan(
        selectedFile, 
        "AUTO",
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Set cap to 90 until backend gives 201 response
          setUploadProgress(Math.min(percentCompleted, 90));
        }
      );
      
      setUploadProgress(100);
      setResult(response);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Failed to analyze the medical scan. Ensure the file is a valid image and try again."
      );
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setResult(null);
    setError(null);
  };

  // Build PDF report download link
  const getDownloadUrl = () => {
    if (!result || !result.report_id) return '#';
    return reportsService.downloadReportUrl(result.report_id);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Panel */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Upload Scanning Module</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit visual cardiogram scans or radiological chest images for AI diagnosis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Form Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Diagnostic Ingestion</h2>

            <form onSubmit={handleUpload} className="space-y-6">

              {/* Drag and Drop Zone */}
              {!previewUrl ? (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all h-64 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-500/5' 
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/10'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Drag and drop scan image here</p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Any file format supported (Maximum 8MB)</p>
                </div>
              ) : (
                /* Image Preview Container */
                <div className="border border-slate-200 dark:border-slate-800 bg-slate-900/25 rounded-3xl overflow-hidden relative group">
                  {previewUrl === 'NON_IMAGE' ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-slate-950/20 p-6">
                      <FileImage className="w-16 h-16 text-blue-500 mb-2" />
                      <span className="text-xs font-semibold text-slate-350">{selectedFile?.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase mt-1">
                        {selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB • File Format
                      </span>
                    </div>
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Scan preview" 
                      className="w-full h-64 object-contain mx-auto"
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      type="button" 
                      onClick={resetForm}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-500/25"
                    >
                      Remove Scan
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Progress Bar */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>AI Model Pipeline Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-md shadow-blue-500/20"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex gap-3 text-xs text-red-400 leading-normal animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5" />
                      <span>Analyze Medical Scan</span>
                    </>
                  )}
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="bg-slate-200 dark:bg-slate-850 hover:bg-slate-350 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-300 font-semibold px-6 rounded-xl text-sm transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>

            </form>
          </div>

        </div>

        {/* Right Findings Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Screening Output</h2>
              
              {!result ? (
                /* Empty/Inactive State */
                <div className="text-center py-12 px-6 border border-slate-200/60 dark:border-slate-850 border-dashed rounded-2xl flex flex-col items-center justify-center h-80">
                  <FileImage className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-xs font-semibold text-slate-500">Awaiting scan submission...</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal max-w-[200px] mx-auto">Drop your medical scan image and trigger the AI screening engine.</p>
                </div>
              ) : (
                /* AI Results Output */
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Disease & Risk Badge */}
                  <div className="p-4 bg-slate-550/5 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identified Finding</span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">{result.disease}</h3>
                      </div>
                      
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${
                        result.risk_level === 'High' 
                          ? 'bg-red-500/10 text-red-500 border-red-500/25' 
                          : result.risk_level === 'Medium'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                          : 'bg-green-500/10 text-green-500 border-green-500/25'
                      }`}>
                        {result.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-400">Model Confidence</span>
                      <span className="font-bold text-blue-500">{result.probability}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                          result.risk_level === 'High' 
                            ? 'bg-red-500 shadow-red-500/20' 
                            : result.risk_level === 'Medium'
                            ? 'bg-amber-500 shadow-amber-500/20'
                            : 'bg-green-500 shadow-green-500/20'
                        }`}
                        style={{ width: `${result.probability}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Explanation Description */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Clinical Summary</span>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350">{result.explanation}</p>
                  </div>

                  {/* Recommendations & Precautions */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Guidance & Precautions</span>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-350 text-[11px] leading-relaxed">
                      {result.risk_level === 'High' ? (
                        <>
                          <li><strong className="text-red-500">Urgent Cardiological Consult</strong>: Schedule an immediate evaluation with a cardiologist.</li>
                          <li><strong>Follow-up Diagnostics</strong>: Recommend 12-lead ECG, cardiac enzymes, and an echocardiogram.</li>
                          <li><strong>Activity Limits</strong>: Limit strenuous physical exertion until cleared by your doctor.</li>
                          <li><strong>Symptom Warning</strong>: If chest pain, shortness of breath, or sweating occurs, seek emergency care immediately.</li>
                        </>
                      ) : result.risk_level === 'Medium' ? (
                        <>
                          <li><strong>Medical Review</strong>: Schedule a general practitioner checkup within 7–14 days.</li>
                          <li><strong>Telemetry Tracking</strong>: Monitor blood pressure, cholesterol, and blood sugar weekly.</li>
                          <li><strong>Dietary Adjustments</strong>: Restrict sodium and transition to a heart-healthy diet.</li>
                          <li><strong>Activity Guidance</strong>: Engage in light-to-moderate exercise (e.g. walking) as tolerated.</li>
                        </>
                      ) : (
                        <>
                          <li><strong>Preventative Habits</strong>: Maintain 150+ minutes of cardiovascular exercise weekly.</li>
                          <li><strong>Dietary Health</strong>: Follow a balanced diet rich in soluble fibers and omega-3.</li>
                          <li><strong>Routine Screenings</strong>: Continue annual checkups and blood pressure screenings.</li>
                          <li><strong>Risk Mitigation</strong>: Ensure quality sleep and complete tobacco avoidance.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Warning Note */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-2.5 text-[10px] text-amber-500 leading-normal">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><b>Disclaimer:</b> Generated automatically. This assessment does not substitute professional cardiologist consultation.</span>
                  </div>

                </div>
              )}
            </div>

            {result && (
              /* Action Options */
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                <a
                  href={getDownloadUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl text-xs transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </a>
                <button
                  onClick={() => navigate('/chatbot')}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuss Finding</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default UploadScanPage;
