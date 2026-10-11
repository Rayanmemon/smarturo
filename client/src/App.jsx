import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import RecordsTable from './components/RecordsTable';
import NewReadingForm from './components/NewReadingForm';
import ReadingModal from './components/ReadingModal';
import ReferenceRanges from './components/ReferenceRanges';
import { getSummaryStats, getReadings, reviewReading } from './api/client';

export function App() {
  const [stats, setStats] = useState(null);
  const [readings, setReadings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await getSummaryStats();
      setStats(data);
    } catch (err) {
      console.warn('Stats request failed:', err.message);
    }
  };

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReadings({
        page,
        limit: 12,
        search,
        filter,
      });
      setReadings(data.readings || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleQuickReview = async (id) => {
    try {
      await reviewReading(id, { reviewedBy: 'Attending Clinician (Quick Sign)' });
      fetchReadings();
      fetchStats();
    } catch (err) {
      console.error('Quick review failed:', err);
    }
  };

  const handleReadingCreated = () => {
    fetchStats();
    fetchReadings();
  };

  const handleReadingReviewed = () => {
    fetchStats();
    fetchReadings();
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StatsBar stats={stats} />

          <Routes>
            <Route
              path="/"
              element={
                <RecordsTable
                  readings={readings}
                  pagination={pagination}
                  search={search}
                  setSearch={setSearch}
                  filter={filter}
                  setFilter={setFilter}
                  page={page}
                  setPage={setPage}
                  loading={loading}
                  onSelectReading={setSelectedReading}
                  onQuickReview={handleQuickReview}
                  onRefresh={() => {
                    fetchReadings();
                    fetchStats();
                  }}
                />
              }
            />
            <Route
              path="/new"
              element={<NewReadingForm onReadingCreated={handleReadingCreated} />}
            />
            <Route
              path="/guidelines"
              element={<ReferenceRanges />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {selectedReading && (
          <ReadingModal
            reading={selectedReading}
            onClose={() => setSelectedReading(null)}
            onReviewed={handleReadingReviewed}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
