import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [message, setMessage] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, []);

  const loadAll = () => {
    fetch('http://localhost:5000/api/admin/stats').then((r) => r.json()).then(setStats);
    fetch('http://localhost:5000/api/admin/users').then((r) => r.json()).then(setUsers);
    fetch('http://localhost:5000/api/admin/jobs').then((r) => r.json()).then(setJobs);
    fetch('http://localhost:5000/api/admin/employers').then((r) => r.json()).then(setEmployers);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
    setMessage('User deleted');
    loadAll();
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    await fetch(`http://localhost:5000/api/admin/jobs/${id}`, { method: 'DELETE' });
    setMessage('Job deleted');
    loadAll();
  };

  const toggleEmployerStatus = async (companyId, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    await fetch(`http://localhost:5000/api/admin/employers/${companyId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setMessage(newStatus === 'blocked' ? 'Employer blocked from posting jobs' : 'Employer unblocked');
    loadAll();
  };

  const viewProfile = async (userId) => {
    const res = await fetch(`http://localhost:5000/api/admin/candidate-profile/${userId}`);
    const data = await res.json();
    setViewingProfile(data);
  };

  let workExp = [], skills = [];
  if (viewingProfile) {
    try { workExp = JSON.parse(viewingProfile.work_experience || '[]'); } catch {}
    skills = (viewingProfile.technical_skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  }

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users, employers, jobs, and monitor platform activity</p>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'overview' ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab('overview')}>📊 Overview</button>
        <button className={tab === 'users' ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab('users')}>👥 Users</button>
        <button className={tab === 'employers' ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab('employers')}>🏢 Employers</button>
        <button className={tab === 'jobs' ? 'admin-tab active' : 'admin-tab'} onClick={() => setTab('jobs')}>💼 Jobs</button>
      </div>

      <div className="admin-content">
        {message && <p className="admin-message">{message}</p>}

        {tab === 'overview' && stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-box"><h2>{stats.totalUsers}</h2><p>Total Users</p></div>
            <div className="admin-stat-box"><h2>{stats.totalCandidates}</h2><p>Job Seekers</p></div>
            <div className="admin-stat-box"><h2>{stats.totalEmployers}</h2><p>Employers</p></div>
            <div className="admin-stat-box"><h2>{stats.totalJobs}</h2><p>Jobs Posted</p></div>
            <div className="admin-stat-box"><h2>{stats.totalApplications}</h2><p>Applications</p></div>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-table-card">
            <h3>All Users</h3>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-pill role-${u.role}`}>{u.role}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="action-cell">
                      {u.role === 'candidate' && (
                        <button className="view-btn" onClick={() => viewProfile(u.user_id)}>View Profile</button>
                      )}
                      {u.role !== 'admin' && (
                        <button className="delete-btn" onClick={() => deleteUser(u.user_id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'employers' && (
          <div className="admin-table-card">
            <h3>Employers</h3>
            <p className="table-hint">Employers can only post jobs and view applicant profiles. Blocking an employer here stops them from posting new jobs.</p>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Jobs Posted</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {employers.map((e) => (
                  <tr key={e.user_id}>
                    <td>{e.name}</td>
                    <td>{e.email}</td>
                    <td>{e.company_name || '—'}</td>
                    <td>{e.jobs_posted}</td>
                    <td>
                      <span className={`role-pill ${e.status === 'blocked' ? 'role-admin' : 'role-candidate'}`}>
                        {e.status || 'no company yet'}
                      </span>
                    </td>
                    <td>
                      {e.company_id && (
                        <button
                          className={e.status === 'blocked' ? 'unblock-btn' : 'delete-btn'}
                          onClick={() => toggleEmployerStatus(e.company_id, e.status)}
                        >
                          {e.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'jobs' && (
          <div className="admin-table-card">
            <h3>All Jobs</h3>
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Applicants</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.job_id}>
                    <td>{j.title}</td>
                    <td>{j.company_name}</td>
                    <td>{j.location}</td>
                    <td>{j.applicant_count}</td>
                    <td><span className={`role-pill ${j.status === 'open' ? 'role-candidate' : 'role-admin'}`}>{j.status}</span></td>
                    <td><button className="delete-btn" onClick={() => deleteJob(j.job_id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate profile modal */}
      {viewingProfile && (
        <div className="profile-modal-overlay" onClick={() => setViewingProfile(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingProfile(null)}>✕</button>
            <div className="modal-avatar">{viewingProfile.name ? viewingProfile.name.charAt(0).toUpperCase() : '?'}</div>
            <h2>{viewingProfile.name}</h2>
            <p className="modal-title">{viewingProfile.professional_title || 'No title set'}</p>
            <p className="modal-email">{viewingProfile.email}</p>

            {viewingProfile.about_me && (
              <div className="modal-section"><h4>About</h4><p>{viewingProfile.about_me}</p></div>
            )}

            {skills.length > 0 && (
              <div className="modal-section">
                <h4>Skills</h4>
                <div className="modal-skills">{skills.map((s, i) => <span key={i} className="modal-skill-chip">{s}</span>)}</div>
              </div>
            )}

            {viewingProfile.college_university && (
              <div className="modal-section">
                <h4>Education</h4>
                <p>{viewingProfile.degree} — {viewingProfile.college_university} ({viewingProfile.passing_year})</p>
              </div>
            )}

            {workExp.length > 0 && (
              <div className="modal-section">
                <h4>Work Experience</h4>
                {workExp.map((w, i) => (
                  <p key={i}>{w.role} at {w.company} ({w.start} – {w.end || 'Present'})</p>
                ))}
              </div>
            )}

            {viewingProfile.resume_url && (
              <div className="modal-section">
                <h4>Resume</h4>
                <a href={viewingProfile.resume_url} target="_blank" rel="noreferrer">View Resume Link →</a>
              </div>
            )}

            {!viewingProfile.professional_title && (
              <p className="modal-empty">This candidate hasn't completed their profile yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;