// Resume Parser Simulator & AI Recommendation Engine

import type { Candidate, Job } from '../db/mockDatabase';

export interface ScanStep {
  label: string;
  duration: number;
}

export const PARSING_STEPS: ScanStep[] = [
  { label: 'Initializing secure file upload...', duration: 600 },
  { label: 'Scanning document structure & layout layers...', duration: 800 },
  { label: 'Running OCR on text streams...', duration: 700 },
  { label: 'Extracting contact details & personal links...', duration: 600 },
  { label: 'Parsing skills, framework tags, and tools...', duration: 800 },
  { label: 'Extracting education details & credentials...', duration: 600 },
  { label: 'Mapping employment timeline & company tenures...', duration: 900 },
  { label: 'Aligning profile with target job specifications...', duration: 500 },
];

// Seed profiles to simulate parsing depending on filename uploaded
const MOCK_PROFILES = [
  {
    keywords: ['rohit', 'kumar', 'ai', 'ml', 'machine'],
    data: {
      name: 'Rohit Kumar',
      email: 'rohit.kumar@gmail.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      highestQualification: "Master's",
      skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'SQL', 'NLP', 'TensorFlow', 'Scikit-Learn', 'FastAPI'],
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
        }
      ]
    }
  },
  {
    keywords: ['priya', 'sharma', 'react', 'mern', 'web'],
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@yahoo.com',
      phone: '+91 91234 56789',
      location: 'Mumbai, India',
      highestQualification: "Bachelor's",
      skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux', 'Git', 'CSS'],
      certifications: ['Meta Front-End Developer Professional Certificate'],
      experienceYears: 3,
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
      ]
    }
  },
  {
    keywords: ['amit', 'verma', 'analyst', 'junior', 'fresher'],
    data: {
      name: 'Amit Verma',
      email: 'amit.verma@outlook.com',
      phone: '+91 88888 77777',
      location: 'Delhi, India',
      highestQualification: "Bachelor's",
      skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Data Analytics'],
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
      ]
    }
  }
];

const GENERAL_FIRST_NAMES = ['Karan', 'Sneha', 'Aarav', 'Neha', 'Rohan', 'Aditi', 'Vikram', 'Anjali', 'Dev', 'Pooja'];
const GENERAL_LAST_NAMES = ['Patel', 'Joshi', 'Mehta', 'Nair', 'Iyer', 'Sen', 'Rao', 'Gupta', 'Singh', 'Das'];
const GENERAL_LOCATIONS = ['Bangalore, India', 'Mumbai, India', 'Pune, India', 'Delhi, India', 'Hyderabad, India', 'Chennai, India'];
const GENERAL_QUALIFICATIONS = ["Bachelor's", "Master's", "PhD"];
const ENGINEERING_SKILLS = [
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Spring Boot', 'SQL', 
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 
  'Google Cloud', 'Git', 'CI/CD', 'Machine Learning', 'Deep Learning', 
  'PyTorch', 'TensorFlow', 'Data Science', 'Power BI', 'Tableau'
];

