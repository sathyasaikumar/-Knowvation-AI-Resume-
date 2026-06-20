// Mock Database for AI Resume Screening & Recruitment Platform
// Persists in LocalStorage to behave like a real database.

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  joinedAt: string;
}

export interface ExperienceTimelineItem {
  id: string;
  company: string;
  role: string;
  duration: string;
  years: number;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
}

export interface Candidate {
  id: string; // matches User.id
  email: string;
  name: string;
  phone: string;
  location: string;
  highestQualification: string;
  skills: string[];
  certifications: string[];
  experienceYears: number;
  currentCompany: string;
  experienceTimeline: ExperienceTimelineItem[];
  projects: ProjectItem[];
  resumeUrl?: string;
  resumeFileName?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  domain: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequired: number;
  qualificationRequired: string;
  location: string;
  salaryRange: string;
  description: string;
  createdAt: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'hr_review'
  | 'technical_interview'
  | 'hr_interview'
  | 'selected'
  | 'rejected';

export interface ScoreBreakdown {
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keywordMatch: number;
}

export interface TimelineEvent {
  status: ApplicationStatus;
  date: string;
  comment: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  appliedAt: string;
  timeline: TimelineEvent[];
}

export interface SystemSettings {
  passingThreshold: number;
  chatbotEnabled: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

export interface HRSessionLog {
  id: string;
  recruiterId: string;
  recruiterName: string;
  date: string;
  loginTime: string;
  logoutTime: string;
  durationHours: number;
}

// -------------------------------------------------------------
// Seed Data
// -------------------------------------------------------------

const SEED_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior AI/ML Engineer',
    company: 'Knowvation Corp',
    domain: 'Artificial Intelligence',
    requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'SQL'],
    preferredSkills: ['LangChain', 'FastAPI', 'AWS S3', 'Docker', 'Transformers'],
    experienceRequired: 5,
    qualificationRequired: "Master's",
    location: 'Bangalore, India (Hybrid)',
    salaryRange: '$120,000 - $150,000',
    description: 'We are looking for a Senior AI/ML Engineer to lead the development of our resume parsing and candidate ranking models. You will work with LLMs, custom embeddings, and scalable deployment systems.',
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'job-2',
    title: 'Full Stack MERN Developer',
    company: 'NextGen Solutions',
    domain: 'Full Stack Development',
    requiredSkills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript'],
    preferredSkills: ['TypeScript', 'Tailwind CSS', 'Redux', 'Docker', 'AWS'],
    experienceRequired: 3,
    qualificationRequired: "Bachelor's",
    location: 'Mumbai, India (Remote)',
    salaryRange: '$70,000 - $95,000',
    description: 'Join our product team to build and maintain high-performance web applications using the MERN stack. Experience in cloud deployment and clean API design is highly valued.',
    createdAt: '2026-06-12T14:30:00Z'
  },
  {
    id: 'job-3',
    title: 'Cloud DevOps Architect',
    company: 'CloudSky Tech',
    domain: 'Cloud Computing',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    preferredSkills: ['Python', 'Linux', 'Prometheus', 'Nginx', 'Bash'],
    experienceRequired: 6,
    qualificationRequired: "Bachelor's",
    location: 'Delhi, India (On-site)',
    salaryRange: '$130,000 - $160,000',
    description: 'Design and implement secure, self-healing cloud infrastructure. You will manage deployment pipelines, optimize AWS expenditures, and automate configuration management.',
    createdAt: '2026-06-15T09:00:00Z'
  },
  {
    id: 'job-4',
    title: 'Junior Data Analyst',
    company: 'Metrics & Insights Co.',
    domain: 'Data Science',
    requiredSkills: ['SQL', 'Power BI', 'Excel', 'Python'],
    preferredSkills: ['Tableau', 'Pandas', 'Data Warehousing', 'Statistics'],
    experienceRequired: 1,
    qualificationRequired: "Bachelor's",
    location: 'Pune, India (Hybrid)',
    salaryRange: '$45,000 - $60,000',
    description: 'Analyze recruiter databases, draft weekly dashboard reports, and support the HR operations team with data-driven predictive insights.',
    createdAt: '2026-06-17T11:20:00Z'
  },
  {
    id: 'job-5',
    title: 'Senior HR Specialist',
    company: 'Knowvation Corp',
    domain: 'HR',
    requiredSkills: ['HR Management', 'Recruiting', 'Employee Relations', 'Conflict Resolution'],
    preferredSkills: ['Onboarding', 'ATS Management', 'Performance Reviews', 'HRIS'],
    experienceRequired: 4,
    qualificationRequired: "Bachelor's",
    location: 'Bangalore, India (On-site)',
    salaryRange: '$60,000 - $85,000',
    description: 'We are seeking a Senior HR Specialist to lead our employee relations, recruiter pipelines, and onboarding programs. You will configure and manage our internal Applicant Tracking Systems.',
    createdAt: '2026-06-18T10:00:00Z'
  }
];

