import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    api
      .get('/leaves/dashboard/stats')
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
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Your Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Track and manage your leave applications</p>
          </div>
          <Link 
            to="/apply-leave" 
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/10 transition-all duration-300 hover:from-primary-500 hover:to-indigo-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="mr-1.5 font-bold">+</span> Apply for Leave
          </Link>
        </div>

        {loading && <LoadingSpinner label="Loading your dashboard…" />}
        {errorMsg && <p className="mt-6 rounded-xl bg-rose-50 border border-rose-200/50 px-4 py-3 text-sm text-rose-700">{errorMsg}</p>}

        {stats && (
          <div className="animate-in fade-in duration-500">
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Leave Balance" value={`${stats.leaveBalance} Days`} accent="text-primary-600" />
              <StatCard label="Total Requests" value={stats.totalRequests} />
              <StatCard label="Approved" value={stats.approvedRequests} accent="text-emerald-600" />
              <StatCard label="Pending" value={stats.pendingRequests} accent="text-amber-600" />
              <StatCard label="Rejected" value={stats.rejectedRequests} accent="text-rose-600" />
            </div>

            <section className="mt-12">
              <h2 className="font-display text-lg font-bold text-slate-800">Recent Activity</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md shadow-sm">
                {stats.recentActivity.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500 text-center">No leave activity yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Leave Type</th>
                          <th className="px-6 py-4">Requested Dates</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.recentActivity.map((l) => (
                          <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold">
                              <Link to={`/leave-details/${l._id}`} className="text-primary-600 hover:text-primary-800 transition-colors">
                                {l.leaveType}
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {new Date(l.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(l.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
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
