import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { chatbotAPI } from '../../api';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hi! I'm GearBot. How can I help you?", isUser: false }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleAction = async (query) => {
    if (loading) return;
    setMessages(prev => [...prev, { text: query, isUser: true }]);
    setLoading(true);

    try {
      const { data } = await chatbotAPI.query(query);
      setMessages(prev => [...prev, { text: data.message, isUser: false }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-red-700 transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'} hover:rotate-12`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col transition-all origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '520px', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">GearBot Assistant</div>
              <div className="text-[10px] text-white/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Always active
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.isUser ? 'bg-red-600 text-white rounded-br-none shadow-md shadow-red-200' : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-none'}`}>
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white text-slate-400 p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm text-xs flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                Consulting logs...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Actions Only */}
        <div className="p-5 bg-white border-t border-slate-100 rounded-b-3xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Quick Insights</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Warehouse Stats', query: 'Quick Stats', icon: '📊' },
              { label: 'Laptop Summary', query: 'Laptop Status', icon: '💻' },
              { label: 'Occupied Trays', query: 'Occupied Trays', icon: '📥' },
              { label: 'Recent Staff', query: 'Recent Employees', icon: '👤' }
            ].map((action, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handleAction(action.query)}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-slate-200 transition-all text-left disabled:opacity-50"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-400 italic">GearBot Automation v2.1 — Refined Interface</p>
          </div>
        </div>
      </div>
    </>
  );
}
