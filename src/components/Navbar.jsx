import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Career<span>Connect</span></Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/jobs">Find Jobs</Link></li>
        <li><Link to="/companies">Companies</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>

      <div className="nav-buttons">
        {!user && (
          <>
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-solid">Register</Link>
          </>
        )}

        {user && user.role === 'employer' && (
          <>
            <Link to="/post-job" className="btn-outline">Post a Job</Link>
            <Link to="/employer-dashboard" className="btn-outline">My Jobs</Link>
            <span className="welcome-text">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-solid">Logout</button>
          </>
        )}

        {user && user.role === 'candidate' && (
          <>
            <Link to="/dashboard" className="btn-outline">Dashboard</Link>
            <Link to="/resume" className="btn-outline">My Resume</Link>
            <span className="welcome-text">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-solid">Logout</button>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            <Link to="/admin" className="btn-outline">Admin Panel</Link>
            <span className="welcome-text">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-solid">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
