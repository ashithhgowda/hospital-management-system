import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const roleColors = {
    admin:   'bg-purple-500/20 text-purple-100 border border-purple-400/30',
    doctor:  'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30',
    patient: 'bg-sky-500/20 text-sky-100 border border-sky-400/30',
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-lg shadow-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🏥</span>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-blue-100 transition-colors">
              Hospital<span className="text-blue-200">MS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link to="/doctors"
                  className="text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                  Doctors
                </Link>
                {user.role === 'patient' && (
                  <Link to="/book-appointment"
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-white/20 hover:scale-105">
                    + Book
                  </Link>
                )}
                {user.role === 'doctor' && (
                  <Link to="/doctor-dashboard"
                    className="text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                    My Schedule
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin"
                    className="text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                    Admin Panel
                  </Link>
                )}
                <Link to="/dashboard"
                  className="text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                  Dashboard
                </Link>

                {/* User pill */}
                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/20">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border border-white/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-white text-sm font-medium leading-none">{user.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block capitalize ${roleColors[user.role] || roleColors.patient}`}>
                      {user.role}
                    </span>
                  </div>
                  <button onClick={handleLogout}
                    className="ml-2 text-blue-100 hover:text-white border border-white/30 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm transition-all">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/doctors"
                  className="text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                  Doctors
                </Link>
                <Link to="/login"
                  className="text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                  Login
                </Link>
                <Link to="/register"
                  className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all">
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-2 border-b border-white/10">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user.name}</p>
                    <span className="text-blue-200 text-xs capitalize">{user.role}</span>
                  </div>
                </div>
                {[
                  { to: '/doctors', label: 'Doctors' },
                  { to: '/dashboard', label: 'Dashboard' },
                  ...(user.role === 'patient' ? [{ to: '/book-appointment', label: '+ Book Appointment' }] : []),
                  ...(user.role === 'doctor' ? [{ to: '/doctor-dashboard', label: 'My Schedule' }] : []),
                  ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
                ].map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                    className="block text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full text-left text-red-300 hover:text-red-200 hover:bg-red-500/10 px-3 py-2 rounded-lg text-sm font-medium transition-all mt-1">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/doctors" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm">Doctors</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-white bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-semibold">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
