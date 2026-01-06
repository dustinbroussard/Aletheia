
import React, { useRef, useState, useEffect } from 'react';
import { SimulationState, Persona } from '../types';

interface ConfigPanelProps {
  state: SimulationState;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onSavePersona: (persona: Persona) => void;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
}

const AVATAR_STYLES = [
  { id: 'bottts-neutral', name: 'Robots' },
  { id: 'avataaars', name: 'Humans' },
  { id: 'pixel-art', name: 'Pixel' },
  { id: 'lorelei', name: 'Anime' },
  { id: 'identicon', name: 'Abstract' },
  { id: 'thumbs', name: 'Shapes' },
];

const ConfigPanel: React.FC<ConfigPanelProps> = ({ state, setState, onSavePersona }) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [activeStyle, setActiveStyle] = useState<string>('bottts-neutral');
  const [orModels, setOrModels] = useState<OpenRouterModel[]>([]);
  const [modelSearch, setModelSearch] = useState<{ [key: string]: string }>({});
  const [showDropdown, setShowDropdown] = useState<{ [key: string]: boolean }>({});
  const [advancedOpen, setAdvancedOpen] = useState<{ [key: string]: boolean }>({});

  // Fetch OpenRouter models on mount with extended data
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const json = await response.json();
        if (json.data) {
          setOrModels(json.data.map((m: any) => ({ 
            id: m.id, 
            name: m.name,
            description: m.description || '',
            context_length: m.context_length || 0
          })));
        }
      } catch (err) {
        console.error("Failed to fetch OpenRouter models", err);
      }
    };
    fetchModels();
  }, []);

  const updatePersona = (id: string, updates: Partial<Persona>) => {
    setState(prev => ({
      ...prev,
      personas: prev.personas.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addPersona = () => {
    const seed = Math.random().toString(36).substring(7);
    const newPersona: Persona = {
      id: crypto.randomUUID(),
      name: 'New Agent',
      avatar: `https://api.dicebear.com/7.x/${activeStyle}/svg?seed=${seed}`,
      color: '#10b981',
      systemPrompt: 'You are a helpful assistant.',
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      temperature: 0.7,
      maxTokens: 500
    };
    setState(prev => ({ ...prev, personas: [...prev.personas, newPersona] }));
  };

  const removePersona = (id: string) => {
    setState(prev => ({ ...prev, personas: prev.personas.filter(p => p.id !== id) }));
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersona(id, { avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const randomizeAvatar = (id: string, styleId?: string) => {
    const style = styleId || activeStyle;
    const seed = Math.random().toString(36).substring(7);
    updatePersona(id, { avatar: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}` });
  };

  const sliderClassName = "w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-4 flex flex-col gap-8 custom-scrollbar scroll-region pb-20">
      {/* Global API Settings */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          API Connectivity
        </h2>
        <div className="bg-[rgba(11,19,36,0.85)] border border-white/10 rounded-2xl p-6 shadow-[0_20px_40px_rgba(6,10,20,0.3)]">
          <label className="block text-xs font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-2">OpenRouter API Key (Local Storage)</label>
          <div className="relative">
            <input 
              type="password"
              value={state.openRouterKey}
              onChange={e => setState(prev => ({ ...prev, openRouterKey: e.target.value }))}
              className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-200 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out mono shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              placeholder="sk-or-v1-..."
            />
            {state.openRouterKey && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Key Loaded</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Keys are stored strictly in your browser's local storage and never touch our servers.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Genesis Configuration
        </h2>
        <div className="bg-[rgba(11,19,36,0.85)] border border-white/10 rounded-2xl p-6 space-y-6 shadow-[0_20px_40px_rgba(6,10,20,0.3)]">
          <div>
            <label className="block text-xs font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-2">Genesis Prompt (Initial Scenario)</label>
            <textarea 
              value={state.genesisPrompt}
              onChange={e => setState(prev => ({ ...prev, genesisPrompt: e.target.value }))}
              className="w-full h-32 bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl p-4 text-sm text-white/90 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out resize-none"
              placeholder="Describe the initial environment or topic for the simulation..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-subtle)] uppercase tracking-widest mb-2">Meta-Instructions (Global Constraints)</label>
            <input 
              type="text"
              value={state.metaInstructions}
              onChange={e => setState(prev => ({ ...prev, metaInstructions: e.target.value }))}
              className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out"
              placeholder="Constraints applied to ALL agents..."
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Agent Orchestration
          </h2>
          <div className="flex items-center gap-2">
            <select 
              className="bg-[rgba(8,12,24,0.7)] border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-[var(--text-subtle)] focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out mono"
              value={activeStyle}
              onChange={(e) => setActiveStyle(e.target.value)}
            >
              {AVATAR_STYLES.map(s => <option key={s.id} value={s.id}>{s.name} Style</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.personas.map(p => {
            const isOR = p.provider === 'openrouter';
            const isAdvancedOpen = !!advancedOpen[p.id];
            const searchTerm = (modelSearch[p.id] || '').toLowerCase();
            
            const filteredModels = orModels.filter(m => {
              const id = m.id.toLowerCase();
              const name = m.name.toLowerCase();
              const desc = m.description.toLowerCase();
              const provider = id.split('/')[0] || '';
              
              return (
                name.includes(searchTerm) ||
                id.includes(searchTerm) ||
                desc.includes(searchTerm) ||
                provider.includes(searchTerm)
              );
            }).slice(0, 100);

            return (
              <div key={p.id} className="bg-[rgba(11,19,36,0.85)] border border-white/10 rounded-2xl p-5 pb-14 flex flex-col gap-3 group relative overflow-visible shadow-[0_24px_40px_rgba(6,10,20,0.35)]">
                {/* Background gradient hint */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: p.color }}></div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="relative group/avatar shrink-0">
                      <div 
                        className="w-20 h-20 rounded-2xl border-2 p-1 bg-[rgba(8,12,24,0.9)] shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-300 ease-out shadow-[0_16px_30px_rgba(6,10,20,0.45)]" 
                        style={{ borderColor: p.color }}
                        onClick={() => fileInputRefs.current[p.id]?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label={`Upload avatar for ${p.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRefs.current[p.id]?.click();
                          }
                        }}
                      >
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={el => { fileInputRefs.current[p.id] = el; }}
                        onChange={(e) => handleFileUpload(p.id, e)}
                      />
                      <button 
                        onClick={() => randomizeAvatar(p.id)}
                        className="absolute -bottom-1 -right-1 bg-cyan-400 border border-white/20 p-1.5 rounded-xl text-slate-900 shadow-[0_12px_20px_rgba(93,212,255,0.35)] hover:bg-cyan-300 transition-all duration-300 ease-out"
                        aria-label={`Randomize avatar for ${p.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <input 
                        type="text" 
                        value={p.name} 
                        onChange={e => updatePersona(p.id, { name: e.target.value })}
                        className="bg-transparent border-b border-white/10 text-white font-semibold text-xl focus:outline-none focus:border-white/30 w-full pb-1 mb-2 transition-colors"
                        placeholder="Agent Name"
                      />
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => updatePersona(p.id, { provider: 'gemini', model: 'gemini-3-flash-preview' })}
                          className={`px-2 py-0.5 rounded-xl text-[9px] font-bold uppercase transition-colors ${!isOR ? 'bg-cyan-400 text-slate-900' : 'bg-white/5 text-[var(--text-subtle)]'}`}
                        >
                          Gemini
                        </button>
                        <button 
                          onClick={() => updatePersona(p.id, { provider: 'openrouter', model: 'openai/gpt-3.5-turbo' })}
                          className={`px-2 py-0.5 rounded-xl text-[9px] font-bold uppercase transition-colors ${isOR ? 'bg-amber-400 text-slate-900' : 'bg-white/5 text-[var(--text-subtle)]'}`}
                        >
                          OpenRouter
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removePersona(p.id)}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors z-10 shrink-0"
                    aria-label={`Remove ${p.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-[var(--text-subtle)] uppercase tracking-widest">Model</label>
                    <div className="relative">
                      {isOR ? (
                        <div className="relative">
                          <input 
                            type="text" 
                            value={showDropdown[p.id] ? (modelSearch[p.id] || '') : p.model} 
                            onFocus={() => {
                              setShowDropdown(prev => ({ ...prev, [p.id]: true }));
                              setModelSearch(prev => ({ ...prev, [p.id]: '' }));
                            }}
                            onChange={e => setModelSearch(prev => ({ ...prev, [p.id]: e.target.value }))}
                            className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-2 py-2 text-[10px] text-amber-200 focus:outline-none focus:border-amber-300 transition-all duration-300 ease-out mono truncate"
                            placeholder="Search name, provider, or capability..."
                          />
                          {showDropdown[p.id] && (
                            <div className="absolute z-50 top-full left-0 w-full mt-1 max-h-72 overflow-y-auto bg-[rgba(11,19,36,0.98)] border border-white/10 rounded-2xl shadow-[0_24px_40px_rgba(6,10,20,0.4)] custom-scrollbar scroll-region ring-1 ring-amber-400/20">
                              {filteredModels.length > 0 ? filteredModels.map(m => {
                                const provider = m.id.split('/')[0];
                                return (
                                  <button
                                    key={m.id}
                                    onClick={() => {
                                      updatePersona(p.id, { model: m.id });
                                      setShowDropdown(prev => ({ ...prev, [p.id]: false }));
                                    }}
                                    className="w-full text-left px-3 py-2.5 text-[10px] text-[var(--text-subtle)] hover:bg-amber-400/10 hover:text-white border-b border-white/5 transition-colors mono group/item"
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <span className="font-bold text-white/90 group-hover/item:text-amber-200">{m.name}</span>
                                      <span className="px-1.5 py-0.5 rounded-xl bg-white/5 text-[8px] uppercase tracking-tighter text-[var(--text-subtle)]">{provider}</span>
                                    </div>
                                    <div className="text-[8px] opacity-40 truncate mb-1">{m.id}</div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[8px] text-amber-200/70">{Math.round(m.context_length / 1024)}k context</span>
                                      {m.description.toLowerCase().includes('vision') && (
                                        <span className="text-[8px] text-green-500/70 font-bold uppercase">Vision</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              }) : (
                                <div className="p-4 text-[10px] text-gray-600 italic text-center">No models found matching "{modelSearch[p.id]}"</div>
                              )}
                            </div>
                          )}
                          {showDropdown[p.id] && (
                            <div 
                              className="fixed inset-0 z-40 bg-transparent" 
                              onClick={() => setShowDropdown(prev => ({ ...prev, [p.id]: false }))}
                            ></div>
                          )}
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={p.model} 
                          onChange={e => updatePersona(p.id, { model: e.target.value })}
                          className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-2 py-2 text-[10px] text-cyan-200 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out mono"
                        />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setAdvancedOpen(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                    className="flex items-center justify-between text-[10px] text-[var(--text-subtle)] uppercase tracking-widest hover:text-white/80 transition-colors pt-1"
                    aria-expanded={isAdvancedOpen}
                    aria-controls={`advanced-${p.id}`}
                  >
                    Advanced
                    <span className={`ml-2 transition-transform duration-200 ease-out ${isAdvancedOpen ? 'rotate-180' : 'rotate-0'}`}>▾</span>
                  </button>
                </div>

                <div
                  id={`advanced-${p.id}`}
                  className={`overflow-hidden transition-all duration-200 ease-out ${isAdvancedOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="pt-3 flex flex-col gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">System Persona</label>
                      <textarea 
                        value={p.systemPrompt}
                        onChange={e => updatePersona(p.id, { systemPrompt: e.target.value })}
                        className="w-full h-24 bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-cyan-300 resize-none transition-all duration-300 ease-out"
                        placeholder="Define the agent's behavior, knowledge, and style..."
                      />
                    </div>

                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase">Temperature</label>
                          <span className="text-[10px] text-[var(--text-subtle)] mono">{p.temperature.toFixed(1)}</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.1" 
                          value={p.temperature} 
                          onChange={e => updatePersona(p.id, { temperature: parseFloat(e.target.value) })}
                          className={sliderClassName}
                        />
                      </div>
                      <div className="w-28">
                        <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-1">Max Tokens</label>
                        <input 
                          type="number" 
                          value={p.maxTokens} 
                          onChange={e => updatePersona(p.id, { maxTokens: parseInt(e.target.value) })}
                          className="w-full bg-[rgba(8,12,24,0.9)] border border-white/10 rounded-xl px-2 py-2 text-xs text-white/80 focus:outline-none focus:border-cyan-300 transition-all duration-300 ease-out mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-subtle)] uppercase mb-2">Display Color</label>
                      <div className="grid grid-cols-6 gap-2">
                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff'].map(c => (
                          <button 
                            key={c} 
                            onClick={() => updatePersona(p.id, { color: c })}
                            aria-label={`Select display color ${c}`}
                            aria-pressed={p.color === c}
                            className={`w-6 h-6 rounded-xl border-2 transition-transform hover:scale-110 ${p.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSavePersona(p)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 transition-all duration-200 ease-out"
                  aria-label={`Save configuration for ${p.name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v4h6V5" />
                  </svg>
                  Save
                </button>
              </div>
            );
          })}

          <button
            onClick={addPersona}
            className="border border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-white/50 hover:text-white/80 hover:border-white/30 transition-all duration-200 ease-out bg-[rgba(11,19,36,0.35)]"
            aria-label="Add agent"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-2 text-cyan-200/80">+</div>
            <div className="text-xs uppercase tracking-widest">New Agent</div>
            <div className="text-[10px] text-[var(--text-subtle)] mt-1">Tap to configure</div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ConfigPanel;
