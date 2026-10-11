import React from 'react';
import { BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ReferenceRanges() {
  const rules = [
    {
      code: 'LEU',
      name: 'Leucocytes',
      normal: 'Negative',
      abnormal: '++ or +++',
      clinicalSignificance: 'Elevated leucocytes indicate pyuria and possible urinary tract infection (UTI) or inflammation.',
    },
    {
      code: 'NIT',
      name: 'Nitrite',
      normal: 'Negative',
      abnormal: 'Positive',
      clinicalSignificance: 'Nitrites are produced by gram-negative bacteria (e.g. E. coli) reducing nitrate; strong marker for UTI.',
    },
    {
      code: 'URO',
      name: 'Urobilinogen',
      normal: '0.1 – 1.0 mg/dL',
      abnormal: '< 0.1 or > 1.0 mg/dL',
      clinicalSignificance: 'Elevated in hemolytic anemia or liver disease; absent in obstructive jaundice.',
    },
    {
      code: 'PRO',
      name: 'Protein',
      normal: '≤ 14 mg/dL',
      abnormal: '> 14 mg/dL',
      clinicalSignificance: 'Proteinuria suggests glomerular damage, chronic kidney disease (CKD), or preeclampsia.',
    },
    {
      code: 'pH',
      name: 'Urinary pH',
      normal: '4.5 – 8.0',
      abnormal: '< 4.5 or > 8.0',
      clinicalSignificance: 'Extreme acidity or alkalinity can indicate metabolic acidosis, alkalosis, or risk of renal calculi.',
    },
    {
      code: 'BLO',
      name: 'Blood',
      normal: 'Negative',
      abnormal: 'Trace, +, ++',
      clinicalSignificance: 'Hematuria indicates urinary tract trauma, renal calculi (kidney stones), infection, or malignancy.',
    },
    {
      code: 'SG',
      name: 'Specific Gravity',
      normal: '1.005 – 1.030',
      abnormal: '< 1.005 or > 1.030',
      clinicalSignificance: 'Measures renal concentrating ability and hydration status; abnormal in diabetes insipidus or dehydration.',
    },
    {
      code: 'KET',
      name: 'Ketones',
      normal: '≤ 0 mg/dL',
      abnormal: '> 0 mg/dL',
      clinicalSignificance: 'Ketonuria indicates diabetic ketoacidosis (DKA), starvation, or prolonged strenuous exercise.',
    },
    {
      code: 'BIL',
      name: 'Bilirubin',
      normal: '≤ 0 mg/dL',
      abnormal: '> 0 mg/dL',
      clinicalSignificance: 'Conjugated bilirubin in urine indicates hepatocellular dysfunction or biliary tree obstruction.',
    },
    {
      code: 'GLU',
      name: 'Glucose',
      normal: '≤ 0 mg/dL',
      abnormal: '> 0 mg/dL',
      clinicalSignificance: 'Glucosuria occurs when blood glucose exceeds the renal threshold (typically > 180 mg/dL) in diabetes mellitus.',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Clinical Reference Ranges
          </h2>
          <p className="text-xs text-slate-500">
            Standard clinical reference thresholds used for dipstick urinalysis evaluation
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <th className="px-3.5 py-2.5">Analyte Code</th>
              <th className="px-3.5 py-2.5">Full Name</th>
              <th className="px-3.5 py-2.5">Normal Threshold</th>
              <th className="px-3.5 py-2.5">Abnormal Condition</th>
              <th className="px-3.5 py-2.5">Clinical Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <tr key={rule.code} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-3 font-mono font-bold text-blue-700">{rule.code}</td>
                <td className="px-3.5 py-3 font-medium text-slate-800">{rule.name}</td>
                <td className="px-3.5 py-3">
                  <span className="inline-flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> {rule.normal}
                  </span>
                </td>
                <td className="px-3.5 py-3">
                  <span className="inline-flex items-center gap-1 font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <AlertCircle className="w-3 h-3" /> {rule.abnormal}
                  </span>
                </td>
                <td className="px-3.5 py-3 text-slate-600 max-w-md">{rule.clinicalSignificance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReferenceRanges;
