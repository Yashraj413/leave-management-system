import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user } = useAuth();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const rows = [
    ['Name', user.name],
    ['Email', user.email],
    ['Department', user.department],
    ['Role', user.role === 'manager' ? 'Manager' : 'Employee'],
    ...(user.role === 'employee' ? [['Leave Balance', `${user.leaveBalance} day(s)`]] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Employee Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your account and structural organization info</p>

        <div className="mt-8 flex flex-col items-center sm:flex-row gap-6 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-8 shadow-sm">
          <div className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 font-display text-2xl font-extrabold text-white shadow-lg shadow-primary-500/20">
            {getInitials(user.name)}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="font-display text-2xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-1">{user.role === 'manager' ? 'Manager' : 'Employee'}</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-100 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-6 shadow-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between px-2 py-4 text-sm font-medium">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">{label}</span>
              <span className="text-slate-800 font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
