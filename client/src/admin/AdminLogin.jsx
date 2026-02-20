import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await auth.login({ email, password });
    if (res.ok) {
      navigate('/admin');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-white">
      <div className="max-w-lg w-full bg-white/95 p-8 rounded-3xl shadow-2xl border border-pink-50" style={{backdropFilter: 'blur(6px)'}}>
        <div className="mb-4">
          <Link to="/" className="text-sm text-pink-500 hover:underline flex items-center gap-2">
            ← Home
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <img src="/images/logo1.png" alt="KM & co realty Logo" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="text-2xl font-bold text-pink-600">KM & co realty</h2>
            <div className="text-sm text-gray-500">Admin Portal</div>
          </div>
        </div>

        {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm text-gray-600">Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com"
            type="email"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />

          <label className="block text-sm text-gray-600">Password</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />

          <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition">Sign in</button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/admin/forgot" className="text-pink-500 hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
