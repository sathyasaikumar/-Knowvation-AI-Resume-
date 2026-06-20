import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateATSScore } from '../../db/mockDatabase';
import type { Candidate, ExperienceTimelineItem, ProjectItem } from '../../db/mockDatabase';
import { parseUploadedResume, PARSING_STEPS, highlightResumeText } from '../../utils/resumeParser';
import { CandidateChatbot } from './CandidateChatbot';
import { 
  FileText, Upload, Sparkles, User, Briefcase, 
  MapPin, Phone, Mail, BookOpen, AlertCircle, CheckCircle, Trash2, Plus, X, ArrowUpRight
} from 'lucide-react';
import { Card, Button, Badge, Input, Textarea } from '../ui';

// Custom dropin Select components for simplified UI
const CustomSelect: React.FC<{
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
    <select 
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
    >
      {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-950">{opt.label}</option>)}
    </select>
  </div>
);

export const CandidateDashboard: React.FC = () => {
  const { 
    currentUser, 
    candidateProfile, 
    jobs, 
    applications, 
    applyToJob, 
    updateProfile,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'score' | 'profile' | 'career'>('score');
  
  // Job selection state for matching preview
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  
  // Resume Parsing simulation state
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStepIdx, setParsingStepIdx] = useState(0);
  const [uploadedResumes, setUploadedResumes] = useState<string[]>(
    candidateProfile?.resumeFileName ? [candidateProfile.resumeFileName] : []
  );

  // Profile Edit fields
  const [editName, setEditName] = useState(candidateProfile?.name || '');
  const [editPhone, setEditPhone] = useState(candidateProfile?.phone || '');
  const [editLocation, setEditLocation] = useState(candidateProfile?.location || '');
  const [editQualification, setEditQualification] = useState(candidateProfile?.highestQualification || "Bachelor's");
  const [editExperience, setEditExperience] = useState(candidateProfile?.experienceYears || 0);
  const [editCompany, setEditCompany] = useState(candidateProfile?.currentCompany || '');
  
  // Tag input states
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(candidateProfile?.skills || []);
  const [certsList, setCertsList] = useState<string[]>(candidateProfile?.certifications || []);

  // Timeline / Project states
  const [timeline, setTimeline] = useState<ExperienceTimelineItem[]>(candidateProfile?.experienceTimeline || []);
  const [projects, setProjects] = useState<ProjectItem[]>(candidateProfile?.projects || []);

  // Add timeline form fields
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpDuration, setNewExpDuration] = useState('');
  const [newExpYears, setNewExpYears] = useState(1);
  const [newExpDesc, setNewExpDesc] = useState('');

  // Add project form fields
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');

  if (!candidateProfile || !currentUser) {
    return <div className="text-center py-12 text-slate-400">Loading candidate session...</div>;
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Calculate matching details dynamically based on candidate state
  const mockTempCandidate: Candidate = {
    ...candidateProfile,
    name: editName || candidateProfile.name,
    highestQualification: editQualification,
    experienceYears: Number(editExperience),
    skills: skillsList,
    certifications: certsList,
    experienceTimeline: timeline,
    projects: projects
  };

  const { score, breakdown } = selectedJob 
    ? calculateATSScore(mockTempCandidate, selectedJob)
    : { score: 0, breakdown: { skillMatch: 0, experienceMatch: 0, educationMatch: 0, keywordMatch: 0 } };

  // Check if candidate already applied to selected job
  const existingApp = applications.find(a => a.candidateId === currentUser.id && a.jobId === selectedJobId);

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processResumeFile(e.target.files[0]);
    }
  };

  const processResumeFile = async (file: File) => {
    setIsParsing(true);
    setParsingStepIdx(0);

    // Animate scanning progress steps
    for (let i = 0; i < PARSING_STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, PARSING_STEPS[i].duration));
      setParsingStepIdx(i + 1);
    }

    try {
      const parsedData = await parseUploadedResume(file);
      
      // Update form states with parsed data
      if (parsedData.name) setEditName(parsedData.name);
      if (parsedData.phone) setEditPhone(parsedData.phone);
      if (parsedData.location) setEditLocation(parsedData.location);
      if (parsedData.highestQualification) setEditQualification(parsedData.highestQualification);
      if (parsedData.experienceYears !== undefined) setEditExperience(parsedData.experienceYears);
      if (parsedData.currentCompany) setEditCompany(parsedData.currentCompany);
      if (parsedData.skills) setSkillsList(parsedData.skills);
      if (parsedData.certifications) setCertsList(parsedData.certifications);
      if (parsedData.experienceTimeline) setTimeline(parsedData.experienceTimeline);
      if (parsedData.projects) setProjects(parsedData.projects);

      setUploadedResumes(prev => [...prev, file.name]);

      // Save directly to global state
      const updatedCandidate: Candidate = {
        ...candidateProfile,
        name: parsedData.name || candidateProfile.name,
        email: parsedData.email || candidateProfile.email,
        phone: parsedData.phone || candidateProfile.phone,
        location: parsedData.location || candidateProfile.location,
        highestQualification: parsedData.highestQualification || candidateProfile.highestQualification,
        skills: parsedData.skills || candidateProfile.skills,
        certifications: parsedData.certifications || candidateProfile.certifications,
        experienceYears: parsedData.experienceYears !== undefined ? parsedData.experienceYears : candidateProfile.experienceYears,
        currentCompany: parsedData.currentCompany || candidateProfile.currentCompany,
        experienceTimeline: parsedData.experienceTimeline || candidateProfile.experienceTimeline,
        projects: parsedData.projects || candidateProfile.projects,
        resumeFileName: file.name
      };
      
      updateProfile(updatedCandidate);
    } catch (err) {
      console.error("Scanning failed", err);
    } finally {
      setIsParsing(false);
    }
  };

  // Profile Save
  const handleSaveProfile = () => {
    const updatedCandidate: Candidate = {
      ...candidateProfile,
      name: editName,
      phone: editPhone,
      location: editLocation,
      highestQualification: editQualification,
      experienceYears: Number(editExperience),
      currentCompany: editCompany,
      skills: skillsList,
      certifications: certsList,
      experienceTimeline: timeline,
      projects: projects
    };
    updateProfile(updatedCandidate);
    alert('Candidate profile saved successfully and ATS scores updated!');
  };

  // Skills tag manipulation
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skillsList.includes(newSkill.trim())) {
        setSkillsList(prev => [...prev, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(prev => prev.filter(s => s !== skill));
  };

  // Certs tag manipulation
  const handleAddCert = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newCert.trim()) {
      e.preventDefault();
      if (!certsList.includes(newCert.trim())) {
        setCertsList(prev => [...prev, newCert.trim()]);
      }
      setNewCert('');
    }
  };

  const handleRemoveCert = (cert: string) => {
    setCertsList(prev => prev.filter(c => c !== cert));
  };

  // Add Experience Timeline item
  const handleAddTimeline = () => {
    if (!newExpCompany || !newExpRole) return;
    const newItem: ExperienceTimelineItem = {
      id: `exp-${Date.now()}`,
      company: newExpCompany,
      role: newExpRole,
      duration: newExpDuration || 'Recent',
      years: Number(newExpYears),
      description: newExpDesc
    };
    setTimeline(prev => [newItem, ...prev]);
    // reset form
    setNewExpCompany('');
    setNewExpRole('');
    setNewExpDuration('');
    setNewExpYears(1);
    setNewExpDesc('');
  };

  // Add Project item
  const handleAddProject = () => {
    if (!newProjTitle || !newProjDesc) return;
    const techArray = newProjTech ? newProjTech.split(',').map(t => t.trim()) : [];
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProjTitle,
      description: newProjDesc,
      technologies: techArray
    };
    setProjects(prev => [...prev, newItem]);
    // reset form
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
  };

  const handleApply = () => {
    if (!selectedJobId) return;
    // apply
    applyToJob(selectedJobId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* LEFT: Sticky Profile Summary Card & Tabs */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border-indigo-500/10">
          <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/10 text-white font-extrabold text-3xl mb-4">
              {editName ? editName.split(' ').map(n => n[0]).join('') : 'C'}
            </div>
            <h2 className="text-xl font-bold text-slate-100 font-heading">{editName || 'Unnamed Candidate'}</h2>
            <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mt-1">{editCompany || 'Software Professional'}</p>
            
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              <Badge color={currentUser.isVerified ? 'emerald' : 'amber'}>
                {currentUser.isVerified ? '✓ Verified Student' : '⏳ Verification Required'}
              </Badge>
              {uploadedResumes.length > 0 && (
                <Badge color="purple">{uploadedResumes.length} Resume Saved</Badge>
              )}
            </div>
          </div>

          <div className="py-6 border-b border-white/5 space-y-3.5">
            <div className="flex items-center gap-3 text-slate-350 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{candidateProfile.email}</span>
            </div>
            {editPhone && (
              <div className="flex items-center gap-3 text-slate-350 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{editPhone}</span>
              </div>
            )}
            {editLocation && (
              <div className="flex items-center gap-3 text-slate-350 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{editLocation}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-350 text-sm">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>{editQualification} Degree</span>
            </div>
            <div className="flex items-center gap-3 text-slate-350 text-sm">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{editExperience} Yrs Professional Exp</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="pt-4 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('score')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'score' 
                  ? 'bg-indigo-600/10 text-indigo-300 border-l-4 border-indigo-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              ATS Score & Matcher
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-indigo-600/10 text-indigo-300 border-l-4 border-indigo-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              Edit Profile details
            </button>
            <button 
              onClick={() => setActiveTab('career')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'career' 
                  ? 'bg-indigo-600/10 text-indigo-300 border-l-4 border-indigo-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              AI Interview Coach
            </button>
          </div>
        </Card>

        {/* Saved Resumes list */}
        <Card className="border-white/5 p-5">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Saved Documents</h3>
          {uploadedResumes.length === 0 ? (
            <p className="text-xs text-slate-500">No resumes uploaded yet. Standard values initialized.</p>
          ) : (
            <div className="space-y-2.5">
              {uploadedResumes.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[170px]">{res}</span>
                  </div>
                  <Badge color="emerald">Active</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* RIGHT: Dynamic Tab View */}
      <div className="lg:col-span-8 space-y-6">

        {/* Top Drag & Drop Resume parser area */}
        <Card className="border-indigo-500/10 hover:border-indigo-500/20 bg-indigo-950/10 relative overflow-hidden p-6">
          <div className="absolute top-0 right-0 w-24 h-24 glow-purple opacity-30 pointer-events-none"></div>
          
          {isParsing ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              {/* Spinner */}
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
              </div>
              <h3 className="text-md font-bold text-indigo-300 animate-pulse">Scanning Resume Document</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm">{PARSING_STEPS[Math.min(parsingStepIdx, PARSING_STEPS.length - 1)]?.label || 'Running NLP analysis...'}</p>
              
              {/* Progress bar */}
              <div className="w-64 h-1.5 bg-slate-850 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${(parsingStepIdx / PARSING_STEPS.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleFileDrop}
              className="flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/25 text-indigo-400 shrink-0">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Drag & Drop Resume Parser</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Upload PDF or DOCX file to auto-populate profile details & calculate ATS score.</p>
                </div>
              </div>
              <label className="shrink-0">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden" 
                />
                <Button variant="primary" size="sm" className="pointer-events-none">
                  Select Document
                </Button>
              </label>
            </div>
          )}
        </Card>

        {/* Tab 1: ATS SCORECARD & MATCHING PREVIEW */}
        {activeTab === 'score' && (
          <div className="space-y-6">
            
            {/* Job Selector card */}
            <Card className="border-white/5 flex flex-col md:flex-row md:items-end gap-4 p-5">
              <div className="flex-1">
                <CustomSelect 
                  label="Evaluate compatibility for Role:"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  options={jobs.map(j => ({ value: j.id, label: `${j.title} (${j.company})` }))}
                />
              </div>
              <div className="shrink-0 flex items-center gap-3">
                {existingApp ? (
                  <div className="flex items-center gap-2 p-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Applied: {existingApp.status.toUpperCase().replace('_', ' ')}
                  </div>
                ) : (
                  <Button variant="primary" className="w-full md:w-auto" onClick={handleApply}>
                    Apply for Position <ArrowUpRight className="w-4 h-4 ml-1.5" />
                  </Button>
                )}
              </div>
            </Card>

            {/* Main Score radial display card */}
            {selectedJob && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left: Score Gauge */}
                <Card className="md:col-span-5 border-white/5 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">ATS Screening Score</h3>
                  
                  {/* Circular progress SVG */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="50" cy="50" r="42" 
                        stroke={score >= settings.passingThreshold ? '#10b981' : '#f43f5e'} 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={263.89}
                        strokeDashoffset={263.89 - (263.89 * score) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-slate-100 font-heading">{score}%</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Matching</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-1 items-center">
                    <span className="text-xs text-slate-400">Hiring Standard Threshold: {settings.passingThreshold}%</span>
                    <span className={`text-sm font-bold mt-2 flex items-center gap-1.5 ${score >= settings.passingThreshold ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {score >= settings.passingThreshold ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Pre-Screening Passed
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" /> Below Threshold
                        </>
                      )}
                    </span>
                  </div>
                </Card>

                {/* Right: Breakdown list */}
                <Card className="md:col-span-7 border-white/5 p-6 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Evaluation Details</h3>
                  
                  <div className="space-y-4">
                    {/* Skill Match bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300">Technical Skills Matching (40%)</span>
                        <span className="text-indigo-400">{breakdown.skillMatch}%</span>
                      </div>
                      <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-indigo-500" style={{ width: `${breakdown.skillMatch}%` }}></div>
                      </div>
                    </div>

                    {/* Experience Match bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300">Experience Tenure Compatibility (25%)</span>
                        <span className="text-sky-400">{breakdown.experienceMatch}%</span>
                      </div>
                      <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-sky-500" style={{ width: `${breakdown.experienceMatch}%` }}></div>
                      </div>
                    </div>

                    {/* Education Match bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300">Academic Qualification Align (15%)</span>
                        <span className="text-emerald-400">{breakdown.educationMatch}%</span>
                      </div>
                      <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-500" style={{ width: `${breakdown.educationMatch}%` }}></div>
                      </div>
                    </div>

                    {/* Keyword Match bar */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-300">Resume Keywords & Certifications (20%)</span>
                        <span className="text-purple-400">{breakdown.keywordMatch}%</span>
                      </div>
                      <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-purple-500" style={{ width: `${breakdown.keywordMatch}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Resume Highlights simulator */}
            {selectedJob && (
              <Card className="border-white/5 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">AI Highlighted Resume Scan</h3>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Match</span>
                    <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Partial</span>
                    <span className="flex items-center gap-1.5 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Missing</span>
                  </div>
                </div>

                {/* Scanned representation box */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-[11px] leading-relaxed max-h-[300px] overflow-y-auto">
                  {highlightResumeText(mockTempCandidate, selectedJob).map((block, idx) => {
                    if (block.type === 'match') {
                      return <span key={idx} className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/30">{block.text}</span>;
                    }
                    if (block.type === 'partial') {
                      return <span key={idx} className="bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded border border-amber-500/30">{block.text}</span>;
                    }
                    if (block.type === 'missing') {
                      return <span key={idx} className="bg-rose-500/20 text-rose-300 px-1 py-0.5 rounded border border-rose-500/30 font-semibold block mt-1">{block.text}</span>;
                    }
                    return <span key={idx} className="text-slate-400">{block.text}</span>;
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: PROFILE EDITOR */}
        {activeTab === 'profile' && (
          <Card className="border-white/5 space-y-6 p-6">
            <h3 className="text-base font-bold text-slate-100 border-b border-white/5 pb-3">Edit Candidate Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
              />
              <Input 
                label="Current Title/Company" 
                value={editCompany} 
                onChange={(e) => setEditCompany(e.target.value)} 
              />
              <Input 
                label="Phone Number" 
                value={editPhone} 
                onChange={(e) => setEditPhone(e.target.value)} 
              />
              <Input 
                label="Location (City, Country)" 
                value={editLocation} 
                onChange={(e) => setEditLocation(e.target.value)} 
              />
              <CustomSelect 
                label="Highest Qualification" 
                value={editQualification} 
                onChange={(e) => setEditQualification(e.target.value)}
                options={[
                  { value: "High School", label: "High School" },
                  { value: "Diploma", label: "Diploma" },
                  { value: "Bachelor's", label: "Bachelor's Degree" },
                  { value: "Master's", label: "Master's Degree" },
                  { value: "PhD", label: "Doctorate (PhD)" }
                ]}
              />
              <Input 
                label="Years of Experience" 
                type="number"
                value={editExperience} 
                onChange={(e) => setEditExperience(Number(e.target.value))} 
              />
            </div>

            {/* Skills tag editor */}
            <div className="flex flex-col gap-2.5 text-left">
              <Input 
                label="Skills (Type skill name and press ENTER)" 
                placeholder="e.g. Python, Docker, React"
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill} 
              />
              <div className="flex flex-wrap gap-2 mt-1.5">
                {skillsList.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-400 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications tag editor */}
            <div className="flex flex-col gap-2.5 text-left">
              <Input 
                label="Certifications (Type name and press ENTER)" 
                placeholder="e.g. AWS Solutions Architect, GCP Professional"
                value={newCert} 
                onChange={(e) => setNewCert(e.target.value)}
                onKeyDown={handleAddCert} 
              />
              <div className="flex flex-wrap gap-2 mt-1.5">
                {certsList.map((cert, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
                    {cert}
                    <button onClick={() => handleRemoveCert(cert)} className="hover:text-red-400 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience timeline items */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-200">Work Experience History</h4>
              
              {timeline.length > 0 && (
                <div className="space-y-3">
                  {timeline.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-slate-950/30 border border-slate-850 flex justify-between gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">{item.role} at {item.company}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.duration} ({item.years} yrs)</p>
                        <p className="text-xs text-slate-350 mt-2">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => setTimeline(prev => prev.filter(i => i.id !== item.id))}
                        className="text-slate-500 hover:text-red-400 cursor-pointer p-1 self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form to add item */}
              <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="Company" value={newExpCompany} onChange={(e) => setNewExpCompany(e.target.value)} />
                  <Input placeholder="Role Title" value={newExpRole} onChange={(e) => setNewExpRole(e.target.value)} />
                  <Input placeholder="Duration (e.g. 2022 - 2024)" value={newExpDuration} onChange={(e) => setNewExpDuration(e.target.value)} />
                  <Input placeholder="Years" type="number" value={newExpYears} onChange={(e) => setNewExpYears(Number(e.target.value))} />
                </div>
                <Textarea placeholder="Responsibility description..." value={newExpDesc} onChange={(e) => setNewExpDesc(e.target.value)} rows={2} />
                <Button variant="secondary" size="sm" onClick={handleAddTimeline} className="w-full flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Experience Block
                </Button>
              </div>
            </div>

            {/* Projects list builder */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-200">Portfolio Projects</h4>

              {projects.length > 0 && (
                <div className="space-y-3">
                  {projects.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-slate-950/30 border border-slate-850 flex justify-between gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">{item.title}</h5>
                        <p className="text-xs text-slate-350 mt-1.5">{item.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {item.technologies.map((t, idx2) => <Badge key={idx2} color="slate">{t}</Badge>)}
                        </div>
                      </div>
                      <button 
                        onClick={() => setProjects(prev => prev.filter(i => i.id !== item.id))}
                        className="text-slate-500 hover:text-red-400 cursor-pointer p-1 self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form to add item */}
              <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-3">
                <Input placeholder="Project Title" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} />
                <Textarea placeholder="Short description..." value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} rows={2} />
                <Input placeholder="Tech Stack tags (comma separated)" value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} />
                
                <Button variant="secondary" size="sm" onClick={handleAddProject} className="w-full flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Project Item
                </Button>
              </div>
            </div>

            <Button variant="primary" className="w-full pt-4 mt-2" onClick={handleSaveProfile}>
              Save Profile Changes & Recalculate Scores
            </Button>
          </Card>
        )}

        {/* Tab 3: AI INTERVIEW COACH & CHATBOT */}
        {activeTab === 'career' && selectedJob && (
          <div className="space-y-6">
            <CandidateChatbot candidate={mockTempCandidate} job={selectedJob} />
          </div>
        )}
      </div>

    </div>
  );
};
