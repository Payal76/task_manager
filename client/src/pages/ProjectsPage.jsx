import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage({ apiBase, user }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [joinId, setJoinId] = useState('');
  const [joinError, setJoinError] = useState('');
  const navigate = useNavigate();

  const createProject = async (event) => {
    event.preventDefault();
    setError('');
    const res = await fetch(`${apiBase}/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.message || 'Could not create project');
      return;
    }
    setName('');
    setDescription('');
    alert('Project created successfully! View it in "Your All Projects"');
    navigate('/your-projects');
  };

  const joinProject = async (event) => {
    event.preventDefault();
    setJoinError('');
    const res = await fetch(`${apiBase}/projects/join`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: joinId }),
    });
    if (!res.ok) {
      const body = await res.json();
      setJoinError(body.message || 'Unable to join project');
      return;
    }
    setJoinId('');
    alert('Project joined successfully!');
    navigate('/your-projects');
  };

  if (!user) return <p>Please login to view projects.</p>;

  return (
    <div className="box">
      <h2>Projects</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/your-projects')} style={{ padding: '10px 20px', cursor: 'pointer', flex: 1 }}>📋 Your All Projects</button>
        <button onClick={() => navigate('/all-projects')} style={{ padding: '10px 20px', cursor: 'pointer', flex: 1 }}>🌍 All Projects</button>
      </div>
      
      <div className="grid">
        <form className="form-card" onSubmit={createProject}>
          <h3>Create Project</h3>
          <label>Project Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit">Create Project</button>
          {error && <p className="error">{error}</p>}
        </form>
        <form className="form-card" onSubmit={joinProject}>
          <h3>Join Project</h3>
          <label>Project ID</label>
          <input value={joinId} onChange={(e) => setJoinId(e.target.value)} required />
          <button type="submit">Join</button>
          {joinError && <p className="error">{joinError}</p>}
        </form>
      </div>
    </div>
  );
}
