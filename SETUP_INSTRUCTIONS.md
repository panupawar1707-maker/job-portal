# CareerConnect — Complete Project Setup

## 1. Replace your old project folder

1. Close VS Code and stop both servers (Ctrl+C in each terminal).
2. Rename your old `CareerConnect` folder to `CareerConnect_OLD` (backup, don't delete yet).
3. Unzip this download so you get a new `CareerConnect` folder in the same location
   (e.g. `C:\Users\LENOVO\Desktop\CareerConnect`).
4. Open the new `CareerConnect` folder in VS Code (File → Open Folder).

## 2. Database — run the schema

1. Open MySQL Workbench, connect to your local server.
2. Open `backend/schema.sql` (File → Open SQL Script).
3. Run the entire file (the lightning bolt / Ctrl+Shift+Enter to run all).
   This DROPS and recreates the `careerconnect` database with all 9 tables:
   users, companies, jobs, candidate_profiles, applications, shortlists,
   interviews, offers, reports.
4. Verify: `SHOW TABLES;` inside `careerconnect`.

⚠️ This wipes any old data. If you need your old test users, open your old
schema first and note down anything important before running this.

## 3. Backend setup

```
cd backend
npm install
```

Create a real `.env` file (copy `.env.example` and rename to `.env`), then edit
the password:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourrealpassword
DB_NAME=careerconnect
PORT=5000
```

Start it:
```
node server.js
```
You should see:
```
✅ MySQL Database connected successfully
🚀 Server running on http://localhost:5000
```

## 4. Frontend setup

Open a **second terminal**:
```
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 5. Create your Admin account

Admins can't self-register (by design — security). Register normally as a
candidate first, then in MySQL Workbench:
```sql
UPDATE users SET role = 'admin' WHERE email = 'youradmin@example.com';
```

## 6. Full flow to test

1. Register as a **Job Seeker** → auto-redirected to `/create-profile`
2. Fill out the profile (sidebar sections) → Save → redirected to `/dashboard`
3. Go to "My Resume" in navbar → see your ATS-friendly resume, click
   "Download / Print PDF" to save it
4. Logout, register as an **Employer** → login → redirected to
   `/employer-dashboard`
5. Click "+ Post a New Job" → fill it in → it appears on `/jobs` for everyone
6. Login back as the candidate → apply to that job → it now shows in their
   Dashboard → Applications tab
7. Login as employer again → Employer Dashboard → "View Applicants" on that
   job → Shortlist / Reject / Schedule Interview / Send Offer
8. Login as candidate again → Dashboard → Interviews / Offers tabs now show
   real data
9. Login as admin → `/admin` → Overview stats, manage Users, manage Jobs

## What's new in this version vs. what you had

- Fixed a bug in your uploaded `server.js` (it was missing the `jobRoutes`
  import — you'd have gotten a crash on `/api/jobs`)
- Added: Employer Dashboard, View Applicants (shortlist/reject/interview/
  offer), Admin Dashboard, ATS-Friendly Resume Builder (auto-generated from
  the candidate profile, printable to PDF)
- Login now redirects by role: candidate → profile check → dashboard,
  employer → employer dashboard, admin → admin panel
- All database tables match your original ERD (Resume, Shortlist, Interview,
  Offer, Reports included)

## Database tables (9 total)

| Table | Purpose |
|---|---|
| users | All accounts — candidate / employer / admin |
| companies | Employer's company profile |
| jobs | Job postings |
| candidate_profiles | Full profile (personal, professional, education, skills, experience, projects, certifications, resume, social, preferences) |
| applications | Candidate ↔ Job applications, with status |
| shortlists | Auto-logged when an application is shortlisted |
| interviews | Interview rounds per application |
| offers | Offers sent per application |
| reports | Reserved for admin-generated reports |

Everything connects through `user_id` / `job_id` / `application_id` foreign
keys exactly as in your ERD.
