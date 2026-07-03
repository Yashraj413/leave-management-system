import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-800">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
        Back to home
      </Link>
    </div>
  );
}
