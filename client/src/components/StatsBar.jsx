import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export function StatsBar({ stats }) {
  const items = [
    {
      title: 'Total Tests',
      value: stats?.totalReadings ?? '—',
      subtitle: `${stats?.totalPatients ?? 0} Unique Patients`,
      icon: FileText,
      borderColor: 'border-blue-100',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Normal Tests',
      value: stats?.normalReadings ?? '—',
      subtitle: 'All 10 analytes in range',
      icon: CheckCircle,
      borderColor: 'border-emerald-100',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Flagged Abnormal',
      value: stats?.abnormalReadings ?? '—',
      subtitle: `${stats?.abnormalRate ?? 0}% abnormal rate`,
      icon: AlertTriangle,
      borderColor: 'border-rose-100',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
    },
    {
      title: 'Pending Review',
      value: stats?.pendingReview ?? '—',
      subtitle: 'Awaiting clinician sign-off',
      icon: Clock,
      borderColor: 'border-amber-100',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      title: 'Signed Off',
      value: stats?.signedOffAbnormal ?? '—',
      subtitle: 'Abnormal reviewed & signed',
      icon: CheckCircle2,
      borderColor: 'border-teal-100',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl border ${item.borderColor} p-4 shadow-sm hover:shadow transition-shadow`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {item.title}
              </span>
              <div className={`p-1.5 rounded-lg ${item.bgColor} ${item.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {item.value}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}

export default StatsBar;
