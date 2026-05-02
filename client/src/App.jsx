import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import YourProjectsPage from './pages/YourProjectsPage.jsx';
import AllProjectsPage from './pages/AllProjectsPage.jsx';

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ user, children }) {
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${apiBase}/auth/me`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch(`${apiBase}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div className="app-shell"><p>Loading...</p></div>;
  }

  return (
    <div className="app-shell">
      <header>
        <div className="header-content">
          <h1>Task Manager</h1>
          <nav>
            {user ? (
              <>
                <Link to="/">Dashboard</Link>
                <Link to="/projects">Projects</Link>
              </>
            ) : null}
          </nav>
          <div className="header-right">
            {user ? (
              <>
                <span>{user.name}</span>
                <Link to="/logout" onClick={handleLogout}>
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<AuthRoute user={user}><LoginPage onLogin={setUser} apiBase={apiBase} /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute user={user}><SignupPage onSignup={setUser} apiBase={apiBase} /></AuthRoute>} />
          <Route path="/projects/:projectId" element={<PrivateRoute user={user}><ProjectPage apiBase={apiBase} user={user} /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute user={user}><ProjectsPage apiBase={apiBase} user={user} /></PrivateRoute>} />
          <Route path="/your-projects" element={<PrivateRoute user={user}><YourProjectsPage apiBase={apiBase} user={user} /></PrivateRoute>} />
          <Route path="/all-projects" element={<PrivateRoute user={user}><AllProjectsPage apiBase={apiBase} user={user} /></PrivateRoute>} />
          <Route path="/" element={<PrivateRoute user={user}><DashboardPage apiBase={apiBase} user={user} /></PrivateRoute>} />
        </Routes>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">f</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📷</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">in</a>
          </div>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-bottom">
            © 2026 Team Task Manager. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
