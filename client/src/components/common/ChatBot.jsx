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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userQuery, isUser: true }]);
    setLoading(true);

    try {
      const { data } = await chatbotAPI.query(userQuery);
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
        className={`fixed bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-700 transition-all z-50 ${isOpen ? 'scale-0' : 'scale-100'} hover:scale-110`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="p-4 bg-red-600 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">GearBot Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-red-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap ${msg.isUser ? 'bg-red-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-400 p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-3 pb-2 pt-2 bg-white flex overflow-x-auto gap-2 border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700 w-full no-scrollbar">
          {['Racks Status', 'Employees Details', 'Occupied Trays', 'Laptops count'].map((action, i) => (
            <button key={i} onClick={() => {
              setInput(action);
              setTimeout(() => document.getElementById('chatbot-send-btn').click(), 50);
            }} className="flex-shrink-0 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[11px] font-semibold hover:bg-red-100 transition border border-red-100 whitespace-nowrap">
              {action}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t rounded-b-2xl flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700">
          <input
            type="text"
            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Ask about racks, laptops..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button id="chatbot-send-btn" type="submit" disabled={!input.trim() || loading} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
