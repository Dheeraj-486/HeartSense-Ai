import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, UploadCloud, History, FileText, 
  MessageSquare, User, Settings, LogOut, Sun, Moon, Menu, X, Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/api';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Load and apply theme
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const settings = await settingsService.getSettings();
        setDarkMode(settings.dark_mode);
        if (settings.dark_mode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (err) {
        // Fallback
        document.documentElement.classList.add('dark');
      }
    };
    fetchTheme();
  }, []);

  const toggleTheme = async () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      await settingsService.updateSettings({ dark_mode: nextVal });
    } catch (err) {
      console.error('Failed to save theme setting:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Scan', path: '/upload', icon: UploadCloud },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F1F5F9] dark:bg-[#090D1A] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
          <span className="font-display font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
            HeartSense AI
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Sliding Sidebar Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm">
          <aside className="w-64 h-full glass-panel border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-6 px-4">
            <div>
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span className="font-display font-bold tracking-tight text-slate-900 dark:text-white">HeartSense AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4 px-2">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
              </button>
              
              <div className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{user?.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-slate-200 dark:border-slate-800/80 flex-col justify-between py-8 px-6 sticky top-0 h-screen z-10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-10 px-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
            <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
              HeartSense AI
            </span>
          </div>
          
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all"
          >
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          
          <div className="flex items-center gap-3.5 border-t border-slate-200 dark:border-slate-800/80 pt-5 px-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-none">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-1 leading-none">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen p-6 md:p-10">
        <div className="max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
