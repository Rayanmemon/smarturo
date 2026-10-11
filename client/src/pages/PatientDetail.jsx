import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  PlusCircle,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { getPatientById } from '../api/client';
import Badge, { AbnormalCountBadge } from '../components/Badge';
import ReadingDetailModal from '../components/ReadingDetailModal';

export function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReading, setSelectedReading] = useState(null);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getPatientById(patientId);
      setPatientData(res);
    } catch (err) {
      console.error('Error loading patient detail:', err);
      setError(err.response?.data?.error || 'Failed to load patient history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        <p className="text-sm">Loading patient profile & history...</p>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-panel p-8 text-center border-rose-500/30">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Patient Not Found</h3>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/patients')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Patient List
          </button>
        </div>
      </div>
    );
  }

  const { patient, readings } = patientData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => navigate('/patients')}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      {/* Patient Demographic Card */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-700/80">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-teal-500/20">
            {patient.patientId.slice(-2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{patient.patientId}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                  patient.gender === 'Female'
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                {patient.gender}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
              <span>Age: <strong className="text-slate-200">{patient.age} years</strong></span>
              <span>Total Test Events: <strong className="text-teal-400">{readings.length}</strong></span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Added {new Date(patient.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/readings/new?patientId=${patient.patientId}`)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold text-sm shadow-md hover:from-teal-400 hover:to-cyan-400 transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Urinalysis Reading</span>
        </button>
      </div>

      {/* Reading History Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          Urinalysis Test History
        </h2>
        <span className="text-xs text-slate-400">Click any row to view complete analyte flags</span>
      </div>

      {/* Reading Timeline / Table */}
      <div className="glass-panel overflow-hidden">
        {readings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-300">No test readings recorded</p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Add New Urinalysis Reading" above to submit the first dipstick reading.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Test Date & Time</th>
                  <th className="px-6 py-4">Diagnosis Label</th>
                  <th className="px-6 py-4">Abnormal Flags</th>
                  <th className="px-6 py-4">Review Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {readings.map((reading) => (
                  <tr
                    key={reading._id}
                    onClick={() => setSelectedReading(reading)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 text-xs font-semibold text-slate-200">
                      {new Date(reading.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {reading.diagnosis}
                    </td>
                    <td className="px-6 py-4">
                      <AbnormalCountBadge
                        count={reading.flags?.overallAbnormalCount ?? 0}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={reading.reviewStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-teal-400 group-hover:underline">
                        View Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReading && (
        <ReadingDetailModal
          reading={selectedReading}
          onClose={() => setSelectedReading(null)}
        />
      )}
    </div>
  );
}

export default PatientDetail;
