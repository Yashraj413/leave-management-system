import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      const user = await login(email, password);
      navigate(user.role === 'manager' ? '/manager/dashboard' : '/dashboard');
    } catch {
      // error already surfaced via context `error`
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 px-4 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-8 md:p-10 shadow-2xl backdrop-blur-xl relative z-10">
        <h1 className="text-center font-display text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-400 to-indigo-300 bg-clip-text text-transparent">
          LeaveMS
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-slate-400">Sign in to manage team absence</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:bg-white/10 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:bg-white/10 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="••••••••"
            />
          </div>

          {(formError || error) && (
            <p role="alert" className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3 text-sm font-bold text-white transition-all duration-300 hover:from-primary-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-primary-500/20 transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-xs text-slate-400">
          <p className="font-semibold uppercase tracking-wider text-slate-300">Demo Credentials</p>
          <div className="mt-2 space-y-1 font-mono">
            <p><span className="text-primary-300">Employee:</span> employee@company.com / Employee@123</p>
            <p><span className="text-indigo-300">Manager :</span> manager@company.com / Manager@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
