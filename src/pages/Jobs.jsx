import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Jobs.css';

function Jobs() {
  const [searchParams] = useSearchParams();
const [search, setSearch] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then((res) => res.json())
      .then((data) => { setJobs(data); setLoading(false); })
      .catch(() => { setError('Failed to load jobs. Make sure the server is running.'); setLoading(false); });
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = job.location ? job.location.toLowerCase().includes(location.toLowerCase()) : true;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="jobs-page">
      <Navbar />

      <section className="jobs-search-section">
        <h1>Find Your Next Opportunity</h1>
        <div className="jobs-search-box">
          <input type="text" placeholder="Job title or keyword..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <button>Search</button>
        </div>
      </section>

      <section className="jobs-list-section">
        {loading && <p className="results-count">Loading jobs...</p>}
        {error && <p className="no-results">{error}</p>}

        {!loading && !error && (
          <>
            <p className="results-count">{filteredJobs.length} jobs found</p>
            <div className="jobs-list">
              {filteredJobs.length === 0 && <p className="no-results">No jobs match your search.</p>}

              {filteredJobs.map((job) => (
                <div className="job-card" key={job.job_id}>
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <span className="job-type">{job.job_type}</span>
                  </div>
                  <p className="job-company">{job.company_name}</p>
                  <div className="job-meta">
                    <span>📍 {job.location}</span>
                    <span>💰 ₹{job.salary_min} - ₹{job.salary_max}</span>
                    <span>🕒 {new Date(job.posted_at).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/jobs/${job.job_id}`} className="apply-btn">View Details</Link>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="footer">
        <p>© 2026 CareerConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Jobs;
