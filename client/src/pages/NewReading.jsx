import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  User,
  FlaskConical,
} from 'lucide-react';
import { createReading, getPatients, createPatient } from '../api/client';
import Badge, { AbnormalCountBadge } from '../components/Badge';

export function NewReading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledPatientId = searchParams.get('patientId') || '';

  const [patientMode, setPatientMode] = useState(
    prefilledPatientId ? 'existing' : 'new'
  );

  // Existing patient selector states
  const [existingPatientId, setExistingPatientId] = useState(prefilledPatientId);
  const [patientList, setPatientList] = useState([]);

  // New patient creation states
  const [newPatientId, setNewPatientId] = useState('');
  const [newAge, setNewAge] = useState(30);
  const [newGender, setNewGender] = useState('Female');

  // Analyte Form Values
  const [color, setColor] = useState('Yellow');
  const [transparency, setTransparency] = useState('Clear');
  const [leu, setLeu] = useState('Negative');
  const [nit, setNit] = useState('Negative');
  const [uro, setUro] = useState(0.2);
  const [pro, setPro] = useState(0);
  const [ph, setPh] = useState(6.5);
  const [blo, setBlo] = useState('Negative');
  const [sg, setSg] = useState(1.015);
  const [ket, setKet] = useState(0);
  const [bil, setBil] = useState(0);
  const [glu, setGlu] = useState(0);
  const [bacteria, setBacteria] = useState('Absent');
  const [diagnosis, setDiagnosis] = useState('Unspecified');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState(null);

  useEffect(() => {
    // Load patient list for selection dropdown
    getPatients({ limit: 100 })
      .then((data) => setPatientList(data.patients || []))
      .catch((err) => console.error('Failed to load patient dropdown list:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let targetPatientId = existingPatientId;

    try {
      setLoading(true);

      // If user is creating a new patient record first
      if (patientMode === 'new') {
        const pRes = await createPatient({
          patientId: newPatientId.trim() || undefined,
          age: Number(newAge),
          gender: newGender,
        });
        targetPatientId = pRes.patientId;
      }

      if (!targetPatientId) {
        throw new Error('Please select or create a valid Patient ID.');
      }

      const payload = {
        patientId: targetPatientId,
        color,
        transparency,
        leu,
        nit,
        uro: Number(uro),
        pro: Number(pro),
        ph: Number(ph),
        blo,
        sg: Number(sg),
        ket: Number(ket),
        bil: Number(bil),
        glu: Number(glu),
        bacteria,
        diagnosis,
      };

      const result = await createReading(payload);
      setCreatedResult(result);
    } catch (err) {
      console.error('Error submitting reading:', err);
      setError(
        err.response?.data?.details?.join(', ') ||
          err.response?.data?.error ||
          err.message ||
          'Failed to record urinalysis reading.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-teal-400" />
          New Urinalysis Reading Entry
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Input dipstick readings. Server rule engine will deterministically calculate flags.
        </p>
      </div>

      {/* Success Modal / Banner when created */}
      {createdResult ? (
        <div className="glass-panel p-6 sm:p-8 border-teal-500/40 bg-teal-950/20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mx-auto">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Reading Submitted & Flagged!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Patient ID: <strong className="text-teal-300">{createdResult.patientId}</strong> | Status:{' '}
              <Badge type={createdResult.reviewStatus} />
            </p>
          </div>

          {/* Computed Flags Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Rule Engine Result
              </span>
              <AbnormalCountBadge count={createdResult.flags.overallAbnormalCount} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(createdResult.flags)
                .filter(([k]) => k !== 'overallAbnormalCount')
                .map(([key, flag]) => (
                  <div key={key} className="flex justify-between items-center p-1.5 rounded bg-slate-900/60">
                    <span className="uppercase text-slate-400">{key}</span>
                    <Badge type={flag} size="sm" />
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => {
                setCreatedResult(null);
                setDiagnosis('Unspecified');
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Add Another Entry
            </button>
            <button
              onClick={() => navigate(`/patients/${createdResult.patientId}`)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md"
            >
              View Patient Profile <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Patient Selection / Creation */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-teal-400" /> 1. Patient Details
            </h2>

            {/* Toggle Mode */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="patientMode"
                  value="existing"
                  checked={patientMode === 'existing'}
                  onChange={() => setPatientMode('existing')}
                  className="accent-teal-500"
                />
                Select Existing Patient
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="patientMode"
                  value="new"
                  checked={patientMode === 'new'}
                  onChange={() => setPatientMode('new')}
                  className="accent-teal-500"
                />
                Register New Patient
              </label>
            </div>

            {patientMode === 'existing' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Patient ID
                </label>
                <select
                  required
                  value={existingPatientId}
                  onChange={(e) => setExistingPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patientList.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.patientId} ({p.gender}, {p.age} yrs)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Patient ID (Optional, auto P0###)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. P0501"
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={120}
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Gender *
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Visual & Qualitative Analytes */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              2. Visual & Qualitative Properties
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Color
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value="Yellow">Yellow</option>
                  <option value="Pale Yellow">Pale Yellow</option>
                  <option value="Dark Yellow">Dark Yellow</option>
                  <option value="Amber">Amber</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Transparency
                </label>
                <select
                  value={transparency}
                  onChange={(e) => setTransparency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value="Clear">Clear</option>
                  <option value="Cloudy">Cloudy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Bacteria
                </label>
                <select
                  value={bacteria}
                  onChange={(e) => setBacteria(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value="Absent">Absent</option>
                  <option value="Present">Present</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Diagnosis Label
                </label>
                <select
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value="Unspecified">Unspecified</option>
                  <option value="Normal">Normal</option>
                  <option value="UTI">UTI</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Kidney Disease">Kidney Disease</option>
                  <option value="Liver Disease">Liver Disease</option>
                  <option value="Dehydration">Dehydration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: 10 Dipstick Analytes */}
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              3. Dipstick 10-Analyte Measurements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* LEU */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LEU (Leucocytes)
                </label>
                <select
                  value={leu}
                  onChange={(e) => setLeu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value="Negative">Negative (Normal)</option>
                  <option value="++">++ (Abnormal)</option>
                  <option value="+++">+++ (Abnormal)</option>
                </select>
              </div>

              {/* NIT */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NIT (Nitrite)
                </label>
                <select
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value="Negative">Negative (Normal)</option>
                  <option value="Positive">Positive (Abnormal)</option>
                </select>
              </div>

              {/* URO */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URO (Urobilinogen mg/dL)
                </label>
                <select
                  value={uro}
                  onChange={(e) => setUro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value={0.2}>0.2 (Normal ~0.1-1.0)</option>
                  <option value={4.0}>4.0 (Abnormal)</option>
                  <option value={8.0}>8.0 (Abnormal)</option>
                  <option value={12.0}>12.0 (Abnormal)</option>
                </select>
              </div>

              {/* PRO */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PRO (Protein mg/dL, normal ≤14)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={2000}
                  value={pro}
                  onChange={(e) => setPro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>

              {/* pH */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  pH Level (Normal 4.5 – 8.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min={0}
                  max={14}
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>

              {/* BLO */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  BLO (Blood)
                </label>
                <select
                  value={blo}
                  onChange={(e) => setBlo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                >
                  <option value="Negative">Negative (Normal)</option>
                  <option value="Trace">Trace (Abnormal)</option>
                  <option value="+">+ (Abnormal)</option>
                  <option value="++">++ (Abnormal)</option>
                </select>
              </div>

              {/* SG */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SG (Specific Gravity, normal 1.005-1.030)
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  min={0.9}
                  max={1.1}
                  value={sg}
                  onChange={(e) => setSg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>

              {/* KET */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  KET (Ketones mg/dL, normal 0)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={160}
                  value={ket}
                  onChange={(e) => setKet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>

              {/* BIL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  BIL (Bilirubin, normal 0)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={4}
                  value={bil}
                  onChange={(e) => setBil(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>

              {/* GLU */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  GLU (Glucose mg/dL, normal 0)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={2000}
                  value={glu}
                  onChange={(e) => setGlu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Urinalysis Reading
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default NewReading;