const SEED_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@knowvation.com',
    name: 'Sarah Connor (Super Admin)',
    role: 'admin',
    isVerified: true,
    joinedAt: '2026-05-01T08:00:00Z'
  },
  {
    id: 'user-recruiter',
    email: 'hr@knowvation.com',
    name: 'David Smith (Senior HR)',
    role: 'recruiter',
    isVerified: true,
    joinedAt: '2026-05-10T09:30:00Z'
  },
  {
    id: 'user-candidate-1',
    email: 'rohit.kumar@gmail.com',
    name: 'Rohit Kumar',
    role: 'candidate',
    isVerified: true,
    joinedAt: '2026-06-15T10:00:00Z'
  },
  {
    id: 'user-candidate-2',
    email: 'priya.sharma@yahoo.com',
    name: 'Priya Sharma',
    role: 'candidate',
    isVerified: true,
    joinedAt: '2026-06-16T12:00:00Z'
  },
  {
    id: 'user-candidate-3',
    email: 'amit.verma@outlook.com',
    name: 'Amit Verma',
    role: 'candidate',
    isVerified: false,
    joinedAt: '2026-06-18T15:00:00Z'
  },
  {
    id: 'user-candidate-4',
    email: 'anjali.nair@gmail.com',
    name: 'Anjali Nair',
    role: 'candidate',
    isVerified: true,
    joinedAt: '2026-06-17T09:00:00Z'
  }
];

