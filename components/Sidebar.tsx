
import React from 'react';
import { ActiveModule } from '../types';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const navItems = [
    { id: ActiveModule.SEARCH, icon: 'fa-magnifying-glass-chart', label: 'Record Inquiry', color: 'text-blue-400' },
    { id: ActiveModule.AUDIT, icon: 'fa-shield-halved', label: 'Grounding Audit', color: 'text-emerald-400' },
    { id: ActiveModule.CONFLICTS, icon: 'fa-circle-nodes', label: 'Discrepancy Engine', color: 'text-rose-400' },
    { id: ActiveModule.VISUALIZE, icon: 'fa-layer-group', label: 'Connection Map', color: 'text-amber-400' },
    { id: ActiveModule.ANALYZE, icon: 'fa-brain-circuit', label: 'Deep Synthesis', color: 'text-indigo-400' },
    { id: ActiveModule.MAPS, icon: 'fa-map-location-dot', label: 'Cartography', color: 'text-cyan-400' },
    { id: ActiveModule.SCAN, icon: 'fa-file-signature', label: 'Doc. Digitization', color: 'text-slate-400' },
  ];

  return (
    <aside className="w-72 bg-[#0a0f1d] text-slate-400 h-screen sticky top-0 flex flex-col transition-all z-20 border-r border-slate-800 shadow-2xl">
      <div className="p-8 border-b border-slate-800/50 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-[#0a0f1d] shadow-lg shadow-amber-500/20">
            <i className="fa-solid fa-compass text-xl"></i>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter serif italic">OriginPoint</h1>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-2">Historical Intelligence</p>
      </div>

      <nav className="flex-1 mt-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
              activeModule === item.id
                ? 'bg-slate-800/50 text-white shadow-inner'
                : 'hover:bg-slate-800/30 hover:text-slate-200'
            }`}
          >
            {activeModule === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-r-full"></div>
            )}
            <div className={`transition-transform duration-300 group-hover:scale-110 ${activeModule === item.id ? item.color : 'text-slate-600'}`}>
              <i className={`fa-solid ${item.icon} w-6 text-center text-lg`}></i>
            </div>
            <span className={`font-semibold text-sm tracking-tight ${activeModule === item.id ? 'translate-x-1' : ''} transition-transform`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-slate-800/50">
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-500">Node Status</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Reconciling 12,402 active archives across diverse global registries.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
