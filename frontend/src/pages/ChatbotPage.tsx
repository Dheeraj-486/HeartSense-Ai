import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, ShieldAlert, Sparkles, Copy, Check, Trash2, 
  MessageSquareCode, HelpCircle, HeartPulse, BrainCircuit
} from 'lucide-react';
import { chatbotService } from '../services/api';
import { ChatMessage } from '../types';

const QUICK_PROMPTS = [
  "Explain Myocardial Infarction",
  "What is Atrial Fibrillation?",
  "Tell me about Coronary Artery Disease",
  "What does an enlarged heart mean?"
];

const ChatbotPage: React.FC = () => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // 1. Fetch Chat History
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-history'],
    queryFn: chatbotService.getHistory,
  });

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 2. Message Mutation (Send Message)
  const sendMessageMutation = useMutation({
    mutationFn: chatbotService.sendMessage,
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat-history'] });

      // Snapshot previous value
      const previousHistory = queryClient.getQueryData<ChatMessage[]>(['chat-history']) || [];

      // Optimistically add User message
      const tempUserMessage: ChatMessage = {
        id: Date.now(),
        user_id: 0,
        message: newMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };

      queryClient.setQueryData<ChatMessage[]>(
        ['chat-history'],
        [...previousHistory, tempUserMessage]
      );

      setInputMessage('');
      setIsTyping(true);

      return { previousHistory };
    },
    onSuccess: (data) => {
      setIsTyping(false);
      // Replace optimistic state with actual database messages
      queryClient.setQueryData<ChatMessage[]>(
        ['chat-history'],
        (old = []) => {
          // Remove temp message and append server-confirmed user + bot messages
          const filtered = old.filter(msg => msg.timestamp !== undefined);
          // Just refetching is cleaner or we append the bot response
          return [...filtered.slice(0, -1), data];
        }
      );
      // Standard query invalidate to sync IDs
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
    onError: (err, newMsg, context) => {
      setIsTyping(false);
      // Rollback to previous state
      if (context?.previousHistory) {
        queryClient.setQueryData(['chat-history'], context.previousHistory);
      }
    }
  });

  // 3. Clear History Mutation
  const clearHistoryMutation = useMutation({
    mutationFn: chatbotService.clearHistory,
    onSuccess: () => {
      queryClient.setQueryData(['chat-history'], []);
    }
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const message = inputMessage.trim();
    if (!message || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(message);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(prompt);
  };

  const handleCopy = (text: string, id: number) => {
    // Strip disclaimer if copying for clean notes
    const cleanText = text.split('\n\n---\n*Disclaimer:')[0];
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">AI Medical Assistant</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discuss cardiovascular diagnostics, treatments, and general precautions with BioGPT.</p>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear entire conversation history?')) {
                clearHistoryMutation.mutate();
              }
            }}
            disabled={clearHistoryMutation.isPending}
            className="inline-flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-500 hover:text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Conversation</span>
          </button>
        )}
      </div>

      {/* Main Grid: Chats & Shortcuts */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Interactive Chat Window (3 cols) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between overflow-hidden">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Medical Disclaimer Banner */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-xs text-amber-500 leading-relaxed shadow-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Medical Guidance Disclaimer</p>
                <p className="mt-1 text-[11px] opacity-90">This AI chatbot is powered by microsoft/BioGPT. Responses are for informational and educational screening purposes only. It does not replace professional medical evaluations, prescriptions, or diagnostics. For acute symptoms, please contact emergency services immediately.</p>
              </div>
            </div>

            {isLoading ? (
              /* Chat Loading Skeleton */
              <div className="space-y-4 animate-pulse pt-6">
                <div className="flex justify-end"><div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div></div>
                <div className="flex justify-start"><div className="h-16 w-3/4 bg-slate-200 dark:bg-slate-850 rounded-2xl"></div></div>
              </div>
            ) : messages.length === 0 ? (
              /* Inactive Empty State */
              <div className="text-center py-20 px-6 max-w-sm mx-auto flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 animate-bounce">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-850 dark:text-slate-200">Start Cardiac Discussion</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">Ask questions about heart health indicators, disease definitions, or scan readings to query the clinical language model.</p>
              </div>
            ) : (
              /* Active Chat Feed */
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-fade-in`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-xs md:text-sm leading-relaxed shadow-sm relative ${
                      isUser 
                        ? 'bg-blue-600 text-white font-medium rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800/80'
                    }`}>
                      
                      {/* Copy Action Button */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.message, msg.id)}
                          className="absolute -top-3.5 -right-3.5 p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                          title="Copy clinical text"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}

                      {/* Format formatting: support bold and line breaks */}
                      <p className="whitespace-pre-line">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {/* Simulated AI Typing bubble */}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800/80 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form Message Composer */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0D1324] flex gap-3 items-center">
            <input
              type="text"
              required
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a medical health query (e.g., 'What are coronary symptoms?')..."
              disabled={sendMessageMutation.isPending}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500/80 rounded-xl text-slate-200 placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/25 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Side: Quick Prompt Cards (1 col) */}
        <div className="hidden lg:flex flex-col gap-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <MessageSquareCode className="w-4 h-4 text-blue-500" />
              <span>Quick Prompting</span>
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-normal mb-5">Click a quick prompt chip below to automatically feed a inquiry to the BioGPT engine.</p>
            
            <div className="space-y-2.5">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p)}
                  disabled={sendMessageMutation.isPending}
                  className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] md:text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all shadow-sm leading-normal flex gap-2 items-start"
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 leading-none">Diagnostic Chat</h4>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">Ask detailed questions about your scan findings (e.g., 'Explain Myocardial Infarction').</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ChatbotPage;
