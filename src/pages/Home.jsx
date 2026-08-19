import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

function Home() {
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({ jobs: 0, companies: 0, candidates: 0 });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const targets = { jobs: 10000, companies: 5000, candidates: 20000 };
    const steps = 40;
    const interval = 1500 / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounts({
        jobs: Math.floor(targets.jobs * progress),
        companies: Math.floor(targets.companies * progress),
        candidates: Math.floor(targets.candidates * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    { icon: '💻', name: 'Technology', count: '2,400+' },
    { icon: '📊', name: 'Marketing', count: '1,100+' },
    { icon: '🎨', name: 'Design', count: '890+' },
    { icon: '💰', name: 'Finance', count: '760+' },
    { icon: '🏥', name: 'Healthcare', count: '1,340+' },
    { icon: '⚙️', name: 'Engineering', count: '1,980+' },
  ];

  const features = [
    { icon: '🎯', title: 'Smart Matching', text: 'Get job recommendations tailored to your skills and experience.' },
    { icon: '🏢', title: 'Verified Companies', text: 'All listed companies are verified for safe and genuine hiring.' },
    { icon: '📄', title: 'ATS-Friendly Resume', text: 'Build a resume from your profile that passes applicant tracking systems.' },
  ];

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="hero-pattern" aria-hidden="true">
          <svg viewBox="0 0 900 500" preserveAspectRatio="none">
            <circle cx="120" cy="120" r="4" fill="#F2B705" opacity="0.7" />
            <circle cx="760" cy="90" r="3" fill="#3A4A6B" />
            <circle cx="640" cy="360" r="4" fill="#2F6FED" opacity="0.8" />
            <circle cx="90" cy="380" r="3" fill="#3A4A6B" />
            <path d="M120,120 Q400,220 640,360" stroke="#243352" strokeWidth="1" strokeDasharray="3 6" fill="none" />
            <path d="M760,90 Q550,160 640,360" stroke="#243352" strokeWidth="1" strokeDasharray="3 6" fill="none" />
            <path d="M120,120 Q60,260 90,380" stroke="#243352" strokeWidth="1" strokeDasharray="3 6" fill="none" />
            <circle r="3.5" fill="#F2B705">
              <animateMotion dur="6s" repeatCount="indefinite" path="M120,120 Q400,220 640,360" />
            </circle>
          </svg>
        </div>

        <div className="hero-overlay fade-in">
          <div className="hero-eyebrow">10,000+ live roles, updated daily</div>
          <h1>Find your <span>dream job</span> today</h1>
          <p>Connecting talented professionals with top companies across the country.</p>

          <div className="search-box">
            <div className="search-field">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Job title, keywords..." />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <span className="search-icon">📍</span>
              <input type="text" placeholder="Location" />
            </div>
            <Link to="/jobs" className="search-btn-link">Search Jobs</Link>
          </div>

          <div className="stats">
            <div><h2>{counts.jobs.toLocaleString()}+</h2><p>Active Jobs</p></div>
            <div><h2>{counts.companies.toLocaleString()}+</h2><p>Companies</p></div>
            <div><h2>{counts.candidates.toLocaleString()}+</h2><p>Candidates</p></div>
          </div>

          {user && user.role === 'candidate' && (
            <div className="quick-actions">
              <Link to="/jobs" className="btn-solid">Browse Jobs</Link>
              <Link to="/dashboard" className="btn-outline-white">My Dashboard</Link>
            </div>
          )}

          {user && user.role === 'employer' && (
            <div className="quick-actions">
              <Link to="/post-job" className="btn-solid">Post a New Job</Link>
              <Link to="/employer-dashboard" className="btn-outline-white">My Posted Jobs</Link>
            </div>
          )}
        </div>
      </section>

      <section className="categories">
        <div className="section-eyebrow">Browse by field</div>
        <h2 className="section-title">Explore by Category</h2>
        <p className="section-subtitle">Find the right role in the field you love</p>
        <div className="category-grid">
          {categories.map((cat, i) => (
            <Link to={`/jobs?q=${encodeURIComponent(cat.name)}`} className="category-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="category-icon-badge">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <p>{cat.count} jobs</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="features">
        <div className="section-eyebrow">Why CareerConnect</div>
        <h2 className="section-title">Built for a better job search</h2>
        <div className="feature-cards">
          {features.map((f, i) => (
            <div className="card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="feature-icon-badge">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonial">
        <div className="testimonial-card">
          <div className="quote-mark">"</div>
          <p className="testimonial-text">
            CareerConnect helped me land my dream job in just two weeks. The smart matching
            actually works — every recommendation felt relevant.
          </p>
          <div className="testimonial-author">
            <div className="avatar">RS</div>
            <div>
              <h4>Riya Sharma</h4>
              <span>Frontend Developer at TechNova</span>
            </div>
          </div>
        </div>
      </section>

      {!user && (
        <section className="cta">
          <h2>Ready to take the next step in your career?</h2>
          <p>Join thousands of professionals who found their dream job with us.</p>
          <Link to="/register" className="btn-solid">Get Started Now</Link>
        </section>
      )}

      <footer className="footer">
        <p>© 2026 CareerConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;