export default function StatCard({ label, value, accent = 'text-primary-600' }) {
  const getBorderColor = () => {
    if (accent.includes('primary')) return 'border-l-primary-500';
    if (accent.includes('emerald')) return 'border-l-emerald-500';
    if (accent.includes('amber')) return 'border-l-amber-500';
    if (accent.includes('rose')) return 'border-l-rose-500';
    return 'border-l-slate-400';
  };

  return (
    <div className={`glass-panel border-l-4 ${getBorderColor()} rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold tracking-tight ${accent}`}>{value}</p>
    </div>
  );
}
