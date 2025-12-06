import React, { useState, useEffect, useRef } from 'react';
import { Message, ConversationStep, UserData } from '../types';
import { Send, Sparkles, User, Bot } from 'lucide-react';

interface ChatProps {
  messages: Message[];
  step: ConversationStep;
  onSendMessage: (text: string) => void;
  loading: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, step, onSendMessage, loading }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !loading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const getPlaceholder = () => {
    switch(step) {
      case ConversationStep.NAME: return "Type your name...";
      case ConversationStep.INCOME: return "e.g. 5000 or $5,000/mo";
      case ConversationStep.EXPENSES: return "e.g. 2000 or Rent 1200, Food 800";
      case ConversationStep.LOANS: return "e.g. Car loan $15k, or None";
      default: return "Type a message...";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-3">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <Sparkles className="text-emerald-400" size={20} />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg">SmartSaving</h1>
          <p className="text-xs text-slate-400">AI Financial Assistant</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
              ${msg.sender === 'user' ? 'bg-slate-700' : 'bg-emerald-600'}`}>
              {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            
            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed
              ${msg.sender === 'user' 
                ? 'bg-slate-800 text-slate-100 rounded-tr-sm' 
                : 'bg-emerald-900/30 text-emerald-50 border border-emerald-900/50 rounded-tl-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
               <Bot size={14} className="text-white" />
             </div>
             <div className="bg-emerald-900/30 p-4 rounded-2xl rounded-tl-sm border border-emerald-900/50">
               <div className="flex gap-1.5">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={step === ConversationStep.ANALYZING || step === ConversationStep.COMPLETED}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || loading || step === ConversationStep.ANALYZING}
            className="absolute right-2 top-2 p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
        {step === ConversationStep.COMPLETED && (
          <div className="text-center mt-2">
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-slate-500 hover:text-emerald-400 underline decoration-dashed"
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
