import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Activity, FileText, MessageSquare, ShieldCheck, 
  ArrowRight, TrendingUp, AlertCircle, Plus, Eye
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardService } from '../services/api';

const COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981'];

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 10000, // Auto-update dashboard metrics every 10s
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        
        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
        
        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Failed to load analytics</h3>
        <p className="text-sm text-slate-400 mt-2">There was a problem communicating with the clinical database. Please verify the backend is running.</p>
      </div>
    );
  }

  const widgetCards = [
    {
      title: 'Total Scans Screened',
      value: stats.total_predictions,
      icon: Activity,
      desc: 'ECG, MRI, CT & X-Ray files',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/10',
    },
    {
      title: 'Reports Generated',
      value: stats.reports_generated,
      icon: FileText,
      desc: 'Signed PDF assessments',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/10',
    },
    {
      title: 'Chatbot Discussions',
      value: stats.chat_sessions,
      icon: MessageSquare,
      desc: 'BioGPT medical advice sessions',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10',
    },
    {
      title: 'System Accuracy Score',
      value: `${stats.accuracy_score}%`,
      icon: ShieldCheck,
      desc: 'ViT verification benchmark',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">Clinical Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review aggregated scanning stats and medical predictions history.</p>
        </div>
        <Link 
          to="/upload" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Scan</span>
        </Link>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgetCards.map((w, idx) => {
          const Icon = w.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-3xl border flex flex-col justify-between h-32 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{w.title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${w.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl md:text-3xl tracking-tight leading-none mt-2">{w.value}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{w.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between h-80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weekly Screening Activity</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-Time Trends</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.prediction_trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    border: '1px solid #1E293B',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }} 
                />
                <Area type="monotone" dataKey="count" name="Scans analyzed" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease Distribution Pie Chart (1/3 width) */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-80">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 block">Disease Distribution</span>
          <div className="flex-1 min-h-0 flex items-center justify-center relative">
            {stats.disease_distribution.length === 1 && stats.disease_distribution[0].name === "No Data" ? (
              <p className="text-xs text-slate-400 font-medium italic">No scan records available to plot.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.disease_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.disease_distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderRadius: '12px', 
                      border: '1px solid #1E293B',
                      color: '#F8FAFC',
                      fontSize: '10px'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconSize={8} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '9px', color: '#94A3B8' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Recent Predictions Table Preview */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/85 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Diagnostic Screening</h2>
          <Link to="/reports" className="text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1.5">
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {stats.recent_predictions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              <p className="font-medium italic">No recent scan history.</p>
              <Link to="/upload" className="text-blue-500 hover:underline text-xs mt-2 inline-block">Upload your first scan now</Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/80">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Scan Category</th>
                  <th className="px-6 py-4">Assessed Finding</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {stats.recent_predictions.map((p) => {
                  let badgeColor = "bg-green-500/10 text-green-500 border-green-500/20";
                  if (p.risk_level === "High") {
                    badgeColor = "bg-red-500/10 text-red-500 border-red-500/20";
                  } else if (p.risk_level === "Medium") {
                    badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  }
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all font-medium text-slate-700 dark:text-slate-200">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                        {new Date(p.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          {p.image_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100 font-semibold">{p.disease}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{p.probability}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeColor}`}>
                          {p.risk_level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