const SEED_CANDIDATES: Candidate[] = [
  {
    id: 'user-candidate-1',
    name: 'Rohit Kumar',
    email: 'rohit.kumar@gmail.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    highestQualification: "Master's",
    skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'SQL', 'NLP', 'TensorFlow', 'Scikit-Learn'],
    certifications: ['AWS Certified Solutions Architect', 'DeepLearning.AI TensorFlow Developer'],
    experienceYears: 5,
    currentCompany: 'AI Labs India',
    experienceTimeline: [
      {
        id: 'exp-1',
        company: 'AI Labs India',
        role: 'Senior Machine Learning Developer',
        duration: '2024 - Present (2 Years)',
        years: 2,
        description: 'Led a team of 3 developers building NLP pipelines for commercial document parsing. Reduced error rates by 15% using transformer-based models.'
      },
      {
        id: 'exp-2',
        company: 'TechSoft Solutions',
        role: 'Software Engineer (ML)',
        duration: '2021 - 2024 (3 Years)',
        years: 3,
        description: 'Implemented classical machine learning models (XGBoost, Random Forests) for user churn prediction. Managed production deployments using FastAPI and Docker.'
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'DeepResumeParser',
        description: 'An AI resume screening module parsing PDF resumes into structured JSON entities using PyTorch and custom BERT models.',
        technologies: ['Python', 'PyTorch', 'Transformers', 'FastAPI']
      },
      {
        id: 'proj-2',
        title: 'Enterprise Search Engine',
        description: 'A semantic search engine built on top of AWS Elasticsearch, querying internal corporate knowledge bases.',
        technologies: ['Python', 'AWS', 'Elasticsearch', 'SQL']
      }
    ],
    resumeFileName: 'rohit_kumar_resume_ai.pdf'
  },
  {
    id: 'user-candidate-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@yahoo.com',
    phone: '+91 91234 56789',
    location: 'Mumbai, India',
    highestQualification: "Bachelor's",
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux', 'Git'],
    certifications: ['Meta Front-End Developer Professional Certificate'],
    experienceYears: 3.5,
    currentCompany: 'WebCrafters',
    experienceTimeline: [
      {
        id: 'exp-3',
        company: 'WebCrafters',
        role: 'Full Stack Engineer',
        duration: '2023 - Present (3 Years)',
        years: 3,
        description: 'Crafted 15+ responsive React web apps. Migrated backend legacy codebases from PHP to Express.js resulting in a 40% performance speedup.'
      }
    ],
    projects: [
      {
        id: 'proj-3',
        title: 'SaaS HR Dashboard',
        description: 'A glassmorphic HR analytics panel with dynamic chart widgets using Framer Motion and React-Chartjs-2.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS']
      }
    ],
    resumeFileName: 'priya_sharma_mern_dev.pdf'
  },
  {
    id: 'user-candidate-3',
    name: 'Amit Verma',
    email: 'amit.verma@outlook.com',
    phone: '+91 88888 77777',
    location: 'Delhi, India',
    highestQualification: "Bachelor's",
    skills: ['Python', 'SQL', 'Excel', 'Power BI'],
    certifications: ['Microsoft Certified: Power BI Data Analyst Associate'],
    experienceYears: 0.5,
    currentCompany: 'Fresh Graduate',
    experienceTimeline: [
      {
        id: 'exp-4',
        company: 'Global Retailers',
        role: 'Data Analyst Intern',
        duration: 'Jan 2026 - June 2026 (6 Months)',
        years: 0.5,
        description: 'Managed weekly retail sales reporting. Cleaned messy CSV logs using pandas and loaded structured relational tables into MySQL.'
      }
    ],
    projects: [
      {
        id: 'proj-4',
        title: 'E-Commerce Dashboard',
        description: 'A Power BI report representing key sales, customer acquisitions, and regional order distributions.',
        technologies: ['Power BI', 'SQL', 'Excel']
      }
    ],
    resumeFileName: 'amit_verma_fresher.pdf'
  },
  {
    id: 'user-candidate-4',
    name: 'Anjali Nair',
    email: 'anjali.nair@gmail.com',
    phone: '+91 95432 10987',
    location: 'Bangalore, India',
    highestQualification: "Bachelor's",
    skills: ['HR Management', 'Recruiting', 'Employee Relations', 'Conflict Resolution', 'Communication', 'Excel'],
    certifications: ['SHRM Certified Professional (SHRM-CP)'],
    experienceYears: 4,
    currentCompany: 'Apex Corporate Services',
    experienceTimeline: [
      {
        id: 'exp-5',
        company: 'Apex Corporate Services',
        role: 'Human Resources Associate',
        duration: '2022 - Present (4 Years)',
        years: 4,
        description: 'Coordinated candidate interviews, managed employee onboarding folders, resolved workplace concerns, and maintained staff payroll records.'
      }
    ],
    projects: [
      {
        id: 'proj-5',
        title: 'ATS Upgrade Implementation',
        description: 'Led the migration of candidate database to an automated recruitment screening module, cutting HR resume triage time by 30%.',
        technologies: ['ATS Management', 'Excel', 'HRIS']
      }
    ],
    resumeFileName: 'anjali_nair_hr_resume.pdf'
  }
];

