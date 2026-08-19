import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './PostJob.css';

function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', job_type: 'Full-time',
    salary_min: '', salary_max: '', skills_required: '',
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setMessage('Please login as an employer to post a job.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== 'employer') {
      setMessage('Only employer accounts can post jobs.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/jobs/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Job posted successfully!');
        setTimeout(() => navigate('/employer-dashboard'), 1200);
      } else {
        setMessage(data.message || 'Failed to post job');
      }
    } catch (error) {
      setMessage('Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-job-page">
      <Navbar />

      <div className="post-job-container">
        <h1>Post a New Job</h1>
        <p className="post-job-subtitle">Fill in the details below to publish your job listing</p>

        {message && <p className="post-job-message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <label>Job Title</label>
          <input type="text" name="title" placeholder="e.g. Frontend Developer" value={formData.title} onChange={handleChange} required />

          <label>Job Description</label>
          <textarea name="description" placeholder="Describe the role, responsibilities, and requirements..." rows="5" value={formData.description} onChange={handleChange} required />

          <label>Location</label>
          <input type="text" name="location" placeholder="e.g. Pune, India" value={formData.location} onChange={handleChange} required />

          <label>Job Type</label>
          <select name="job_type" value={formData.job_type} onChange={handleChange}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          <div className="salary-row">
            <div>
              <label>Minimum Salary (₹)</label>
              <input type="number" name="salary_min" placeholder="e.g. 600000" value={formData.salary_min} onChange={handleChange} />
            </div>
            <div>
              <label>Maximum Salary (₹)</label>
              <input type="number" name="salary_max" placeholder="e.g. 900000" value={formData.salary_max} onChange={handleChange} />
            </div>
          </div>

          <label>Skills Required</label>
          <input type="text" name="skills_required" placeholder="e.g. React, JavaScript, CSS" value={formData.skills_required} onChange={handleChange} />

          <button type="submit" className="post-job-btn" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
