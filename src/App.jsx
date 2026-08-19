import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import CreateProfile from './pages/CreateProfile';
import Dashboard from './pages/Dashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import ViewApplicants from './pages/ViewApplicants';
import AdminDashboard from './pages/AdminDashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import About from './pages/About'; 
import Companies from './pages/Companies'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/employer-dashboard/jobs/:jobId/applicants" element={<ViewApplicants />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/Companies" element={<Companies />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
