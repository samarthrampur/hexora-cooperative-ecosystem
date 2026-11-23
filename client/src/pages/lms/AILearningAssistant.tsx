import React, { useState } from 'react';
import { api } from '../../services/api';
import { Bot, Send, Sparkles, BookOpen, Lightbulb, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  mode?: string;
  timestamp: string;
}

export const AILearningAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am your HEXORA Learning Assistant. I can help clarify concepts from your course curriculum, explain cooperative accounting standards, recommend courses to close skill gaps, or test your readiness for certification assessments. What would you like to explore?',
      mode: 'INTELLIGENT_ENGINE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'What are the mandatory statutory reserves in cooperative accounting?',
    'Recommend courses to help me qualify for Agritech IoT jobs.',
    'Explain the calibration depth for root-zone soil moisture probes.',
    'How do certified skills impact my job match score?',
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
        workspace: 'LMS',
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
          text: 'I encountered an error processing your query. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Bot className="w-6 h-6 mr-2 text-teal-600" />
            AI Learning Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Contextual AI tutor trained on cooperative governance, sustainable agritech, and operational curriculums.
          </p>
        </div>
        <div className="flex items-center px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>Active Tutor Engine</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
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
                    : 'bg-teal-500 text-white shadow-xs'
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
                    <span className="text-[9px] uppercase font-bold tracking-wider text-teal-600">
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
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                <span>Analyzing course curriculum and generating explanation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-5 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 rounded-lg transition-colors truncate max-w-xs"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Box */}
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
              placeholder="Ask a question about cooperative laws, agritech telemetry, or skill certifications..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-teal-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
