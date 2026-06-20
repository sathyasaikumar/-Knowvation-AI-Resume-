import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDatabase } from '../db/mockDatabase';
import type { 
  User, Candidate, Job, Application, SystemSettings, 
  ApplicationStatus, UserRole, HRSessionLog
} from '../db/mockDatabase';

interface AppContextType {
  currentUser: User | null;
  candidateProfile: Candidate | null;
  jobs: Job[];
  applications: Application[];
  settings: SystemSettings;
  users: User[];
  candidates: Candidate[];
  hrLogs: HRSessionLog[];
  loading: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  register: (email: string, name: string, role: UserRole) => Promise<boolean>;
  applyToJob: (jobId: string) => void;
  updateProfile: (profile: Candidate) => void;
  addJob: (job: Job) => void;
  removeJob: (id: string) => void;
  changeApplicationStatus: (appId: string, status: ApplicationStatus, comment?: string) => void;
  saveSystemSettings: (settings: SystemSettings) => void;
  removeUser: (id: string) => void;
  saveHRLog: (log: HRSessionLog) => void;
  deleteHRLog: (id: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    passingThreshold: 80,
    chatbotEnabled: true,
    emailNotifications: true,
    whatsappNotifications: false
  });
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hrLogs, setHrLogs] = useState<HRSessionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = () => {
    setJobs(mockDatabase.getJobs());
    setApplications(mockDatabase.getApplications());
    setSettings(mockDatabase.getSettings());
    setUsers(mockDatabase.getUsers());
    setCandidates(mockDatabase.getCandidates());
    setHrLogs(mockDatabase.getHRLogs());
    
    const session = mockDatabase.getCurrentSession();
    if (session) {
      setCurrentUser(session);
      if (session.role === 'candidate') {
        const profile = mockDatabase.getCandidateById(session.id);
        setCandidateProfile(profile);
      } else {
        setCandidateProfile(null);
      }
    } else {
      setCurrentUser(null);
      setCandidateProfile(null);
    }
  };

  useEffect(() => {
    // Initial load
    refreshData();
    setLoading(false);
  }, []);

  // Login simulation (simplifying without passwords for prototype ease, matching by role/email)
  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const dbUsers = mockDatabase.getUsers();
    const matchedUser = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

    if (!matchedUser) {
      setLoading(false);
      return false;
    }

    mockDatabase.setCurrentSession(matchedUser);
    if (role === 'recruiter') {
      localStorage.setItem('kr_recruiter_session_start', new Date().toISOString());
    }
    refreshData();
    setLoading(false);
    return true;
  };

  const logout = () => {
    const session = mockDatabase.getCurrentSession();
    if (session && session.role === 'recruiter') {
      const startTimeStr = localStorage.getItem('kr_recruiter_session_start');
      if (startTimeStr) {
        const startTime = new Date(startTimeStr);
        const endTime = new Date();
        const diffMs = endTime.getTime() - startTime.getTime();
        let durationHours = diffMs / 3600000;
        
        // If logged out quickly, simulate a dynamic shift between 7.0 and 9.5 hours for immediate compliance visual testing
        if (durationHours < 0.02) {
          durationHours = parseFloat((7.0 + Math.random() * 2.5).toFixed(2));
        } else {
          durationHours = parseFloat(durationHours.toFixed(2));
        }

        const newLog: HRSessionLog = {
          id: `log-${Date.now()}`,
          recruiterId: session.id,
          recruiterName: session.name,
          date: new Date().toISOString().split('T')[0],
          loginTime: startTime.toISOString(),
          logoutTime: endTime.toISOString(),
          durationHours
        };
        mockDatabase.saveHRLog(newLog);
        localStorage.removeItem('kr_recruiter_session_start');
      }
    }
    mockDatabase.setCurrentSession(null);
    refreshData();
  };

  const register = async (email: string, name: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const dbUsers = mockDatabase.getUsers();
    const existing = dbUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setLoading(false);
      return false; // Email already registered
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      isVerified: role !== 'candidate', // candidates require email verification mock
      joinedAt: new Date().toISOString()
    };

    mockDatabase.saveUser(newUser);

    if (role === 'candidate') {
      const newCandidate: Candidate = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: '',
        location: '',
        highestQualification: "Bachelor's",
        skills: [],
        certifications: [],
        experienceYears: 0,
        currentCompany: '',
        experienceTimeline: [],
        projects: []
      };
      mockDatabase.saveCandidate(newCandidate);
    }

    // Auto-login after registration
    mockDatabase.setCurrentSession(newUser);
    if (role === 'recruiter') {
      localStorage.setItem('kr_recruiter_session_start', new Date().toISOString());
    }
    refreshData();
    setLoading(false);
    return true;
  };

  const applyToJob = (jobId: string) => {
    if (!currentUser || currentUser.role !== 'candidate') return;
    mockDatabase.createApplication(currentUser.id, jobId);
    refreshData();
  };

  const updateProfile = (profile: Candidate) => {
    mockDatabase.saveCandidate(profile);
    // Sync User name if changed
    if (currentUser && currentUser.name !== profile.name) {
      const updatedUser = { ...currentUser, name: profile.name };
      mockDatabase.saveUser(updatedUser);
      mockDatabase.setCurrentSession(updatedUser);
    }
    refreshData();
  };

  const addJob = (job: Job) => {
    mockDatabase.saveJob(job);
    refreshData();
  };

  const removeJob = (id: string) => {
    mockDatabase.deleteJob(id);
    refreshData();
  };

  const changeApplicationStatus = (appId: string, status: ApplicationStatus, comment?: string) => {
    const apps = mockDatabase.getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const defaultComments: Record<ApplicationStatus, string> = {
      applied: 'Application reopened.',
      screening: 'Application returned to screening state.',
      hr_review: 'Shortlisted for Recruiter review.',
      technical_interview: 'Technical Interview scheduled.',
      hr_interview: 'HR Interview scheduled.',
      selected: 'Hiring decision made: Shortlisted for Offer release.',
      rejected: 'Application rejected after recruiter evaluation.'
    };

    const newApp: Application = {
      ...app,
      status,
      timeline: [
        ...app.timeline,
        {
          status,
          date: new Date().toISOString(),
          comment: comment || defaultComments[status]
        }
      ]
    };

    mockDatabase.saveApplication(newApp);
    refreshData();
  };

  const saveSystemSettings = (newSettings: SystemSettings) => {
    mockDatabase.saveSettings(newSettings);
    refreshData();
  };

  const removeUser = (id: string) => {
    mockDatabase.deleteUser(id);
    refreshData();
  };

  const saveHRLog = (log: HRSessionLog) => {
    mockDatabase.saveHRLog(log);
    refreshData();
  };

  const deleteHRLog = (id: string) => {
    mockDatabase.deleteHRLog(id);
    refreshData();
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      candidateProfile,
      jobs,
      applications,
      settings,
      users,
      candidates,
      hrLogs,
      loading,
      login,
      logout,
      register,
      applyToJob,
      updateProfile,
      addJob,
      removeJob,
      changeApplicationStatus,
      saveSystemSettings,
      removeUser,
      saveHRLog,
      deleteHRLog,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
