import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'teal', trend }) {
  const colorStyles = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-teal-500/5',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-cyan-500/5',
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorStyles[color]} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
