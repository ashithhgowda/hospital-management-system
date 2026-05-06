import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-900/10 border border-white/60 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="text-gray-500 text-sm mt-1">Join as a patient today</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 bg-gray-50/50 transition-all hover:border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📧</span>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 bg-gray-50/50 transition-all hover:border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                <input
                  type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters" required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 bg-gray-50/50 transition-all hover:border-gray-300"
                />
              </div>
            </div>

            {/* <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
              <span>ℹ️</span> You'll be registered as a <strong>patient</strong>. Doctors are added by admins.
            </div> */}

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-custom" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
