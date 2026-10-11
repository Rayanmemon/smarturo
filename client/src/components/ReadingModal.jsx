import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { reviewReading } from '../api/client';

export function ReadingModal({ reading, onClose, onReviewed }) {
  if (!reading) return null;

  const [reviewedBy, setReviewedBy] = useState(reading.reviewedBy || 'Dr. Student Reviewer');
  const [reviewNote, setReviewNote] = useState(reading.reviewNote || '');
  const [submitting, setSubmitting] = useState(false);

  const analytes = [
    { key: 'leu', name: 'Leukocytes (LEU)', ref: 'Negative', value: reading.leu },
    { key: 'nit', name: 'Nitrite (NIT)', ref: 'Negative', value: reading.nit },
    { key: 'uro', name: 'Urobilinogen (URO)', ref: '0.1 – 1.0 mg/dL', value: `${reading.uro} mg/dL` },
    { key: 'pro', name: 'Protein (PRO)', ref: '≤ 14 mg/dL', value: `${reading.pro} mg/dL` },
    { key: 'ph', name: 'pH Level', ref: '4.5 – 8.0', value: reading.ph },
    { key: 'blo', name: 'Blood (BLO)', ref: 'Negative', value: reading.blo },
    { key: 'sg', name: 'Specific Gravity (SG)', ref: '1.005 – 1.030', value: reading.sg },
    { key: 'ket', name: 'Ketones (KET)', ref: '≤ 0 mg/dL', value: `${reading.ket} mg/dL` },
    { key: 'bil', name: 'Bilirubin (BIL)', ref: '≤ 0 mg/dL', value: `${reading.bil} mg/dL` },
    { key: 'glu', name: 'Glucose (GLU)', ref: '≤ 0 mg/dL', value: `${reading.glu} mg/dL` },
  ];

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await reviewReading(reading._id, { reviewedBy, reviewNote });
      if (onReviewed) onReviewed(updated);
      onClose();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const abnormalCount = reading.flags?.overallAbnormalCount || 0;
  const isPending = reading.reviewStatus === 'Pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {reading.patientId.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Urinalysis Report: {reading.patientId}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    abnormalCount === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {abnormalCount === 0 ? 'Normal' : `${abnormalCount} Abnormal`}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Patient: {reading.patient?.age ? `${reading.patient.age} yrs` : '—'} •{' '}
                {reading.patient?.gender || '—'} • Tested on{' '}
                {reading.timestamp ? new Date(reading.timestamp).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Physical Appearance</span>
              <strong className="text-slate-800">{reading.color}</strong> / {reading.transparency}
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Bacteria</span>
              <strong className="text-slate-800">{reading.bacteria || 'Absent'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Presumed Diagnosis</span>
              <strong className="text-slate-800">{reading.diagnosis || 'Routine'}</strong>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              10-Analyte Dipstick Breakdown
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Analyte</th>
                    <th className="px-3 py-2">Patient Value</th>
                    <th className="px-3 py-2">Clinical Reference</th>
                    <th className="px-3 py-2 text-right">Flag Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytes.map((item) => {
                    const flag = reading.flags ? reading.flags[item.key] : 'Normal';
                    const isAbnormal = flag === 'Abnormal';

                    return (
                      <tr key={item.key} className={isAbnormal ? 'bg-rose-50/50' : ''}>
                        <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                        <td className="px-3 py-2 font-mono text-slate-700">{item.value}</td>
                        <td className="px-3 py-2 text-slate-500">{item.ref}</td>
                        <td className="px-3 py-2 text-right">
                          {isAbnormal ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                              <AlertTriangle className="w-3.5 h-3.5" /> Abnormal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5" /> Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Clinician Review & Sign-Off
            </h4>

            {isPending ? (
              <form onSubmit={handleReview} className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Attending Reviewer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewedBy}
                      onChange={(e) => setReviewedBy(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Clinical Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Prescribe antibiotics, follow-up in 7 days"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    {submitting ? 'Signing...' : 'Sign Off & Mark Reviewed'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-900">
                <p>
                  <strong>Reviewed by:</strong> {reading.reviewedBy || 'Attending Clinician'}
                </p>
                {reading.reviewNote && (
                  <p className="mt-1 text-slate-600">
                    <strong>Note:</strong> {reading.reviewNote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReadingModal;
