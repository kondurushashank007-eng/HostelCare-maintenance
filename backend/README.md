# HostelCare Backend API

The Node.js / Express.js REST API powering **HostelCare – Smart Hostel Complaint & Maintenance Management System**.

## Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`) with offline JSON fallback engine
- **Authentication**: JWT & bcryptjs
- **Validation**: Zod
- **AI Integration**: Official `@google/genai` SDK + Rule-Based Fallback Engine
- **File Uploads**: Multer (Local & Supabase Storage ready)

## Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Note on Database**: If you haven't set up a live Supabase project yet, HostelCare's database adapter automatically activates the local fallback store (`database/local_store.json`), allowing instant full offline testing with 100% of all features functioning out of the box! When you provide valid `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, it routes all queries directly to your Supabase PostgreSQL tables.

## Database Initialization
Run the database schema in Supabase SQL editor:
`backend/database/schema.sql`

To seed initial demo accounts, rooms, technicians, and complaints:
```bash
npm run seed
```

## Running the Backend
```bash
# Start development server with auto-reload
npm run dev

# Or start standard production server
npm start

# Run API test verification suite
node scripts/verify-api.js
```

## Demo Credentials
| Role | Email | Password | Notes |
|---|---|---|---|
| **Hostel Warden / Admin** | `admin@hostelcare.com` | `Admin@123` | Full administrative control & AI Copilot |
| **Electrician** | `rajesh.electrician@hostelcare.com` | `Tech@123` | Electrical trade technician |
| **Plumber** | `suresh.plumber@hostelcare.com` | `Tech@123` | Plumbing & Water Supply technician |
| **Student (Resident 1)** | `rahul.sharma@hostel.edu` | `Student@123` | Block A — Room 204 |
| **Student (Resident 2)** | `priya.patel@hostel.edu` | `Student@123` | Block B — Room 105 |

