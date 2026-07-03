import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LeaveDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [comment, setComment] = useState('');
  const [actioning, setActioning] = useState(false);

  const fetchLeave = () => {
    setLoading(true);
    api
      .get(`/leaves/${id}`)
      .then(({ data }) => setLeave(data.data))
      .catch(() => setErrorMsg('Could not load this leave request.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDecision = async (decision) => {
    setActioning(true);
    try {
      await api.put(`/leaves/${id}/${decision}`, { managerComments: comment });
      fetchLeave();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/30">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (errorMsg || !leave) {
    return (
      <div className="min-h-screen bg-slate-50/30">
        <Navbar />
        <p className="p-12 text-center font-semibold text-rose-600">{errorMsg || 'Not found.'}</p>
      </div>
    );
  }

  const isManager = user.role === 'manager';

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800 transition">
          <span className="mr-1">←</span> Back
        </button>

        <div className="mt-6 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-8 shadow-sm">
          <div className="flex items-start justify-between pb-6 border-b border-slate-100">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md mb-2">
                {leave.leaveType} Leave
              </span>
              <h1 className="font-display text-2xl font-extrabold text-slate-900">Request Details</h1>
              {isManager && leave.employee?.name && (
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Requested by{' '}
                  <Link to={`/employees/${leave.employee._id}`} className="text-primary-600 hover:underline">
                    {leave.employee.name}
                  </Link>{' '}
                  ({leave.employee.department})
                </p>
              )}
            </div>
            <StatusBadge status={leave.status} />
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</dt>
              <dd className="mt-1.5 font-semibold text-slate-800">
                {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</dt>
              <dd className="mt-1.5 font-semibold text-slate-800">
                {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Duration</dt>
              <dd className="mt-1.5 font-semibold text-slate-800">
                {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date Submitted</dt>
              <dd className="mt-1.5 font-semibold text-slate-800">
                {new Date(leave.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reason for Request</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-medium">{leave.reason}</p>
          </div>

          {leave.managerComments && (
            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Manager Comments</p>
              <p className="mt-2 text-sm font-medium text-slate-700 leading-relaxed">{leave.managerComments}</p>
            </div>
          )}

          {isManager && leave.status === 'Pending' && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <label htmlFor="comment" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Comments (required to reject)
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                placeholder="Add notes for the employee..."
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleDecision('approve')}
                  disabled={actioning}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 transition-all duration-300 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  Approve Request
                </button>
                <button
                  onClick={() => handleDecision('reject')}
                  disabled={actioning}
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/10 transition-all duration-300 hover:from-rose-500 hover:to-red-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
