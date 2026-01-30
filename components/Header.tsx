
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
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
          ALETHEIA
        </h1>
        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] mono text-gray-400">
          V1.0.4-BETA
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!state.isRunning || state.isPaused ? (
          <button 
            onClick={onStart}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            RUN SIMULATION
          </button>
        ) : (
          <button 
            onClick={onPause}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            PAUSE
          </button>
        )}
        
        <button 
          onClick={onReset}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Reset"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
