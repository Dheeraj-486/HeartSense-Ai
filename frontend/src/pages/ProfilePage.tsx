import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Password validation if they want to change it
    if (password) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      await updateProfile({
        full_name: fullName,
        ...(password ? { password } : {}),
      });
      setSuccess("Profile updated successfully.");
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Failed to update profile. Please check credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      
      {/* Header Panel */}
      <div>
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your professional credentials and account security settings.</p>
      </div>

      {/* Info Card & Form */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-6">
        
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-blue-500/15">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-snug">{user?.full_name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
              Registered since: {user ? new Date(user.created_at).toLocaleDateString(undefined, {month: 'long', year: 'numeric'}) : ''}
            </p>
          </div>
        </div>

        {/* Notifications alerts */}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-2xl flex gap-3 text-xs text-green-500 leading-normal animate-fade-in">
            <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex gap-3 text-xs text-red-400 leading-normal animate-shake">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl text-xs shadow-md transition-all pt-3.5 pb-3.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Save Changes</span>
            )}
          </button>

        </form>

      </div>

    </div>
  );
};

export default ProfilePage;
