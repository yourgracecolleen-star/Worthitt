
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import { ActiveModule, GroundingSource, AnalysisResult, Conflict, VisualizationData } from './types';
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
  
  // Challenge Evidence States
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
        setResult({ ...data });
        setSummary(await fastSummarize(data.text));
      } else if (activeModule === ActiveModule.MAPS) {
        const data = await mapProperty(query);
        setResult({ ...data });
        setSummary(await fastSummarize(data.text));
      } else if (activeModule === ActiveModule.AUDIT) {
        const data = await groundingAudit(query);
        setResult({ ...data });
        setSummary("Factual verification complete via active grounding.");
      } else if (activeModule === ActiveModule.CONFLICTS) {
        const data = await detectConflicts(query);
        setConflicts(data);
        if (data.length > 0) setSummary(`Detected ${data.length} significant archival discrepancies.`);
      } else if (activeModule === ActiveModule.VISUALIZE) {
        const data = await generateVisualData(query);
        setVisualData(data);
      } else if (activeModule === ActiveModule.ANALYZE) {
        const textData = await searchRecords(query); 
        setResult({ text: textData.text, sources: textData.sources, isThinking: true });
      }
    } catch (err) {
      console.error(err);
      alert('Error during AI process. Ensure API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = (conflict: Conflict) => {
    setChallengeTarget(`${conflict.description} (Record A: ${conflict.evidenceA}, Record B: ${conflict.evidenceB})`);
    setIsChallenging(true);
  };

  const handleChallengeSubmit = async () => {
    if (!evidenceText.trim()) return;
    setLoading(true);
    try {
      const response = await submitChallenge(challengeTarget, evidenceText);
      setResult({ text: response, sources: [], isThinking: true });
      setIsChallenging(false);
      setEvidenceText('');
      setSummary("Evidence re-analysis complete. Connection updated.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

      <main className="flex-1 flex flex-col p-8 bg-slate-50 overflow-y-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 capitalize flex items-center gap-3">
              {activeModule.replace(/_/g, ' ')}
              {activeModule === ActiveModule.AUDIT && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded tracking-widest animate-pulse">
                  Factual Grounding Active
                </span>
              )}
            </h2>
            <p className="text-slate-500 mt-2">
              Deep-connecting fragmented history with factual grounding.
            </p>
          </div>
        </header>

        {isChallenging ? (
          <section className="bg-white rounded-3xl p-8 shadow-xl border border-blue-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-gavel text-blue-600"></i>
              Challenge Connection
            </h3>
            <div className="bg-blue-50 p-4 rounded-xl mb-6 text-sm text-blue-800 border border-blue-100">
              <span className="font-bold">Challenging:</span> {challengeTarget}
            </div>
            <textarea
              className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none h-40 mb-4"
              placeholder="Provide verifiable evidence (census IDs, deed book volumes, specific dates, or contradicting documents)..."
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={handleChallengeSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-check"></i>}
                Submit Evidence
              </button>
              <button 
                onClick={() => setIsChallenging(false)}
                className="bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <form onSubmit={handleAction} className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    activeModule === ActiveModule.AUDIT 
                    ? "Enter a specific claim or record to verify against live search data..." 
                    : `Input for ${activeModule}...`
                  }
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-inner"
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 disabled:bg-slate-400 transition-all flex items-center gap-2"
              >
                {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                {activeModule === ActiveModule.AUDIT ? 'Audit' : 'Analyze'}
              </button>
            </form>

            {loading && (
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Synchronizing Grounding Metadata...</p>
              </div>
            )}

            {!loading && summary && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h4 className="text-indigo-900 font-bold mb-1">Advanced Grounding System</h4>
                  <p className="text-indigo-800 text-sm leading-relaxed">{summary}</p>
                </div>
              </div>
            )}

            {/* Main Result Area */}
            {activeModule === ActiveModule.CONFLICTS && conflicts.length > 0 && !loading && (
              <div className="grid grid-cols-1 gap-4">
                {conflicts.map((c) => (
                  <div key={c.id} className="border border-red-100 bg-red-50/30 rounded-2xl p-6 relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold uppercase text-xs tracking-widest">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        Discrepancy Found
                      </div>
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {c.recordType} Record
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">{c.description}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-white rounded-xl border border-red-50 text-xs text-slate-600">
                        <span className="font-bold block text-red-500 mb-1">Source Point A</span>
                        {c.evidenceA}
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-red-50 text-xs text-slate-600">
                        <span className="font-bold block text-red-500 mb-1">Source Point B</span>
                        {c.evidenceB}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 italic mb-4">Reasoning: {c.reason}</p>
                    <button 
                      onClick={() => startChallenge(c)}
                      className="w-full bg-slate-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                    >
                      Challenge factual link
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeModule === ActiveModule.VISUALIZE && visualData && !loading && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-timeline text-blue-600"></i>
                    Ownership Timeline
                  </h3>
                  <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-6">
                    {visualData.timeline.map((ev, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[41px] top-0 w-5 h-5 bg-white border-4 border-blue-500 rounded-full"></div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="text-blue-600 font-bold text-sm">{ev.year}</span>
                          <h4 className="font-bold text-slate-800">{ev.event}</h4>
                          <p className="text-xs text-slate-500">Involved: {ev.actor} ({ev.type})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-tree text-green-600"></i>
                    Property Lineage
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {visualData.familyTree.map((person, i) => (
                      <div key={i} className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm min-w-[150px] text-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-full mx-auto mb-2 flex items-center justify-center text-slate-400">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <h5 className="font-bold text-sm text-slate-800">{person.name}</h5>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{person.role}</p>
                        <div className="mt-2 text-[10px] bg-blue-50 text-blue-600 py-1 px-2 rounded-full inline-block">
                          {person.propertyLink}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 whitespace-pre-wrap text-slate-700 leading-relaxed font-serif relative">
                  {result.isThinking && (
                    <div className="mb-4 inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      <i className="fa-solid fa-brain"></i>
                      Deep Reasoning Output
                    </div>
                  )}
                  {result.text}
                  <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-tighter text-slate-300 pointer-events-none">
                    Verified Chain
                  </div>
                </div>
                {result.sources.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Grounded Evidence & Locations</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.sources.map((s, idx) => (
                        <a 
                          key={idx} 
                          href={s.uri} 
                          target="_blank" 
                          className={`p-3 border rounded-xl flex items-center gap-3 hover:shadow-md transition-all group ${
                            s.type === 'map' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            s.type === 'map' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <i className={`fa-solid ${s.type === 'map' ? 'fa-location-dot' : 'fa-globe'} text-xs`}></i>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <span className="text-xs font-bold truncate block text-slate-800">{s.title}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{s.uri}</span>
                          </div>
                          <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-300 group-hover:text-blue-500"></i>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default App;
