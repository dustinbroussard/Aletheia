
import React from 'react';
import { SimulationState } from '../types';

interface HeaderProps {
  state: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ state, onStart, onPause, onReset }) => {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[rgba(11,19,36,0.8)] backdrop-blur-md z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_14px_rgba(93,212,255,0.65)]"></span>
          ALETHEIA
        </h1>
        <div className="px-2 py-0.5 rounded-xl bg-white/5 border border-white/10 text-[10px] mono text-[var(--text-subtle)]">
          V1.0.4-BETA
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!state.isRunning || state.isPaused ? (
          <button 
            onClick={onStart}
            className="flex items-center gap-2 bg-cyan-400/90 hover:bg-cyan-300 text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-[0_12px_24px_rgba(93,212,255,0.35)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            RUN SIMULATION
          </button>
        ) : (
          <button 
            onClick={onPause}
            className="flex items-center gap-2 bg-amber-400/90 hover:bg-amber-300 text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-[0_12px_24px_rgba(240,179,91,0.35)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            PAUSE
          </button>
        )}
        
        <button 
          onClick={onReset}
          className="p-2 text-[var(--text-subtle)] hover:text-white transition-colors rounded-xl border border-transparent hover:border-white/10"
          title="Reset"
          aria-label="Reset simulation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
