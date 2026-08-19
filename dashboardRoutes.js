const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Everything needed for a candidate's dashboard, in one call
router.get('/candidate/:user_id', (req, res) => {
  const { user_id } = req.params;

  const profileSql = 'SELECT * FROM candidate_profiles WHERE user_id = ?';
  const applicationsSql = `
    SELECT applications.*, jobs.title AS job_title, jobs.location, jobs.job_type,
           companies.company_name
    FROM applications
    JOIN jobs ON applications.job_id = jobs.job_id
    JOIN companies ON jobs.company_id = companies.company_id
    WHERE applications.candidate_id = ?
    ORDER BY applications.applied_at DESC
  `;
  const interviewsSql = `
    SELECT interviews.*, jobs.title AS job_title, companies.company_name
    FROM interviews
    JOIN applications ON interviews.application_id = applications.application_id
    JOIN jobs ON applications.job_id = jobs.job_id
    JOIN companies ON jobs.company_id = companies.company_id
    WHERE applications.candidate_id = ?
    ORDER BY interviews.interview_date DESC
  `;
  const offersSql = `
    SELECT offers.*, jobs.title AS job_title, companies.company_name
    FROM offers
    JOIN applications ON offers.application_id = applications.application_id
    JOIN jobs ON applications.job_id = jobs.job_id
    JOIN companies ON jobs.company_id = companies.company_id
    WHERE applications.candidate_id = ?
    ORDER BY offers.offer_date DESC
  `;

  db.query(profileSql, [user_id], (err, profileResults) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });

    db.query(applicationsSql, [user_id], (err, applications) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err.message });

      db.query(interviewsSql, [user_id], (err, interviews) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err.message });

        db.query(offersSql, [user_id], (err, offers) => {
          if (err) return res.status(500).json({ message: 'Server error', error: err.message });

          res.status(200).json({
            profile: profileResults[0] || null,
            applications,
            interviews,
            offers,
          });
        });
      });
    });
  });
});

module.exports = router;
