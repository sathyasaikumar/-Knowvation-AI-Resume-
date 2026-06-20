import React from 'react';

// -------------------------------------------------------------
// Card Component
// -------------------------------------------------------------
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div 
      className={`glass-panel rounded-2xl p-6 shadow-xl text-left border border-white/10 ${
        hoverable ? 'glass-panel-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// -------------------------------------------------------------
// Button Component
// -------------------------------------------------------------
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] border border-transparent",
    secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/50",
    outline: "bg-transparent hover:bg-white/5 text-slate-200 border border-slate-700/50 hover:border-slate-500",
    danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 hover:border-red-500/80",
    success: "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 hover:border-emerald-500/80"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// -------------------------------------------------------------
// Badge Component
// -------------------------------------------------------------
interface BadgeProps {
  children: React.ReactNode;
  color?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'slate' }) => {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    slate: "bg-slate-500/10 text-slate-400 border border-slate-500/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

// -------------------------------------------------------------
// Input Component
// -------------------------------------------------------------
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <input 
        className={`w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
        } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
};

// -------------------------------------------------------------
// Textarea Component
// -------------------------------------------------------------
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <textarea 
        className={`w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
        } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 resize-none ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
};

// -------------------------------------------------------------
// Modal Component
// -------------------------------------------------------------
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-sm">
      <div 
        className={`w-full ${sizes[size]} glass-panel rounded-2xl border border-white/10 shadow-2xl transform overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/40">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