const SEED_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1', // Senior AI/ML
    candidateId: 'user-candidate-1', // Rohit Kumar
    status: 'hr_review',
    atsScore: 94,
    scoreBreakdown: {
      skillMatch: 95,
      experienceMatch: 100,
      educationMatch: 100,
      keywordMatch: 80
    },
    appliedAt: '2026-06-15T11:00:00Z',
    timeline: [
      {
        status: 'applied',
        date: '2026-06-15T11:00:00Z',
        comment: 'Application submitted successfully.'
      },
      {
        status: 'screening',
        date: '2026-06-15T11:02:00Z',
        comment: 'AI Screening engine parsed resume. Score calculated: 94%. Automatic screening threshold passed.'
      },
      {
        status: 'hr_review',
        date: '2026-06-16T14:00:00Z',
        comment: 'Resume short-listed for Recruiter review. Candidate possesses strong Deep Learning + AWS experience.'
      }
    ]
  },
  {
    id: 'app-2',
    jobId: 'job-2', // MERN Dev
    candidateId: 'user-candidate-2', // Priya Sharma
    status: 'technical_interview',
    atsScore: 89,
    scoreBreakdown: {
      skillMatch: 90,
      experienceMatch: 100,
      educationMatch: 80,
      keywordMatch: 85
    },
    appliedAt: '2026-06-16T13:30:00Z',
    timeline: [
      {
        status: 'applied',
        date: '2026-06-16T13:30:00Z',
        comment: 'Application submitted.'
      },
      {
        status: 'screening',
        date: '2026-06-16T13:31:00Z',
        comment: 'AI parsed: 89% score. Matches React, Node, Express, MongoDB, and TypeScript.'
      },
      {
        status: 'hr_review',
        date: '2026-06-17T10:00:00Z',
        comment: 'Hiring manager reviewed candidate portfolio. Approved for interview.'
      },
      {
        status: 'technical_interview',
        date: '2026-06-18T10:30:00Z',
        comment: 'Technical Round 1 scheduled. Focused on Javascript fundamentals, Node.js event loop, and React hooks.'
      }
    ]
  },
  {
    id: 'app-3',
    jobId: 'job-1', // Senior AI/ML (wants 5 yrs exp, Amit is junior and doesn't have PyTorch)
    candidateId: 'user-candidate-3', // Amit Verma
    status: 'rejected',
    atsScore: 32,
    scoreBreakdown: {
      skillMatch: 40,
      experienceMatch: 10,
      educationMatch: 80,
      keywordMatch: 20
    },
    appliedAt: '2026-06-18T15:10:00Z',
    timeline: [
      {
        status: 'applied',
        date: '2026-06-18T15:10:00Z',
        comment: 'Application submitted.'
      },
      {
        status: 'screening',
        date: '2026-06-18T15:11:00Z',
        comment: 'ATS score of 32% is below the company threshold (80%).'
      },
      {
        status: 'rejected',
        date: '2026-06-18T15:11:05Z',
        comment: 'Automatically rejected: ATS Score (32%) does not satisfy minimum requirements.'
      }
    ]
  },
  {
    id: 'app-4',
    jobId: 'job-5', // Senior HR Specialist
    candidateId: 'user-candidate-4', // Anjali Nair
    status: 'hr_review',
    atsScore: 92,
    scoreBreakdown: {
      skillMatch: 95,
      experienceMatch: 80,
      educationMatch: 100,
      keywordMatch: 95
    },
    appliedAt: '2026-06-18T10:30:00Z',
    timeline: [
      {
        status: 'applied',
        date: '2026-06-18T10:30:00Z',
        comment: 'Application submitted successfully.'
      },
      {
        status: 'screening',
        date: '2026-06-18T10:31:00Z',
        comment: 'AI parsed: 92% score. Matches HR Management, Recruiting, Employee Relations.'
      },
      {
        status: 'hr_review',
        date: '2026-06-18T14:00:00Z',
        comment: 'Automatically approved for Recruiter review.'
      }
    ]
  }
];

