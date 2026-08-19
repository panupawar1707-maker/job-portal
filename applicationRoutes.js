const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Candidate applies for a job
router.post('/apply', (req, res) => {
  const { job_id, candidate_id, resume_url, cover_letter } = req.body;

  if (!job_id || !candidate_id) {
    return res.status(400).json({ message: 'job_id and candidate_id are required' });
  }

  const checkSql = 'SELECT * FROM applications WHERE job_id = ? AND candidate_id = ?';
  db.query(checkSql, [job_id, candidate_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });

    if (results.length > 0) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    const insertSql = 'INSERT INTO applications (job_id, candidate_id, resume_url, cover_letter) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [job_id, candidate_id, resume_url || null, cover_letter || null], (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to apply', error: err.message });
      res.status(201).json({ message: 'Applied successfully', applicationId: result.insertId });
    });
  });
});

// Get all applicants for a specific job (employer view)
router.get('/job/:job_id', (req, res) => {
  const { job_id } = req.params;
  const sql = `
    SELECT applications.*, users.name AS candidate_name, users.email AS candidate_email,
           candidate_profiles.professional_title, candidate_profiles.technical_skills,
           candidate_profiles.experience_years, candidate_profiles.resume_url AS profile_resume
    FROM applications
    JOIN users ON applications.candidate_id = users.user_id
    LEFT JOIN candidate_profiles ON users.user_id = candidate_profiles.user_id
    WHERE applications.job_id = ?
    ORDER BY applications.applied_at DESC
  `;
  db.query(sql, [job_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
});

// Update application status (shortlist / reject / hire)
router.put('/:application_id/status', (req, res) => {
  const { application_id } = req.params;
  const { status } = req.body;

  const allowed = ['applied', 'shortlisted', 'rejected', 'hired'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.query('UPDATE applications SET status = ? WHERE application_id = ?', [status, application_id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });

    if (status === 'shortlisted') {
      db.query('INSERT INTO shortlists (application_id) VALUES (?)', [application_id], () => {});
    }

    res.status(200).json({ message: 'Status updated successfully' });
  });
});

// Schedule / add an interview for an application
router.post('/:application_id/interview', (req, res) => {
  const { application_id } = req.params;
  const { interview_date, round, feedback, result } = req.body;

  const sql = `
    INSERT INTO interviews (application_id, interview_date, round, feedback, result)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [application_id, interview_date || null, round || null, feedback || null, result || 'pending'], (err, result2) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(201).json({ message: 'Interview scheduled', interviewId: result2.insertId });
  });
});

// Send an offer for an application
router.post('/:application_id/offer', (req, res) => {
  const { application_id } = req.params;
  const { offer_details } = req.body;

  const sql = `INSERT INTO offers (application_id, offer_details) VALUES (?, ?)`;
  db.query(sql, [application_id, offer_details || null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });

    db.query("UPDATE applications SET status = 'hired' WHERE application_id = ?", [application_id], () => {});

    res.status(201).json({ message: 'Offer sent', offerId: result.insertId });
  });
});

module.exports = router;
