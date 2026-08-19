import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './JobDetails.css';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch(() => setMessage('Failed to load job details'));
  }, [id]);

  const handleApply = async () => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      setMessage('Please login first to apply for this job.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const user = JSON.parse(storedUser);
    setApplying(true);

    try {
      const response = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: id, candidate_id: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Application submitted successfully!');
      } else {
        setMessage(data.message || 'Application failed');
      }
    } catch (error) {
      setMessage('Server error. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (!job) {
    return (
      <div>
        <Navbar />
        <p className="loading-text">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <Navbar />

      <div className="job-details-container">
        <div className="job-details-header">
          <h1>{job.title}</h1>
          <span className="job-type">{job.job_type}</span>
        </div>

        <p className="job-company">{job.company_name}</p>

        <div className="job-meta">
          <span>📍 {job.location}</span>
          <span>💰 ₹{job.salary_min} - ₹{job.salary_max}</span>
          <span>🕒 Posted {new Date(job.posted_at).toLocaleDateString()}</span>
        </div>

        <div className="job-description">
          <h3>Job Description</h3>
          <p>{job.description}</p>
        </div>

        {job.skills_required && (
          <div className="job-skills">
            <h3>Skills Required</h3>
            <p>{job.skills_required}</p>
          </div>
        )}

        {message && <p className="apply-message">{message}</p>}

        <button className="apply-now-btn" onClick={handleApply} disabled={applying}>
          {applying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
}

export default JobDetails;
