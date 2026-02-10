
import React from 'react';
import { ActiveModule } from '../types';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const navItems = [
    { id: ActiveModule.SEARCH, icon: 'fa-search', label: 'Record Search' },
    { id: ActiveModule.AUDIT, icon: 'fa-shield-check', label: 'Grounding Audit' },
    { id: ActiveModule.CONFLICTS, icon: 'fa-triangle-exclamation', label: 'Discrepancy Engine' },
    { id: ActiveModule.VISUALIZE, icon: 'fa-diagram-project', label: 'Connection Map' },
    { id: ActiveModule.ANALYZE, icon: 'fa-brain', label: 'Deep Analysis' },
    { id: ActiveModule.MAPS, icon: 'fa-map-location-dot', label: 'Land Mapping' },
    { id: ActiveModule.SCAN, icon: 'fa-file-invoice', label: 'Document Scanner' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col transition-all z-20">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">O</div>
        <h1 className="text-xl font-bold text-white tracking-tight">OriginPoint</h1>
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeModule === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500 leading-relaxed">
        Redesigning ancestry and land connection through factual AI reasoning.
      </div>
    </aside>
  );
};

export default Sidebar;
