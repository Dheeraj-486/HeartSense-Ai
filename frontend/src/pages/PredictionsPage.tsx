import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  History, Search, Trash2, Eye, FileText, 
  AlertCircle, X, Download, ShieldAlert, Sparkles
} from 'lucide-react';
import { predictionsService, reportsService } from '../services/api';
import { Prediction } from '../types';

const PredictionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  // 1. Fetch Predictions History
  const { data: predictions = [], isLoading, error } = useQuery({
    queryKey: ['predictions-history'],
    queryFn: predictionsService.getPredictions,
  });

  // 2. Delete Prediction Mutation
  const deleteMutation = useMutation({
    mutationFn: predictionsService.deletePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSelectedPrediction(null);
    }
  });

  const handleDelete = (id: number, disease: string) => {
    if (confirm(`Are you sure you want to permanently delete the scan and analysis for "${disease}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter & Search Logic
  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch = p.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.risk_level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.image_type.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesType = filterType === 'ALL' || p.image_type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Panel */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Predictions Database</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit past deep learning scans, probabilities, and system screening logs.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-200 dark:border-slate-850">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search findings, risk status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          {['ALL', 'ECG', 'MRI', 'CT', 'X-RAY'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-2 rounded-xl border text-[10px] font-bold tracking-wider transition-all ${
                filterType === t 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {filteredPredictions.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              <History className="w-12 h-12 text-slate-300 dark:text-slate-850 mx-auto mb-4" />
              <p className="font-semibold">No predictions matches found</p>
              <p className="text-xs text-slate-500 mt-1">Try refining your search query or upload a scan in the module.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/80">
                  <th className="px-6 py-4">Uploaded Date</th>
                  <th className="px-6 py-4">Scan Modality</th>
                  <th className="px-6 py-4">Identified Finding</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40">
                {filteredPredictions.map((p) => {
                  let badgeColor = "bg-green-500/10 text-green-500 border-green-500/20";
                  if (p.risk_level === "High") {
                    badgeColor = "bg-red-500/10 text-red-500 border-red-500/20";
                  } else if (p.risk_level === "Medium") {
                    badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all font-medium text-slate-700 dark:text-slate-200">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                        {new Date(p.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true})}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-550 tracking-wider">
                          {p.image_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100 font-semibold">{p.disease}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-850 dark:text-slate-350">{p.probability}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeColor}`}>
                          {p.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button 
                          onClick={() => setSelectedPrediction(p)}
                          className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white inline-flex items-center justify-center transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.disease)}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-800 hover:bg-red-600 hover:text-white inline-flex items-center justify-center transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Inspect Prediction Slide-over/Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 animate-scale-in max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal Exit Button */}
            <button 
              onClick={() => setSelectedPrediction(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Details */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h2 className="font-display font-extrabold text-xl">Clinical Screening Report</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Scan Image Preview */}
              <div className="border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center h-48">
                <img 
                  src={selectedPrediction.image_path} 
                  alt="Scanned Cardiogram" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Aggregated Results */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identified Condition</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">{selectedPrediction.disease}</p>
                </div>
                
                <div className="flex gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Category</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold inline-block mt-1 ${
                      selectedPrediction.risk_level === 'High' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : selectedPrediction.risk_level === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {selectedPrediction.risk_level} Risk
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inference Accuracy</span>
                    <p className="text-sm font-bold text-blue-500 mt-1">{selectedPrediction.probability}%</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scan Modality</span>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 mt-1 uppercase">{selectedPrediction.image_type}</p>
                </div>
              </div>

            </div>

            {/* Explanation paragraph */}
            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Diagnostics Explanation</span>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{selectedPrediction.explanation}</p>
            </div>

            {/* Warning Banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-2.5 text-[10px] text-amber-500 leading-normal mt-6">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span><b>Cardiological Notice:</b> Generative metrics are for screening assistance. Always correlate results with standard 12-lead ECG, cardiac panels, and professional cardiology reviews.</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedPrediction(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-850 hover:bg-slate-350 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PredictionsPage;
