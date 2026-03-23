import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { useSensorStore } from '../store/useSensorStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function Guide() {
  const { currentStress } = useSensorStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there. I'm your Aura wellness guide. I've been analyzing your recent physiological data. How are you feeling right now?",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      // Prepare context about user's current stress
      const stressContext = currentStress 
        ? `The user's current weighted stress level is ${Math.round(currentStress.weightedStress)}%. 
           Objective physiological score: ${currentStress.objectiveScore.toFixed(1)}. 
           Subjective self-reported score: ${currentStress.subjectiveScore.toFixed(1)}.`
        : "Current stress data is still calibrating.";

      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: `You are Aura, a compassionate and expert wellness guide for a stress monitoring application. 
          Your goal is to help users understand their physiological stress data and provide actionable, science-backed advice for relaxation and mental well-being.
          
          Context: ${stressContext}
          
          Guidelines:
          1. Be empathetic, calm, and professional.
          2. Reference the user's stress data if it's relevant to their query.
          3. If stress is high (>70%), suggest immediate relief techniques like the 4-7-8 breathing exercise (available in the 'Relieve' tab).
          4. Keep responses concise and conversational (max 3-4 sentences unless asked for detail).
          5. Do not provide medical diagnoses. Always suggest consulting a professional for serious concerns.`,
        },
      });

      // Include chat history for context
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // We use sendMessage instead of sendMessageStream for simplicity in this UI
      const response = await chat.sendMessage({
        message: input
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "I'm sorry, I couldn't process that. How else can I help?",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to my systems. Please check your connection and try again.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: "Chat cleared. How can I help you now?",
        sender: 'bot',
      },
    ]);
  };

  return (
    <div className="glass-panel flex flex-col h-[calc(100vh-14rem)] md:h-[600px] md:max-h-[70vh] animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-medium text-zinc-100">Aura Guide</h3>
            <p className="text-xs text-emerald-400">Online • Analyzing your vitals</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-[85%]",
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
                ? "bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/10" 
                : "bg-white/5 text-zinc-300 rounded-tl-sm border border-white/5"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 text-zinc-500 rounded-tl-sm border border-white/5 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Aura is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Aura is typing..." : "Type your message..."}
            disabled={isLoading}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-800 transition-colors"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