export async function parseUploadedResume(file: File): Promise<Partial<Candidate>> {
  // Simulate server/parsing latency
  const totalDuration = PARSING_STEPS.reduce((acc, step) => acc + step.duration, 0);
  await new Promise(resolve => setTimeout(resolve, totalDuration));

  const fileName = file.name.toLowerCase();

  // 1. Check if filename matches one of our seeds
  for (const profile of MOCK_PROFILES) {
    if (profile.keywords.some(k => fileName.includes(k))) {
      return {
        ...profile.data,
        resumeFileName: file.name
      };
    }
  }

  // 2. Generate a random but realistic candidate profile based on filename keywords
  const firstName = GENERAL_FIRST_NAMES[Math.floor(Math.random() * GENERAL_FIRST_NAMES.length)];
  const lastName = GENERAL_LAST_NAMES[Math.floor(Math.random() * GENERAL_LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const location = GENERAL_LOCATIONS[Math.floor(Math.random() * GENERAL_LOCATIONS.length)];
  const highestQualification = GENERAL_QUALIFICATIONS[Math.floor(Math.random() * GENERAL_QUALIFICATIONS.length)];
  
  // Extract skills from filename or inject random ones
  const skills: string[] = [];
  ENGINEERING_SKILLS.forEach(skill => {
    if (fileName.includes(skill.toLowerCase()) || Math.random() > 0.7) {
      skills.push(skill);
    }
  });
  if (skills.length === 0) {
    skills.push('JavaScript', 'HTML', 'CSS', 'Git');
  }

  const certs: string[] = [];
  if (skills.includes('React') || skills.includes('TypeScript')) {
    certs.push('Meta Front-End Professional Certificate');
  }
  if (skills.includes('AWS') || skills.includes('Docker')) {
    certs.push('AWS Certified Solutions Architect');
  }
  if (skills.includes('Machine Learning') || skills.includes('Python')) {
    certs.push('Stanford Machine Learning Certification');
  }

  const expYears = Math.floor(Math.random() * 8) + (highestQualification === 'PhD' ? 3 : 1);
  const currentCompany = expYears > 0 ? `${firstName}Tech Innovations` : 'Fresh Graduate';

  const experienceTimeline = expYears > 0 ? [
    {
      id: `exp-${Date.now()}-1`,
      company: currentCompany,
      role: 'Software Engineer',
      duration: `2024 - Present (${expYears} Years)`,
      years: expYears,
      description: `Responsible for designing and deploying backend systems. Optimized code compilation, worked closely with product stakeholders, and introduced automated testing using Git.`
    }
  ] : [];

  const projects = [
    {
      id: `proj-${Date.now()}-1`,
      title: `${skills[0]} Project Suite`,
      description: `A dynamic open-source application implementing advanced dashboard tracking and API integrations.`,
      technologies: skills.slice(0, 3)
    }
  ];

  return {
    name,
    email,
    phone: `+91 ${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}`,
    location,
    highestQualification,
    skills,
    certifications: certs,
    experienceYears: expYears,
    currentCompany,
    experienceTimeline,
    projects,
    resumeFileName: file.name
  };
}

// -------------------------------------------------------------
// Recommendations Generator
// -------------------------------------------------------------

export interface AIRecommendation {
  missingSkills: string[];
  recommendedSkills: string[];
  suggestedCertifications: string[];
  suggestedCourses: { title: string; platform: string; url: string }[];
  resumeImprovements: string[];
  selectionProbability: number;
  interviewSuccessRate: number;
  hiringConfidenceScore: number;
}

export function generateAIRecommendations(candidate: Candidate, job: Job): AIRecommendation {
  const cSkills = candidate.skills.map(s => s.toLowerCase().trim());
  const reqSkills = job.requiredSkills.map(s => s.toLowerCase().trim());

  // 1. Missing Skills
  const missingSkills = job.requiredSkills.filter(
    skill => !cSkills.includes(skill.toLowerCase().trim())
  );

  // 2. Recommended Skills (Preferred skills not in candidate profile, or complementary skills)
  const recommendedSkills = job.preferredSkills.filter(
    skill => !cSkills.includes(skill.toLowerCase().trim())
  );

  // 3. Suggested Certifications
  const suggestedCertifications: string[] = [];
  if (missingSkills.some(s => ['aws', 'cloud', 'devops', 'kubernetes'].includes(s.toLowerCase()))) {
    suggestedCertifications.push('AWS Certified Cloud Practitioner or Solutions Architect');
  }
  if (missingSkills.some(s => ['react', 'angular', 'frontend', 'typescript'].includes(s.toLowerCase()))) {
    suggestedCertifications.push('Meta Front-End Developer Professional Certificate');
  }
  if (missingSkills.some(s => ['python', 'pytorch', 'machine learning', 'deep learning', 'ai'].includes(s.toLowerCase()))) {
    suggestedCertifications.push('DeepLearning.AI TensorFlow Developer or Generative AI Professional');
  }
  if (missingSkills.some(s => ['sql', 'database', 'postgresql', 'mongodb'].includes(s.toLowerCase()))) {
    suggestedCertifications.push('Oracle Database SQL Certified Associate');
  }
  
  if (suggestedCertifications.length === 0) {
    suggestedCertifications.push('Scrum Alliance Certified ScrumMaster (CSM)', 'CompTIA Security+');
  }

  // 4. Suggested Courses
  const suggestedCourses: { title: string; platform: string; url: string }[] = [];
  missingSkills.slice(0, 2).forEach(skill => {
    suggestedCourses.push({
      title: `Complete ${skill} Masterclass 2026`,
      platform: 'Udemy',
      url: '#'
    });
  });
  
  if (suggestedCourses.length < 2 && recommendedSkills.length > 0) {
    suggestedCourses.push({
      title: `Advanced ${recommendedSkills[0]} and Cloud Architectures`,
      platform: 'Coursera',
      url: '#'
    });
  }
  
  if (suggestedCourses.length === 0) {
    suggestedCourses.push(
      { title: 'Data Structures and Algorithms Bootcamp', platform: 'Coursera', url: '#' },
      { title: 'System Design Interview Guide', platform: 'Educative', url: '#' }
    );
  }

  // 5. Resume Improvements
  const resumeImprovements: string[] = [];
  if (candidate.experienceYears === 0) {
    resumeImprovements.push('Highlight academic capstone projects and internship contributions.');
  }
  if (candidate.skills.length < 5) {
    resumeImprovements.push('Expand your skills directory to include adjacent tools and libraries.');
  }
  if (candidate.projects.length === 0) {
    resumeImprovements.push('Add a dedicated Projects section demonstrating practical engineering applications.');
  } else {
    resumeImprovements.push('Include metrics in project descriptions (e.g., "improved speed by 20%", "reduced latency").');
  }
  if (!candidate.phone || !candidate.location) {
    resumeImprovements.push('Ensure complete contact information (phone, city/country) is visible in your header.');
  }
  if (candidate.experienceTimeline.length > 0 && !candidate.experienceTimeline[0].description.match(/\d+%/)) {
    resumeImprovements.push('Quantify professional achievements with numerical benchmarks (revenue saved, bugs resolved).');
  }

  // Add default improvements
  resumeImprovements.push(
    'Incorporate keywords from the job description directly into your experience timeline.',
    'Keep your formatting consistent and ensure it is ATS-scannable (single-column layouts preferred).'
  );

  // 6. ATS Match score
  // Calculate raw scores
  const matchedReq = reqSkills.filter(skill => cSkills.includes(skill)).length;
  const reqMatchRate = reqSkills.length > 0 ? (matchedReq / reqSkills.length) : 1;
  
  const expMatchRate = job.experienceRequired === 0 ? 1 : Math.min(1, candidate.experienceYears / job.experienceRequired);

  // Selection Probability: Combination of skill matches and experience
  const selectionProbability = Math.round(
    (reqMatchRate * 60) + (expMatchRate * 30) + (candidate.highestQualification === 'PhD' ? 10 : candidate.highestQualification === "Master's" ? 8 : 5)
  );

  // Interview Success Rate: Predicts how well they will clear technical hurdles
  const interviewSuccessRate = Math.round(
    (reqMatchRate * 50) + (Math.min(1, candidate.experienceYears / 5) * 40) + 10
  );

  // Hiring Confidence Score
  const hiringConfidenceScore = Math.round((selectionProbability + interviewSuccessRate) / 2);

  return {
    missingSkills,
    recommendedSkills,
    suggestedCertifications,
    suggestedCourses,
    resumeImprovements: resumeImprovements.slice(0, 4), // Limit to top 4 recommendations
    selectionProbability: Math.min(99, Math.max(10, selectionProbability)),
    interviewSuccessRate: Math.min(99, Math.max(10, interviewSuccessRate)),
    hiringConfidenceScore: Math.min(99, Math.max(10, hiringConfidenceScore))
  };
}

// -------------------------------------------------------------
// Resume Highlighting Utility
// -------------------------------------------------------------
export interface TextHighlight {
  text: string;
  type: 'match' | 'partial' | 'missing' | 'none';
}

export function highlightResumeText(candidate: Candidate, job: Job): TextHighlight[] {
  // Simulates a text content highlight by mapping elements
  const results: TextHighlight[] = [];
  const cSkills = candidate.skills.map(s => s.toLowerCase().trim());
  const reqSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
  const prefSkills = job.preferredSkills.map(s => s.toLowerCase().trim());

  // Personal details header
  results.push({ text: `NAME: ${candidate.name}\n`, type: 'none' });
  results.push({ text: `EMAIL: ${candidate.email} | PHONE: ${candidate.phone}\n`, type: 'none' });
  results.push({ text: `LOCATION: ${candidate.location}\n\n`, type: 'none' });

  results.push({ text: `EDUCATION:\n`, type: 'none' });
  const isEduMatch = candidate.highestQualification === job.qualificationRequired || candidate.highestQualification === "Master's" || candidate.highestQualification === 'PhD';
  results.push({ 
    text: `- ${candidate.highestQualification} Degree\n\n`, 
    type: isEduMatch ? 'match' : 'partial' 
  });

  results.push({ text: `EXPERIENCE:\n`, type: 'none' });
  const isExpMatch = candidate.experienceYears >= job.experienceRequired;
  results.push({ 
    text: `- Total Experience: ${candidate.experienceYears} years (Job requests: ${job.experienceRequired} years)\n`, 
    type: isExpMatch ? 'match' : 'partial' 
  });

  candidate.experienceTimeline.forEach(exp => {
    results.push({ text: `  * ${exp.role} at ${exp.company} (${exp.duration})\n`, type: 'none' });
    results.push({ text: `    ${exp.description}\n`, type: 'none' });
  });

  results.push({ text: `\nSKILLS:\n`, type: 'none' });
  candidate.skills.forEach((skill, idx) => {
    const sLower = skill.toLowerCase().trim();
    let type: 'match' | 'partial' | 'missing' | 'none' = 'none';
    if (reqSkills.includes(sLower)) {
      type = 'match';
    } else if (prefSkills.includes(sLower)) {
      type = 'partial';
    }
    
    results.push({ 
      text: `${skill}${idx < candidate.skills.length - 1 ? ', ' : ''}`, 
      type 
    });
  });
  results.push({ text: `\n\n`, type: 'none' });

  // Add missing items in a footer
  if (job.requiredSkills.some(s => !cSkills.includes(s.toLowerCase()))) {
    results.push({ text: `MISSING REQUIRED SKILLS IDENTIFIED BY AI:\n`, type: 'none' });
    job.requiredSkills.forEach(req => {
      if (!cSkills.includes(req.toLowerCase())) {
        results.push({ text: `- Missing: ${req}\n`, type: 'missing' });
      }
    });
  }

  return results;
}
