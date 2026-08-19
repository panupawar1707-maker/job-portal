const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Overview stats for admin dashboard
router.get('/stats', (req, res) => {
  const queries = {
    totalUsers: 'SELECT COUNT(*) AS count FROM users',
    totalCandidates: "SELECT COUNT(*) AS count FROM users WHERE role = 'candidate'",
    totalEmployers: "SELECT COUNT(*) AS count FROM users WHERE role = 'employer'",
    totalJobs: 'SELECT COUNT(*) AS count FROM jobs',
    totalApplications: 'SELECT COUNT(*) AS count FROM applications',
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    db.query(queries[key], (err, rows) => {
      if (!err) results[key] = rows[0].count;
      completed++;
      if (completed === keys.length) {
        res.status(200).json(results);
      }
    });
  });
});

// Get all users
router.get('/users', (req, res) => {
  db.query('SELECT user_id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
});

// Delete a user
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE user_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json({ message: 'User deleted successfully' });
  });
});

// Get all jobs (with company + applicant count)
router.get('/jobs', (req, res) => {
  const sql = `
    SELECT jobs.*, companies.company_name,
      (SELECT COUNT(*) FROM applications WHERE applications.job_id = jobs.job_id) AS applicant_count
    FROM jobs
    JOIN companies ON jobs.company_id = companies.company_id
    ORDER BY jobs.posted_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
});

// Close/delete a job
router.delete('/jobs/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM jobs WHERE job_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json({ message: 'Job deleted successfully' });
  });
});
// Get all employers (with their company + block status)
router.get('/employers', (req, res) => {
  const sql = `
    SELECT users.user_id, users.name, users.email, users.created_at,
           companies.company_id, companies.company_name, companies.status,
           (SELECT COUNT(*) FROM jobs WHERE jobs.company_id = companies.company_id) AS jobs_posted
    FROM users
    LEFT JOIN companies ON companies.user_id = users.user_id
    WHERE users.role = 'employer'
    ORDER BY users.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
});

// Block or unblock an employer's company
router.put('/employers/:company_id/status', (req, res) => {
  const { company_id } = req.params;
  const { status } = req.body;

  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.query('UPDATE companies SET status = ? WHERE company_id = ?', [status, company_id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json({ message: `Employer ${status === 'blocked' ? 'blocked' : 'unblocked'} successfully` });
  });
});

// Get full profile of any candidate (for admin to review)
router.get('/candidate-profile/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT users.name, users.email, users.phone, candidate_profiles.*
    FROM users
    LEFT JOIN candidate_profiles ON users.user_id = candidate_profiles.user_id
    WHERE users.user_id = ?
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(results[0]);
  });
});

module.exports = router;
