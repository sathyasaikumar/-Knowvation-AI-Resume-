import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateATSScore } from '../../db/mockDatabase';
import type { Job, Candidate, Application, ApplicationStatus } from '../../db/mockDatabase';
import { generateAIRecommendations, highlightResumeText } from '../../utils/resumeParser';
import { 
  Users, CheckCircle, XCircle, Search, Download, Plus, 
  ArrowUpDown, Eye, ClipboardList, Folder, FolderOpen, FileText, FileDown,
  TrendingUp, Award, Activity
} from 'lucide-react';
import { Card, Button, Badge, Input, Modal, Textarea } from '../ui';

// Register Chart.js Components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Radar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dropdown Helper
const FilterSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}> = ({ value, onChange, options, placeholder }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 cursor-pointer"
  >
    {placeholder && <option value="" className="bg-slate-950">{placeholder}</option>}
    {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-950">{opt.label}</option>)}
  </select>
);

export const RecruiterDashboard: React.FC = () => {
  const { 
    jobs, 
    applications, 
    candidates, 
    settings,
    addJob, 
    removeJob,
    changeApplicationStatus 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'applicants' | 'jobs' | 'analytics' | 'folders' | 'comparison'>('applicants');

  // Comparative Selector State
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  // Seed compare ids on mount/load
  React.useEffect(() => {
    if (candidates.length > 0 && selectedCompareIds.length === 0) {
      setSelectedCompareIds(candidates.map(c => c.id));
    }
  }, [candidates]);

  const getTopCandidateId = () => {
    let topId = '';
    let topScore = -1;
    
    candidates
      .filter(c => selectedCompareIds.includes(c.id))
      .forEach(cand => {
        const app = applications.find(a => a.candidateId === cand.id);
        const score = app ? app.atsScore : 0;
        if (score > topScore) {
          topScore = score;
          topId = cand.id;
        }
      });
      
    return topId;
  };

  // Dynamically calculate analytics data
  const getAnalyticsData = () => {
    const domains = [
      { key: 'ai', label: 'AI/ML Engineering', count: 0, totalScore: 0 },
      { key: 'fullstack', label: 'Full Stack Dev', count: 0, totalScore: 0 },
      { key: 'devops', label: 'Cloud/DevOps', count: 0, totalScore: 0 },
      { key: 'data', label: 'Data Science', count: 0, totalScore: 0 },
      { key: 'hr', label: 'HR Management', count: 0, totalScore: 0 },
      { key: 'other', label: 'Other Domains', count: 0, totalScore: 0 }
    ];

    candidates.forEach(cand => {
      const app = applications.find(a => a.candidateId === cand.id);
      const job = app ? jobs.find(j => j.id === app.jobId) : null;
      const score = app ? app.atsScore : 50;

      const domain = job ? job.domain.toLowerCase() : '';
      const skillsLower = cand.skills.map(s => s.toLowerCase());

      if (domain.includes('artificial') || domain.includes('ai') || domain.includes('machine learning') || skillsLower.includes('pytorch') || skillsLower.includes('tensorflow')) {
        domains[0].count++;
        domains[0].totalScore += score;
      } else if (domain.includes('full stack') || domain.includes('mern') || domain.includes('software') || skillsLower.includes('react') || skillsLower.includes('node.js')) {
        domains[1].count++;
        domains[1].totalScore += score;
      } else if (domain.includes('cloud') || domain.includes('devops') || skillsLower.includes('docker') || skillsLower.includes('aws')) {
        domains[2].count++;
        domains[2].totalScore += score;
      } else if (domain.includes('data science') || domain.includes('data analyst') || skillsLower.includes('power bi') || skillsLower.includes('sql')) {
        domains[3].count++;
        domains[3].totalScore += score;
      } else if (domain.includes('hr') || domain.includes('recruiting') || skillsLower.includes('hr management')) {
        domains[4].count++;
        domains[4].totalScore += score;
      } else {
        domains[5].count++;
        domains[5].totalScore += score;
      }
    });

    const statusCounts = {
      applied: 0,
      screening: 0,
      hr_review: 0,
      technical_interview: 0,
      hr_interview: 0,
      selected: 0,
      rejected: 0
    };

    applications.forEach(app => {
      if (app.status in statusCounts) {
        statusCounts[app.status as keyof typeof statusCounts]++;
      }
    });

    // Compute top skills
    const skillCounts: Record<string, number> = {};
    candidates.forEach(cand => {
      cand.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const sortedSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      domains,
      statusCounts,
      sortedSkills
    };
  };

  const analytics = getAnalyticsData();

  // Filter/Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterExperience, setFilterExperience] = useState(''); // 'fresher' | 'junior' | 'senior'
  const [sortField, setSortField] = useState<'score' | 'experience' | 'applied'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal Detail States
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusComment, setStatusComment] = useState('');

  // Job Creator States
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('Knowvation Corp');
  const [newJobDomain, setNewJobDomain] = useState('Software Engineering');
  const [newJobReqSkills, setNewJobReqSkills] = useState('');
  const [newJobPrefSkills, setNewJobPrefSkills] = useState('');
  const [newJobExp, setNewJobExp] = useState(2);
  const [newJobQual, setNewJobQual] = useState("Bachelor's");
  const [newJobLoc, setNewJobLoc] = useState('Bangalore, India');
  const [newJobSalary, setNewJobSalary] = useState('$80,000 - $110,000');
  const [newJobDesc, setNewJobDesc] = useState('');

  // Resume Folders visualizer state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'Software Engineering': true,
    'Data Science': true,
    'AI/ML': true,
    'HR': true,
    'Other Domains': false
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const getCandidatesByFolder = () => {
    const folders: Record<string, Candidate[]> = {
      'Software Engineering': [],
      'Data Science': [],
      'AI/ML': [],
      'HR': [],
      'Other Domains': []
    };

    candidates.forEach(cand => {
      const app = applications.find(a => a.candidateId === cand.id);
      const job = app ? jobs.find(j => j.id === app.jobId) : null;
      const domain = job ? job.domain.toLowerCase() : '';
      const skillsLower = cand.skills.map(s => s.toLowerCase());

      if (domain.includes('artificial intelligence') || domain.includes('ai') || domain.includes('machine learning') || skillsLower.includes('pytorch') || skillsLower.includes('tensorflow') || skillsLower.includes('machine learning')) {
        folders['AI/ML'].push(cand);
      } else if (domain.includes('full stack') || domain.includes('frontend') || domain.includes('backend') || domain.includes('software') || skillsLower.includes('react') || skillsLower.includes('node.js') || skillsLower.includes('javascript') || skillsLower.includes('typescript')) {
        folders['Software Engineering'].push(cand);
      } else if (domain.includes('data science') || domain.includes('data analyst') || skillsLower.includes('power bi') || skillsLower.includes('tableau') || skillsLower.includes('pandas')) {
        folders['Data Science'].push(cand);
      } else if (domain.includes('hr') || domain.includes('recruiting') || skillsLower.includes('hr management') || skillsLower.includes('employee relations')) {
        folders['HR'].push(cand);
      } else {
        folders['Other Domains'].push(cand);
      }
    });

    return folders;
  };

  // 1. KPI Aggregations
  const totalApplicants = candidates.length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;
  const interviewCount = applications.filter(a => a.status === 'technical_interview' || a.status === 'hr_interview').length;

  // 2. Data Filtering & Formatting
  const getCandidateData = () => {
    let list = candidates.map(candidate => {
      // Find candidate's application (simplifying, checking current active matching)
      const app = applications.find(a => a.candidateId === candidate.id && (filterJob ? a.jobId === filterJob : true));
      const job = app ? jobs.find(j => j.id === app.jobId) : (jobs[0] || null);
      
      const scoreData = job 
        ? calculateATSScore(candidate, job)
        : { score: 0, breakdown: { skillMatch: 0, experienceMatch: 0, educationMatch: 0, keywordMatch: 0 } };

      return {
        candidate,
        app: app || null,
        job: job || null,
        atsScore: app ? app.atsScore : scoreData.score,
        scoreBreakdown: app ? app.scoreBreakdown : scoreData.breakdown,
        appliedDate: app ? app.appliedAt : '2026-06-18T00:00:00Z'
      };
    });

    // Apply Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item => 
        item.candidate.name.toLowerCase().includes(q) || 
        item.candidate.skills.some(s => s.toLowerCase().includes(q)) ||
        (item.job && item.job.title.toLowerCase().includes(q))
      );
    }

    // Apply Job Filter
    if (filterJob) {
      list = list.filter(item => item.app && item.app.jobId === filterJob);
    }

    // Apply Status Filter
    if (filterStatus) {
      list = list.filter(item => item.app && item.app.status === filterStatus);
    }

    // Apply Experience Range Filter
    if (filterExperience) {
      list = list.filter(item => {
        const y = item.candidate.experienceYears;
        if (filterExperience === 'fresher') return y === 0;
        if (filterExperience === 'junior') return y > 0 && y <= 3;
        if (filterExperience === 'senior') return y > 3;
        return true;
      });
    }

    // Apply Sorting
    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortField === 'score') {
        valA = a.atsScore;
        valB = b.atsScore;
      } else if (sortField === 'experience') {
        valA = a.candidate.experienceYears;
        valB = b.candidate.experienceYears;
      } else if (sortField === 'applied') {
        valA = new Date(a.appliedDate).getTime();
        valB = new Date(b.appliedDate).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  };

  const processedCandidates = getCandidateData();

  // Sort helper
  const triggerSort = (field: 'score' | 'experience' | 'applied') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (processedCandidates.length === 0) return;
    
    // CSV headers
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Highest Qualification', 'Experience (Years)', 'ATS Score', 'Status', 'Matched Job', 'Skills'];
    
    const rows = processedCandidates.map(item => [
      item.candidate.name,
      item.candidate.email,
      item.candidate.phone,
      item.candidate.location,
      item.candidate.highestQualification,
      item.candidate.experienceYears,
      item.atsScore,
      item.app ? item.app.status.toUpperCase() : 'NO APPLICATION',
      item.job ? item.job.title : 'None',
      item.candidate.skills.join(' | ')
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `knowvation_candidates_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Modal handlers
  const handleOpenDetail = (candidate: Candidate, app: Application | null) => {
    // If no app but candidate is selected, bind mock data from job 1
    let activeApp = app;
    if (!app && jobs.length > 0) {
      // Find or create application
      activeApp = applications.find(a => a.candidateId === candidate.id) || null;
    }
    
    setSelectedCandidate(candidate);
    setSelectedApp(activeApp);
    setStatusComment('');
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (status: ApplicationStatus) => {
    if (!selectedApp) return;
    changeApplicationStatus(selectedApp.id, status, statusComment.trim() || undefined);
    
    // Refresh modal states
    const updatedApps = applications; // Since it's in state context, fetch again
    const matched = updatedApps.find(a => a.id === selectedApp.id);
    if (matched) setSelectedApp(matched);
    
    setStatusComment('');
    alert(`Status updated successfully to: ${status.toUpperCase().replace('_', ' ')}`);
  };

  // Job Creator Submit
  const handleCreateJob = () => {
    if (!newJobTitle || !newJobDesc || !newJobReqSkills) {
      alert('Please populate Title, Description and Required Skills.');
      return;
    }

    const reqArray = newJobReqSkills.split(',').map(s => s.trim()).filter(Boolean);
    const prefArray = newJobPrefSkills ? newJobPrefSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: newJobTitle,
      company: newJobCompany,
      domain: newJobDomain,
      requiredSkills: reqArray,
      preferredSkills: prefArray,
      experienceRequired: Number(newJobExp),
      qualificationRequired: newJobQual,
      location: newJobLoc,
      salaryRange: newJobSalary,
      description: newJobDesc,
      createdAt: new Date().toISOString()
    };

    addJob(newJob);
    setIsCreateJobOpen(false);

    // reset fields
    setNewJobTitle('');
    setNewJobReqSkills('');
    setNewJobPrefSkills('');
    setNewJobExp(2);
    setNewJobDesc('');
    
    alert(`Job posting for "${newJob.title}" published! Candidate ATS compatibility scores have been automatically updated.`);
  };

  // AI Fit Recommendation breakdown
  const activeRecs = selectedCandidate && selectedApp 
    ? generateAIRecommendations(selectedCandidate, jobs.find(j => j.id === selectedApp.jobId) || jobs[0])
    : null;

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header with Stats Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-indigo-500/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Candidates</span>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-1 font-heading">{totalApplicants}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/25">
            <Users className="w-5 h-5" />
          </div>
        </Card>
        
        <Card className="p-4 border-emerald-500/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shortlisted (HR)</span>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-heading">{selectedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-450 rounded-2xl border border-emerald-500/25">
            <CheckCircle className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-amber-500/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">In Interviews</span>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1 font-heading">{interviewCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-450 rounded-2xl border border-amber-500/25">
            <ClipboardList className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-rose-500/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Auto-Rejected</span>
            <h3 className="text-2xl font-extrabold text-rose-450 mt-1 font-heading">{rejectedCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-450 rounded-2xl border border-rose-500/25">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/5 pb-2">
        <button 
          onClick={() => setActiveSubTab('applicants')}
          className={`px-5 py-2 text-sm font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'applicants' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Applicants Directory
        </button>
        <button 
          onClick={() => setActiveSubTab('jobs')}
          className={`px-5 py-2 text-sm font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'jobs' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Job Openings ({jobs.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('analytics')}
          className={`px-5 py-2 text-sm font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'analytics' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hiring Analytics
        </button>
        <button 
          onClick={() => setActiveSubTab('folders')}
          className={`px-5 py-2 text-sm font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'folders' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Resume Storage
        </button>
        <button 
          onClick={() => setActiveSubTab('comparison')}
          className={`px-5 py-2 text-sm font-bold transition-all relative cursor-pointer ${
            activeSubTab === 'comparison' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Resume Comparison
        </button>
      </div>

      {/* TAB 1: APPLICANTS DIRECTORY */}
      {activeSubTab === 'applicants' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <Card className="p-4 border-white/5 flex flex-col md:flex-row flex-wrap items-center justify-between gap-3 bg-slate-900/20">
            <div className="flex flex-1 items-center gap-3 w-full md:max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  placeholder="Search applicants name or skill tags..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/45 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <FilterSelect 
                placeholder="All Positions"
                value={filterJob} 
                onChange={setFilterJob} 
                options={jobs.map(j => ({ value: j.id, label: j.title }))} 
              />
              <FilterSelect 
                placeholder="All Statuses"
                value={filterStatus} 
                onChange={setFilterStatus} 
                options={[
                  { value: 'hr_review', label: 'HR Review' },
                  { value: 'technical_interview', label: 'Tech Interview' },
                  { value: 'hr_interview', label: 'HR Interview' },
                  { value: 'selected', label: 'Offer Approved' },
                  { value: 'rejected', label: 'Rejected' }
                ]} 
              />
              <FilterSelect 
                placeholder="Experience Range"
                value={filterExperience} 
                onChange={setFilterExperience} 
                options={[
                  { value: 'fresher', label: 'Fresher (0 Years)' },
                  { value: 'junior', label: 'Junior (1-3 Years)' },
                  { value: 'senior', label: 'Senior (3+ Years)' }
                ]} 
              />

              <Button 
                variant="secondary" 
                size="sm"
                className="py-2.5 !text-xs" 
                onClick={handleExportCSV}
                disabled={processedCandidates.length === 0}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export Data
              </Button>
            </div>
          </Card>

          {/* Table list */}
          <Card className="border-white/5 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-slate-300">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 text-left">Candidate Name</th>
                    <th className="px-6 py-4 text-left">Applied Role</th>
                    <th className="px-6 py-4 text-center cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => triggerSort('experience')}>
                      Exp Years <ArrowUpDown className="w-3 h-3 inline ml-1" />
                    </th>
                    <th className="px-6 py-4 text-center cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => triggerSort('score')}>
                      ATS Match <ArrowUpDown className="w-3 h-3 inline ml-1" />
                    </th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-900/10">
                  {processedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-xs font-semibold">
                        No applicants found matching current filter selection.
                      </td>
                    </tr>
                  ) : (
                    processedCandidates.map(({ candidate, app, job, atsScore }) => {
                      const exceeds = atsScore >= settings.passingThreshold;
                      
                      return (
                        <tr key={candidate.id} className="hover:bg-white/2.5 transition-colors">
                          <td className="px-6 py-4.5 text-left">
                            <div className="font-bold text-slate-100 text-sm font-heading">{candidate.name}</div>
                            <div className="text-[10px] text-slate-450 truncate max-w-[200px] mt-0.5">{candidate.skills.slice(0, 3).join(', ')}...</div>
                          </td>
                          <td className="px-6 py-4.5 text-left text-xs font-medium text-slate-350">
                            {job ? (
                              <div>
                                <span className="font-bold text-slate-200">{job.title}</span>
                                <span className="text-[10px] text-slate-450 block mt-0.5">{job.company}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">Not Applied</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-center text-xs font-semibold text-slate-300">
                            {candidate.experienceYears} Yrs
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl font-mono ${
                              exceeds 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                            }`}>
                              {atsScore}%
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            {app ? (
                              <Badge color={
                                app.status === 'selected' ? 'emerald' : 
                                app.status === 'rejected' ? 'rose' : 
                                app.status === 'hr_review' ? 'purple' : 'amber'
                              }>
                                {app.status.toUpperCase().replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-550">Not Scanned</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="px-3 py-1.5 !text-xs font-semibold"
                              onClick={() => handleOpenDetail(candidate, app)}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Scorecard
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: JOB OPENINGS LIST */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Active Requirements</h3>
            <Button variant="primary" size="sm" onClick={() => setIsCreateJobOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Create Job Opening
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => (
              <Card key={job.id} className="border-white/5 flex flex-col justify-between" hoverable>
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-base font-heading">{job.title}</h4>
                      <p className="text-xs text-indigo-400 mt-1 font-semibold">{job.company} • {job.domain}</p>
                    </div>
                    <Badge color="blue">{job.location.split(',')[0]}</Badge>
                  </div>

                  <p className="text-xs text-slate-400 mt-3.5 line-clamp-3 leading-relaxed">{job.description}</p>

                  <div className="mt-4.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="font-bold text-slate-450 uppercase text-[9px]">Req Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {job.requiredSkills.map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950/50 border border-slate-850 text-slate-350 text-[10px]">{s}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="font-bold text-slate-450 uppercase text-[9px]">Exp Target:</span>
                      <span className="text-[10px] text-slate-200">{job.experienceRequired}+ Years ({job.qualificationRequired} Degree)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-450">{job.salaryRange}</span>
                  <button 
                    onClick={() => removeJob(job.id)}
                    className="text-slate-550 hover:text-rose-400 transition-colors p-1.5 text-xs font-semibold cursor-pointer rounded-lg hover:bg-rose-500/10"
                  >
                    Delete Posting
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}      {/* TAB 3: HIRING ANALYTICS */}
      {activeSubTab === 'analytics' && (() => {
        // Prepare chart datasets dynamically
        const radarData = {
          labels: analytics.domains.map(d => d.label),
          datasets: [
            {
              label: 'Candidate Density',
              data: analytics.domains.map(d => d.count),
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderColor: '#6366f1',
              borderWidth: 2,
              pointBackgroundColor: '#6366f1',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#6366f1'
            },
            {
              label: 'Average ATS Score (%)',
              data: analytics.domains.map(d => d.count > 0 ? Math.round(d.totalScore / d.count) : 0),
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              borderColor: '#a855f7',
              borderWidth: 2,
              pointBackgroundColor: '#a855f7',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#a855f7'
            }
          ]
        };

        const doughnutData = {
          labels: ['Shortlisted (HR)', 'Tech Interview', 'HR Interview', 'Selected', 'Auto-Rejected'],
          datasets: [
            {
              data: [
                analytics.statusCounts.hr_review,
                analytics.statusCounts.technical_interview,
                analytics.statusCounts.hr_interview,
                analytics.statusCounts.selected,
                analytics.statusCounts.rejected
              ],
              backgroundColor: [
                'rgba(168, 85, 247, 0.65)',
                'rgba(245, 158, 11, 0.65)',
                'rgba(59, 130, 246, 0.65)',
                'rgba(16, 185, 129, 0.65)',
                'rgba(244, 63, 94, 0.65)'
              ],
              borderColor: [
                '#a855f7',
                '#f59e0b',
                '#3b82f6',
                '#10b981',
                '#f43f5e'
              ],
              borderWidth: 1.5
            }
          ]
        };

        const sortedScores = applications.map(a => a.atsScore).sort((a, b) => a - b);
        const lineLabels = sortedScores.map((_, i) => `Cand ${i + 1}`);
        const lineData = {
          labels: lineLabels.length > 0 ? lineLabels : ['No Data'],
          datasets: [
            {
              label: 'ATS Match Score Spectrum',
              data: sortedScores.length > 0 ? sortedScores : [0],
              fill: true,
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              borderColor: '#6366f1',
              borderWidth: 2.5,
              tension: 0.45,
              pointBackgroundColor: '#818cf8',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#818cf8'
            }
          ]
        };

        const radarOptions = {
          scales: {
            r: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
              pointLabels: { color: '#94a3b8', font: { size: 9, weight: 'bold' as any } },
              ticks: { display: false }
            }
          },
          plugins: {
            legend: { labels: { color: '#cbd5e1', font: { size: 9 } } },
            tooltip: { backgroundColor: '#0f172a', titleColor: '#6366f1', bodyColor: '#f1f5f9' }
          },
          responsive: true,
          maintainAspectRatio: false
        };

        const doughnutOptions = {
          plugins: {
            legend: { position: 'bottom' as any, labels: { color: '#cbd5e1', font: { size: 9 } } },
            tooltip: { backgroundColor: '#0f172a', bodyColor: '#f1f5f9' }
          },
          responsive: true,
          maintainAspectRatio: false
        };

        const lineOptions = {
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.02)' }, ticks: { color: '#64748b', font: { size: 8 } } },
            y: { min: 0, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b', font: { size: 8 } } }
          },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#0f172a', bodyColor: '#f1f5f9' }
          },
          responsive: true,
          maintainAspectRatio: false
        };

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Analytics Summary Header */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Talent Diagnostics & Performance Metrics</h3>
              <p className="text-[10px] text-slate-450 mt-1">AI predictive indexing and talent pool composition matching.</p>
            </div>

            {/* Top Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Radar: Candidates by Domain */}
              <Card className="lg:col-span-7 border-white/5 p-6 bg-slate-900/10 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Domain Fit Analysis</h4>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Radar Fit</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Radar Chart */}
                  <div className="md:col-span-7 h-64 relative">
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                  {/* Stats list with percentages and scores */}
                  <div className="md:col-span-5 space-y-2.5 bg-slate-950/30 p-4 rounded-2xl border border-white/5">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domain Share & Avg Match</h5>
                    {analytics.domains.map((dom, i) => {
                      const totalCount = candidates.length;
                      const sharePercent = totalCount > 0 ? Math.round((dom.count / totalCount) * 100) : 0;
                      const avgScore = dom.count > 0 ? Math.round(dom.totalScore / dom.count) : 0;

                      return (
                        <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1.5 last:border-b-0 last:pb-0">
                          <div className="min-w-0">
                            <span className="font-bold text-slate-350 block truncate">{dom.label}</span>
                            <span className="text-[9px] text-slate-500 font-semibold">{dom.count} Candidates ({sharePercent}%)</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[9px] ${
                              avgScore >= settings.passingThreshold 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : avgScore > 0 
                                ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' 
                                : 'bg-slate-800 text-slate-500 border border-slate-700/30'
                            }`}>
                              {avgScore > 0 ? `${avgScore}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Doughnut: Pipeline Status splits */}
              <Card className="lg:col-span-5 border-white/5 p-6 bg-slate-900/10 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Hiring Funnel Status</h4>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Pipeline</span>
                </div>
                <div className="h-64 relative">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </Card>
            </div>

            {/* Bottom Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Line: Score distribution */}
              <Card className="lg:col-span-8 border-white/5 p-6 bg-slate-900/10 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">ATS Score Distribution Spectrum</h4>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Distribution</span>
                </div>
                <div className="h-48 relative">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </Card>

              {/* Top Skills Heatmap list */}
              <Card className="lg:col-span-4 border-white/5 p-6 bg-slate-900/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Top Talent Pool Skills</h4>
                  <div className="space-y-3.5">
                    {analytics.sortedSkills.map((skill, index) => {
                      const totalCand = candidates.length;
                      const percent = Math.round((skill.count / totalCand) * 100);
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-350">
                            <span className="font-mono">{skill.name}</span>
                            <span className="text-[10px] text-indigo-400">{skill.count} Candidates ({percent}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-950/60 overflow-hidden border border-slate-900">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-4">
                  Based on verified resume parser extractions
                </div>
              </Card>
            </div>
          </div>
        );
      })()}

      {/* TAB 4: RESUME STORAGE EXPLORER */}
      {activeSubTab === 'folders' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Resume Storage Explorer</h3>
            <p className="text-[10px] text-slate-450 mt-1">Structured folders representing files parsed by functional domain divisions.</p>
          </div>

          <Card className="border-white/5 p-5 bg-slate-900/10">
            <div className="space-y-3">
              {Object.entries(getCandidatesByFolder()).map(([folderName, folderCandidates]) => {
                const isExpanded = expandedFolders[folderName];
                return (
                  <div key={folderName} className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/20">
                    {/* Folder Header */}
                    <button
                      onClick={() => toggleFolder(folderName)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-slate-200 hover:bg-white/2.5 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <FolderOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                        ) : (
                          <Folder className="w-5 h-5 text-indigo-400/80 shrink-0" />
                        )}
                        <div>
                          <span className="text-xs font-bold font-heading">{folderName}</span>
                          <span className="text-[9px] text-slate-500 font-mono ml-2">({folderCandidates.length} {folderCandidates.length === 1 ? 'file' : 'files'})</span>
                        </div>
                      </div>
                      <div className="text-slate-550 hover:text-slate-350 transition-colors">
                        {isExpanded ? (
                          <span className="text-xs font-semibold">Collapse</span>
                        ) : (
                          <span className="text-xs font-semibold">Expand</span>
                        )}
                      </div>
                    </button>

                    {/* Folder Files List */}
                    {isExpanded && (
                      <div className="border-t border-white/5 divide-y divide-white/5 bg-slate-950/40">
                        {folderCandidates.length === 0 ? (
                          <div className="px-6 py-4 text-xs text-slate-550 text-center">
                            This folder is empty. Resumes matching this category will appear here.
                          </div>
                        ) : (
                          folderCandidates.map(cand => {
                            const app = applications.find(a => a.candidateId === cand.id);
                            const fileName = cand.resumeFileName || `${cand.name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`;
                            return (
                              <div key={cand.id} className="px-6 py-3 flex items-center justify-between hover:bg-white/1 flex-wrap gap-2">
                                <div className="flex items-center gap-3 min-w-[200px]">
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                  <div>
                                    <span className="text-xs font-semibold text-slate-300 font-mono block truncate max-w-[280px]">
                                      {fileName}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      Candidate: <strong className="text-slate-400">{cand.name}</strong> ({cand.experienceYears} yrs exp)
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {app && (
                                    <Badge color={app.atsScore >= settings.passingThreshold ? 'emerald' : 'slate'}>
                                      ATS: {app.atsScore}%
                                    </Badge>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleOpenDetail(cand, app || null)}
                                      className="py-1 px-2.5 !text-[10px]"
                                    >
                                      Preview
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        alert(`Downloading document "${fileName}" from Knowvation secure storage repository...`);
                                      }}
                                      className="py-1 px-2.5 !text-[10px] flex items-center gap-1"
                                    >
                                      <FileDown className="w-3 h-3 text-slate-450" /> Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: RESUME COMPARISON PANEL */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Unlimited Candidate Comparison</h3>
              <p className="text-[10px] text-slate-450 mt-1">Select and compare multiple candidate profiles side-by-side to evaluate the best performers.</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCompareIds(candidates.map(c => c.id))}
                className="!text-xs py-2"
              >
                Select All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCompareIds([])}
                className="!text-xs py-2"
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Side: Talent Pool Selector checkboxes */}
            <Card className="xl:col-span-3 border-white/5 p-4 bg-slate-900/10 space-y-3">
              <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-2">Talent Pool</h4>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {candidates.map(cand => {
                  const isChecked = selectedCompareIds.includes(cand.id);
                  const app = applications.find(a => a.candidateId === cand.id);
                  return (
                    <label
                      key={cand.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-650/10 border-indigo-500/40 text-slate-200'
                          : 'bg-slate-950/20 border-slate-900 text-slate-450 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedCompareIds(prev => prev.filter(id => id !== cand.id));
                          } else {
                            setSelectedCompareIds(prev => [...prev, cand.id]);
                          }
                        }}
                        className="accent-indigo-500 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block truncate">{cand.name}</span>
                        {app && <span className="text-[9px] text-indigo-400 font-mono">ATS Match: {app.atsScore}%</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>

            {/* Right Side: Side-by-Side Comparison Matrix */}
            <Card className="xl:col-span-9 border-white/5 p-0 overflow-hidden">
              {selectedCompareIds.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs font-semibold">
                  Select candidates from the left panel to compare their evaluation metrics side-by-side.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-slate-355 text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-4 text-left min-w-[150px]">Metric</th>
                        {candidates
                          .filter(c => selectedCompareIds.includes(c.id))
                          .map(cand => {
                            const isTop = cand.id === getTopCandidateId();
                            return (
                              <th
                                key={cand.id}
                                className={`px-5 py-4 text-center min-w-[200px] border-l border-white/5 ${
                                  isTop ? 'bg-indigo-600/10 text-indigo-300 font-bold' : ''
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  {isTop && (
                                    <span className="inline-flex items-center gap-1 text-[8px] bg-indigo-500/25 border border-indigo-450 text-indigo-300 px-2 py-0.5 rounded-full mb-1">
                                      🌟 Best Match
                                    </span>
                                  )}
                                  <span className="font-heading font-extrabold text-sm text-slate-200">
                                    {cand.name}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-medium mt-0.5">{cand.email}</span>
                                </div>
                              </th>
                            );
                          })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-950/20">
                      {/* ATS Score */}
                      <tr>
                        <td className="px-5 py-4 font-bold text-slate-300 bg-slate-900/10">ATS Compatibility</td>
                        {candidates
                          .filter(c => selectedCompareIds.includes(c.id))
                          .map(cand => {
                            const app = applications.find(a => a.candidateId === cand.id);
                            const score = app ? app.atsScore : 0;
                            const isTop = cand.id === getTopCandidateId();
                            return (
                              <td
                                key={cand.id}
                                className={`px-5 py-4 text-center border-l border-white/5 ${
                                  isTop ? 'bg-indigo-650/5' : ''
                                }`}
                              >
                                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl font-mono ${
                                  score >= settings.passingThreshold
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                                }`}>
                                  {score}%
                                </span>
                              </td>
                            );
                          })}
                      </tr>

                      {/* Work Experience */}
                      <tr>
                        <td className="px-5 py-4 font-bold text-slate-300 bg-slate-900/10">Work Experience</td>
                        {candidates
                          .filter(c => selectedCompareIds.includes(c.id))
                          .map(cand => {
                            const isTop = cand.id === getTopCandidateId();
                            return (
                              <td
                                key={cand.id}
                                className={`px-5 py-4 text-center border-l border-white/5 ${
                                  isTop ? 'bg-indigo-650/5' : ''
                                }`}
                              >
                                <span className="font-bold text-slate-200">{cand.experienceYears} Years</span>
                                {cand.currentCompany && <span className="text-[10px] text-slate-500 block mt-0.5">{cand.currentCompany}</span>}
                              </td>
                            );
                          })}
                      </tr>

                      {/* Education */}
                      <tr>
                        <td className="px-5 py-4 font-bold text-slate-300 bg-slate-900/10">Education Target</td>
                        {candidates
                          .filter(c => selectedCompareIds.includes(c.id))
                          .map(cand => {
                            const isTop = cand.id === getTopCandidateId();
                            return (
                              <td
                                key={cand.id}
                                className={`px-5 py-4 text-center border-l border-white/5 ${
                                  isTop ? 'bg-indigo-650/5' : ''
                                }`}
                              >
                                <span className="font-semibold text-slate-200">{cand.highestQualification}</span>
                                {cand.location && <span className="text-[10px] text-slate-500 block mt-0.5">{cand.location}</span>}
                              </td>
                            );
                          })}
                      </tr>

                      {/* Core Skills */}
                      <tr>
                        <td className="px-5 py-4 font-bold text-slate-300 bg-slate-900/10">Core Skills</td>
                        {candidates
                          .filter(c => selectedCompareIds.includes(c.id))
                          .map(cand => {
                            const isTop = cand.id === getTopCandidateId();
                            return (
                              <td
                                key={cand.id}
                                className={`px-5 py-4 border-l border-white/5 ${
                                  isTop ? 'bg-indigo-650/5' : ''
                                }`}
                              >
                                <div className="flex flex-wrap gap-1 justify-center max-w-[220px] mx-auto">
                                  {cand.skills.slice(0, 6).map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {cand.skills.length > 6 && (
                                    <span className="text-[9px] text-slate-500">+{cand.skills.length - 6} more</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                      </tr>

                      {/* AI Diagnostics */}
                      <tr>
                        <td className="px-5 py-4 font-bold text-slate-300 bg-slate-900/10">AI diagnostics</td>
                        {candidates
                          .filter(c => selectedCompareIds.includes(c.id))
                          .map(cand => {
                            const app = applications.find(a => a.candidateId === cand.id);
                            const job = app ? jobs.find(j => j.id === app.jobId) : null;
                            const recs = generateAIRecommendations(cand, job || jobs[0]);
                            const isTop = cand.id === getTopCandidateId();
                            return (
                              <td
                                key={cand.id}
                                className={`px-5 py-4 border-l border-white/5 ${
                                  isTop ? 'bg-indigo-650/5' : ''
                                }`}
                              >
                                <div className="space-y-1.5 max-w-[180px] mx-auto text-[10px] text-left">
                                  <div className="flex justify-between">
                                    <span className="text-slate-450">Fit Probability:</span>
                                    <span className="font-bold font-mono text-emerald-450">{recs.selectionProbability}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-450">Interview Index:</span>
                                    <span className="font-bold font-mono text-indigo-400">{recs.interviewSuccessRate}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-450">Hiring Confidence:</span>
                                    <span className="font-bold font-mono text-purple-400">{recs.hiringConfidenceScore}%</span>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                      </tr>

                      {/* Interactive Actions */}
                      <tr>
                        <td className="px-5 py-4 font-bold text-slate-300 bg-slate-900/10">Interactive Actions</td>
                        {candidates
                          .filter(c => selectedCompareIds.includes(c.id))
                          .map(cand => {
                            const app = applications.find(a => a.candidateId === cand.id);
                            const isTop = cand.id === getTopCandidateId();
                            const fileName = cand.resumeFileName || `${cand.name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`;
                            return (
                              <td
                                key={cand.id}
                                className={`px-5 py-4 border-l border-white/5 text-center ${
                                  isTop ? 'bg-indigo-650/5' : ''
                                }`}
                              >
                                <div className="flex flex-col gap-2 max-w-[150px] mx-auto">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleOpenDetail(cand, app || null)}
                                    className="w-full py-1.5 !text-[11px] flex items-center justify-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> View Scorecard
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      alert(`Downloading candidate document "${fileName}" securely...`);
                                    }}
                                    className="w-full py-1.5 !text-[11px] flex items-center justify-center gap-1.5"
                                  >
                                    <FileDown className="w-3.5 h-3.5" /> Download Resume
                                  </Button>
                                </div>
                              </td>
                            );
                          })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL: DETAILED CANDIDATE SCORECARD */}
      {/* ------------------------------------------------------------- */}
      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title={`Candidate Evaluation Scorecard - ${selectedCandidate?.name}`}
        size="xl"
      >
        {selectedCandidate && selectedApp && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* Modal Left Column: Highlights & Timeline */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Highlighted text panel */}
              <Card className="p-4 bg-slate-950/50 border-white/5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3.5">OCR parsed Text & Highlighting</h4>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 font-mono text-[10px] leading-relaxed max-h-[260px] overflow-y-auto">
                  {highlightResumeText(selectedCandidate, jobs.find(j => j.id === selectedApp.jobId) || jobs[0]).map((b, i) => {
                    if (b.type === 'match') return <span key={i} className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded">{b.text}</span>;
                    if (b.type === 'partial') return <span key={i} className="bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded">{b.text}</span>;
                    if (b.type === 'missing') return <span key={i} className="bg-rose-500/20 text-rose-300 px-1 py-0.5 block my-1 rounded font-bold">{b.text}</span>;
                    return <span key={i} className="text-slate-400">{b.text}</span>;
                  })}
                </div>
              </Card>

              {/* Status Action timeline */}
              <Card className="p-4 border-white/5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Application History Log</h4>
                <div className="relative border-l border-slate-800 pl-4 space-y-4.5 ml-2">
                  {selectedApp.timeline.map((event, i) => (
                    <div key={i} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-6.5 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900/60 ${
                        event.status === 'selected' ? 'bg-emerald-500' :
                        event.status === 'rejected' ? 'bg-rose-500' :
                        event.status === 'hr_review' ? 'bg-purple-500' : 'bg-amber-500'
                      }`}></span>
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                          <span>{event.status.toUpperCase().replace('_', ' ')}</span>
                          <span className="text-[10px] font-medium text-slate-500">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{event.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Modal Right Column: AI predictions & Decisions */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* AI Predictions dashboard */}
              {activeRecs && (
                <Card className="p-5 border-indigo-500/10 bg-indigo-950/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 glow-purple opacity-20"></div>
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    AI Predictor Diagnostics
                  </h4>

                  <div className="space-y-4 text-slate-300">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Selection Probability</span>
                        <span className="font-mono text-emerald-400">{activeRecs.selectionProbability}%</span>
                      </div>
                      <div className="h-2 bg-slate-950/60 rounded-full border border-slate-850 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${activeRecs.selectionProbability}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Interview Readiness Index</span>
                        <span className="font-mono text-indigo-400">{activeRecs.interviewSuccessRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-950/60 rounded-full border border-slate-850 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${activeRecs.interviewSuccessRate}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Hiring Confidence Index</span>
                        <span className="font-mono text-purple-400">{activeRecs.hiringConfidenceScore}%</span>
                      </div>
                      <div className="h-2 bg-slate-950/60 rounded-full border border-slate-850 overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${activeRecs.hiringConfidenceScore}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Recruiter Action Form */}
              <Card className="p-4 border-white/5 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Change Hiring Stage</h4>
                
                <Textarea 
                  placeholder="Leave review comments here (e.g. Cleared Technical loop, strong code patterns, etc.)..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={2}
                />

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('technical_interview')}>
                    Tech Interview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('hr_interview')}>
                    HR Interview
                  </Button>
                  <Button variant="success" size="sm" onClick={() => handleUpdateStatus('selected')} className="col-span-2">
                    Approve / Shortlist Candidate
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleUpdateStatus('rejected')} className="col-span-2">
                    Reject Candidate
                  </Button>
                </div>
              </Card>

            </div>

          </div>
        )}
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL: JOB OPENINGS CREATION FORM */}
      {/* ------------------------------------------------------------- */}
      <Modal 
        isOpen={isCreateJobOpen} 
        onClose={() => setIsCreateJobOpen(false)} 
        title="Create Professional Job Requirement"
      >
        <div className="space-y-4 text-left">
          <Input 
            label="Job Position Title" 
            placeholder="e.g. Senior Backend Engineer" 
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <FilterSelect 
              value={newJobDomain}
              onChange={setNewJobDomain}
              options={[
                { value: 'Software Engineering', label: 'Software Engineering' },
                { value: 'Full Stack Development', label: 'Full Stack Development' },
                { value: 'Data Science', label: 'Data Science' },
                { value: 'Artificial Intelligence', label: 'AI/ML Engineering' },
                { value: 'Cloud Computing', label: 'Cloud Computing' },
                { value: 'DevOps', label: 'DevOps' },
                { value: 'Testing', label: 'Testing' },
                { value: 'Other', label: 'Other Domain' }
              ]}
            />
            <Input 
              label="Company Name" 
              value={newJobCompany}
              onChange={(e) => setNewJobCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Experience Target (Years)" 
              type="number" 
              value={newJobExp}
              onChange={(e) => setNewJobExp(Number(e.target.value))}
            />
            <FilterSelect 
              value={newJobQual}
              onChange={setNewJobQual}
              options={[
                { value: "Bachelor's", label: "Bachelor's Degree" },
                { value: "Master's", label: "Master's Degree" },
                { value: "PhD", label: "Doctorate (PhD)" }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Office Location" value={newJobLoc} onChange={(e) => setNewJobLoc(e.target.value)} />
            <Input label="Salary Target range" value={newJobSalary} onChange={(e) => setNewJobSalary(e.target.value)} />
          </div>

          <Input 
            label="Required Skills (Comma separated)" 
            placeholder="e.g. Python, PyTorch, SQL" 
            value={newJobReqSkills}
            onChange={(e) => setNewJobReqSkills(e.target.value)}
          />

          <Input 
            label="Preferred Skills (Comma separated)" 
            placeholder="e.g. AWS, Docker, Git" 
            value={newJobPrefSkills}
            onChange={(e) => setNewJobPrefSkills(e.target.value)}
          />

          <Textarea 
            label="Detailed Job Criteria Description" 
            placeholder="Introduce details about responsibilities, team scope, and project alignment..." 
            value={newJobDesc}
            onChange={(e) => setNewJobDesc(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateJobOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateJob}>Publish Requirement</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
