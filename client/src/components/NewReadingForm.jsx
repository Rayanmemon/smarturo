import React, { useState } from 'react';
import { Send, Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { createReading } from '../api/client';

export function NewReadingForm({ onReadingCreated }) {
  const initialForm = {
    patientId: '',
    age: '28',
    gender: 'Female',
    color: 'Yellow',
    transparency: 'Clear',
    leu: 'Negative',
    nit: 'Negative',
    uro: '0.2',
    pro: '0',
    ph: '6.0',
    blo: 'Negative',
    sg: '1.015',
    ket: '0',
    bil: '0',
    glu: '0',
    bacteria: 'Absent',
    diagnosis: 'Normal',
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [resultBanner, setResultBanner] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadPreset = (preset) => {
    setResultBanner(null);
    setErrorMsg('');

    if (preset === 'normal') {
      setFormData({
        patientId: `P${Math.floor(1000 + Math.random() * 9000)}`,
        age: '25',
        gender: 'Female',
        color: 'Yellow',
        transparency: 'Clear',
        leu: 'Negative',
        nit: 'Negative',
        uro: '0.2',
        pro: '0',
        ph: '6.0',
        blo: 'Negative',
        sg: '1.015',
        ket: '0',
        bil: '0',
        glu: '0',
        bacteria: 'Absent',
        diagnosis: 'Normal',
      });
    } else if (preset === 'uti') {
      setFormData({
        patientId: `P${Math.floor(1000 + Math.random() * 9000)}`,
        age: '34',
        gender: 'Female',
        color: 'Dark Yellow',
        transparency: 'Cloudy',
        leu: '+++',
        nit: 'Positive',
        uro: '0.5',
        pro: '25',
        ph: '7.5',
        blo: '+',
        sg: '1.025',
        ket: '0',
        bil: '0',
        glu: '0',
        bacteria: 'Present',
        diagnosis: 'UTI',
      });
    } else if (preset === 'diabetes') {
      setFormData({
        patientId: `P${Math.floor(1000 + Math.random() * 9000)}`,
        age: '52',
        gender: 'Male',
        color: 'Pale Yellow',
        transparency: 'Clear',
        leu: 'Negative',
        nit: 'Negative',
        uro: '0.3',
        pro: '0',
        ph: '5.5',
        blo: 'Negative',
        sg: '1.035',
        ket: '15',
        bil: '0',
        glu: '250',
        bacteria: 'Absent',
        diagnosis: 'Diabetes',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setResultBanner(null);

    try {
      const payload = {
        patientId: formData.patientId || undefined,
        age: Number(formData.age),
        gender: formData.gender,
        color: formData.color,
        transparency: formData.transparency,
        leu: formData.leu,
        nit: formData.nit,
        uro: Number(formData.uro),
        pro: Number(formData.pro),
        ph: Number(formData.ph),
        blo: formData.blo,
        sg: Number(formData.sg),
        ket: Number(formData.ket),
        bil: Number(formData.bil),
        glu: Number(formData.glu),
        bacteria: formData.bacteria,
        diagnosis: formData.diagnosis,
      };

      const response = await createReading(payload);
      setResultBanner({
        success: true,
        data: response,
      });

      if (onReadingCreated) {
        onReadingCreated(response);
      }
    } catch (err) {
      console.error('Error submitting reading:', err);
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.error || 'Failed to submit urinalysis test'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">New Urinalysis Test Entry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter patient dipstick measurements. Evaluated server-side using standard clinical reference rules.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Demo presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('normal')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Normal Sample
          </button>
          <button
            type="button"
            onClick={() => loadPreset('uti')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            UTI Sample
          </button>
          <button
            type="button"
            onClick={() => loadPreset('diabetes')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Diabetes Sample
          </button>
        </div>
      </div>

      {resultBanner && (
        <div
          className={`mb-6 p-4 rounded-lg border text-sm flex items-start gap-3 ${
            resultBanner.data.flags.overallAbnormalCount === 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {resultBanner.data.flags.overallAbnormalCount === 0 ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-sm">
              Test Saved Successfully into MongoDB! (Patient ID: {resultBanner.data.patientId})
            </h4>
            <p className="text-xs mt-1">
              Result:{' '}
              <strong>
                {resultBanner.data.flags.overallAbnormalCount === 0
                  ? 'All 10 Analytes Normal'
                  : `${resultBanner.data.flags.overallAbnormalCount} Abnormal Analyte(s) Detected`}
              </strong>{' '}
              • Review Status: <strong>{resultBanner.data.reviewStatus}</strong>
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            1. Patient Demographics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Patient ID (Optional)
              </label>
              <input
                type="text"
                name="patientId"
                placeholder="Auto-generated if empty"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                name="age"
                required
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            2. Physical Observation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Color</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Pale Yellow">Pale Yellow</option>
                <option value="Yellow">Yellow (Normal)</option>
                <option value="Dark Yellow">Dark Yellow</option>
                <option value="Amber">Amber</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transparency
              </label>
              <select
                name="transparency"
                value={formData.transparency}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Clear">Clear (Normal)</option>
                <option value="Cloudy">Cloudy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bacteria</label>
              <select
                name="bacteria"
                value={formData.bacteria}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Absent">Absent (Normal)</option>
                <option value="Present">Present</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            3. Chemical Dipstick Test Analytes (10 Parameters)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">LEU (Leukocytes)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: Negative</span>
              <select
                name="leu"
                value={formData.leu}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Negative">Negative (Normal)</option>
                <option value="++">++ (Trace)</option>
                <option value="+++">+++ (High)</option>
              </select>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">NIT (Nitrite)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: Negative</span>
              <select
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Negative">Negative (Normal)</option>
                <option value="Positive">Positive</option>
              </select>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">URO (Urobilinogen)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: 0.1 - 1.0 mg/dL</span>
              <input
                type="number"
                step="0.1"
                name="uro"
                required
                value={formData.uro}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">PRO (Protein)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: ≤ 14 mg/dL</span>
              <input
                type="number"
                step="1"
                name="pro"
                required
                value={formData.pro}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">pH Level</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: 4.5 - 8.0</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                name="ph"
                required
                value={formData.ph}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">BLO (Blood)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: Negative</span>
              <select
                name="blo"
                value={formData.blo}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Negative">Negative (Normal)</option>
                <option value="Trace">Trace</option>
                <option value="+">+ (1+)</option>
                <option value="++">++ (2+)</option>
              </select>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">SG (Specific Gravity)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: 1.005 - 1.030</span>
              <input
                type="number"
                step="0.001"
                min="0.9"
                max="1.1"
                name="sg"
                required
                value={formData.sg}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">KET (Ketones)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: ≤ 0 mg/dL</span>
              <input
                type="number"
                step="1"
                min="0"
                name="ket"
                required
                value={formData.ket}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">BIL (Bilirubin)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: ≤ 0 mg/dL</span>
              <input
                type="number"
                step="1"
                min="0"
                name="bil"
                required
                value={formData.bil}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800">GLU (Glucose)</label>
              <span className="text-[10px] text-slate-500 block mb-1">Ref: ≤ 0 mg/dL</span>
              <input
                type="number"
                step="1"
                min="0"
                name="glu"
                required
                value={formData.glu}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            4. Presumed Clinical Diagnosis
          </label>
          <select
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="w-full sm:w-1/2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Normal">Normal</option>
            <option value="UTI">Urinary Tract Infection (UTI)</option>
            <option value="Diabetes">Diabetes / Glycosuria</option>
            <option value="Kidney Disease">Kidney Disease / Proteinuria</option>
            <option value="Liver Disease">Liver Disease</option>
            <option value="Dehydration">Dehydration</option>
            <option value="Unspecified">Unspecified / Routine Checkup</option>
          </select>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Evaluating & Saving to DB...' : 'Save & Evaluate Test'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewReadingForm;
