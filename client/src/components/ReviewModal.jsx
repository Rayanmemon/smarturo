import React, { useState } from 'react';
import { X, ClipboardCheck, Loader2 } from 'lucide-react';
import { reviewReading } from '../api/client';

export function ReviewModal({ reading, onClose, onSuccess }) {
  const [reviewedBy, setReviewedBy] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!reading) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewedBy.trim()) {
      setError('Please provide reviewer name.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const updated = await reviewReading(reading._id, {
        reviewedBy: reviewedBy.trim(),
        reviewNote: reviewNote.trim(),
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || 'Failed to mark as reviewed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 relative border-slate-700/80 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Clinical Review</h2>
            <p className="text-xs text-slate-400">
              Reading for Patient <strong className="text-slate-200">{reading.patientId}</strong>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Reviewer Name *
            </label>
            <input
              type="text"
              required
              placeholder="Dr. Smith / Nurse Jane"
              value={reviewedBy}
              onChange={(e) => setReviewedBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/80 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Clinical Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add observation, follow-up recommendation, or lab confirmation notes..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/80 text-sm resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md hover:from-teal-400 hover:to-cyan-400 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
