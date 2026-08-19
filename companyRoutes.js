const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET all companies, with their open job count
router.get('/', (req, res) => {
  const sql = `
    SELECT companies.company_id, companies.company_name, companies.location,
           companies.company_description, companies.website, companies.logo_url,
           COUNT(jobs.job_id) AS job_count
    FROM companies
    LEFT JOIN jobs ON jobs.company_id = companies.company_id AND jobs.status = 'open'
    GROUP BY companies.company_id
    ORDER BY job_count DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
});

// GET a single company profile + its open jobs
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM companies WHERE company_id = ?', [id], (err, companyResults) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (companyResults.length === 0) return res.status(404).json({ message: 'Company not found' });

    const jobsSql = `SELECT * FROM jobs WHERE company_id = ? AND status = 'open' ORDER BY posted_at DESC`;
    db.query(jobsSql, [id], (err, jobResults) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err.message });
      res.status(200).json({ company: companyResults[0], jobs: jobResults });
    });
  });
});
// Update a company's logo/details (employer edits their own company)
router.put('/update/:user_id', (req, res) => {
  const { user_id } = req.params;
  const { logo_url, company_description, website } = req.body;

  db.query(
    'UPDATE companies SET logo_url = ?, company_description = ?, website = ? WHERE user_id = ?',
    [logo_url || null, company_description || null, website || null, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Company not found for this user' });
      res.status(200).json({ message: 'Company updated successfully' });
    }
  );
});

// Get a company by user_id (so the employer dashboard can load its own logo)
router.get('/by-user/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.query('SELECT * FROM companies WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results[0] || null);
  });
});

module.exports = router;