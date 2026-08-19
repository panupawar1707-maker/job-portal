import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ResumeBuilder.css';

function ResumeBuilder() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    fetch(`http://localhost:5000/api/profile/${user.id}`)
      .then((res) => res.json())
      .then((data) => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handlePrint = () => window.print();

  if (loading) return (<div><Navbar /><p className="loading-text">Loading your resume...</p></div>);

  if (!profile || !profile.professional_title) {
    return (
      <div>
        <Navbar />
        <div className="resume-empty">
          <h2>Your profile isn't complete yet</h2>
          <p>Fill out your profile first so we can generate an ATS-friendly resume from it.</p>
          <Link to="/create-profile" className="resume-empty-btn">Complete Your Profile</Link>
        </div>
      </div>
    );
  }

  let workExp = [], projects = [], certifications = [];
  try { workExp = JSON.parse(profile.work_experience || '[]'); } catch {}
  try { projects = JSON.parse(profile.projects || '[]'); } catch {}
  try { certifications = JSON.parse(profile.certifications || '[]'); } catch {}

  const technicalSkills = (profile.technical_skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const softSkills = (profile.soft_skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <div className="resume-builder-page">
      <Navbar />

      <div className="resume-toolbar no-print">
        <div>
          <h2>ATS-Friendly Resume</h2>
          <p>Auto-generated from your profile — clean, single-column format that passes applicant tracking systems.</p>
        </div>
        <div className="toolbar-actions">
          <Link to="/create-profile" className="toolbar-btn outline">Edit Profile</Link>
          <button className="toolbar-btn solid" onClick={handlePrint}>⬇ Download / Print PDF</button>
        </div>
      </div>

      {/* PRINTABLE RESUME */}
      <div className="resume-sheet">
        <div className="resume-header">
          <h1>{user.name}</h1>
          <p className="resume-title">{profile.professional_title}</p>
          <div className="resume-contact">
            <span>{user.email}</span>
            {profile.mobile_number && <span>· {profile.mobile_number}</span>}
            {(profile.city || profile.state) && <span>· {[profile.city, profile.state].filter(Boolean).join(', ')}</span>}
          </div>
          <div className="resume-links">
            {profile.linkedin_url && <span>{profile.linkedin_url}</span>}
            {profile.github_url && <span>{profile.github_url}</span>}
            {profile.portfolio_url && <span>{profile.portfolio_url}</span>}
          </div>
        </div>

        {profile.about_me && (
          <div className="resume-section">
            <h2>Summary</h2>
            <p>{profile.about_me}</p>
          </div>
        )}

        {technicalSkills.length > 0 && (
          <div className="resume-section">
            <h2>Technical Skills</h2>
            <p>{technicalSkills.join(' · ')}</p>
          </div>
        )}

        {softSkills.length > 0 && (
          <div className="resume-section">
            <h2>Soft Skills</h2>
            <p>{softSkills.join(' · ')}</p>
          </div>
        )}

        {workExp.length > 0 && (
          <div className="resume-section">
            <h2>Work Experience</h2>
            {workExp.map((exp, i) => (
              <div className="resume-entry" key={i}>
                <div className="resume-entry-header">
                  <strong>{exp.role}</strong>
                  <span>{exp.start} – {exp.end || 'Present'}</span>
                </div>
                <p className="resume-entry-sub">{exp.company}</p>
                {exp.description && <p>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {(profile.college_university || profile.degree) && (
          <div className="resume-section">
            <h2>Education</h2>
            <div className="resume-entry">
              <div className="resume-entry-header">
                <strong>{profile.degree} {profile.specialization ? `— ${profile.specialization}` : ''}</strong>
                <span>{profile.passing_year}</span>
              </div>
              <p className="resume-entry-sub">{profile.college_university}</p>
              {profile.cgpa && <p>CGPA / Percentage: {profile.cgpa}</p>}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="resume-section">
            <h2>Projects</h2>
            {projects.map((proj, i) => (
              <div className="resume-entry" key={i}>
                <div className="resume-entry-header">
                  <strong>{proj.title}</strong>
                  {proj.link && <span>{proj.link}</span>}
                </div>
                {proj.tech && <p className="resume-entry-sub">Tech: {proj.tech}</p>}
                {proj.description && <p>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div className="resume-section">
            <h2>Certifications</h2>
            {certifications.map((cert, i) => (
              <div className="resume-entry" key={i}>
                <div className="resume-entry-header">
                  <strong>{cert.name}</strong>
                  <span>{cert.date}</span>
                </div>
                <p className="resume-entry-sub">{cert.organization}</p>
              </div>
            ))}
          </div>
        )}

        {profile.languages_known && (
          <div className="resume-section">
            <h2>Languages</h2>
            <p>{profile.languages_known}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeBuilder;
