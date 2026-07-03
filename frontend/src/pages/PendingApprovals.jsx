import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function PendingApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPending = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 8 };
    if (search) params.search = search;
    if (leaveType) params.leaveType = leaveType;

    api
      .get('/pending-leaves', { params })
      .then(({ data }) => {
        setLeaves(data.data);
        setTotalPages(data.pagination.totalPages || 1);
      })
      .catch(() => setErrorMsg('Could not load pending approvals.'))
      .finally(() => setLoading(false));
  }, [page, search, leaveType]);

  useEffect(() => {
    const timeout = setTimeout(fetchPending, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchPending]);

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Pending Approvals</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">Review and process absence requests from your team</p>

        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search employee name or email…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-72 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            aria-label="Search employees"
          />
          <select
            value={leaveType}
            onChange={(e) => {
              setPage(1);
              setLeaveType(e.target.value);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            aria-label="Filter by leave type"
          >
            <option value="">All Types</option>
            {['Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {loading && <LoadingSpinner label="Loading pending requests…" />}
        {errorMsg && <p className="mt-6 rounded-xl bg-rose-50 border border-rose-200/50 px-4 py-3 text-sm text-rose-700">{errorMsg}</p>}

        {!loading && leaves.length === 0 && (
          <div className="mt-8 text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-white/50">
            <p className="text-sm font-medium text-slate-400">No pending requests right now. 🎉</p>
          </div>
        )}

        {!loading && leaves.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Leave Type</th>
                    <th className="px-6 py-4">Requested Dates</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{l.employee?.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{l.employee?.department}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{l.leaveType}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(l.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(l.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/leave-details/${l._id}`} 
                          className="inline-flex items-center justify-center rounded-lg border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100 hover:text-primary-800 transition"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
