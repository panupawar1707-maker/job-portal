import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './EmployerDashboard.css';

function EmployerDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);
const [company, setCompany] = useState(null);
const [uploadingLogo, setUploadingLogo] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'employer') { navigate('/'); return; }

    fetch(`http://localhost:5000/api/jobs/employer/${user.id}`)
      .then((res) => res.json())
      .then((data) => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`http://localhost:5000/api/companies/by-user/${user.id}`)
      .then((res) => res.json())
      .then((data) => setCompany(data))
      .catch(() => {});
  }, []);
  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploadingLogo(true);

    const uploadData = new FormData();
    uploadData.append('logo', file);

    try {
      const uploadRes = await fetch('http://localhost:5000/api/upload/logo', {
        method: 'POST',
        body: uploadData,
      });
      const uploadResult = await uploadRes.json();

      if (uploadRes.ok) {
        await fetch(`http://localhost:5000/api/companies/update/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logo_url: uploadResult.url,
            company_description: company?.company_description || '',
            website: company?.website || '',
          }),
        });
        setCompany((prev) => ({ ...prev, logo_url: uploadResult.url }));
      }
    } catch {
      // silently ignore, logo isn't critical
    } finally {
      setUploadingLogo(false);
    }
};

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0);

  return (
    <div className="employer-dashboard-page">
      <Navbar />

      <div className="employer-header">
        <div className="employer-header-content">
          <div className="employer-header-left">
            <label className="logo-upload-box">
              {uploadingLogo ? (
                <span className="logo-uploading">...</span>
              ) : company?.logo_url ? (
                <img src={company.logo_url} alt="Company logo" className="company-logo-preview" />
              ) : (
                <span className="logo-placeholder">+</span>
              )}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                style={{ display: 'none' }}
                onChange={(e) => handleLogoUpload(e.target.files[0])}
              />
            </label>
            <div>
              <h1>Welcome back, {user?.name}</h1>
              <p>Manage your job listings and review applicants</p>
            </div>
          </div>
          <Link to="/post-job" className="post-job-cta">+ Post a New Job</Link>
        </div>

        <div className="employer-stats">
          <div className="stat-box"><h2>{jobs.length}</h2><p>Jobs Posted</p></div>
          <div className="stat-box"><h2>{jobs.filter((j) => j.status === 'open').length}</h2><p>Active Jobs</p></div>
          <div className="stat-box"><h2>{totalApplicants}</h2><p>Total Applicants</p></div>
        </div>
      </div>

      <div className="employer-content">
        <h2 className="section-heading">My Posted Jobs</h2>

        {loading && <p className="empty-hint">Loading your jobs...</p>}

        {!loading && jobs.length === 0 && (
          <div className="empty-state">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/post-job" className="post-job-cta">Post Your First Job</Link>
          </div>
        )}

        <div className="jobs-grid">
          {jobs.map((job) => (
            <div className="job-manage-card" key={job.job_id}>
              <div className="job-manage-header">
                <h3>{job.title}</h3>
                <span className={`status-pill ${job.status === 'open' ? 'pill-green' : 'pill-red'}`}>{job.status}</span>
              </div>
              <p className="job-manage-meta">📍 {job.location} · {job.job_type}</p>
              <p className="job-manage-meta">🕒 Posted {new Date(job.posted_at).toLocaleDateString()}</p>

              <div className="applicant-count-box">
                <span className="applicant-number">{job.applicant_count}</span>
                <span>applicant{job.applicant_count === 1 ? '' : 's'}</span>
              </div>

              <Link to={`/employer-dashboard/jobs/${job.job_id}/applicants`} className="view-applicants-btn">
                View Applicants →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard;
