import React from 'react';

export function Badge({ type, text, size = 'md', children }) {
  const label = text || children;

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'Normal' || type === 'Reviewed' || type === 'green') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (type === 'Abnormal' || type === 'red') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (type === 'Pending' || type === 'amber') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (type === 'gray') {
    colorClasses = 'bg-slate-800/60 text-slate-400 border-slate-700/60';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border transition-all ${colorClasses} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
}

export function AbnormalCountBadge({ count }) {
  let badgeType = 'green';
  if (count >= 3) {
    badgeType = 'red';
  } else if (count >= 1) {
    badgeType = 'amber';
  }

  return (
    <Badge type={badgeType}>
      {count === 0 ? '0 Abnormal' : `${count} Abnormal`}
    </Badge>
  );
}

export default Badge;
