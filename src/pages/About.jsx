import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './About.css';

function About() {
  const values = [
    { icon: '🎯', title: 'Purpose-Driven Matching', text: 'We connect the right people with the right roles using smart, skill-based matching — not just keyword searches.' },
    { icon: '🔒', title: 'Verified & Trusted', text: 'Every company on CareerConnect is reviewed, so job seekers can apply with confidence.' },
    { icon: '⚡', title: 'Fast & Simple', text: 'From profile creation to application tracking, everything is designed to save you time.' },
    { icon: '📄', title: 'ATS-Ready Resumes', text: 'Build a resume straight from your profile that is formatted to pass applicant tracking systems.' },
  ];

  const stats = [
    { number: '10K+', label: 'Active Job Listings' },
    { number: '5K+', label: 'Verified Companies' },
    { number: '20K+', label: 'Registered Candidates' },
    { number: '98%', label: 'Positive Feedback' },
  ];

  return (
    <div className="about-page">
      <Navbar />

      <section className="about-hero">
        <div className="about-hero-blob blob-x"></div>
        <div className="about-hero-blob blob-y"></div>
        <div className="about-hero-content">
          <span className="about-eyebrow">OUR STORY</span>
          <h1>Building bridges between <span>talent</span> and <span>opportunity</span></h1>
          <p>
            CareerConnect was built to make the job search feel less like a maze and more like a clear path —
            for both job seekers and the companies looking for them.
          </p>
        </div>
      </section>

      <section className="about-stats">
        {stats.map((s, i) => (
          <div className="about-stat" key={i}>
            <h2>{s.number}</h2>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      <section className="about-values">
        <h2 className="section-title">What We Stand For</h2>
        <div className="values-grid">
          {values.map((v, i) => (
            <div className="value-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-mission">
        <div className="mission-card">
          <h2>Our Mission</h2>
          <p>
            To remove the friction from hiring — giving job seekers a single place to build their profile,
            track every application, and land their next role, while giving employers a faster way to find
            candidates who actually fit.
          </p>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to get started?</h2>
        <p>Join thousands of professionals and companies already using CareerConnect.</p>
        <div className="about-cta-buttons">
          <Link to="/register" className="cta-btn-solid">Create an Account</Link>
          <Link to="/jobs" className="cta-btn-outline">Browse Jobs</Link>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 CareerConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default About;