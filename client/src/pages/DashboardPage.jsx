import { useEffect, useState } from 'react';

export default function DashboardPage({ apiBase, user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${apiBase}/dashboard`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, [apiBase, user]);

  if (!user) return <p>Please login to view the dashboard.</p>;

  return (
    <div className="box">
      <h2>Dashboard</h2>
      <div className="stat-card">
        <h3>Your User ID</h3>
        <p>{user.id}</p>
      </div>
      {stats ? (
        <div className="grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{stats.totalTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Overdue Tasks</h3>
            <p>{stats.overdueTasks.length}</p>
          </div>
          <div className="stat-card">
            <h3>Tasks by Status</h3>
            <ul>
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <li key={status}>{status}: {count}</li>
              ))}
            </ul>
          </div>
          <div className="stat-card">
            <h3>Tasks per User</h3>
            <ul>
              {Object.entries(stats.tasksPerUser).map(([userId, count]) => (
                <li key={userId}>{userId}: {count}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
}
