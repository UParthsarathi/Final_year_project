import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function Guide() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there. I'm your Aura wellness guide. I've been analyzing your recent physiological data. How are you feeling right now?",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I hear you. Based on your EDA trends, your stress levels have been slightly elevated today. Would you like me to guide you through a quick breathing exercise, or would you prefer to vent?",
          sender: 'bot',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="glass-panel flex flex-col h-[calc(100vh-14rem)] md:h-[600px] md:max-h-[70vh] animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-medium text-zinc-100">Aura Guide</h3>
          <p className="text-xs text-emerald-400">Online â€¢ Monitoring your vitals</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-[80%]",
              msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.sender === 'user' ? "bg-zinc-800 text-zinc-300" : "bg-indigo-500/20 text-indigo-400"
            )}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.sender === 'user' 
                ? "bg-zinc-800 text-zinc-100 rounded-tr-sm" 
                : "bg-white/5 text-zinc-300 rounded-tl-sm border border-white/5"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-zinc-900/50 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-800 transition-colors"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
