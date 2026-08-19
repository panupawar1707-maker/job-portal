import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Companies.css';

function Companies() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/companies')
      .then((res) => res.json())
      .then((data) => {
       setJobs(
          data.map((c) => ({
            id: c.company_id,
            name: c.company_name,
            location: c.location,
            jobCount: c.job_count,
            logo: c.logo_url,
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="companies-page">
      <Navbar />

      <section className="companies-hero">
        <div className="companies-hero-blob blob-a"></div>
        <div className="companies-hero-blob blob-b"></div>
        <div className="companies-hero-content">
          <h1>Companies Hiring on <span>CareerConnect</span></h1>
          <p>Explore verified companies actively hiring across every industry.</p>
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="companies-search"
          />
        </div>
      </section>

      <section className="companies-list-section">
        {loading && <p className="empty-hint">Loading companies...</p>}

        {!loading && filtered.length === 0 && (
          <p className="empty-hint">
            {jobs.length === 0
              ? 'No companies have posted jobs yet. Check back soon!'
              : 'No companies match your search.'}
          </p>
        )}

        <div className="companies-grid">
          {filtered.map((company, i) => (
            <div className="company-card" key={company.id || i} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="company-logo">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="company-logo-img" />
                ) : (
                  company.name.charAt(0).toUpperCase()
                )}
              </div>
              <h3>{company.name}</h3>
              <p className="company-location">📍 {company.location}</p>
              <p className="company-job-count">{company.jobCount} open position{company.jobCount === 1 ? '' : 's'}</p>
              <Link to="/jobs" className="company-view-btn">View Jobs</Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 CareerConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Companies;