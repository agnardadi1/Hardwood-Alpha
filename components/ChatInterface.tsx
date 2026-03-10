import React, { useState, useEffect, useRef } from 'react';
import { CardInput, EvaluationResult, AppSettings } from '../types';
import { startChat } from '../services/geminiService';
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { Chat } from "@google/genai";

interface Props {
  input: CardInput;
  result: EvaluationResult;
  settings: AppSettings;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatInterface: React.FC<Props> = ({ input, result, settings }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat when component mounts or dependencies change
    const initChat = async () => {
      try {
        const chat = startChat(input, result, settings);
        setChatSession(chat);
        // Add initial greeting from AI (simulated)
        setMessages([
          { 
            role: 'model', 
            text: `I've analyzed the ${result.extracted_details.year} ${result.extracted_details.set} ${result.extracted_details.player}. What specific questions do you have about this card's investment potential or market data?` 
          }
        ]);
      } catch (error) {
        console.error("Failed to start chat session", error);
      }
    };

    if (result) {
      initChat();
    }
  }, [result, input, settings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !chatSession || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg });
      const text = response.text || "I couldn't generate a response.";
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
            <h3 className="text-sm font-display font-bold text-white tracking-wider uppercase">Market Analyst Chat</h3>
            <p className="text-[10px] text-slate-500 font-mono">LIVE CONTEXT: {result.extracted_details.player}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-emerald-900/50 border border-emerald-700/30' : 'bg-slate-800 border border-slate-700'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-emerald-400" /> : <Bot className="w-4 h-4 text-slate-400" />}
              </div>
              
              {/* Bubble */}
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-md'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex max-w-[85%] flex-row space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-slate-400" />
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about price, comps, or future outlook..."
          className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim() || isLoading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};