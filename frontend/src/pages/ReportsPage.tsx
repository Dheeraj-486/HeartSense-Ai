import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Calendar, AlertCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { reportsService } from '../services/api';

const ReportsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: reportsService.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });

  // 1. Fetch Reports List
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports-history'],
    queryFn: reportsService.getReports,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Failed to load reports</h3>
        <p className="text-sm text-slate-400 mt-2">There was a problem querying the reports database. Please check your network connection.</p>
      </div>
    );
  }

  const handleDelete = (reportId: number) => {
    if (confirm(`Are you sure you want to permanently delete this assessment report?`)) {
      deleteMutation.mutate(reportId);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Panel */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Reports Workspace</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Download signed PDF medical assessments for your health files or doctor visits.</p>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-850 text-center max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-slate-350 dark:text-slate-800 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No reports generated yet</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">PDF health assessments are compiled automatically when you upload and screen visual scans in the workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-44 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 leading-snug">Assessment Report</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Report ID: #{report.id}</p>
                    </div>
                  </div>
                  
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>AI-Signed</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-5 text-[11px] text-slate-450 dark:text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Created: {new Date(report.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  <span className="text-slate-500">•</span>
                  <span>{new Date(report.created_at).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', hour12: true})}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <a 
                  href={reportsService.downloadReportUrl(report.id)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-md shadow-blue-500/10 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                
                <button
                  onClick={() => handleDelete(report.id)}
                  disabled={deleteMutation.isPending}
                  className="px-3 rounded-xl bg-slate-200 dark:bg-slate-850 hover:bg-red-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
                  title="Delete Report"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ReportsPage;
