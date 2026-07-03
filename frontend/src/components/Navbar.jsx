import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links =
    user.role === 'manager'
      ? [
          { to: '/manager/dashboard', label: 'Dashboard' },
          { to: '/manager/pending-approvals', label: 'Pending' },
          { to: '/profile', label: 'Profile' },
        ]
      : [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/apply-leave', label: 'Apply Leave' },
          { to: '/leave-history', label: 'History' },
          { to: '/profile', label: 'Profile' },
        ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4" aria-label="Main navigation">
        <span className="font-display text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
          LeaveMS
        </span>
        <div className="flex items-center gap-1 sm:gap-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1"></div>
          <span className="hidden text-sm font-semibold text-slate-700 sm:inline bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
            Hi, {user.name.split(' ')[0]}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
