import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProjectPage({ apiBase, user }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', assignee: '' });
  const [memberId, setMemberId] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [memberError, setMemberError] = useState('');
  const [taskError, setTaskError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (!memberSearch.trim()) return false;
    const query = memberSearch.toLowerCase();
    const isAlreadyMember = project?.members.some((m) => m._id === u._id) || project?.owner._id === u._id;
    return !isAlreadyMember && (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  });

  const filteredMembers = project?.members.filter((member) => {
    const query = memberSearch.toLowerCase();
    return member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query);
  }) || [];

  const filteredTasks = tasks.filter((task) => {
    const query = taskSearch.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.description || '').toLowerCase().includes(query) ||
      (task.assignee?.name || '').toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!user) return;
    fetch(`${apiBase}/projects/${projectId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then(setProject)
      .catch(() => setProject(null));
    fetch(`${apiBase}/tasks/project/${projectId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then(setTasks)
      .catch(() => setTasks([]));
    fetch(`${apiBase}/auth/users/all`, { credentials: 'include' })
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [apiBase, user, projectId]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const addTask = async (event) => {
    event.preventDefault();
    setTaskError('');
    const taskPayload = { ...form, projectId };
    const res = await fetch(`${apiBase}/tasks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskPayload),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setForm({ title: '', description: '', dueDate: '', priority: 'Medium', assignee: '' });
      setShowTaskForm(false);
      return;
    }
    const responseBody = await res.json();
    setTaskError(responseBody.message || 'Unable to create task');
  };

  const addMember = async (event) => {
    event.preventDefault();
    setMemberError('');
    if (!memberId) {
      setMemberError('Please select a member');
      return;
    }
    const res = await fetch(`${apiBase}/projects/${projectId}/members`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    });
    if (!res.ok) {
      const body = await res.json();
      setMemberError(body.message || 'Could not add member');
      return;
    }
    const updated = await res.json();
    setProject(updated);
    setMemberId('');
    setMemberSearch('');
    setShowUserDropdown(false);
  };

  const removeMember = async (memberIdToRemove) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setMemberError('');
    const res = await fetch(`${apiBase}/projects/${projectId}/members/${memberIdToRemove}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json();
      setMemberError(body.message || 'Could not remove member');
      return;
    }
    const updated = await res.json();
    setProject(updated);
  };

  const deleteProject = async () => {
    if (!confirm('Are you sure you want to DELETE this entire project? This cannot be undone.')) return;
    setMemberError('');
    const res = await fetch(`${apiBase}/projects/${projectId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json();
      setMemberError(body.message || 'Could not delete project');
      return;
    }
    alert('Project deleted successfully!');
    navigate('/projects');
  };

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

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setTaskError('');
    const res = await fetch(`${apiBase}/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const body = await res.json();
      setTaskError(body.message || 'Could not delete task');
      return;
    }
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const updateTaskStatus = async (taskId, status) => {
    setStatusError('');
    const res = await fetch(`${apiBase}/tasks/${taskId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const body = await res.json();
      setStatusError(body.message || 'Unable to update task');
      return;
    }
    const updatedTask = await res.json();
    setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
  };

  if (!user) return <p>Please login to view this project.</p>;

  if (!project) {
    return (
      <div className="box">
        <p>Loading project...</p>
      </div>
    );
  }

  if (showTaskForm) {
    return (
      <div className="box">
        <button
          type="button"
          className="secondary-button"
          style={{ marginBottom: '18px' }}
          onClick={() => setShowTaskForm(false)}
        >
          ← Back to Project
        </button>
        <form className="form-card" onSubmit={addTask}>
          <h3>Create Task</h3>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
          <label>Due Date</label>
          <input name="dueDate" value={form.dueDate} onChange={handleChange} type="date" required />
          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <label>Assignee ID</label>
          <input name="assignee" value={form.assignee} onChange={handleChange} />
          <button type="submit">Create Task</button>
          {taskError && <p className="error">{taskError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
          <p>
            <strong>Project ID:</strong> {project._id}
            {project.isAdmin ? ' (Admin)' : ''}
          </p>
          <p><strong>Members:</strong> {project.members.length + 1}</p>
          <p><strong>Task count:</strong> {tasks.length}</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}><strong>📅 Created:</strong> {formatDate(project.createdAt)}</p>
        </div>
        {project.isAdmin && (
          <button
            type="button"
            style={{ backgroundColor: '#dc2626', padding: '10px 16px', height: 'fit-content', marginLeft: '16px', whiteSpace: 'nowrap' }}
            onClick={deleteProject}
          >
            🗑️ Delete Project
          </button>
        )}
      </div>

      <div className="grid">
        <div>
          <h3>Members</h3>
          <label>Search or Add Members</label>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setShowUserDropdown(true);
              }}
              onFocus={() => setShowUserDropdown(true)}
              placeholder="Search by name or email"
            />
            {showUserDropdown && filteredUsers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                border: '1px solid #d8e0ef',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      setMemberId(u._id);
                      setMemberSearch('');
                      setShowUserDropdown(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: '#fff',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#f3f4f6')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#fff')}
                  >
                    <strong>{u.name}</strong> - {u.email}
                  </div>
                ))}
              </div>
            )}
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li className="member-item">
              <span><strong>{project.owner.name}</strong> (Admin)</span>
            </li>
            {filteredMembers.map((member) => (
              <li key={member._id} className="member-item">
                <span>{member.name}</span>
                {project.isAdmin ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => removeMember(member._id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {memberId && project.isAdmin && (
            <button
              type="button"
              onClick={addMember}
              style={{ marginTop: '10px', backgroundColor: '#16a34a' }}
            >
              Add Selected Member
            </button>
          )}
          {memberError && <p className="error">{memberError}</p>}
        </div>

        <div>
          <h3>Tasks</h3>
          <button
            type="button"
            className="secondary-button"
            style={{ height: '42px', marginTop: '24px' }}
            onClick={() => setShowTaskForm(true)}
          >
            Create Task
          </button>
          <div style={{ marginTop: '20px' }}>
            {filteredTasks.length ? filteredTasks.map((task) => {
              const assigneeId = task.assignee?._id ? task.assignee._id.toString() : task.assignee?.toString();
              const canUpdate = project.isAdmin || (task.assignee && assigneeId === user.id);
              return (
                <div key={task._id} className="task-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginTop: 0 }}>{task.title}</h4>
                      <p>{task.description}</p>
                      <p>Priority: <strong>{task.priority}</strong></p>
                      <p>Assigned to: {task.assignee?.name || 'Unassigned'}</p>
                      <label>Status</label>
                      <select
                        value={task.status}
                        disabled={!canUpdate}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    </div>
                    {project.isAdmin && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => deleteTask(task._id)}
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626', marginTop: 0, whiteSpace: 'nowrap' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : <p>No tasks match your search.</p>}
            {statusError && <p className="error">{statusError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

