import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsError(false);
        setMessage('Login successful! Redirecting...');

        if (data.user.role === 'admin') {
          setTimeout(() => navigate('/admin'), 800);
        } else if (data.user.role === 'employer') {
          setTimeout(() => navigate('/employer-dashboard'), 800);
        } else {
          try {
            const profileCheck = await fetch(`http://localhost:5000/api/profile/check/${data.user.id}`);
            const profileData = await profileCheck.json();
            setTimeout(() => {
              navigate(profileData.hasProfile ? '/dashboard' : '/create-profile');
            }, 800);
          } catch {
            setTimeout(() => navigate('/create-profile'), 800);
          }
        }
      } else {
        setIsError(true);
        setMessage(data.message || 'Login failed');
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
          <div className="auth-side-eyebrow">Welcome back</div>
          <h1>Pick up right where your search left off.</h1>
          <p>Your applications, saved jobs, and profile are exactly where you left them.</p>
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
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Login to continue your job search</p>

          {message && (
            <p className={`auth-message ${isError ? 'error' : ''}`}>{message}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <div className="auth-options">
              <label className="remember"><input type="checkbox" /> Remember me</label>
              <a href="#" className="forgot">Forgot password?</a>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;