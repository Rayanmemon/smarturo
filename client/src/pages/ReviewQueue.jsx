import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Eye,
} from 'lucide-react';
import { getReadings } from '../api/client';
import Badge, { AbnormalCountBadge } from '../components/Badge';
import ReviewModal from '../components/ReviewModal';
import ReadingDetailModal from '../components/ReadingDetailModal';

export function ReviewQueue() {
  const [pendingReadings, setPendingReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingReading, setReviewingReading] = useState(null);
  const [inspectReading, setInspectReading] = useState(null);

  const fetchPendingQueue = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getReadings({
        reviewStatus: 'Pending',
        limit: 50,
      });

      // Sort by abnormal count descending
      const sorted = (data.readings || []).sort(
        (a, b) =>
          (b.flags?.overallAbnormalCount || 0) -
          (a.flags?.overallAbnormalCount || 0)
      );

      setPendingReadings(sorted);
    } catch (err) {
      console.error('Error fetching review queue:', err);
      setError('Failed to load pending review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const handleReviewSuccess = (updatedReading) => {
    setPendingReadings((prev) =>
      prev.filter((item) => item._id !== updatedReading._id)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-amber-400" />
          Clinician Review Queue
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Urinalysis readings flagged with 1 or more abnormal analytes awaiting clinical sign-off
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-sm">Loading pending queue...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center max-w-lg mx-auto border-rose-500/30">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <p className="text-sm text-slate-300">{error}</p>
        </div>
      ) : pendingReadings.length === 0 ? (
        <div className="glass-panel p-12 text-center border-teal-500/30">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Review Queue Clear!</h2>
          <p className="text-xs text-slate-400 mt-1">
            All pending abnormal readings have been reviewed by a clinician.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{pendingReadings.length}</strong> items sorted by severity
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingReadings.map((reading) => {
              // Extract list of abnormal analyte names for quick display
              const abnormalAnalytes = reading.flags
                ? Object.entries(reading.flags)
                    .filter(([k, v]) => k !== 'overallAbnormalCount' && v === 'Abnormal')
                    .map(([k]) => k.toUpperCase())
                : [];

              return (
                <div
                  key={reading._id}
                  className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-extrabold text-white">
                        Patient {reading.patientId}
                      </span>
                      <span className="text-sm font-semibold text-slate-300">
                        Diagnosis: {reading.diagnosis}
                      </span>
                      <AbnormalCountBadge count={reading.flags?.overallAbnormalCount || 0} />
                      <Badge type="Pending" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(reading.timestamp).toLocaleString()}
                      </span>
                      <span>Color: <strong className="text-slate-300">{reading.color}</strong></span>
                      <span>Bacteria: <strong className="text-slate-300">{reading.bacteria}</strong></span>
                    </div>

                    {/* Abnormal Analytes List */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-rose-400">Abnormal:</span>
                      <div className="flex flex-wrap gap-1">
                        {abnormalAnalytes.map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                      onClick={() => setInspectReading(reading)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                    <button
                      onClick={() => setReviewingReading(reading)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:from-teal-400 hover:to-cyan-400 shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Mark Reviewed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      {reviewingReading && (
        <ReviewModal
          reading={reviewingReading}
          onClose={() => setReviewingReading(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Inspect Detail Modal */}
      {inspectReading && (
        <ReadingDetailModal
          reading={inspectReading}
          onClose={() => setInspectReading(null)}
        />
      )}
    </div>
  );
}

export default ReviewQueue;
