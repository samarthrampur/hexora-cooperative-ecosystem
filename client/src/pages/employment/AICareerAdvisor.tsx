import React, { useState } from 'react';
import { api } from '../../services/api';
import { Sparkles, Send, Bot, Target, FileText, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  mode?: string;
  timestamp: string;
}

export const AICareerAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Welcome to the HEXORA Career Intelligence Desk! I can help optimize your resume for cooperative and agritech openings, explain skill gaps for specific jobs, and suggest career growth paths. How can I help your career today?',
      mode: 'INTELLIGENT_ENGINE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'How do I highlight my verified LMS certificates on my resume?',
    'What skills are employers looking for in cold-chain logistics?',
    'Explain how my match score is calculated.',
    'Recommend high-demand cooperative management roles.',
  ];

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post<any>('/ai/chat', {
        prompt: promptText,
        workspace: 'EMPLOYMENT',
      });

      const aiMsg: ChatMessage = {
        sender: 'assistant',
        text: res.response,
        mode: res.mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I encountered an error analyzing your career query. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-emerald-600" />
            AI Career Advisor & Resume Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Intelligent career recommendations, resume optimization, and skill gap advisory.
          </p>
        </div>
        <div className="flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Bot className="w-3.5 h-3.5 mr-1" />
          <span>Career Advisor Online</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-800 border border-slate-100'
                }`}
              >
                {msg.text}
                <div
                  className={`mt-1.5 text-[10px] flex items-center justify-end space-x-2 ${
                    msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.mode && (
                    <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600">
                      {msg.mode}
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Analyzing job market requirements and formulating guidance...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-5 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 rounded-lg transition-colors truncate max-w-xs"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for resume optimization tips, salary benchmarks, or career advice..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-emerald-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
