import React from 'react';
import { X, Calendar, User, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';

export function ReadingDetailModal({ reading, onClose }) {
  if (!reading) return null;

  const analytes = [
    { key: 'leu', name: 'Leucocytes (LEU)', val: reading.leu, ref: 'Negative', unit: '' },
    { key: 'nit', name: 'Nitrite (NIT)', val: reading.nit, ref: 'Negative', unit: '' },
    { key: 'uro', name: 'Urobilinogen (URO)', val: reading.uro, ref: '0.1 – 1.0', unit: 'mg/dL' },
    { key: 'pro', name: 'Protein (PRO)', val: reading.pro, ref: '≤ 14', unit: 'mg/dL' },
    { key: 'ph', name: 'pH Level', val: reading.ph, ref: '4.5 – 8.0', unit: '' },
    { key: 'blo', name: 'Blood (BLO)', val: reading.blo, ref: 'Negative', unit: '' },
    { key: 'sg', name: 'Specific Gravity (SG)', val: reading.sg, ref: '1.005 – 1.030', unit: '' },
    { key: 'ket', name: 'Ketones (KET)', val: reading.ket, ref: '0', unit: 'mg/dL' },
    { key: 'bil', name: 'Bilirubin (BIL)', val: reading.bil, ref: '0', unit: 'mg/dL' },
    { key: 'glu', name: 'Glucose (GLU)', val: reading.glu, ref: '0', unit: 'mg/dL' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative border-slate-700/80 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              Reading Detail for Patient {reading.patientId}
              <Badge type={reading.reviewStatus} />
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(reading.timestamp).toLocaleString()}
              </span>
              <span>Diagnosis label: <strong className="text-slate-200">{reading.diagnosis}</strong></span>
            </div>
          </div>
        </div>

        {/* Visual Attributes Header */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Color</span>
            <span className="font-semibold text-slate-200">{reading.color}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Transparency</span>
            <span className="font-semibold text-slate-200">{reading.transparency}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Bacteria</span>
            <span className="font-semibold text-slate-200">{reading.bacteria}</span>
          </div>
        </div>

        {/* Analytes 10-Grid */}
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Dipstick Analyte Readings & Reference Ranges
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {analytes.map((item) => {
            const flag = reading.flags ? reading.flags[item.key] : 'Normal';
            const isAbnormal = flag === 'Abnormal';

            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border transition-all ${
                  isAbnormal
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-slate-900/40 border-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">
                    {item.name}
                  </span>
                  <Badge type={flag} size="sm" />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div>
                    <span className="text-lg font-bold text-white">
                      {item.val}
                    </span>
                    {item.unit && <span className="text-xs text-slate-400 ml-1">{item.unit}</span>}
                  </div>
                  <span className="text-xs text-slate-400">
                    Ref: <span className="text-slate-300 font-medium">{item.ref}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reviewer Note if available */}
        {reading.reviewStatus === 'Reviewed' && (
          <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Reviewed by {reading.reviewedBy || 'Clinician'}
            </div>
            {reading.reviewNote && <p className="italic text-slate-400">"{reading.reviewNote}"</p>}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReadingDetailModal;
