
import React, { useRef, useEffect } from 'react';
import { Message, Persona } from '../types';

interface TheaterProps {
  messages: Message[];
  personas: Persona[];
  streamingText: string;
  currentAgentId: string;
  isProcessing: boolean;
}

const SimulationTheater: React.FC<TheaterProps> = ({ 
  messages, 
  personas, 
  streamingText, 
  currentAgentId,
  isProcessing 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Simulation Log Container */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-black/40 border border-white/5 rounded-2xl overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar"
      >
        {messages.length === 0 && !isProcessing && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-24 h-24 border border-cyan-500/30 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-cyan-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.387a2 2 0 01-1.597.105l-2.658-.886a2 2 0 00-1.106.063l-2.735.912a2 2 0 01-1.339 0L2 12V4a2 2 0 012-2h11a2 2 0 012 2v1"></path></svg>
            </div>
            <h2 className="text-xl font-medium text-white mb-2">Digital Petri Dish Initialized</h2>
            <p className="text-sm max-w-xs">Configure your agent personas and genesis prompt, then press Run to begin observation.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const persona = personas.find(p => p.id === msg.agentId);
          return (
            <div key={msg.id} className={`flex flex-col gap-2 max-w-[85%] ${persona?.color === '#ef4444' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider mono text-gray-500">
                  {new Date(msg.metadata.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-xs font-bold" style={{ color: persona?.color }}>
                  {msg.agentName}
                </span>
              </div>
              <div className="group relative">
                <div 
                  className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-200 text-sm leading-relaxed shadow-xl"
                  style={{ borderLeft: `3px solid ${persona?.color}` }}
                >
                  {msg.content}
                </div>
                
                {/* Meta Overlay */}
                <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 rounded px-2 py-0.5 flex gap-3 text-[9px] mono text-gray-400">
                  <span>{msg.metadata.latencyMs}ms</span>
                  <span>{msg.metadata.tokenCount} tokens</span>
                  <span className="text-cyan-500">${msg.metadata.costEstimate.toFixed(6)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Streaming Placeholder */}
        {isProcessing && streamingText && (
          <div className="flex flex-col gap-2 max-w-[85%] self-start items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-xs font-bold text-cyan-500">
                {personas.find(p => p.id === currentAgentId)?.name} is responding...
              </span>
            </div>
            <div className="px-5 py-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-gray-300 text-sm italic leading-relaxed">
              {streamingText}
              <span className="inline-block w-2 h-4 bg-cyan-500 ml-1 animate-pulse"></span>
            </div>
          </div>
        )}
      </div>

      {/* Observation Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Messages" value={messages.length.toString()} color="white" />
        <StatCard 
          label="Avg Latency" 
          value={messages.length > 0 ? `${Math.round(messages.reduce((a, b) => a + b.metadata.latencyMs, 0) / messages.length)}ms` : "---"} 
          color="cyan" 
        />
        <StatCard 
          label="Total Tokens" 
          value={messages.reduce((a, b) => a + b.metadata.tokenCount, 0).toLocaleString()} 
          color="amber" 
        />
        <StatCard 
          label="Sim Budget Used" 
          value={`$${messages.reduce((a, b) => a + b.metadata.costEstimate, 0).toFixed(4)}`} 
          color="green" 
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-bold mono text-${color}-400`}>{value}</div>
  </div>
);

export default SimulationTheater;
