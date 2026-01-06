
import React, { useState } from 'react';
import { SimulationState, SavedPersona } from '../types';

interface SidebarProps {
  state: SimulationState;
  setView: (view: 'theater' | 'config') => void;
  currentView: 'theater' | 'config';
  savedPersonas: SavedPersona[];
  onRecallSavedPersona: (savedId: string) => void;
  onDeleteSavedPersona: (savedId: string) => void;
  onUpdateSavedPersona: (savedId: string, updates: Partial<SavedPersona>) => void;
}

const COLOR_OPTIONS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff'];

const Sidebar: React.FC<SidebarProps> = ({ 
  state, 
  setView, 
  currentView, 
  savedPersonas,
  onRecallSavedPersona,
  onDeleteSavedPersona,
  onUpdateSavedPersona
}) => {
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<SavedPersona | null>(null);

  const startEditing = (persona: SavedPersona) => {
    setEditingId(persona.savedId);
    setEditingDraft({ ...persona });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingDraft(null);
  };

  const saveEditing = () => {
    if (!editingDraft || !editingId) return;
    onUpdateSavedPersona(editingId, editingDraft);
    cancelEditing();
  };

  return (
    <aside className="w-20 md:w-64 border-r border-white/10 bg-[rgba(11,19,36,0.9)] flex flex-col shrink-0 relative">
      <div className="flex-1 py-6 flex flex-col gap-6">
        <nav className="flex flex-col gap-2 px-3">
          <button 
            onClick={() => setView('theater')}
            aria-label="Switch to theater mode"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${currentView === 'theater' ? 'bg-white/10 text-white shadow-[0_10px_20px_rgba(6,10,20,0.35)]' : 'text-[var(--text-subtle)] hover:text-white hover:bg-white/5'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span className="hidden md:block font-medium">Theater Mode</span>
          </button>
          
          <button 
            onClick={() => setView('config')}
            aria-label="Switch to configuration mode"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${currentView === 'config' ? 'bg-white/10 text-white shadow-[0_10px_20px_rgba(6,10,20,0.35)]' : 'text-[var(--text-subtle)] hover:text-white hover:bg-white/5'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            <span className="hidden md:block font-medium">Configurations</span>
          </button>

          <button 
            onClick={() => setShowSavedPanel(prev => !prev)}
            aria-label="Open saved agent configurations"
            aria-expanded={showSavedPanel}
            aria-controls="saved-agent-panel"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-subtle)] hover:text-white hover:bg-white/5 transition-all duration-300 ease-out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 3h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v4h6V5" />
            </svg>
            <span className="hidden md:block font-medium">Saved Agents</span>
          </button>
        </nav>

        {showSavedPanel && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 md:hidden z-30"
              onClick={() => setShowSavedPanel(false)}
              aria-hidden="true"
            ></div>
            <div
              id="saved-agent-panel"
              className="fixed md:absolute md:left-full md:top-6 md:ml-4 inset-x-4 bottom-6 md:bottom-auto md:inset-x-auto w-auto md:w-[360px] max-h-[80vh] overflow-y-auto z-40 bg-[rgba(11,19,36,0.96)] border border-white/10 rounded-2xl shadow-[0_24px_40px_rgba(6,10,20,0.45)] p-4 custom-scrollbar scroll-region"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-subtle)]">Saved Agents</div>
                <button 
                  onClick={() => setShowSavedPanel(false)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Close saved agent panel"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {savedPersonas.length === 0 ? (
                <div className="text-[11px] text-[var(--text-subtle)] text-center py-6">
                  No saved configurations yet.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedPersonas.map(persona => {
                    const isEditing = editingId === persona.savedId;
                    return (
                      <div key={persona.savedId} className="border border-white/10 rounded-2xl p-3 bg-white/5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl border-2 shrink-0 overflow-hidden"
                            style={{ borderColor: persona.color }}
                          >
                            <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{persona.name}</div>
                            <div className="text-[10px] text-[var(--text-subtle)] truncate mono">
                              {persona.provider} · {persona.model}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onRecallSavedPersona(persona.savedId)}
                              className="text-[10px] uppercase tracking-widest text-cyan-200/80 hover:text-cyan-200 px-2 py-1 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors"
                            >
                              Use
                            </button>
                            <button
                              onClick={() => isEditing ? cancelEditing() : startEditing(persona)}
                              className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              onClick={() => onDeleteSavedPersona(persona.savedId)}
                              className="text-[10px] uppercase tracking-widest text-red-300/70 hover:text-red-300 px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isEditing && editingDraft && (
                          <div className="mt-3 flex flex-col gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">Name</label>
                              <input 
                                type="text"
                                value={editingDraft.name}
                                onChange={(e) => setEditingDraft({ ...editingDraft, name: e.target.value })}
                                className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-2 py-2 text-xs text-white/90 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">Avatar URL</label>
                              <input 
                                type="text"
                                value={editingDraft.avatar}
                                onChange={(e) => setEditingDraft({ ...editingDraft, avatar: e.target.value })}
                                className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-2 py-2 text-xs text-white/90 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out mono"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingDraft({ ...editingDraft, provider: 'gemini', model: 'gemini-3-flash-preview' })}
                                className={`px-2 py-1 rounded-xl text-[9px] font-bold uppercase transition-colors ${editingDraft.provider === 'gemini' ? 'bg-cyan-400 text-slate-900' : 'bg-white/5 text-[var(--text-subtle)]'}`}
                              >
                                Gemini
                              </button>
                              <button 
                                onClick={() => setEditingDraft({ ...editingDraft, provider: 'openrouter', model: 'openai/gpt-3.5-turbo' })}
                                className={`px-2 py-1 rounded-xl text-[9px] font-bold uppercase transition-colors ${editingDraft.provider === 'openrouter' ? 'bg-amber-400 text-slate-900' : 'bg-white/5 text-[var(--text-subtle)]'}`}
                              >
                                OpenRouter
                              </button>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">Model</label>
                              <input 
                                type="text"
                                value={editingDraft.model}
                                onChange={(e) => setEditingDraft({ ...editingDraft, model: e.target.value })}
                                className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-2 py-2 text-xs text-white/90 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">System Persona</label>
                              <textarea 
                                value={editingDraft.systemPrompt}
                                onChange={(e) => setEditingDraft({ ...editingDraft, systemPrompt: e.target.value })}
                                className="w-full h-20 bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl p-2 text-xs text-white/80 focus:outline-none focus:border-cyan-300 resize-none transition-all duration-300 ease-out"
                              />
                            </div>

                            <div className="flex items-end gap-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase">Temperature</label>
                                  <span className="text-[10px] text-[var(--text-subtle)] mono">{editingDraft.temperature.toFixed(1)}</span>
                                </div>
                                <input 
                                  type="range" min="0" max="1" step="0.1" 
                                  value={editingDraft.temperature} 
                                  onChange={(e) => setEditingDraft({ ...editingDraft, temperature: parseFloat(e.target.value) })}
                                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                />
                              </div>
                              <div className="w-24">
                                <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">Max Tokens</label>
                                <input 
                                  type="number" 
                                  value={editingDraft.maxTokens} 
                                  onChange={(e) => setEditingDraft({ ...editingDraft, maxTokens: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-2 py-2 text-xs text-white/80 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">Display Color</label>
                              <div className="grid grid-cols-6 gap-2">
                                {COLOR_OPTIONS.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => setEditingDraft({ ...editingDraft, color })}
                                    aria-label={`Select display color ${color}`}
                                    aria-pressed={editingDraft.color === color}
                                    className={`w-5 h-5 rounded-lg border-2 transition-transform hover:scale-110 ${editingDraft.color === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={cancelEditing}
                                className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEditing}
                                className="text-[10px] uppercase tracking-widest text-cyan-200/90 hover:text-cyan-200 px-3 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div className="px-6 py-4 border-t border-white/10 mt-auto">
          <h3 className="text-[10px] text-[var(--text-subtle)] font-bold uppercase tracking-widest mb-4 hidden md:block">Active Agents</h3>
          <div className="flex flex-col gap-3">
            {state.personas.map(p => (
              <div key={p.id} className="flex items-center gap-3 group">
                <div 
                  className="w-8 h-8 rounded-full border-2 shrink-0 overflow-hidden shadow-[0_8px_14px_rgba(5,8,18,0.45)]" 
                  style={{ borderColor: p.color }}
                >
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block overflow-hidden">
                  <div className="text-xs font-bold text-white/90 truncate">{p.name}</div>
                  <div className="text-[9px] text-[var(--text-subtle)] truncate mono uppercase">{p.model.split('-')[0]}</div>
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
