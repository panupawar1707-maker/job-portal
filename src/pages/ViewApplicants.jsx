import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ViewApplicants.css';

const STATUS_COLORS = { applied: 'status-blue', shortlisted: 'status-purple', rejected: 'status-red', hired: 'status-green' };

function ViewApplicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [interviewFormFor, setInterviewFormFor] = useState(null);
  const [interviewData, setInterviewData] = useState({ interview_date: '', round: '', feedback: '' });

  const loadApplicants = () => {
    fetch(`http://localhost:5000/api/applications/job/${jobId}`)
      .then((res) => res.json())
      .then((data) => { setApplicants(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadApplicants(); }, [jobId]);

  const updateStatus = async (application_id, status) => {
    try {
      await fetch(`http://localhost:5000/api/applications/${application_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setMessage(`Application marked as ${status}`);
      loadApplicants();
    } catch {
      setMessage('Failed to update status');
    }
  };

  const scheduleInterview = async (application_id) => {
    try {
      await fetch(`http://localhost:5000/api/applications/${application_id}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData),
      });
      setMessage('Interview scheduled successfully');
      setInterviewFormFor(null);
      setInterviewData({ interview_date: '', round: '', feedback: '' });
      loadApplicants();
    } catch {
      setMessage('Failed to schedule interview');
    }
  };

  const sendOffer = async (application_id) => {
    try {
      await fetch(`http://localhost:5000/api/applications/${application_id}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_details: 'Offer letter to be finalized.' }),
      });
      setMessage('Offer sent to candidate!');
      loadApplicants();
    } catch {
      setMessage('Failed to send offer');
    }
  };

  return (
    <div className="applicants-page">
      <Navbar />

      <div className="applicants-header">
        <Link to="/employer-dashboard" className="back-link">← Back to My Jobs</Link>
        <h1>Applicants</h1>
        {message && <p className="applicants-message">{message}</p>}
      </div>

      <div className="applicants-container">
        {loading && <p className="empty-hint">Loading applicants...</p>}

        {!loading && applicants.length === 0 && (
          <div className="empty-state"><p>No one has applied to this job yet.</p></div>
        )}

        {applicants.map((app) => (
          <div className="applicant-card" key={app.application_id}>
            <div className="applicant-top">
              <div className="applicant-avatar">{app.candidate_name.charAt(0).toUpperCase()}</div>
              <div className="applicant-info">
                <h3>{app.candidate_name}</h3>
                <p>{app.candidate_email}</p>
                {app.professional_title && <p className="applicant-title">{app.professional_title}</p>}
              </div>
              <span className={`status-badge ${STATUS_COLORS[app.status]}`}>{app.status}</span>
            </div>

            {app.technical_skills && (
              <div className="applicant-skills">
                {app.technical_skills.split(',').map((s, i) => (
                  <span className="skill-chip" key={i}>{s.trim()}</span>
                ))}
              </div>
            )}

            <div className="applicant-meta">
              {app.experience_years != null && <span>💼 {app.experience_years} yrs experience</span>}
              <span>📅 Applied {new Date(app.applied_at).toLocaleDateString()}</span>
              {(app.resume_url || app.profile_resume) && (
                <a href={app.resume_url || app.profile_resume} target="_blank" rel="noreferrer">📄 View Resume</a>
              )}
            </div>

            <div className="applicant-actions">
              <button className="action-btn shortlist" onClick={() => updateStatus(app.application_id, 'shortlisted')}>Shortlist</button>
              <button className="action-btn reject" onClick={() => updateStatus(app.application_id, 'rejected')}>Reject</button>
              <button className="action-btn interview" onClick={() => setInterviewFormFor(app.application_id)}>Schedule Interview</button>
              <button className="action-btn offer" onClick={() => sendOffer(app.application_id)}>Send Offer</button>
            </div>

            {interviewFormFor === app.application_id && (
              <div className="interview-form">
                <div className="interview-form-row">
                  <input
                    type="datetime-local"
                    value={interviewData.interview_date}
                    onChange={(e) => setInterviewData({ ...interviewData, interview_date: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Round (e.g. Technical, HR)"
                    value={interviewData.round}
                    onChange={(e) => setInterviewData({ ...interviewData, round: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  rows="2"
                  value={interviewData.feedback}
                  onChange={(e) => setInterviewData({ ...interviewData, feedback: e.target.value })}
                />
                <div className="interview-form-actions">
                  <button className="cancel-btn" onClick={() => setInterviewFormFor(null)}>Cancel</button>
                  <button className="confirm-btn" onClick={() => scheduleInterview(app.application_id)}>Confirm Interview</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewApplicants;
