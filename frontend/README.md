# HostelCare Frontend

Premium SaaS-style Single Page Web Application built with React, Vite, and Tailwind CSS for **HostelCare – Smart Hostel Complaint & Maintenance Management System**.

## Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Navy Blue, White, and Sky Blue modern SaaS theme)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **Icons**: Lucide React

## Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `VITE_API_URL` points to your backend instance:
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Features & Portals
- **Student Portal**:
  - Lodge complaints with photo upload & live Gemini AI pre-check
  - Real-time complaint progress tracking and complete audit timeline
  - Star ratings & feedback upon resolution
  - Reopen unresolved complaints with automated warden escalation
- **Admin / Warden Portal**:
  - Live command center with KPI cards, category breakdown, and block heatmaps
  - Interactive **Gemini AI Maintenance Copilot** to query database trends
  - Technician workload balancing and assignment
  - Automated SLA escalation triggers
- **Technician Portal**:
  - Assigned task queue with priority alerts (urgent highlighted)
  - Work progress update & completion photo upload
  - Resolved history archive with resident ratings

