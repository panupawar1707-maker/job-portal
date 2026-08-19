import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'applications', label: 'My Applications', icon: '📋' },
  { id: 'interviews', label: 'Interviews', icon: '🎤' },
  { id: 'offers', label: 'Offers', icon: '🎉' },
];

const STATUS_COLORS = { applied: 'status-blue', shortlisted: 'status-purple', rejected: 'status-red', hired: 'status-green' };
const RESULT_COLORS = { pending: 'status-orange', pass: 'status-green', fail: 'status-red' };
const OFFER_COLORS = { pending: 'status-orange', accepted: 'status-green', rejected: 'status-red' };

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    fetch(`http://localhost:5000/api/dashboard/candidate/${user.id}`)
      .then((res) => res.json())
      .then((result) => { setData(result); setLoading(false); })
      .catch(() => { setError('Failed to load dashboard data.'); setLoading(false); });
  }, []);

  if (loading) return (<div><Navbar /><p className="loading-text">Loading your dashboard...</p></div>);
  if (error) return (<div><Navbar /><p className="loading-text">{error}</p></div>);

  const { profile, applications, interviews, offers } = data;

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-avatar">{user.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
          <div className="dashboard-header-info">
            <h1>{user.name}</h1>
            <p>{profile?.professional_title || 'Add a professional title in your profile'}</p>
            <span className="dashboard-email">{user.email}</span>
          </div>
          <div className="header-actions">
            <Link to="/resume" className="edit-profile-btn">View Resume</Link>
            <Link to="/create-profile" className="edit-profile-btn">Edit Profile</Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-box"><h2>{applications.length}</h2><p>Applications</p></div>
          <div className="stat-box"><h2>{applications.filter((a) => a.status === 'shortlisted').length}</h2><p>Shortlisted</p></div>
          <div className="stat-box"><h2>{interviews.length}</h2><p>Interviews</p></div>
          <div className="stat-box"><h2>{offers.length}</h2><p>Offers</p></div>
        </div>
      </div>

      <div className="dashboard-tabs">
        {TABS.map((tab) => (
          <button key={tab.id} className={activeTab === tab.id ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab(tab.id)}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Recent Applications</h3>
              {applications.length === 0 ? (
                <p className="empty-hint">You haven't applied to any jobs yet. <Link to="/jobs">Browse jobs →</Link></p>
              ) : (
                applications.slice(0, 4).map((app) => (
                  <div className="mini-row" key={app.application_id}>
                    <div><strong>{app.job_title}</strong><span>{app.company_name}</span></div>
                    <span className={`status-badge ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                  </div>
                ))
              )}
              <button className="view-all-link" onClick={() => setActiveTab('applications')}>View all applications →</button>
            </div>

            <div className="overview-card">
              <h3>Upcoming Interviews</h3>
              {interviews.length === 0 ? (
                <p className="empty-hint">No interviews scheduled yet.</p>
              ) : (
                interviews.slice(0, 4).map((iv) => (
                  <div className="mini-row" key={iv.interview_id}>
                    <div><strong>{iv.job_title}</strong><span>{iv.round || 'Interview'} — {iv.company_name}</span></div>
                    <span className={`status-badge ${RESULT_COLORS[iv.result]}`}>{iv.result}</span>
                  </div>
                ))
              )}
              <button className="view-all-link" onClick={() => setActiveTab('interviews')}>View all interviews →</button>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="list-card">
            <h3>All Applications</h3>
            {applications.length === 0 ? (
              <p className="empty-hint">You haven't applied to any jobs yet. <Link to="/jobs">Browse jobs →</Link></p>
            ) : (
              <table className="data-table">
                <thead><tr><th>Job Title</th><th>Company</th><th>Location</th><th>Applied On</th><th>Status</th></tr></thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.application_id}>
                      <td>{app.job_title}</td><td>{app.company_name}</td><td>{app.location}</td>
                      <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td><span className={`status-badge ${STATUS_COLORS[app.status]}`}>{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="list-card">
            <h3>Interviews</h3>
            {interviews.length === 0 ? (
              <p className="empty-hint">No interviews scheduled yet.</p>
            ) : (
              <table className="data-table">
                <thead><tr><th>Job Title</th><th>Company</th><th>Round</th><th>Date</th><th>Result</th></tr></thead>
                <tbody>
                  {interviews.map((iv) => (
                    <tr key={iv.interview_id}>
                      <td>{iv.job_title}</td><td>{iv.company_name}</td><td>{iv.round || '—'}</td>
                      <td>{iv.interview_date ? new Date(iv.interview_date).toLocaleString() : 'TBD'}</td>
                      <td><span className={`status-badge ${RESULT_COLORS[iv.result]}`}>{iv.result}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="list-card">
            <h3>Offers</h3>
            {offers.length === 0 ? (
              <p className="empty-hint">No offers received yet. Keep going!</p>
            ) : (
              <table className="data-table">
                <thead><tr><th>Job Title</th><th>Company</th><th>Offer Date</th><th>Status</th></tr></thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.offer_id}>
                      <td>{offer.job_title}</td><td>{offer.company_name}</td>
                      <td>{new Date(offer.offer_date).toLocaleDateString()}</td>
                      <td><span className={`status-badge ${OFFER_COLORS[offer.status]}`}>{offer.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
