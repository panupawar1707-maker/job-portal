-- ============================================
-- CareerConnect Full Database Schema
-- Run this entire file in MySQL Workbench
-- ============================================

DROP DATABASE IF EXISTS careerconnect;
CREATE DATABASE careerconnect;
USE careerconnect;

-- ============================================
-- 1. USERS  (candidate / employer / admin)
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'employer', 'admin') NOT NULL DEFAULT 'candidate',
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. COMPANIES  (employer profile)
-- ============================================
CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    company_description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    location VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- 3. JOBS
-- ============================================
CREATE TABLE jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150),
    job_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') DEFAULT 'Full-time',
    salary_min INT,
    salary_max INT,
    skills_required VARCHAR(255),
    status ENUM('open', 'closed') DEFAULT 'open',
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
);

-- ============================================
-- 4. CANDIDATE PROFILES (full professional profile)
-- ============================================
CREATE TABLE candidate_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,

    profile_photo VARCHAR(255),
    mobile_number VARCHAR(15),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin_code VARCHAR(10),

    professional_title VARCHAR(150),
    about_me TEXT,
    employment_status ENUM('Fresher', 'Employed', 'Unemployed', 'Freelancer'),
    experience_years INT DEFAULT 0,
    current_company VARCHAR(150),
    current_job_role VARCHAR(150),
    expected_salary VARCHAR(50),
    preferred_job_location VARCHAR(150),
    employment_type ENUM('Full-time', 'Part-time', 'Internship', 'Remote'),

    highest_qualification VARCHAR(100),
    degree VARCHAR(150),
    college_university VARCHAR(200),
    specialization VARCHAR(150),
    passing_year VARCHAR(4),
    cgpa VARCHAR(10),

    technical_skills VARCHAR(500),
    soft_skills VARCHAR(500),
    languages_known VARCHAR(255),

    work_experience JSON,
    projects JSON,
    certifications JSON,

    resume_url VARCHAR(255),

    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),

    job_category VARCHAR(100),
    notice_period VARCHAR(50),
    willing_to_relocate BOOLEAN DEFAULT FALSE,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- 5. APPLICATIONS
-- ============================================
CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    resume_url VARCHAR(255),
    cover_letter TEXT,
    status ENUM('applied', 'shortlisted', 'rejected', 'hired') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (job_id, candidate_id)
);

-- ============================================
-- 6. SHORTLISTS
-- ============================================
CREATE TABLE shortlists (
    shortlist_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    shortlist_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);

-- ============================================
-- 7. INTERVIEWS
-- ============================================
CREATE TABLE interviews (
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    interview_date DATETIME,
    round VARCHAR(50),
    feedback TEXT,
    result ENUM('pending', 'pass', 'fail') DEFAULT 'pending',
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);

-- ============================================
-- 8. OFFERS
-- ============================================
CREATE TABLE offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    offer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    offer_details TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);

-- ============================================
-- 9. REPORTS (admin)
-- ============================================
CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_data TEXT,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Verify
-- ============================================
SHOW TABLES;
