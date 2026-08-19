const express = require('express');
const db = require('../config/db');

const router = express.Router();

// POST a new job (auto-creates company profile if employer doesn't have one)
router.post('/post', (req, res) => {
  const {
    user_id, title, description, location,
    job_type, salary_min, salary_max, skills_required,
  } = req.body;

  if (!user_id || !title || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.query('SELECT * FROM companies WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });

    if (results.length > 0) {
      if (results[0].status === 'blocked') {
        return res.status(403).json({ message: 'Your company account has been blocked by admin. Contact support.' });
      }
      insertJob(results[0].company_id);
    } else {
      db.query('SELECT name FROM users WHERE user_id = ?', [user_id], (err, userResults) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err.message });

        const companyName = userResults[0]?.name || 'My Company';

        db.query(
          'INSERT INTO companies (user_id, company_name, location) VALUES (?, ?, ?)',
          [user_id, companyName, location],
          (err, result) => {
            if (err) return res.status(500).json({ message: 'Server error', error: err.message });
            insertJob(result.insertId);
          }
        );
      });
    }
  });

  function insertJob(company_id) {
    const sql = `
      INSERT INTO jobs (company_id, title, description, location, job_type, salary_min, salary_max, skills_required)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [company_id, title, description, location, job_type, salary_min || null, salary_max || null, skills_required],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to post job', error: err.message });
        res.status(201).json({ message: 'Job posted successfully', jobId: result.insertId });
      }
    );
  }
});

// GET all jobs posted by a specific employer (for Employer Dashboard)
router.get('/employer/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT jobs.*, 
      (SELECT COUNT(*) FROM applications WHERE applications.job_id = jobs.job_id) AS applicant_count
    FROM jobs
    JOIN companies ON jobs.company_id = companies.company_id
    WHERE companies.user_id = ?
    ORDER BY jobs.posted_at DESC
  `;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
});

// GET single job by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT jobs.*, companies.company_name
    FROM jobs
    JOIN companies ON jobs.company_id = companies.company_id
    WHERE jobs.job_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(results[0]);
  });
});

// GET all open jobs
router.get('/', (req, res) => {
  const sql = `
    SELECT jobs.*, companies.company_name
    FROM jobs
    JOIN companies ON jobs.company_id = companies.company_id
    WHERE jobs.status = 'open'
    ORDER BY jobs.posted_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
});

module.exports = router;
