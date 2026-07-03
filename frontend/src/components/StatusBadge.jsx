const STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10',
  Cancelled: 'bg-slate-50 text-slate-600 border-slate-200/60 ring-slate-500/10',
};

const DOTS = {
  Pending: 'bg-amber-500',
  Approved: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
  Cancelled: 'bg-slate-400',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status] || 'bg-slate-400'}`}></span>
      {status}
    </span>
  );
}
