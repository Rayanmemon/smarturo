import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Loader2,
  Calendar,
} from 'lucide-react';
import { getPatients } from '../api/client';
import { AbnormalCountBadge } from '../components/Badge';

export function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: search.trim(),
        gender: genderFilter,
      };

      const data = await getPatients(params);
      setPatients(data.patients);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching patients list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData(1);
  }, [search, genderFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPatientData(newPage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Patient Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, and inspect urinalysis records per patient
          </p>
        </div>

        <button
          onClick={() => navigate('/readings/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold text-sm shadow-md hover:from-teal-400 hover:to-cyan-400 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Patient Reading</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient ID (e.g. P0003)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/80"
          />
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-teal-500/80 w-full sm:w-auto"
          >
            <option value="">All Genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
            <p className="text-sm">Loading patient directory...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-300">No patients found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search filters or add a new reading.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Age</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Latest Diagnosis</th>
                  <th className="px-6 py-4">Latest Test Date</th>
                  <th className="px-6 py-4">Status / Flag Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {patients.map((patient) => (
                  <tr
                    key={patient.patientId}
                    onClick={() => navigate(`/patients/${patient.patientId}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-bold text-white group-hover:text-teal-300">
                      {patient.patientId}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{patient.age} yrs</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          patient.gender === 'Female'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {patient.latestDiagnosis}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {patient.latestReadingDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(patient.latestReadingDate).toLocaleDateString()}
                        </span>
                      ) : (
                        'No readings'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <AbnormalCountBadge count={patient.abnormalCount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page <strong className="text-slate-200">{pagination.page}</strong> of{' '}
              <strong className="text-slate-200">{pagination.totalPages}</strong> (
              {pagination.total} patients)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Patients;
