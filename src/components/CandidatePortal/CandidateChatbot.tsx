import React, { useState, useEffect, useRef } from 'react';
import type { Candidate, Job } from '../../db/mockDatabase';
import { generateAIRecommendations } from '../../utils/resumeParser';
import { Send, User, Sparkles } from 'lucide-react';
import { Card, Button } from '../ui';

interface CandidateChatbotProps {
  candidate: Candidate;
  job: Job;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const CandidateChatbot: React.FC<CandidateChatbotProps> = ({ candidate, job }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const recs = generateAIRecommendations(candidate, job);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: `Hello ${candidate.name}! I am your AI Career Advisor. I have reviewed your profile for the "${job.title}" role at ${job.company}. 

My analysis indicates an Interview Readiness Score of **${recs.interviewSuccessRate}%**. How can I help you prepare today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [candidate.id, job.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = '';
      const query = text.toLowerCase();

      if (query.includes('improvement') || query.includes('resume') || query.includes('better')) {
        botResponse = `Based on the job criteria for "${job.title}", here are recommendations to optimize your resume:\n\n` + 
          recs.resumeImprovements.map((imp, idx) => `${idx + 1}. ${imp}`).join('\n') + 
          `\n\n**Tip:** Tailor your summary section to explicitly mention experience with ${job.requiredSkills.slice(0, 2).join(' and ')}.`;
      } else if (query.includes('interview') || query.includes('question') || query.includes('prepare')) {
        const questions = [
          `1. Can you explain your experience using ${candidate.skills.slice(0, 2).join(' and ')} in a professional environment?`,
          `2. The "${job.title}" requires expertise in ${job.requiredSkills.slice(0, 2).join(', ')}. How have you resolved engineering bottlenecks in these stacks?`,
          `3. Describe a time you built a project similar to "${candidate.projects[0]?.title || 'your recent application'}". What were your key metrics of success?`,
          `4. (Behavioral) How do you coordinate with product leads when requirements pivot midway through development?`
        ];
        botResponse = `Here are some specialized technical and behavioral questions curated by AI for this role:\n\n` + 
          questions.join('\n\n') + 
          `\n\nWould you like me to simulate a mock answer for any of these?`;
      } else if (query.includes('gap') || query.includes('missing') || query.includes('skills')) {
        if (recs.missingSkills.length > 0) {
          botResponse = `I identified some crucial skill gaps between your profile and the requirements:\n\n` +
            `**Missing Required Skills:** ${recs.missingSkills.join(', ')}\n` +
            (recs.recommendedSkills.length > 0 ? `**Recommended Bonus Skills:** ${recs.recommendedSkills.join(', ')}\n\n` : '\n') +
            `I highly suggest looking into these certifications:\n` +
            recs.suggestedCertifications.map(c => `- ${c}`).join('\n') +
            `\n\nWould you like learning links for these tools?`;
        } else {
          botResponse = `Exceptional job! You possess all the required skills listed for this position: ${job.requiredSkills.join(', ')}. Your skill compatibility is 100%! I recommend brushing up on systems architecture or preparing for behavioral questions.`;
        }
      } else if (query.includes('probability') || query.includes('chance') || query.includes('success')) {
        botResponse = `Here is your AI Fit Assessment for the "${job.title}" role:
- **Selection Probability**: ${recs.selectionProbability}%
- **Interview Success Likelihood**: ${recs.interviewSuccessRate}%
- **Hiring Confidence Index**: ${recs.hiringConfidenceScore}%

*Summary:* ${
          recs.hiringConfidenceScore > 85 
            ? "You are an outstanding candidate! Ensure your contact details are updated; HR is highly likely to reach out." 
            : recs.hiringConfidenceScore > 60 
            ? "You have a solid foundation. Upskilling in missing technologies will significantly boost your probability."
            : "We recommend adding projects matching the core skills and retaking the scan."
        }`;
      } else {
        botResponse = `I hear you! As an AI career agent, I suggest focusing on preparing for **${job.requiredSkills.slice(0, 3).join(', ')}** concepts which are highly weighted for this role.

Ask me:
- *"What are my skill gaps?"*
- *"Suggest resume improvements"*
- *"What interview questions will I face?"*`;
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  return (
    <Card className="flex flex-col h-[520px] bg-slate-900/60 border-white/5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <img src="/novi_owl.png" alt="Novi Owl" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
        <div className="text-left">
          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            AI Career Coach
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </h4>
          <span className="text-xs text-slate-400">Powered by Resume Parser Core</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scroll-smooth">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {msg.sender === 'user' ? (
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <User className="w-4 h-4" />
              </div>
            ) : (
              <img src="/novi_owl.png" alt="Novi Owl" className="w-8 h-8 rounded-lg shrink-0 object-cover border border-white/5" />
            )}
            <div className="text-left">
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.sender === 'user' 
                  ? 'bg-purple-600/20 border border-purple-500/30 text-slate-100 rounded-tr-none' 
                  : 'bg-slate-850 border border-white/5 text-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[80%]">
            <img src="/novi_owl.png" alt="Novi Owl" className="w-8 h-8 rounded-lg shrink-0 object-cover border border-white/5" />
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-850 border border-white/5 text-slate-400 text-sm flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 bounce-dot-1"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 bounce-dot-2"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 bounce-dot-3"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-1.5 py-2 border-t border-white/5">
        <button 
          onClick={() => handleSendMessage('What are my skill gaps?')}
          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-650 text-slate-300 transition-colors cursor-pointer"
        >
          🔍 Skill Gaps
        </button>
        <button 
          onClick={() => handleSendMessage('Suggest resume improvements')}
          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-650 text-slate-300 transition-colors cursor-pointer"
        >
          📝 Resume Tips
        </button>
        <button 
          onClick={() => handleSendMessage('What interview questions will I face?')}
          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-650 text-slate-300 transition-colors cursor-pointer"
        >
          💡 Interview Prep
        </button>
      </div>

      {/* Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex gap-2 pt-2"
      >
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your skill matching, job prep..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800 focus:border-indigo-500/70 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/25 transition-all duration-200"
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="sm"
          className="!rounded-xl px-3"
          disabled={!inputValue.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};
