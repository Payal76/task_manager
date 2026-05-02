import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function YourProjectsPage({ apiBase, user }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      (project.description || '').toLowerCase().includes(query) ||
      project.owner.name.toLowerCase().includes(query)
    );
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (!user) return;
    fetch(`${apiBase}/projects`, { credentials: 'include' })
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [apiBase, user]);

  if (!user) return <p>Please login to view your projects.</p>;

  return (
    <div className="box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Your Projects</h2>
        <button onClick={() => navigate('/projects')} style={{ padding: '10px 20px', cursor: 'pointer' }}>← Back</button>
      </div>
      
      <label>Search Your Projects</label>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search by name, owner, or description" 
      />
      
      <div className="project-list">
        {filteredProjects.length ? (
          filteredProjects.map((project) => (
            <Link key={project._id} className="project-card" to={`/projects/${project._id}`}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p>Owner: {project.owner.name}</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>ID: {project._id}</p>
              <p style={{ fontSize: '0.85em', color: '#999' }}>📅 Created: {formatDate(project.createdAt)}</p>
            </Link>
          ))
        ) : (
          <p>No projects found. {search ? 'Try different search terms.' : 'Create or join a project to get started.'}</p>
        )}
      </div>
    </div>
  );
}
