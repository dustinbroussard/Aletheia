
import React from 'react';
import { SimulationState } from '../types';

interface SidebarProps {
  state: SimulationState;
  setView: (view: 'theater' | 'config') => void;
  currentView: 'theater' | 'config';
}

const Sidebar: React.FC<SidebarProps> = ({ state, setView, currentView }) => {
  return (
    <aside className="w-20 md:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0">
      <div className="flex-1 py-6 flex flex-col gap-6">
        <nav className="flex flex-col gap-2 px-3">
          <button 
            onClick={() => setView('theater')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === 'theater' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span className="hidden md:block font-medium">Theater Mode</span>
          </button>
          
          <button 
            onClick={() => setView('config')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === 'config' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            <span className="hidden md:block font-medium">Configurations</span>
          </button>
        </nav>

        <div className="px-6 py-4 border-t border-white/5 mt-auto">
          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 hidden md:block">Active Agents</h3>
          <div className="flex flex-col gap-3">
            {state.personas.map(p => (
              <div key={p.id} className="flex items-center gap-3 group">
                <div 
                  className="w-8 h-8 rounded-full border-2 shrink-0 overflow-hidden" 
                  style={{ borderColor: p.color }}
                >
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block overflow-hidden">
                  <div className="text-xs font-bold text-gray-300 truncate">{p.name}</div>
                  <div className="text-[9px] text-gray-500 truncate mono uppercase">{p.model.split('-')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
