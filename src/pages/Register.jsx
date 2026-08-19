import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'candidate', companyName: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match');
      return;
    }

    if (formData.role === 'employer' && !formData.companyName.trim()) {
      setIsError(true);
      setMessage('Please enter your company name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyName: formData.role === 'employer' ? formData.companyName : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsError(false);
        setMessage('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setIsError(true);
        setMessage(data.message || 'Registration failed');
        setLoading(false);
      }
    } catch (error) {
      setIsError(true);
      setMessage('Server error. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side-logo">Career<span>Connect</span></div>

        <div className="auth-side-copy">
          <div className="auth-side-eyebrow">Join the network</div>
          <h1>Where talent meets the right opportunity.</h1>
          <p>Create a profile once, and let it work across every application, interview, and offer.</p>
        </div>

        <svg className="auth-network" viewBox="0 0 320 420" fill="none">
          <circle cx="60" cy="90" r="6" fill="#F2B705" />
          <text x="76" y="94" className="auth-node-label">Talent</text>

          <circle cx="180" cy="230" r="8" fill="#2F6FED" />
          <text x="198" y="234" className="auth-node-label">CareerConnect</text>

          <circle cx="270" cy="360" r="6" fill="#F2B705" />
          <text x="230" y="380" className="auth-node-label">Companies</text>

          <path d="M60,90 Q140,150 180,230 Q220,300 270,360" stroke="#3A4A6B" strokeWidth="1.4" strokeDasharray="4 5" fill="none" />

          <circle r="4" fill="#F2B705">
            <animateMotion dur="4s" repeatCount="indefinite"
              path="M60,90 Q140,150 180,230 Q220,300 270,360" />
          </circle>
        </svg>

        <div className="auth-stats">
          <div><strong>12k+</strong><span>Active job seekers</span></div>
          <div><strong>800+</strong><span>Hiring companies</span></div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-mobile-logo">Career<span>Connect</span></div>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Join thousands of job seekers and companies</p>

          {message && (
            <p className={`auth-message ${isError ? 'error' : ''}`}>{message}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />

            <label>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />

            <label>I am a</label>
            <div className="role-toggle">
              <div
                className={`role-option ${formData.role === 'candidate' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('candidate')}
              >
                Job Seeker
              </div>
              <div
                className={`role-option ${formData.role === 'employer' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('employer')}
              >
                Employer
              </div>
            </div>

            {formData.role === 'employer' && (
              <>
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. Acme Corp"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required />

            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;