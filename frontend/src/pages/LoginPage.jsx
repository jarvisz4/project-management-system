import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-500/30">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ProjectMS</h1>
          <p className="text-slate-400 mt-1">Sign in to your workspace</p>
        </div>

        <div className="card p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                className={`input ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20 text-center">
          <p className="text-slate-300 text-xs">
            Demo: <span className="font-mono text-brand-300">admin@demo.com</span> / <span className="font-mono text-brand-300">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
