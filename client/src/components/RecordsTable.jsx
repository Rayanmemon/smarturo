import React from 'react';
import { Search, Filter, Eye, Check, RefreshCw } from 'lucide-react';

export function RecordsTable({
  readings,
  pagination,
  search,
  setSearch,
  filter,
  setFilter,
  page,
  setPage,
  loading,
  onSelectReading,
  onQuickReview,
  onRefresh,
}) {
  const filterOptions = [
    { id: 'all', label: 'All Records' },
    { id: 'abnormal', label: 'Abnormal Flagged' },
    { id: 'pending', label: 'Pending Review' },
    { id: 'signed_off', label: 'Signed Off (Abnormal)' },
    { id: 'normal', label: 'Normal' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient ID (e.g., P0042) or Diagnosis..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setFilter(opt.id);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === opt.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            title="Refresh records from MongoDB"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                Patient
              </th>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                Age / Sex
              </th>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                Date
              </th>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                Physical
              </th>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                Key Values
              </th>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                Clinical Flag
              </th>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                Review Status
              </th>
              <th className="px-4 py-3 bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading urinalysis records from MongoDB...</span>
                  </div>
                </td>
              </tr>
            ) : readings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-500">
                  <p className="font-medium text-slate-700">No urinalysis records found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search query or filter selection.
                  </p>
                </td>
              </tr>
            ) : (
              readings.map((reading) => {
                const abnormalCount = reading.flags?.overallAbnormalCount || 0;
                const isAbnormal = abnormalCount > 0;
                const isPending = reading.reviewStatus === 'Pending';
                const formattedDate = reading.timestamp
                  ? new Date(reading.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <tr
                    key={reading._id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectReading(reading)}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-blue-700">
                      <div>{reading.patientId}</div>
                      <div className="text-xs font-normal text-slate-500">
                        {reading.diagnosis || 'Routine Urinalysis'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {reading.patient?.age ? `${reading.patient.age} yrs` : '—'} •{' '}
                      {reading.patient?.gender || '—'}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      <span className="font-medium">{reading.color}</span> / {reading.transparency}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        pH: {reading.ph} | PRO: {reading.pro} | GLU: {reading.glu}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {isAbnormal ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          {abnormalCount} Abnormal Flag{abnormalCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          All Normal
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {isPending ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Review
                        </span>
                      ) : isAbnormal ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
                          title={reading.reviewedBy ? `Signed off by ${reading.reviewedBy}` : 'Signed off'}
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          Signed Off
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          Reviewed
                        </span>
                      )}
                    </td>

                    <td
                      className="px-4 py-3 text-xs text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectReading(reading)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:border-slate-400 transition-colors"
                          title="View Full Urinalysis Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {isPending && (
                          <button
                            onClick={() => onQuickReview(reading._id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                            title="Mark as Reviewed"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Sign</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Showing page <span className="font-semibold text-slate-900">{pagination.page}</span> of{' '}
          <span className="font-semibold text-slate-900">{pagination.totalPages}</span> (
          <span className="font-semibold text-slate-900">{pagination.total}</span> total urinalysis tests)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          <span className="px-2 font-mono text-xs">
            {page} / {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages || 1, page + 1))}
            disabled={page >= (pagination.totalPages || 1)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordsTable;
