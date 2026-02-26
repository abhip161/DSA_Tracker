import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await authAPI.register(form);
      login({ token: data.token, user: data.user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-900">
      <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 pointer-events-none" />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md bg-dark-700 border border-dark-400/30 rounded-2xl p-8 shadow-card"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-gray-400 text-sm mt-2">Start tracking your DSA journey</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-400">Name</span>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={onChange}
            placeholder="John Doe"
            className="mt-1.5 w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-400">Email</span>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            className="mt-1.5 w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium text-gray-400">Password</span>
          <input
            type="password"
            name="password"
            minLength={6}
            required
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            className="mt-1.5 w-full bg-dark-600 border border-dark-400/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Already have an account?{' '}
          <Link className="text-brand-400 hover:text-brand-300 font-medium transition-colors" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
