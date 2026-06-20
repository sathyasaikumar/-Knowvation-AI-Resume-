import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { UserRole, SystemSettings, HRSessionLog } from '../../db/mockDatabase';
import { 
  Users, ShieldAlert, Cpu, ToggleLeft, ToggleRight, Plus, 
  Trash2, Shield, Info, Globe, Activity, X, Clock, Calendar, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../ui';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    settings, 
    saveSystemSettings, 
    register, 
    removeUser,
    hrLogs,
    saveHRLog,
    deleteHRLog
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'settings' | 'domains' | 'logs'>('users');

  // User creation states
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('recruiter');
  
  // Custom domains list states
  const [domains, setDomains] = useState<string[]>([
    'Software Engineering', 'Full Stack Development', 'Frontend Development',
    'Backend Development', 'Data Science', 'Artificial Intelligence',
    'Cyber Security', 'Cloud Computing', 'DevOps', 'Testing', 'HR', 'Marketing'
  ]);
  const [newDomain, setNewDomain] = useState('');

  // Simulation states for recruiter shift logs
  const recruiters = users.filter(u => u.role === 'recruiter');
  const [simRecruiterId, setSimRecruiterId] = useState('');
  const [simDate, setSimDate] = useState(new Date().toISOString().split('T')[0]);
  const [simHours, setSimHours] = useState('8.5');

  const handleSimulateLog = (e: React.FormEvent) => {
    e.preventDefault();
    const recruiterId = simRecruiterId || (recruiters[0]?.id || 'user-recruiter');
    const recruiter = users.find(u => u.id === recruiterId);
    if (!recruiter) {
      alert('No recruiter selected or found in the system. Create a recruiter account first.');
      return;
    }

    const duration = parseFloat(simHours);
    if (isNaN(duration) || duration <= 0 || duration > 24) {
      alert('Please enter a valid shift duration between 0.1 and 24 hours.');
      return;
    }

    const dateStr = simDate || new Date().toISOString().split('T')[0];
    const loginTime = `${dateStr}T09:00:00Z`;
    const loginDate = new Date(loginTime);
    const logoutDate = new Date(loginDate.getTime() + duration * 3600000);

    const simulatedLog: HRSessionLog = {
      id: `log-${Date.now()}`,
      recruiterId: recruiter.id,
      recruiterName: recruiter.name,
      date: dateStr,
      loginTime: loginDate.toISOString(),
      logoutTime: logoutDate.toISOString(),
      durationHours: duration
    };

    saveHRLog(simulatedLog);
    alert(`Simulated shift log of ${duration} hours for ${recruiter.name} added successfully!`);
  };

  // 1. Threshold change handler
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const updatedSettings: SystemSettings = {
      ...settings,
      passingThreshold: val
    };
    saveSystemSettings(updatedSettings);
  };

  // 2. Toggle config setting helper
  const toggleSetting = (key: keyof Omit<SystemSettings, 'passingThreshold'>) => {
    const updatedSettings: SystemSettings = {
      ...settings,
      [key]: !settings[key]
    };
    saveSystemSettings(updatedSettings);
  };

  // 3. User creation submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      alert('Please enter name and email.');
      return;
    }

    const success = await register(newEmail, newName, newRole);
    if (success) {
      setNewEmail('');
      setNewName('');
      alert(`User profile created successfully for ${newName} as a ${newRole.toUpperCase()}!`);
    } else {
      alert('Email already exists or registration failed.');
    }
  };

  // 4. Domain addition
  const handleAddDomain = () => {
    if (newDomain.trim() && !domains.includes(newDomain.trim())) {
      setDomains(prev => [...prev, newDomain.trim()]);
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (d: string) => {
    setDomains(prev => prev.filter(item => item !== d));
  };

  // System aggregates
  const recruitersCount = users.filter(u => u.role === 'recruiter').length;
  const candidatesCount = users.filter(u => u.role === 'candidate').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6 text-left">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Candidates</span>
            <h3 className="text-xl font-extrabold text-slate-100 mt-1 font-heading">{candidatesCount}</h3>
          </div>
          <div className="p-2.5 bg-slate-900/60 text-slate-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </Card>
        
        <Card className="p-4 border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hiring Recruiters</span>
            <h3 className="text-xl font-extrabold text-indigo-400 mt-1 font-heading">{recruitersCount}</h3>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Super Admins</span>
            <h3 className="text-xl font-extrabold text-purple-400 mt-1 font-heading">{adminsCount}</h3>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">System Status</span>
            <h3 className="text-xl font-extrabold text-emerald-400 mt-1 flex items-center gap-1.5 font-heading">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Operational
            </h3>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-450 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 pb-2">
        <button 
          onClick={() => setActiveSubTab('users')}
          className={`px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'users' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          User Account Management
        </button>
        <button 
          onClick={() => setActiveSubTab('settings')}
          className={`px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'settings' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ATS Core Parameters
        </button>
        <button 
          onClick={() => setActiveSubTab('domains')}
          className={`px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'domains' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Job Domains Directory
        </button>
        <button 
          onClick={() => setActiveSubTab('logs')}
          className={`px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'logs' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Recruiter Session Logs
        </button>
      </div>

      {/* TAB 1: USER ACCOUNT MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User List Table */}
          <Card className="lg:col-span-8 border-white/5 overflow-hidden p-0">
            <div className="p-5 border-b border-white/5 bg-slate-900/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Registered Accounts</h3>
              <Badge color="purple">{users.length} Users Total</Badge>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-slate-350">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-white/5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3.5 text-left">User Profile</th>
                    <th className="px-6 py-3.5 text-left">Email Address</th>
                    <th className="px-6 py-3.5 text-center">System Role</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-900/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/2.5 transition-colors">
                      <td className="px-6 py-3.5 text-left font-semibold text-slate-100 text-sm font-heading">
                        {u.name}
                      </td>
                      <td className="px-6 py-3.5 text-left text-xs font-mono text-slate-450">
                        {u.email}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <Badge color={
                          u.role === 'admin' ? 'purple' :
                          u.role === 'recruiter' ? 'blue' : 'slate'
                        }>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button 
                          onClick={() => {
                            if (u.id === 'user-admin') {
                              alert('Cannot delete primary Root Admin account.');
                              return;
                            }
                            if (confirm(`Remove account for ${u.name}? All associated screening data will be cleared.`)) {
                              removeUser(u.id);
                            }
                          }}
                          disabled={u.id === 'user-admin'}
                          className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Create User Form */}
          <Card className="lg:col-span-4 border-white/5 p-5 self-start">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-5">Provision Account</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input 
                label="Full Name" 
                placeholder="e.g. John Doe"
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
              />
              <Input 
                label="Email Address" 
                type="email"
                placeholder="e.g. j.doe@company.com"
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
              />
              
              <div className="flex flex-col gap-1.5 w-full text-left">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Role</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 cursor-pointer"
                >
                  <option value="recruiter" className="bg-slate-950">HR Recruiter</option>
                  <option value="admin" className="bg-slate-950">Super Admin</option>
                  <option value="candidate" className="bg-slate-950">Candidate Portal</option>
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full mt-2">
                <Plus className="w-4 h-4 mr-1.5" /> Register Profile
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: SYSTEM CONFIGURATIONS */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Core thresholds */}
          <Card className="lg:col-span-7 border-white/5 p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-3">ATS Screening Parameters</h3>
            
            {/* Slider threshold */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                <span>ATS Passing Threshold</span>
                <span className="text-indigo-400 text-base font-mono">{settings.passingThreshold}%</span>
              </div>
              <p className="text-xs text-slate-450 leading-relaxed">
                Candidates with scores equal to or exceeding this threshold are automatically approved for HR review. Profiles below this threshold are automatically cataloged as rejected.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  value={settings.passingThreshold}
                  onChange={handleThresholdChange}
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                />
              </div>
            </div>

            {/* General Toggles */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Features & Notifications</h4>
              
              {/* AI Chatbot Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-900">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">AI Student Chatbot Help</h5>
                  <p className="text-[10px] text-slate-450 mt-0.5">Enables AI candidate mentoring chatbot drawers.</p>
                </div>
                <button onClick={() => toggleSetting('chatbotEnabled')} className="cursor-pointer">
                  {settings.chatbotEnabled ? (
                    <ToggleRight className="w-8 h-8 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-900">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">Email Dispatch Alerts</h5>
                  <p className="text-[10px] text-slate-450 mt-0.5">Notify candidate when recruiter shortlists / schedules interview loops.</p>
                </div>
                <button onClick={() => toggleSetting('emailNotifications')} className="cursor-pointer">
                  {settings.emailNotifications ? (
                    <ToggleRight className="w-8 h-8 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* WhatsApp Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-900">
                <div>
                  <h5 className="text-xs font-bold text-slate-200">WhatsApp Notification dispatch</h5>
                  <p className="text-[10px] text-slate-450 mt-0.5">Integrate WhatsApp alerts for immediate interview coordination.</p>
                </div>
                <button onClick={() => toggleSetting('whatsappNotifications')} className="cursor-pointer">
                  {settings.whatsappNotifications ? (
                    <ToggleRight className="w-8 h-8 text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </Card>

          {/* System Info card */}
          <Card className="lg:col-span-5 border-white/5 p-6 self-start space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Diagnostic Console</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-indigo-300 text-xs leading-relaxed">
              <Info className="w-5 h-5 shrink-0" />
              <span>Threshold shifts instantly recalculate and sync candidate classifications.</span>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-400 pt-2">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Storage Layer</span>
                <span className="font-mono text-slate-300">LocalStorage persist (Mock AWS S3)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>API Gateway</span>
                <span className="font-mono text-slate-300">Secure Web Client Simulator</span>
              </div>
              <div className="flex justify-between">
                <span>Deployment Region</span>
                <span className="font-mono text-slate-300">Localhost Debug</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: DOMAINS CONFIG DIRECTORY */}
      {activeSubTab === 'domains' && (
        <Card className="border-white/5 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Active Job Domains</h3>
              <p className="text-xs text-slate-400 mt-1">Configure active categorization tracks for resume uploads and parsing divisions.</p>
            </div>
            <div className="flex gap-2 w-full md:max-w-xs">
              <input 
                type="text" 
                placeholder="e.g. Cyber Security" 
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950/65 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <Button variant="primary" size="sm" onClick={handleAddDomain} className="!text-xs">
                Add
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {domains.map((d, index) => (
              <div key={index} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-850/80 flex items-center justify-between group">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  {d}
                </span>
                <button 
                  onClick={() => handleRemoveDomain(d)}
                  className="text-slate-550 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: RECRUITER SESSION LOGS */}
      {activeSubTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Logs List Table */}
          <Card className="lg:col-span-8 border-white/5 overflow-hidden p-0">
            <div className="p-5 border-b border-white/5 bg-slate-900/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Shift Logs & Attendance</h3>
                <p className="text-[10px] text-slate-450 mt-1">Recruiters are required to log a minimum of 8.0 working hours per shift.</p>
              </div>
              <Badge color="blue">{hrLogs.length} Total Shifts</Badge>
            </div>
            
            <div className="overflow-x-auto">
              {hrLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No recruiter session logs found. Use the simulation tool or log in as a recruiter.
                </div>
              ) : (
                <table className="w-full text-slate-350">
                  <thead>
                    <tr className="bg-slate-900/40 border-b border-white/5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-3.5 text-left">Recruiter</th>
                      <th className="px-6 py-3.5 text-left">Date</th>
                      <th className="px-6 py-3.5 text-left">Login / Logout</th>
                      <th className="px-6 py-3.5 text-center">Duration</th>
                      <th className="px-6 py-3.5 text-center">Compliance Status</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-900/5">
                    {[...hrLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
                      const isCompliant = log.durationHours >= 8.0;
                      return (
                        <tr key={log.id} className="hover:bg-white/2.5 transition-colors">
                          <td className="px-6 py-3.5 text-left font-semibold text-slate-100 text-sm font-heading">
                            {log.recruiterName}
                          </td>
                          <td className="px-6 py-3.5 text-left text-xs text-slate-400">
                            <span className="flex items-center gap-1.5 pt-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-550" />
                              {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-left text-xs font-mono text-slate-450">
                            <span className="text-slate-300">
                              {new Date(log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="mx-1 text-slate-600">→</span>
                            <span className="text-slate-300">
                              {new Date(log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center font-mono text-xs font-semibold text-indigo-300">
                            {log.durationHours} hrs
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <div className="flex justify-center">
                              {isCompliant ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle className="w-3 h-3 text-emerald-450" /> Compliant
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                  <AlertTriangle className="w-3 h-3 text-red-400" /> Shift Short
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button 
                              onClick={() => {
                                if (confirm('Delete this shift log permanently?')) {
                                  deleteHRLog(log.id);
                                }
                              }}
                              className="text-slate-550 hover:text-red-400 transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          {/* Sidebar Metrics & Simulate Log Form */}
          <div className="lg:col-span-4 space-y-6">
            {/* KPI compliance summary */}
            <Card className="border-white/5 p-5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Compliance Statistics</h3>
              
              {(() => {
                const total = hrLogs.length;
                const compliant = hrLogs.filter(l => l.durationHours >= 8.0).length;
                const short = total - compliant;
                const rate = total > 0 ? Math.round((compliant / total) * 100) : 100;
                
                return (
                  <div className="space-y-4">
                    {/* Radial Indicator */}
                    <div className="flex items-center justify-between bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compliance Rate</span>
                        <h4 className="text-2xl font-extrabold text-indigo-400 mt-1 font-heading">{rate}%</h4>
                      </div>
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle
                            className="text-slate-800"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.9155"
                          />
                          <circle
                            className="text-indigo-500"
                            strokeDasharray={`${rate}, 100`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.9155"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-400">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Total Tracked Shifts</span>
                        <span className="font-semibold text-slate-200">{total}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-450" /> Compliant Shifts (≥8h)</span>
                        <span className="font-semibold text-emerald-400">{compliant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Under 8 hours</span>
                        <span className="font-semibold text-red-400">{short}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card>

            {/* Simulate Shift Log Form */}
            <Card className="border-white/5 p-5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Simulate Shift Log</h3>
              
              <form onSubmit={handleSimulateLog} className="space-y-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Recruiter</label>
                  <select 
                    value={simRecruiterId} 
                    onChange={(e) => setSimRecruiterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 cursor-pointer"
                  >
                    {recruiters.length === 0 ? (
                      <option value="">No recruiters found</option>
                    ) : (
                      recruiters.map(r => (
                        <option key={r.id} value={r.id} className="bg-slate-950">{r.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <Input 
                  label="Shift Date" 
                  type="date"
                  value={simDate} 
                  onChange={(e) => setSimDate(e.target.value)} 
                />

                <Input 
                  label="Shift Duration (Hours)" 
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="24"
                  placeholder="e.g. 8.5"
                  value={simHours} 
                  onChange={(e) => setSimHours(e.target.value)} 
                />

                <Button type="submit" variant="primary" className="w-full mt-2 !text-xs">
                  <Plus className="w-4 h-4 mr-1.5" /> Log Simulated Shift
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
};
