import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const LEAVE_TYPES = ['Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity'];

// Doubles as the "Edit Pending Leave Request" form when an :id param is present.
export default function ApplyLeave() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEditMode) return;
    api
      .get(`/leaves/${id}`)
      .then(({ data }) => {
        const l = data.data;
        setForm({
          leaveType: l.leaveType,
          startDate: l.startDate.slice(0, 10),
          endDate: l.endDate.slice(0, 10),
          reason: l.reason,
        });
      })
      .catch(() => setErrorMsg('Could not load leave request.'))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const validate = () => {
    const errs = {};
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = 'End date cannot be before start date';
    }
    if (!form.reason || form.reason.trim().length < 5) {
      errs.reason = 'Please provide a reason (at least 5 characters)';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/leaves/${id}`, form);
      } else {
        await api.post('/leaves', form);
      }
      navigate('/leave-history');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/30">
        <Navbar />
        <p className="p-12 text-center text-slate-400 font-semibold">Loading leave details…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
          {isEditMode ? 'Edit Leave Request' : 'Apply for Leave'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Submit a request to take time off</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-8 shadow-sm">
          <div>
            <label htmlFor="leaveType" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={form.leaveType}
              onChange={handleChange('leaveType')}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange('startDate')}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                aria-invalid={Boolean(fieldErrors.startDate)}
              />
              {fieldErrors.startDate && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange('endDate')}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                aria-invalid={Boolean(fieldErrors.endDate)}
              />
              {fieldErrors.endDate && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.endDate}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reason for Leave
            </label>
            <textarea
              id="reason"
              rows={4}
              value={form.reason}
              onChange={handleChange('reason')}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              placeholder="Briefly describe the reason for your leave request"
              aria-invalid={Boolean(fieldErrors.reason)}
            />
            {fieldErrors.reason && <p className="mt-1.5 text-xs font-medium text-rose-600">{fieldErrors.reason}</p>}
          </div>

          {errorMsg && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200/50 px-4 py-3 text-sm text-rose-700">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/10 transition-all duration-300 hover:from-primary-500 hover:to-indigo-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : isEditMode ? 'Save Changes' : 'Submit Leave Request'}
          </button>
        </form>
      </main>
    </div>
  );
}
