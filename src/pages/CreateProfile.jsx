import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './CreateProfile.css';

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '🛠️' },
  { id: 'experience', label: 'Work Experience', icon: '📅' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certifications', icon: '📜' },
  { id: 'resume', label: 'Resume', icon: '📄' },
  { id: 'social', label: 'Social Links', icon: '🔗' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
];

function CreateProfile() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [activeSection, setActiveSection] = useState('personal');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    mobile_number: '', date_of_birth: '', gender: '', address: '',
    city: '', state: '', country: '', pin_code: '',
    professional_title: '', about_me: '', employment_status: '',
    experience_years: '', current_company: '', current_job_role: '',
    expected_salary: '', preferred_job_location: '', employment_type: '',
    highest_qualification: '', degree: '', college_university: '',
    specialization: '', passing_year: '', cgpa: '',
    technical_skills: '', soft_skills: '', languages_known: '',
    resume_url: '', linkedin_url: '', github_url: '', portfolio_url: '',
    job_category: '', notice_period: '', willing_to_relocate: false,
  });

  const [workExperience, setWorkExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    // Pre-fill if a profile already exists (edit mode)
    fetch(`http://localhost:5000/api/profile/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setFormData((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.keys(prev).map((key) => [key, data[key] ?? prev[key]])
          ),
          willing_to_relocate: !!data.willing_to_relocate,
        }));
        if (data.work_experience) {
          try { setWorkExperience(JSON.parse(data.work_experience)); } catch {}
        }
        if (data.projects) {
          try { setProjects(JSON.parse(data.projects)); } catch {}
        }
        if (data.certifications) {
          try { setCertifications(JSON.parse(data.certifications)); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const totalFields = 5;
  const filledFields = ['about_me', 'technical_skills', 'professional_title', 'college_university', 'resume_url']
    .filter((k) => (formData[k] || '').toString().trim() !== '').length;
  const progressPercent = Math.round((filledFields / totalFields) * 100);

  const addWorkExp = () => setWorkExperience([...workExperience, { company: '', role: '', start: '', end: '', description: '' }]);
  const updateWorkExp = (i, field, value) => {
    const updated = [...workExperience]; updated[i][field] = value; setWorkExperience(updated);
  };
  const removeWorkExp = (i) => setWorkExperience(workExperience.filter((_, idx) => idx !== i));

  const addProject = () => setProjects([...projects, { title: '', description: '', tech: '', link: '' }]);
  const updateProject = (i, field, value) => {
    const updated = [...projects]; updated[i][field] = value; setProjects(updated);
  };
  const removeProject = (i) => setProjects(projects.filter((_, idx) => idx !== i));

  const addCertification = () => setCertifications([...certifications, { name: '', organization: '', date: '' }]);
  const updateCertification = (i, field, value) => {
    const updated = [...certifications]; updated[i][field] = value; setCertifications(updated);
  };
  const removeCertification = (i) => setCertifications(certifications.filter((_, idx) => idx !== i));

  // ---- Resume upload handlers ----
  const handleFileUpload = async (file) => {
    if (!file) return;
    const validTypes = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(ext)) {
      setMessage('Only PDF, DOC, or DOCX files are allowed');
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('resume', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload/resume', {
        method: 'POST',
        body: uploadData,
      });
      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({ ...prev, resume_url: data.url }));
        setMessage('Resume uploaded successfully!');
      } else {
        setMessage(data.message || 'Upload failed');
      }
    } catch {
      setMessage('Server error during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          work_experience: workExperience,
          projects: projects,
          certifications: certifications,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile saved successfully!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage(data.message || 'Failed to save profile');
      }
    } catch (error) {
      setMessage('Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => navigate('/dashboard');

  const skillsArray = formData.technical_skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

  return (
    <div className="create-profile-page">
      <Navbar />

      <div className="profile-hero">
        <h1>Build Your Professional Profile</h1>
        <p>A complete profile gets 3x more responses from employers</p>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
            <h4>{user?.name || 'Your Name'}</h4>
            <span>{user?.email}</span>
            <div className="progress-wrapper">
              <div className="progress-label"><span>Profile Strength</span><span>{progressPercent}%</span></div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div></div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {SECTIONS.map((s) => (
              <button key={s.id} type="button"
                className={activeSection === s.id ? 'sidebar-link active' : 'sidebar-link'}
                onClick={() => setActiveSection(s.id)}>
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="profile-main">
          {message && <p className="profile-message">{message}</p>}

          <form onSubmit={handleSubmit}>
            {activeSection === 'personal' && (
              <div className="section-card">
                <h2>Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group"><label>Mobile Number</label><input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="+91 9876543210" /></div>
                  <div className="form-group"><label>Date of Birth</label><input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} /></div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender || ''} onChange={handleChange}>
                      <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group full-width"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" /></div>
                  <div className="form-group"><label>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} /></div>
                  <div className="form-group"><label>State</label><input type="text" name="state" value={formData.state} onChange={handleChange} /></div>
                  <div className="form-group"><label>Country</label><input type="text" name="country" value={formData.country} onChange={handleChange} /></div>
                  <div className="form-group"><label>PIN Code</label><input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} /></div>
                </div>
              </div>
            )}

            {activeSection === 'professional' && (
              <div className="section-card">
                <h2>Professional Information</h2>
                <div className="form-grid">
                  <div className="form-group full-width"><label>Professional Title</label><input type="text" name="professional_title" value={formData.professional_title} onChange={handleChange} placeholder="e.g. Frontend Developer" /></div>
                  <div className="form-group full-width"><label>Career Objective / About Me</label><textarea name="about_me" rows="4" value={formData.about_me} onChange={handleChange} placeholder="Tell employers about your goals..." /></div>
                  <div className="form-group">
                    <label>Employment Status</label>
                    <select name="employment_status" value={formData.employment_status || ''} onChange={handleChange}>
                      <option value="">Select</option><option value="Fresher">Fresher</option><option value="Employed">Employed</option><option value="Unemployed">Unemployed</option><option value="Freelancer">Freelancer</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Years of Experience</label><input type="number" name="experience_years" min="0" value={formData.experience_years} onChange={handleChange} /></div>
                  <div className="form-group"><label>Current Company</label><input type="text" name="current_company" value={formData.current_company} onChange={handleChange} /></div>
                  <div className="form-group"><label>Current Job Role</label><input type="text" name="current_job_role" value={formData.current_job_role} onChange={handleChange} /></div>
                  <div className="form-group"><label>Expected Salary</label><input type="text" name="expected_salary" value={formData.expected_salary} onChange={handleChange} placeholder="e.g. ₹8 LPA" /></div>
                  <div className="form-group"><label>Preferred Job Location</label><input type="text" name="preferred_job_location" value={formData.preferred_job_location} onChange={handleChange} /></div>
                  <div className="form-group">
                    <label>Employment Type</label>
                    <select name="employment_type" value={formData.employment_type || ''} onChange={handleChange}>
                      <option value="">Select</option><option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Internship">Internship</option><option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'education' && (
              <div className="section-card">
                <h2>Education</h2>
                <div className="form-grid">
                  <div className="form-group"><label>Highest Qualification</label><input type="text" name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} placeholder="e.g. B.Tech" /></div>
                  <div className="form-group"><label>Degree</label><input type="text" name="degree" value={formData.degree} onChange={handleChange} /></div>
                  <div className="form-group full-width"><label>College/University</label><input type="text" name="college_university" value={formData.college_university} onChange={handleChange} /></div>
                  <div className="form-group"><label>Specialization</label><input type="text" name="specialization" value={formData.specialization} onChange={handleChange} /></div>
                  <div className="form-group"><label>Passing Year</label><input type="text" name="passing_year" value={formData.passing_year} onChange={handleChange} placeholder="2026" /></div>
                  <div className="form-group"><label>CGPA / Percentage</label><input type="text" name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.5 or 85%" /></div>
                </div>
              </div>
            )}

            {activeSection === 'skills' && (
              <div className="section-card">
                <h2>Skills</h2>
                <div className="form-grid">
                  <div className="form-group full-width"><label>Technical Skills</label><input type="text" name="technical_skills" value={formData.technical_skills} onChange={handleChange} placeholder="React, Node.js, MySQL (comma separated)" /></div>
                  <div className="form-group full-width"><label>Soft Skills</label><input type="text" name="soft_skills" value={formData.soft_skills} onChange={handleChange} placeholder="Communication, Teamwork, Leadership" /></div>
                  <div className="form-group full-width"><label>Languages Known</label><input type="text" name="languages_known" value={formData.languages_known} onChange={handleChange} placeholder="English, Hindi, Marathi" /></div>
                  {skillsArray.length > 0 && (
                    <div className="form-group full-width">
                      <div className="preview-skills">
                        {skillsArray.map((skill, i) => <span className="skill-chip" key={i}>{skill}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'experience' && (
              <div className="section-card">
                <div className="section-header-row"><h2>Work Experience</h2><button type="button" className="add-btn" onClick={addWorkExp}>+ Add Experience</button></div>
                {workExperience.length === 0 && <p className="empty-hint">No experience added yet. Click "+ Add Experience" to begin.</p>}
                {workExperience.map((exp, i) => (
                  <div className="entry-card" key={i}>
                    <button type="button" className="remove-btn" onClick={() => removeWorkExp(i)}>✕</button>
                    <div className="form-grid">
                      <div className="form-group"><label>Company Name</label><input type="text" value={exp.company} onChange={(e) => updateWorkExp(i, 'company', e.target.value)} /></div>
                      <div className="form-group"><label>Job Title</label><input type="text" value={exp.role} onChange={(e) => updateWorkExp(i, 'role', e.target.value)} /></div>
                      <div className="form-group"><label>Start Date</label><input type="date" value={exp.start} onChange={(e) => updateWorkExp(i, 'start', e.target.value)} /></div>
                      <div className="form-group"><label>End Date</label><input type="date" value={exp.end} onChange={(e) => updateWorkExp(i, 'end', e.target.value)} /></div>
                      <div className="form-group full-width"><label>Job Description</label><textarea rows="3" value={exp.description} onChange={(e) => updateWorkExp(i, 'description', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'projects' && (
              <div className="section-card">
                <div className="section-header-row"><h2>Projects</h2><button type="button" className="add-btn" onClick={addProject}>+ Add Project</button></div>
                {projects.length === 0 && <p className="empty-hint">No projects added yet.</p>}
                {projects.map((proj, i) => (
                  <div className="entry-card" key={i}>
                    <button type="button" className="remove-btn" onClick={() => removeProject(i)}>✕</button>
                    <div className="form-grid">
                      <div className="form-group full-width"><label>Project Title</label><input type="text" value={proj.title} onChange={(e) => updateProject(i, 'title', e.target.value)} /></div>
                      <div className="form-group full-width"><label>Project Description</label><textarea rows="3" value={proj.description} onChange={(e) => updateProject(i, 'description', e.target.value)} /></div>
                      <div className="form-group"><label>Technologies Used</label><input type="text" value={proj.tech} onChange={(e) => updateProject(i, 'tech', e.target.value)} /></div>
                      <div className="form-group"><label>Project Link (Optional)</label><input type="text" value={proj.link} onChange={(e) => updateProject(i, 'link', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'certifications' && (
              <div className="section-card">
                <div className="section-header-row"><h2>Certifications</h2><button type="button" className="add-btn" onClick={addCertification}>+ Add Certification</button></div>
                {certifications.length === 0 && <p className="empty-hint">No certifications added yet.</p>}
                {certifications.map((cert, i) => (
                  <div className="entry-card" key={i}>
                    <button type="button" className="remove-btn" onClick={() => removeCertification(i)}>✕</button>
                    <div className="form-grid">
                      <div className="form-group"><label>Certification Name</label><input type="text" value={cert.name} onChange={(e) => updateCertification(i, 'name', e.target.value)} /></div>
                      <div className="form-group"><label>Organization</label><input type="text" value={cert.organization} onChange={(e) => updateCertification(i, 'organization', e.target.value)} /></div>
                      <div className="form-group"><label>Completion Date</label><input type="date" value={cert.date} onChange={(e) => updateCertification(i, 'date', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'resume' && (
              <div className="section-card">
                <h2>Resume</h2>

                <div
                  className={dragActive ? 'dropzone dropzone-active' : 'dropzone'}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {uploading ? (
                    <p>Uploading...</p>
                  ) : (
                    <>
                      <div className="dropzone-icon">📄</div>
                      <p className="dropzone-text">Drag & drop your resume here</p>
                      <p className="dropzone-subtext">PDF, DOC, or DOCX — max 5MB</p>
                      <label className="dropzone-browse-btn">
                        Browse Files
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                      </label>
                    </>
                  )}
                </div>

                {formData.resume_url && (
                  <div className="resume-preview">
                    ✅ Resume attached — <a href={formData.resume_url} target="_blank" rel="noreferrer">View uploaded file</a>
                  </div>
                )}

                <div className="form-grid" style={{ marginTop: '20px' }}>
                  <div className="form-group full-width">
                    <label>Or paste a resume link instead</label>
                    <input type="text" name="resume_url" value={formData.resume_url} onChange={handleChange} placeholder="Google Drive / shareable link" />
                  </div>
                  <div className="form-group full-width">
                    <span className="field-hint">💡 Tip: Once your profile is complete, use "My Resume" in the navbar to auto-generate an ATS-friendly resume from this data.</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'social' && (
              <div className="section-card">
                <h2>Social Links</h2>
                <div className="form-grid">
                  <div className="form-group full-width"><label>LinkedIn Profile</label><input type="text" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." /></div>
                  <div className="form-group full-width"><label>GitHub Profile</label><input type="text" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/..." /></div>
                  <div className="form-group full-width"><label>Portfolio Website</label><input type="text" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://yourportfolio.com" /></div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="section-card">
                <h2>Preferences</h2>
                <div className="form-grid">
                  <div className="form-group"><label>Job Category</label><input type="text" name="job_category" value={formData.job_category} onChange={handleChange} placeholder="e.g. IT, Marketing" /></div>
                  <div className="form-group"><label>Preferred Location</label><input type="text" name="preferred_job_location" value={formData.preferred_job_location} onChange={handleChange} /></div>
                  <div className="form-group"><label>Notice Period</label><input type="text" name="notice_period" value={formData.notice_period} onChange={handleChange} placeholder="e.g. Immediate, 30 days" /></div>
                  <div className="form-group checkbox-group">
                    <label><input type="checkbox" name="willing_to_relocate" checked={formData.willing_to_relocate} onChange={handleChange} /> Willing to Relocate</label>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="skip-btn" onClick={handleSkip}>Cancel</button>
              <button type="submit" className="save-btn" disabled={submitting}>{submitting ? 'Saving...' : 'Save Profile'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;