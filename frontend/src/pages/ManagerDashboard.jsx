import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    api
      .get('/manager/dashboard/stats')
      .then(({ data }) => mounted && setStats(data.data))
      .catch(() => mounted && setErrorMsg('Could not load dashboard data.'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Manager Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Monitor and approve leave requests for your team</p>
          </div>
          <Link
            to="/manager/pending-approvals"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/10 transition-all duration-300 hover:from-primary-500 hover:to-indigo-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            Review Pending Approvals
          </Link>
        </div>

        {loading && <LoadingSpinner label="Loading dashboard…" />}
        {errorMsg && <p className="mt-6 rounded-xl bg-rose-50 border border-rose-200/50 px-4 py-3 text-sm text-rose-700">{errorMsg}</p>}

        {stats && (
          <div className="animate-in fade-in duration-500">
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total Employees" value={`${stats.totalEmployees} Members`} />
              <StatCard label="Pending Approvals" value={stats.pendingApprovals} accent="text-amber-600" />
              <StatCard label="Approved" value={stats.approvedRequests} accent="text-emerald-600" />
              <StatCard label="Rejected" value={stats.rejectedRequests} accent="text-rose-600" />
            </div>

            <section className="mt-12">
              <h2 className="font-display text-lg font-bold text-slate-800">Recent Activity</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md shadow-sm">
                {stats.recentActivity.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500 text-center">No recent activity.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Employee</th>
                          <th className="px-6 py-4">Leave Type</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.recentActivity.map((l) => (
                          <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <Link to={`/leave-details/${l._id}`} className="font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                                {l.employee?.name || 'Unknown'}
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{l.leaveType}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={l.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
