export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      <span className="mt-3 text-sm">{label}</span>
    </div>
  );
}