const SEED_HR_LOGS: HRSessionLog[] = [
  {
    id: 'log-1',
    recruiterId: 'user-recruiter',
    recruiterName: 'David Smith (Senior HR)',
    date: '2026-06-15',
    loginTime: '2026-06-15T09:00:00Z',
    logoutTime: '2026-06-15T17:30:00Z',
    durationHours: 8.5
  },
  {
    id: 'log-2',
    recruiterId: 'user-recruiter',
    recruiterName: 'David Smith (Senior HR)',
    date: '2026-06-16',
    loginTime: '2026-06-16T08:45:00Z',
    logoutTime: '2026-06-16T16:15:00Z',
    durationHours: 7.5
  },
  {
    id: 'log-3',
    recruiterId: 'user-recruiter',
    recruiterName: 'David Smith (Senior HR)',
    date: '2026-06-17',
    loginTime: '2026-06-17T09:15:00Z',
    logoutTime: '2026-06-17T18:00:00Z',
    durationHours: 8.75
  },
  {
    id: 'log-4',
    recruiterId: 'user-recruiter',
    recruiterName: 'David Smith (Senior HR)',
    date: '2026-06-18',
    loginTime: '2026-06-18T10:00:00Z',
    logoutTime: '2026-06-18T17:00:00Z',
    durationHours: 7.0
  },
  {
    id: 'log-5',
    recruiterId: 'user-recruiter',
    recruiterName: 'David Smith (Senior HR)',
    date: '2026-06-19',
    loginTime: '2026-06-19T08:30:00Z',
    logoutTime: '2026-06-19T17:15:00Z',
    durationHours: 8.75
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  passingThreshold: 80,
  chatbotEnabled: true,
  emailNotifications: true,
  whatsappNotifications: false
};

// -------------------------------------------------------------
// Scoring Engine Implementation
// -------------------------------------------------------------

export function calculateATSScore(candidate: Candidate, job: Job): { score: number; breakdown: ScoreBreakdown } {
  // Normalize strings for matching
  const cSkills = candidate.skills.map(s => s.toLowerCase().trim());
  const reqSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
  const prefSkills = job.preferredSkills.map(s => s.toLowerCase().trim());

  // 1. Skill Match Score (Weight: 40%)
  let skillMatch = 0;
  if (reqSkills.length > 0) {
    const matchedReq = reqSkills.filter(skill => cSkills.includes(skill)).length;
    const reqScore = (matchedReq / reqSkills.length) * 100;
    
    // Add preferred skills as bonus
    let prefScore = 0;
    if (prefSkills.length > 0) {
      const matchedPref = prefSkills.filter(skill => cSkills.includes(skill)).length;
      prefScore = (matchedPref / prefSkills.length) * 100;
    }
    
    // Skill score is weighted: 80% required, 20% preferred
    skillMatch = Math.round(prefSkills.length > 0 ? (reqScore * 0.8 + prefScore * 0.2) : reqScore);
  }

  // 2. Experience Match Score (Weight: 25%)
  let experienceMatch = 0;
  if (job.experienceRequired === 0) {
    experienceMatch = 100; // Fresher job
  } else {
    // If candidate has more or equal experience, full score
    if (candidate.experienceYears >= job.experienceRequired) {
      experienceMatch = 100;
    } else {
      // Proportional score
      experienceMatch = Math.round((candidate.experienceYears / job.experienceRequired) * 100);
    }
  }

  // 3. Education Match Score (Weight: 15%)
  let educationMatch = 0;
  const eduHierarchy: Record<string, number> = {
    "High School": 1,
    "Diploma": 2,
    "Bachelor's": 3,
    "Master's": 4,
    "PhD": 5
  };

  const candEduVal = eduHierarchy[candidate.highestQualification] || 0;
  const jobEduVal = eduHierarchy[job.qualificationRequired] || 0;

  if (candEduVal >= jobEduVal) {
    educationMatch = 100;
  } else if (candEduVal === jobEduVal - 1) {
    educationMatch = 70; // One level down (e.g. Bachelor's for a Master's role)
  } else {
    educationMatch = 40;
  }

  // 4. Keyword & Certification Match Score (Weight: 20%)
  // Simulates scanning projects, experience description text, and certification names
  let keywordMatch = 0;
  const keywordsToScan = [...job.requiredSkills, ...job.preferredSkills, 'aws', 'docker', 'ci/cd', 'git', 'testing', 'agile', 'kubernetes'];
  const resumeText = [
    candidate.name,
    candidate.highestQualification,
    candidate.currentCompany,
    ...candidate.certifications,
    ...candidate.experienceTimeline.map(e => `${e.role} ${e.company} ${e.description}`),
    ...candidate.projects.map(p => `${p.title} ${p.description} ${p.technologies.join(' ')}`)
  ].join(' ').toLowerCase();

  let matchedKeywords = 0;
  const distinctKeywords = Array.from(new Set(keywordsToScan.map(k => k.toLowerCase())));
  
  distinctKeywords.forEach(word => {
    if (resumeText.includes(word)) {
      matchedKeywords++;
    }
  });

  if (distinctKeywords.length > 0) {
    keywordMatch = Math.round((matchedKeywords / distinctKeywords.length) * 100);
  } else {
    keywordMatch = 100;
  }

  // Calculate final score
  const finalScore = Math.round(
    (skillMatch * 0.40) + 
    (experienceMatch * 0.25) + 
    (educationMatch * 0.15) + 
    (keywordMatch * 0.20)
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    breakdown: {
      skillMatch,
      experienceMatch,
      educationMatch,
      keywordMatch
    }
  };
}

// -------------------------------------------------------------
// Database Operations
// -------------------------------------------------------------

const STORAGE_KEYS = {
  USERS: 'kr_users',
  CANDIDATES: 'kr_candidates',
  JOBS: 'kr_jobs',
  APPLICATIONS: 'kr_applications',
  SETTINGS: 'kr_settings',
  LOGGED_IN_USER: 'kr_session',
  HR_LOGS: 'kr_hr_logs'
};

export const initializeDB = () => {
  // Reset migration: if the new key is not present or if the recruiter email is still the old one, clean previous records so everything seeds correctly
  const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  const isOldSeed = storedUsers && storedUsers.includes('recruiter@knowvation.com');
  if (!localStorage.getItem(STORAGE_KEYS.HR_LOGS) || isOldSeed) {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.setItem(STORAGE_KEYS.HR_LOGS, JSON.stringify(SEED_HR_LOGS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(SEED_CANDIDATES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(SEED_JOBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(SEED_APPLICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
};

// Auto initialize
initializeDB();

export const mockDatabase = {
  // Users
  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  saveUser: (user: User) => {
    const users = mockDatabase.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  deleteUser: (id: string) => {
    const users = mockDatabase.getUsers().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Clean related candidates
    const candidates = mockDatabase.getCandidates().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    
    // Clean related applications
    const apps = mockDatabase.getApplications().filter(a => a.candidateId !== id);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  },

  // Session
  getCurrentSession: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.LOGGED_IN_USER);
    return session ? JSON.parse(session) : null;
  },
  setCurrentSession: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOGGED_IN_USER);
    }
  },

  // Candidates
  getCandidates: (): Candidate[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CANDIDATES) || '[]'),
  getCandidateById: (id: string): Candidate | null => {
    const candidates = mockDatabase.getCandidates();
    return candidates.find(c => c.id === id) || null;
  },
  saveCandidate: (candidate: Candidate) => {
    const candidates = mockDatabase.getCandidates();
    const idx = candidates.findIndex(c => c.id === candidate.id);
    if (idx >= 0) candidates[idx] = candidate;
    else candidates.push(candidate);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));

    // After updating a candidate, re-calculate ATS scores for all their active applications!
    const apps = mockDatabase.getApplications();
    const updatedApps = apps.map(app => {
      if (app.candidateId === candidate.id) {
        const job = mockDatabase.getJobById(app.jobId);
        if (job) {
          const { score, breakdown } = calculateATSScore(candidate, job);
          const threshold = mockDatabase.getSettings().passingThreshold;
          
          let newStatus = app.status;
          // If in screening stage, update status automatically
          if (app.status === 'screening' || app.status === 'applied') {
            newStatus = score >= threshold ? 'hr_review' : 'rejected';
          }
          
          const timeline = [...app.timeline];
          if (app.atsScore !== score) {
            timeline.push({
              status: newStatus,
              date: new Date().toISOString(),
              comment: `Candidate profile updated. ATS Score re-calculated from ${app.atsScore}% to ${score}%.`
            });
          }

          return {
            ...app,
            atsScore: score,
            scoreBreakdown: breakdown,
            status: newStatus,
            timeline
          };
        }
      }
      return app;
    });
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApps));
  },

  // Jobs
  getJobs: (): Job[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]'),
  getJobById: (id: string): Job | null => {
    const jobs = mockDatabase.getJobs();
    return jobs.find(j => j.id === id) || null;
  },
  saveJob: (job: Job) => {
    const jobs = mockDatabase.getJobs();
    const idx = jobs.findIndex(j => j.id === job.id);
    if (idx >= 0) jobs[idx] = job;
    else jobs.push(job);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));

    // After adding/updating a job, re-calculate scores for all applications targeting this job!
    const apps = mockDatabase.getApplications();
    const candidates = mockDatabase.getCandidates();
    
    const updatedApps = apps.map(app => {
      if (app.jobId === job.id) {
        const candidate = candidates.find(c => c.id === app.candidateId);
        if (candidate) {
          const { score, breakdown } = calculateATSScore(candidate, job);
          const threshold = mockDatabase.getSettings().passingThreshold;
          
          let newStatus = app.status;
          if (app.status === 'screening' || app.status === 'applied') {
            newStatus = score >= threshold ? 'hr_review' : 'rejected';
          }

          return {
            ...app,
            atsScore: score,
            scoreBreakdown: breakdown,
            status: newStatus,
            timeline: [
              ...app.timeline,
              {
                status: newStatus,
                date: new Date().toISOString(),
                comment: `Job description was updated by HR. ATS Score re-calculated from ${app.atsScore}% to ${score}%.`
              }
            ]
          };
        }
      }
      return app;
    });
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApps));
  },
  deleteJob: (id: string) => {
    const jobs = mockDatabase.getJobs().filter(j => j.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    
    // Delete related applications
    const apps = mockDatabase.getApplications().filter(a => a.jobId !== id);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  },

  // Applications
  getApplications: (): Application[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]'),
  getApplicationsByCandidate: (candidateId: string): Application[] => {
    return mockDatabase.getApplications().filter(a => a.candidateId === candidateId);
  },
  saveApplication: (app: Application) => {
    const apps = mockDatabase.getApplications();
    const idx = apps.findIndex(a => a.id === app.id);
    if (idx >= 0) apps[idx] = app;
    else apps.push(app);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  },
  createApplication: (candidateId: string, jobId: string): Application => {
    const candidate = mockDatabase.getCandidateById(candidateId);
    const job = mockDatabase.getJobById(jobId);
    if (!candidate || !job) {
      throw new Error('Candidate or Job not found');
    }

    // Check if application already exists
    const existing = mockDatabase.getApplications().find(a => a.candidateId === candidateId && a.jobId === jobId);
    if (existing) return existing;

    const { score, breakdown } = calculateATSScore(candidate, job);
    const threshold = mockDatabase.getSettings().passingThreshold;
    const meetsThreshold = score >= threshold;
    const initialStatus: ApplicationStatus = meetsThreshold ? 'hr_review' : 'rejected';

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId,
      candidateId,
      status: initialStatus,
      atsScore: score,
      scoreBreakdown: breakdown,
      appliedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'applied',
          date: new Date().toISOString(),
          comment: 'Application received and logged.'
        },
        {
          status: 'screening',
          date: new Date().toISOString(),
          comment: `AI resume screening scan completed. Overall ATS Score matches at ${score}%.`
        },
        {
          status: initialStatus,
          date: new Date().toISOString(),
          comment: meetsThreshold 
            ? `ATS threshold passed (>= ${threshold}%). Shortlisted for HR Review.`
            : `ATS threshold failed (< ${threshold}%). Application automatically rejected.`
        }
      ]
    };

    mockDatabase.saveApplication(newApp);
    return newApp;
  },

  // Settings
  getSettings: (): SystemSettings => JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
  saveSettings: (settings: SystemSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    
    // If threshold changes, re-evaluate screening applications
    const apps = mockDatabase.getApplications();
    const updatedApps = apps.map(app => {
      // Re-evaluate only applications that were automatically handled by threshold
      if (app.status === 'hr_review' || app.status === 'rejected') {
        const meetsThreshold = app.atsScore >= settings.passingThreshold;
        const targetStatus: ApplicationStatus = meetsThreshold ? 'hr_review' : 'rejected';
        
        if (app.status !== targetStatus) {
          return {
            ...app,
            status: targetStatus,
            timeline: [
              ...app.timeline,
              {
                status: targetStatus,
                date: new Date().toISOString(),
                comment: `System ATS screening threshold updated to ${settings.passingThreshold}%. Application status updated.`
              }
            ]
          };
        }
      }
      return app;
    });
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApps));
  },

  // HR Logs Operations
  getHRLogs: (): HRSessionLog[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.HR_LOGS) || '[]'),
  saveHRLog: (log: HRSessionLog) => {
    const logs = mockDatabase.getHRLogs();
    const idx = logs.findIndex(l => l.id === log.id);
    if (idx >= 0) logs[idx] = log;
    else logs.push(log);
    localStorage.setItem(STORAGE_KEYS.HR_LOGS, JSON.stringify(logs));
  },
  deleteHRLog: (id: string) => {
    const logs = mockDatabase.getHRLogs().filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.HR_LOGS, JSON.stringify(logs));
  }
};
