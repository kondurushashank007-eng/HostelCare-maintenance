import React, { useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { useNotification } from '../../context/NotificationContext';
import { Bot, Send, Sparkles, User, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminAiAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello Warden! I am your **HostelCare AI Maintenance Copilot**, connected directly to our live hostel complaints database.\n\nYou can ask me about **recurring complaint patterns**, **block-wise bottlenecks**, **overdue and escalated tickets**, or request **workload and preventive maintenance recommendations**. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const suggestedPrompts = [
    'Which block has the highest number of complaints?',
    'What are the most frequent plumbing issues reported?',
    'Summarize all overdue and escalated complaints.',
    'Recommend preventive maintenance for Block B.',
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await analyticsService.askAssistant(textToSend);
      if (res.success && res.data?.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', text: res.data.answer }]);
      }
    } catch (err) {
      showToast('AI Assistant error: ' + err.message, 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I encountered an error querying the database. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-sky-500 text-white">
            <Bot className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Maintenance Copilot</h1>
        </div>
        <p className="text-sm text-slate-500">
          Intelligent warden advisor powered by Gemini AI with live database context
        </p>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-tr from-sky-600 to-sky-400 text-white shadow-md shadow-sky-500/20'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-none font-medium'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 italic">
                Querying live hostel complaint records & synthesizing response with Gemini...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about hostel maintenance trends or overdue issues..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

