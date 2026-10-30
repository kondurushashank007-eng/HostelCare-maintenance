# HostelCare – Smart Hostel Complaint & Maintenance Management System

An AI-powered, full-stack college hostel maintenance and complaint management platform with role-based portals for **Students**, **Wardens / Administrators**, and **Maintenance Technicians**.

---

## 🚀 Live Demo Quick Start

### 1. Prerequisites
- **Node.js**: v18+ or v20+ (Node v26 verified)
- **NPM**: v9+

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
The backend server starts on `http://localhost:5000`.

### 3. Frontend Setup (in a separate terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 One-Click Demo Credentials

On the login page, you can click the **One-Click Hackathon Demo Fill** buttons to immediately test any role:

| Role | Email | Password | Details |
|---|---|---|---|
| **Hostel Warden / Admin** | `admin@hostelcare.com` | `Admin@123` | Dr. Ramesh Verma (Full Control & AI Copilot) |
| **Electrician** | `rajesh.electrician@hostelcare.com` | `Tech@123` | Rajesh Kumar (Electrical Specialist) |
| **Plumber** | `suresh.plumber@hostelcare.com` | `Tech@123` | Suresh Sharma (Plumbing Specialist) |
| **Student Resident 1** | `rahul.sharma@hostel.edu` | `Student@123` | Rahul Sharma (Block A — Room 204) |
| **Student Resident 2** | `priya.patel@hostel.edu` | `Student@123` | Priya Patel (Block B — Room 105) |

---

## 🏛️ System Architecture

```
HOSTELCARE/
├── frontend/                     # React + Vite + Tailwind CSS Single Page App
│   ├── src/
│   │   ├── components/           # Reusable SaaS badges, cards, timeline, modals
│   │   ├── context/              # AuthContext, NotificationContext
│   │   ├── layouts/              # Navbar, Sidebar, AppLayout
│   │   ├── pages/
│   │   │   ├── admin/            # Warden Dashboard, Complaints, Techs, AI Copilot, Reports
│   │   │   ├── student/          # Resident Dashboard, Lodge Issue, Tracking, Profile
│   │   │   └── technician/       # Tech Dashboard, Work Queue, Resolution, History
│   │   ├── routes/               # Role-based protected routing
│   │   └── services/             # Axios API client & endpoints
│   ├── .env                      # Frontend environment
│   └── package.json
│
├── backend/                      # Node.js + Express REST API
│   ├── database/
│   │   └── schema.sql            # Supabase PostgreSQL DDL schema
│   ├── scripts/
│   │   ├── seed.js               # Database demo seed script
│   │   └── verify-api.js         # Complete automated API test suite
│   ├── src/
│   │   ├── config/               # Supabase client & fallback store configuration
│   │   ├── controllers/          # Auth, Complaints, Techs, Feedback, Notifications, Analytics
│   │   ├── middleware/           # JWT Auth, Role RBAC, Error Handler, Multer Upload
│   │   ├── routes/               # Express API route modules
│   │   ├── services/             # Gemini AI SDK, Escalations, Notifications
│   │   ├── utils/                # Logger, Response formatter, Code generator
│   │   ├── validators/           # Zod schema validation
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # HTTP server entrypoint
│   ├── .env                      # Backend environment
│   └── package.json
│
├── .gitignore
├── README.md
└── PROJECT_DOCUMENTATION.md
```

---

## 🧠 Gemini AI Capabilities

HostelCare integrates Google Gemini through protected backend APIs with seamless rule-based offline fallback:

1. **Automated Triage & Priority Classification**: Analyzes complaint descriptions to classify severity into **Low**, **Medium**, **High**, or **Urgent** based on safety hazards, water disruption, or structural danger.
2. **Trade & Specialization Matching**: Automatically identifies whether the issue needs an **Electrician**, **Plumber**, **Network Specialist**, **Carpenter**, or **Housekeeping**.
3. **Duplicate Detection**: Flags existing tickets in the same room or block to avoid redundant repairs.
4. **AI Maintenance Copilot for Wardens**: An interactive chat advisor allowing wardens to query live database metrics (e.g., *"Which block has the most plumbing complaints this week?"*, *"Recommend preventive maintenance actions"*).

---

## 📋 Complete Complaint Workflow

```
Submitted ➔ Pending ➔ Assigned ➔ In Progress ➔ Resolved ➔ Verified/Closed
     ▲                                   │
     └──────── Reopened ◄────────────────┘
                         (or Escalated if SLA overdue)
```

Every state transition records:
- Timestamp
- Responsible user and role
- Concrete audit remarks
- Photo proofs (before & after)

