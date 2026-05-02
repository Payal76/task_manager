import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage({ onLogin, apiBase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setError('Login failed. Please check your credentials.');
      return;
    }
    const data = await res.json();
    onLogin(data.user);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to manage your tasks</p>
        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
          
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
          
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
