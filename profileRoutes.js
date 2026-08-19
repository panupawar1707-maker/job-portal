const express = require('express');
const db = require('../config/db');

const router = express.Router();

const FIELDS = [
  'profile_photo', 'mobile_number', 'date_of_birth', 'gender', 'address',
  'city', 'state', 'country', 'pin_code', 'professional_title', 'about_me',
  'employment_status', 'experience_years', 'current_company', 'current_job_role',
  'expected_salary', 'preferred_job_location', 'employment_type',
  'highest_qualification', 'degree', 'college_university', 'specialization',
  'passing_year', 'cgpa', 'technical_skills', 'soft_skills', 'languages_known',
  'work_experience', 'projects', 'certifications', 'resume_url',
  'linkedin_url', 'github_url', 'portfolio_url', 'job_category',
  'notice_period', 'willing_to_relocate',
];

const ENUM_FIELDS = ['gender', 'employment_status', 'employment_type'];
const JSON_FIELDS = ['work_experience', 'projects', 'certifications'];

function sanitizeValue(field, rawValue) {
  if (JSON_FIELDS.includes(field)) {
    return JSON.stringify(rawValue || []);
  }
  if (field === 'willing_to_relocate') {
    return rawValue ? 1 : 0;
  }
  if (field === 'experience_years') {
    const n = parseInt(rawValue, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  if (field === 'date_of_birth') {
    if (!rawValue || rawValue.trim() === '') return null;
    // Extract just the YYYY-MM-DD part, in case a full ISO datetime string is sent
    return rawValue.split('T')[0];
}
  if (ENUM_FIELDS.includes(field)) {
    return rawValue && rawValue.trim() !== '' ? rawValue : null;
  }
  if (rawValue === undefined || rawValue === '') return null;
  return rawValue;
}

router.post('/create', (req, res) => {
  const { user_id, ...profileData } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  const values = FIELDS.map((f) => sanitizeValue(f, profileData[f]));

  db.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [user_id], (err, results) => {
    if (err) {
      console.error('SELECT error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    if (results.length > 0) {
      const setClause = FIELDS.map((f) => `${f} = ?`).join(', ');
      db.query(
        `UPDATE candidate_profiles SET ${setClause} WHERE user_id = ?`,
        [...values, user_id],
        (err) => {
          if (err) {
            console.error('UPDATE error:', err);
            return res.status(500).json({ message: 'Failed to update profile', error: err.message });
          }
          res.status(200).json({ message: 'Profile updated successfully' });
        }
      );
    } else {
      const placeholders = FIELDS.map(() => '?').join(', ');
      db.query(
        `INSERT INTO candidate_profiles (user_id, ${FIELDS.join(', ')}) VALUES (?, ${placeholders})`,
        [user_id, ...values],
        (err, result) => {
          if (err) {
            console.error('INSERT error:', err);
            return res.status(500).json({ message: 'Failed to create profile', error: err.message });
          }
          res.status(201).json({ message: 'Profile created successfully', profileId: result.insertId });
        }
      );
    }
  });
});

router.get('/check/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json({ hasProfile: results.length > 0, profile: results[0] || null });
  });
});

router.get('/:user_id', (req, res) => {
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