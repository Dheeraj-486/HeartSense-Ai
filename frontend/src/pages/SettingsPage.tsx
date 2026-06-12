import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Shield, Bell, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { settingsService } from '../services/api';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Fetch User Settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['user-settings'],
    queryFn: settingsService.getSettings,
  });

  // 2. Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['user-settings'], updatedData);
      
      // Apply dark mode immediately
      if (updatedData.dark_mode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setSuccess("Preferences updated successfully.");
      setTimeout(() => setSuccess(null), 3000);
    }
  });

  const handleToggle = (key: 'dark_mode' | 'email_notifications' | 'weekly_reports', currentVal: boolean) => {
    updateMutation.mutate({
      [key]: !currentVal
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Failed to load preferences</h3>
        <p className="text-sm text-slate-400 mt-2">There was a problem communicating with the settings manager.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      
      {/* Header Panel */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">System Preferences</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure layout themes, automated reports, and notifications thresholds.</p>
      </div>

      {/* Settings Panel */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-6">
        
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-2xl flex gap-3 text-xs text-green-500 leading-normal animate-fade-in">
            <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6 divide-y divide-slate-150 dark:divide-slate-800/60">
          
          {/* Theme setting */}
          <div className="flex items-center justify-between pb-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-200 leading-none">Layout theme</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 leading-relaxed">Toggle dark background graphics or light paper layouts.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('dark_mode', settings.dark_mode)}
              disabled={updateMutation.isPending}
              className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${
                settings.dark_mode ? 'bg-blue-600 justify-end' : 'bg-slate-350 dark:bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          {/* Email setting */}
          <div className="flex items-center justify-between py-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-200 leading-none">Email notifications</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 leading-relaxed">Receive instant email updates when automated PDF analysis finishes.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('email_notifications', settings.email_notifications)}
              disabled={updateMutation.isPending}
              className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${
                settings.email_notifications ? 'bg-blue-600 justify-end' : 'bg-slate-350 dark:bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          {/* Report summary setting */}
          <div className="flex items-center justify-between py-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-200 leading-none">Weekly summary roundups</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 leading-relaxed">Auto-generate a combined health assessment digest every Sunday.</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('weekly_reports', settings.weekly_reports)}
              disabled={updateMutation.isPending}
              className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${
                settings.weekly_reports ? 'bg-blue-600 justify-end' : 'bg-slate-350 dark:bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

        </div>

      </div>

      {/* Security Info Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-200">HIPAA Data Protection</h4>
          <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 leading-relaxed">All stored diagnostic images and conversation dialogues are fully encrypted at rest. We never share scanning telemetry or user health reports with external databases.</p>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
