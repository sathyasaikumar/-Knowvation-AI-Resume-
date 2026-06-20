import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CandidateDashboard } from './components/CandidatePortal/CandidateDashboard';
import { RecruiterDashboard } from './components/RecruiterPortal/RecruiterDashboard';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { CursorSmoke } from './components/CursorSmoke';
import {
  Sparkles, LogOut, Shield, User, Briefcase, ArrowRight
} from 'lucide-react';
import { Card, Button, Input } from './components/ui';

const AppContent: React.FC = () => {
  const { currentUser, login, logout, register, loading } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'recruiter' | 'admin'>('candidate');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-clear toast alert notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) return;

    // Validate unique company email rules
    if (selectedRole === 'recruiter') {
      if (!email.toLowerCase().includes('hr')) {
        setToast({
          message: "Recruiter email must be a company email containing 'hr' (e.g. hr@company.com)",
          type: 'error'
        });
        return;
      }
    } else if (selectedRole === 'admin') {
      if (!email.toLowerCase().includes('admin')) {
        setToast({
          message: "Admin email must be a company email containing 'admin' (e.g. admin@company.com)",
          type: 'error'
        });
        return;
      }
    }

    if (authMode === 'login') {
      const success = await login(email, selectedRole);
      if (!success) {
        setToast({
          message: 'Account not found for this role. Please Sign Up first!',
          type: 'error'
        });
      } else {
        setToast({
          message: `Login successful! Welcome back, ${email}`,
          type: 'success'
        });
      }
    } else {
      if (!nameInput.trim()) {
        setToast({
          message: 'Please fill out your name.',
          type: 'error'
        });
        return;
      }
      const success = await register(email, nameInput, selectedRole);
      if (!success) {
        setToast({
          message: 'Email already registered.',
          type: 'error'
        });
      } else {
        setToast({
          message: 'Profile created and authenticated successfully!',
          type: 'success'
        });
      }
    }
  };

  const handleForgotPassword = () => {
    const email = emailInput.trim();
    if (!email) {
      setToast({
        message: 'Please enter your email address first!',
        type: 'error'
      });
      return;
    }

    // Forgot password rule validation
    if (selectedRole === 'recruiter' && !email.toLowerCase().includes('hr')) {
      setToast({
        message: "Invalid Recruiter Email: Must contain 'hr'",
        type: 'error'
      });
      return;
    }
    if (selectedRole === 'admin' && !email.toLowerCase().includes('admin')) {
      setToast({
        message: "Invalid Admin Email: Must contain 'admin'",
        type: 'error'
      });
      return;
    }

    setToast({
      message: `A password reset link has been successfully sent to: ${email}`,
      type: 'success'
    });
  };

  const handleLogout = () => {
    logout();
    setToast({
      message: 'Logged out successfully!',
      type: 'success'
    });
  };

  // 1. Unauthenticated Login Layout
  if (!currentUser) {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#070b13]">
        {/* Dynamic interactive cursor smoke trail */}
        <CursorSmoke />

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Logo Brand Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-900/60 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-white/10 overflow-hidden">
              <img src="/novi_owl.png" alt="Novi Owl" className="w-full h-full object-cover" />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-indigo-400 font-heading tracking-tight">
              Knowvation Learning Resume AI
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Enterprise-grade automated resume parsing, ATS screening & matching
            </p>
          </div>

          <Card className="border-indigo-500/10">
            {/* Auth Mode Toggle */}
            <div className="flex border-b border-white/5 pb-4 mb-5 justify-center gap-6 text-sm">
              <button
                onClick={() => setAuthMode('login')}
                className={`font-bold pb-2 transition-all cursor-pointer ${authMode === 'login' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`font-bold pb-2 transition-all cursor-pointer ${authMode === 'register' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Role Tab Selection */}
            {authMode === 'login' && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { value: 'candidate', label: 'Candidate', icon: User },
                  { value: 'recruiter', label: 'Recruiter', icon: Briefcase },
                  { value: 'admin', label: 'Super Admin', icon: Shield }
                ].map(r => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setSelectedRole(r.value as any)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[10px] font-bold transition-all duration-200 cursor-pointer ${selectedRole === r.value
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleSubmitAuth} className="space-y-4">
              {authMode === 'register' && (
                <Input
                  label="Full Name"
                  placeholder="e.g. Rohit Kumar"
                  value={nameInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value)}
                  disabled={loading}
                />
              )}

              <div className="relative">
                <Input
                  label={
                    selectedRole === 'recruiter'
                      ? "Recruiter Email (Must contain 'hr')"
                      : selectedRole === 'admin'
                      ? "Admin Email (Must contain 'admin')"
                      : "Email Address"
                  }
                  type="email"
                  placeholder={
                    selectedRole === 'recruiter'
                      ? "hr@knowvation.com or recruiter.hr@company.com"
                      : selectedRole === 'admin'
                      ? "admin@knowvation.com or sysadmin@company.com"
                      : "candidate@gmail.com or rohit.kumar@gmail.com"
                  }
                  value={emailInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailInput(e.target.value)}
                  disabled={loading}
                />
                
                {authMode === 'login' && (
                  <div className="flex justify-end text-xs mt-1">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 cursor-pointer"
                  >
                    <option value="candidate" className="bg-slate-950">Student/Candidate Portal</option>
                    <option value="recruiter" className="bg-slate-950">HR Recruiter Portal</option>
                    <option value="admin" className="bg-slate-950">Super Admin Portal</option>
                  </select>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                    Processing Secure Auth...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    {authMode === 'login' ? 'Authenticate' : 'Create Profile'} <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

          </Card>
        </div>

        {/* Custom modern toast banner notification popup */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md bg-slate-900/95 animate-in fade-in slide-in-from-bottom-5 duration-300 border-white/10">
            <div className={`h-2.5 w-2.5 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' :
              toast.type === 'error' ? 'bg-rose-400 shadow-[0_0_10px_#f43f5e]' :
              'bg-indigo-400 shadow-[0_0_10px_#6366f1]'
            }`} />
            <span className="text-sm font-semibold text-slate-200">{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Authenticated Dashboard Layout Shell
  return (
    <div className="min-h-screen bg-[#070b13] relative flex flex-col">
      {/* Dynamic interactive cursor smoke trail */}
      <CursorSmoke />

      {/* Main Header bar */}
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/5 bg-slate-950/70 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900/60 flex items-center justify-center border border-white/10 overflow-hidden">
            <img src="/novi_owl.png" alt="Novi Owl" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <h2 className="text-md font-bold text-indigo-400 flex items-center gap-1.5 font-heading tracking-tight leading-none">
              Knowvation Learning Resume AI
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </h2>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1 block">
              Resume Screening
            </span>
          </div>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">{currentUser.name}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
              {currentUser.role === 'candidate' ? 'Student Portal' :
                currentUser.role === 'recruiter' ? 'HR Dashboard' : 'System Administrator'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 relative z-10">

        {/* Dynamic portal routing */}
        {currentUser.role === 'candidate' && <CandidateDashboard />}
        {currentUser.role === 'recruiter' && <RecruiterDashboard />}
        {currentUser.role === 'admin' && <AdminDashboard />}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-white/5 bg-slate-950/20 text-slate-500 text-[10px] uppercase tracking-wider relative z-10">
        © 2026 Knowvation Learning. All rights reserved. • Sandbox Active
      </footer>

      {/* Custom modern toast banner notification popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md bg-slate-900/95 animate-in fade-in slide-in-from-bottom-5 duration-300 border-white/10">
          <div className={`h-2.5 w-2.5 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' :
            toast.type === 'error' ? 'bg-rose-400 shadow-[0_0_10px_#f43f5e]' :
            'bg-indigo-400 shadow-[0_0_10px_#6366f1]'
          }`} />
          <span className="text-sm font-semibold text-slate-200">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
