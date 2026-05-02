import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage({ onSignup, apiBase }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const res = await fetch(`${apiBase}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.message || 'Signup failed');
      return;
    }
    const data = await res.json();
    onSignup(data.user);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Get Started</h2>
        <p className="subtitle">Create your Team Task Manager account</p>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          
          <label>Email Address</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
          
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
          
          <button type="submit">Sign Up</button>
        </form>
        {error && <p className="error">{error}</p>}
        
      </div>
    </div>
  );
}
