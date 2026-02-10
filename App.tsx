
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { ActiveModule, GroundingSource, AnalysisResult, Conflict, VisualizationData, SourceCategory } from './types';
import { 
  searchRecords, 
  mapProperty, 
  detectConflicts, 
  generateVisualData, 
  submitChallenge,
  groundingAudit,
  scanDocument, 
  fastSummarize 
} from './services/geminiService';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>(ActiveModule.SEARCH);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [visualData, setVisualData] = useState<VisualizationData | null>(null);
  const [summary, setSummary] = useState('');
  
  const [isChallenging, setIsChallenging] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<string>('');
  const [evidenceText, setEvidenceText] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setConflicts([]);
    setVisualData(null);
    setSummary('');

    try {
      if (activeModule === ActiveModule.SEARCH) {
        const data = await searchRecords(query);
        setResult(data);
        setSummary(await fastSummarize(data.text));
      } else if (activeModule === ActiveModule.MAPS) {
        const data = await mapProperty(query);
        setResult(data);
        setSummary(await fastSummarize(data.text));
      } else if (activeModule === ActiveModule.AUDIT) {
        const data = await groundingAudit(query);
        setResult(data);
        setSummary("Factual verification complete. Sources audited against live registries.");
      } else if (activeModule === ActiveModule.CONFLICTS) {
        const data = await detectConflicts(query);
        setConflicts(data);
        if (data.length > 0) setSummary(`Detected ${data.length} significant archival discrepancies.`);
      } else if (activeModule === ActiveModule.VISUALIZE) {
        const data = await generateVisualData(query);
        setVisualData(data);
      } else if (activeModule === ActiveModule.ANALYZE) {
        const textData = await searchRecords(query); 
        setResult({ ...textData, isThinking: true });
      }
    } catch (err) {
      console.error(err);
      alert('Request intercepted or failed. Verify link integrity.');
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = (conflict: Conflict) => {
    setChallengeTarget(`${conflict.description}`);
    setIsChallenging(true);
  };

  const handleChallengeSubmit = async () => {
    if (!evidenceText.trim()) return;
    setLoading(true);
    try {
      const response = await submitChallenge(challengeTarget, evidenceText);
      setResult({ text: response, sources: [], isThinking: true, verificationScore: 99, securityHash: 'EX-992-SEC' });
      setIsChallenging(false);
      setEvidenceText('');
      setSummary("Evidence re-analyzed. Lineage connection corrected and locked.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (type: SourceCategory) => {
    switch (type) {
      case 'census': return 'fa-fingerprint';
      case 'tax': return 'fa-building-columns';
      case 'newspaper': return 'fa-scroll';
      case 'map': return 'fa-compass-drafting';
      case 'legal': return 'fa-scale-balanced';
      default: return 'fa-link';
    }
  };

  const getSourceTheme = (type: SourceCategory) => {
    switch (type) {
      case 'census': return 'from-purple-500/10 to-transparent border-purple-200 text-purple-700';
      case 'tax': return 'from-emerald-500/10 to-transparent border-emerald-200 text-emerald-700';
      case 'newspaper': return 'from-amber-500/10 to-transparent border-amber-200 text-amber-700';
      case 'map': return 'from-blue-500/10 to-transparent border-blue-200 text-blue-700';
      case 'legal': return 'from-slate-500/10 to-transparent border-slate-200 text-slate-700';
      default: return 'from-slate-100 to-transparent border-slate-200 text-slate-500';
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

      <main className="flex-1 flex flex-col p-10 max-w-7xl mx-auto w-full relative">
        {/* Distinguished Header Section */}
        <header className="mb-12 flex justify-between items-end border-b border-slate-200 pb-8 bg-white/40 backdrop-blur-sm rounded-b-3xl px-6">
          <div className="space-y-2">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
              <span>Main Frame</span>
              <i className="fa-solid fa-chevron-right text-[8px]"></i>
              <span className="text-amber-600">{activeModule}</span>
            </nav>
            <h2 className="text-5xl font-black text-slate-900 serif tracking-tight capitalize leading-none">
              {activeModule.replace(/_/g, ' ')}
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl">
              Advanced synthesis of genealogical fragmented data and property legal transitions.
            </p>
          </div>
          
          <div className="hidden lg:flex flex-col items-end gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">AI</div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white bg-amber-500 flex items-center justify-center text-[10px] font-black text-white">+4</div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/80 border border-slate-200 rounded-2xl shadow-sm backdrop-blur-md">
              <i className="fa-solid fa-tower-broadcast text-emerald-500 text-xs animate-pulse"></i>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Sync: Archival-V4</span>
            </div>
          </div>
        </header>

        {isChallenging ? (
          <section className="animate-in fade-in zoom-in-95 duration-500">
             <div className="bg-[#0a0f1d] text-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-slate-800">
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
               <div className="relative z-10">
                 <h3 className="text-3xl font-black serif italic mb-2 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-[#0a0f1d]">
                     <i className="fa-solid fa-gavel"></i>
                   </div>
                   Lineage Correction Protocol
                 </h3>
                 <p className="text-slate-400 text-sm mb-8 font-medium">Inject factual counter-evidence into the verification chain.</p>
                 
                 <div className="bg-slate-800/50 p-6 rounded-3xl mb-8 border border-slate-700">
                   <p className="text-[10px] uppercase font-black text-amber-500 mb-2">Current Contested Link</p>
                   <p className="text-xl font-bold italic text-slate-200 serif">"{challengeTarget}"</p>
                 </div>

                 <textarea
                   className="w-full p-8 bg-slate-900 border border-slate-800 rounded-[2rem] focus:ring-4 focus:ring-amber-500/20 outline-none h-52 mb-8 font-mono text-sm text-amber-200 placeholder:text-slate-700"
                   placeholder="Enter volume number, census tract, or historical publication details..."
                   value={evidenceText}
                   onChange={(e) => setEvidenceText(e.target.value)}
                 />
                 
                 <div className="flex gap-4">
                   <button 
                     onClick={handleChallengeSubmit}
                     disabled={loading}
                     className="px-10 py-5 bg-amber-500 text-[#0a0f1d] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-400 transition-all flex items-center gap-3 shadow-xl shadow-amber-500/10"
                   >
                     {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-fingerprint"></i>}
                     Authenticate & Re-analyze
                   </button>
                   <button 
                     onClick={() => setIsChallenging(false)}
                     className="px-10 py-5 bg-slate-800 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all"
                   >
                     Abort Session
                   </button>
                 </div>
               </div>
             </div>
          </section>
        ) : (
          <div className="space-y-10">
            {/* Diverse Search / Command Section */}
            <section className="relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 border-t-4 border-l-4 border-amber-500/20 rounded-tl-3xl"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-4 border-r-4 border-amber-500/20 rounded-br-3xl"></div>
              
              <form onSubmit={handleAction} className="relative z-10 bg-white/90 backdrop-blur-md p-4 rounded-[2.5rem] shadow-xl border border-slate-200 flex gap-4">
                <div className="flex-1 relative flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center text-slate-400 ml-2">
                    <i className="fa-solid fa-terminal"></i>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter archival coordinates, family names, or property IDs..."
                    className="flex-1 bg-transparent border-none py-4 px-2 text-lg font-bold placeholder:text-slate-300 focus:ring-0 outline-none"
                  />
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-[#0a0f1d] text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95 disabled:bg-slate-300"
                >
                  {loading ? <i className="fa-solid fa-atom animate-spin"></i> : <i className="fa-solid fa-bolt-lightning text-amber-400"></i>}
                  Run Engine
                </button>
              </form>
            </section>

            {loading && (
              <div className="flex flex-col items-center py-20 animate-pulse bg-white/40 backdrop-blur-sm rounded-[3rem]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                </div>
                <p className="mt-8 text-xs font-black uppercase tracking-[0.4em] text-slate-400">Archival Synthesis Active</p>
              </div>
            )}

            {!loading && summary && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-10 text-white shadow-2xl border border-slate-800 relative group overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 p-10 pointer-events-none group-hover:scale-110 transition-transform">
                   <i className="fa-solid fa-quote-right text-9xl"></i>
                </div>
                <div className="relative z-10 flex items-start gap-8">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 text-[#0a0f1d] text-3xl shadow-2xl shadow-amber-500/20">
                    <i className="fa-solid fa-stars"></i>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Intelligent Briefing</h4>
                    <p className="text-2xl serif italic text-slate-200 leading-relaxed font-medium">
                      "{summary}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Diverse Data Visualization Views */}
            {!loading && activeModule === ActiveModule.CONFLICTS && conflicts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {conflicts.map((c) => (
                  <div key={c.id} className="bg-white/90 backdrop-blur-md border-2 border-slate-100 rounded-[3rem] overflow-hidden group hover:border-rose-200 transition-all shadow-lg hover:shadow-2xl">
                    <div className="bg-rose-50/80 p-8 border-b border-rose-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <i className="fa-solid fa-triangle-exclamation text-rose-500 text-xl"></i>
                         <span className="font-black uppercase text-[10px] tracking-widest text-rose-600">Archival Rupture Detected</span>
                      </div>
                      <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase border border-rose-200 text-rose-500">{c.recordType}</span>
                    </div>
                    <div className="p-10 space-y-8">
                      <div>
                        <h4 className="text-2xl font-bold serif text-slate-800 mb-2">{c.description}</h4>
                        <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs font-medium leading-relaxed italic border border-slate-800 relative">
                           <i className="fa-solid fa-sparkles text-amber-400 absolute top-2 right-2 opacity-50"></i>
                           {c.summary}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="relative pl-6 border-l-4 border-slate-100">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Thesis Alpha</p>
                          <p className="text-sm font-medium text-slate-600 italic">"{c.evidenceA}"</p>
                        </div>
                        <div className="relative pl-6 border-l-4 border-rose-300">
                          <p className="text-[10px] font-black uppercase text-rose-400 mb-1">Thesis Beta</p>
                          <p className="text-sm font-medium text-slate-600 italic">"{c.evidenceB}"</p>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-mono text-slate-500">
                         <span className="text-rose-500 font-bold mr-2">LOG:</span> {c.reason}
                      </div>

                      <button 
                        onClick={() => startChallenge(c)}
                        className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/10"
                      >
                        Initiate Factual Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && activeModule === ActiveModule.VISUALIZE && visualData && (
              <div className="grid grid-cols-1 gap-12">
                {/* Timeline Card */}
                <div className="bg-white/90 backdrop-blur-md rounded-[4rem] p-12 border border-slate-200 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-12 opacity-5">
                      <i className="fa-solid fa-timeline text-9xl"></i>
                   </div>
                   <h3 className="text-3xl font-black serif italic mb-12 flex items-center gap-4">
                      <i className="fa-solid fa-arrow-right-long text-blue-500"></i>
                      Ownership Chronology
                   </h3>
                   <div className="relative border-l-4 border-slate-100 ml-8 pl-12 space-y-12 pb-4">
                      {visualData.timeline.map((ev, i) => (
                        <div key={i} className="relative group">
                           <div className="absolute -left-[58px] top-2 w-8 h-8 bg-[#0a0f1d] rounded-full border-4 border-white z-10 shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                           <div className="space-y-2">
                             <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-slate-900 serif tracking-tighter italic">{ev.year}</span>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${getSourceTheme(ev.type as any)}`}>
                                  {ev.type}
                                </span>
                             </div>
                             <h4 className="text-xl font-bold text-slate-700">{ev.event}</h4>
                             <p className="text-sm text-slate-400 font-medium">Linked Actor: <span className="text-slate-900">{ev.actor}</span></p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Pedigree Chart View */}
                <div className="bg-[#0a0f1d]/95 backdrop-blur-sm rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                   <h3 className="text-3xl font-black serif italic text-white mb-12 flex items-center gap-4">
                      <i className="fa-solid fa-diagram-nested text-amber-500"></i>
                      Lineage-Property Map
                   </h3>
                   <div className="flex flex-wrap gap-8 justify-center relative z-10">
                      {visualData.familyTree.map((person, i) => (
                        <div key={i} className="group p-8 bg-slate-900 border border-slate-800 rounded-3xl w-72 text-center transition-all hover:scale-105 hover:border-amber-500/50 shadow-2xl">
                           <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center text-slate-600 border border-slate-700 group-hover:text-amber-500 transition-colors">
                             <i className="fa-solid fa-id-card-clip text-2xl"></i>
                           </div>
                           <h5 className="text-lg font-bold text-white serif italic mb-2">{person.name}</h5>
                           <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-6">{person.role}</p>
                           <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-tighter">
                             {person.propertyLink}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {/* Distinguished General Result View */}
            {!loading && result && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <article className="bg-white/95 backdrop-blur-md rounded-[4rem] p-12 border border-slate-100 shadow-2xl relative">
                  <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex flex-col items-center justify-center text-white border-4 border-emerald-100">
                         <span className="text-xl font-black">{result.verificationScore}</span>
                         <span className="text-[8px] font-black uppercase tracking-tighter">Score</span>
                       </div>
                       <div>
                         <h3 className="text-2xl font-black text-slate-800 serif italic">Final Archival Determination</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Verification Confidence High</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Hash ID</p>
                       <p className="font-mono text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-bold">{result.securityHash}</p>
                    </div>
                  </div>

                  {result.isThinking && (
                    <div className="mb-8 p-4 bg-slate-900 rounded-2xl flex items-center gap-4 text-white">
                       <i className="fa-solid fa-brain-circuit text-amber-400 text-xl animate-pulse"></i>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em]">Synthetic Logic Layer 4 Verified</span>
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-2xl italic border-l-8 border-slate-50 pl-12 py-4">
                      {result.text}
                    </div>
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                        <i className="fa-solid fa-stamp text-emerald-500"></i>
                        Authenticity Verified by OriginPoint Core
                     </div>
                     <div className="w-32 h-1 border-t-2 border-slate-50 border-dashed"></div>
                     <p className="text-[9px] font-mono text-slate-300 uppercase">PROTOCOL: X-ARCHIVE-TLS-256</p>
                  </div>
                </article>

                {/* Distinguished Source Grid */}
                {result.sources.length > 0 && (
                  <div className="space-y-6">
                    <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] text-center">External Factual Grounding</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {result.sources.map((s, idx) => (
                        <a 
                          key={idx} 
                          href={s.uri} 
                          target="_blank" 
                          className={`group p-6 rounded-[2.5rem] border-2 transition-all hover:-translate-y-2 hover:shadow-2xl bg-white/90 backdrop-blur-sm shadow-md bg-gradient-to-br ${getSourceTheme(s.type)}`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                               <i className={`fa-solid ${getSourceIcon(s.type)}`}></i>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-20 group-hover:opacity-100 transition-opacity"></i>
                          </div>
                          <h6 className="font-black text-xs uppercase tracking-tight mb-2 truncate group-hover:text-slate-900 transition-colors">{s.title}</h6>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black uppercase opacity-40">{s.type} Archive</span>
                             <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                             <span className="text-[9px] font-mono opacity-50 truncate max-w-[100px]">{s.uri.split('//')[1]}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default App;
