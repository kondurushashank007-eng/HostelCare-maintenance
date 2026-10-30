# HostelCare – Technical Project Documentation

## 1. System Overview
**HostelCare** is an enterprise-grade, responsive, full-stack web application engineered to modernize maintenance management across college hostels. It replaces manual registers and WhatsApp messages with a centralized, automated platform that connects students, wardens, and technicians.

---

## 2. Technology Stack & Design Decisions

### Frontend
- **React.js 18** with **Vite**: Rapid hot module replacement and lightweight production bundle.
- **Tailwind CSS**: Navy blue (`#0f172a`), Sky blue (`#0284c7`), and slate neutral palette designed according to modern SaaS standards.
- **React Router DOM v6**: Nested routes with role-based `ProtectedRoute` guards.
- **Axios**: HTTP client equipped with request interceptors for automatic JWT token injection and response interceptors for 401 handling.
- **Lucide React**: Clean icons.

### Backend
- **Node.js (ES Modules) + Express.js**: Modular controller-service architecture.
- **JWT (JSON Web Tokens) & bcryptjs**: Cryptographically secure token signing with salted bcrypt hashing for passwords.
- **Zod**: Strict runtime schema validation for incoming HTTP payloads.
- **Multer**: Multi-file multipart handler for JPEG, PNG, and WebP complaint & resolution photos.
- **Database Engine**: Dual-mode database layer:
  - **Supabase PostgreSQL**: Live database client utilizing `@supabase/supabase-js`.
  - **Resilient Fallback Engine**: Built-in mock database mirroring the Supabase query builder interface for offline testing.

### Artificial Intelligence
- **Google Gemini API**: Official `@google/genai` JavaScript SDK.
- **Intelligent Fallback Engine**: Rule-based natural language parser that ensures 100% system availability even when API quotas are exhausted or internet connectivity is disrupted.

---

## 3. Database Schema

### Table Definitions (`database/schema.sql`)
1. **`hostel_rooms`**:
   - `id` (UUID PK): Unique identifier.
   - `block` (VARCHAR): Hostel wing (e.g., A, B, C, D).
   - `room_number` (VARCHAR): Room number (e.g., 101, 204).
   - `floor` (INTEGER): Floor level.
   - `capacity` (INTEGER): Number of resident beds.
   - Constraint: `UNIQUE(block, room_number)`.

2. **`users`**:
   - `id` (UUID PK): Unique identifier.
   - `name` (VARCHAR): User's full name.
   - `email` (VARCHAR UNIQUE): College email ID.
   - `password_hash` (VARCHAR): 10-round bcrypt salted hash.
   - `role` (VARCHAR): Enum `student`, `admin`, `technician`.
   - `phone` (VARCHAR): Mobile contact number.
   - `room_id` (UUID FK): References `hostel_rooms(id)`.

3. **`technicians`**:
   - `id` (UUID PK): Technician identifier.
   - `user_id` (UUID FK UNIQUE): References `users(id)`.
   - `specialization` (VARCHAR): Trade (Electrical, Plumbing, Wi-Fi, Furniture, etc.).
   - `is_available` (BOOLEAN): On-duty status flag.
   - `active_tasks_count` (INTEGER): Active workload tracker.
   - `rating_average` (NUMERIC): Running satisfaction score (1.0 to 5.0).

4. **`complaints`**:
   - `id` (UUID PK): Ticket identifier.
   - `complaint_code` (VARCHAR UNIQUE): Unique readable code (e.g. `HC-2025-1011`).
   - `student_id` (UUID FK): References `users(id)`.
   - `room_id` (UUID FK): References `hostel_rooms(id)`.
   - `title` (VARCHAR): Problem title.
   - `description` (TEXT): Full problem description.
   - `category` (VARCHAR): One of the 10 hostel complaint categories.
   - `priority` (VARCHAR): `Low`, `Medium`, `High`, `Urgent`.
   - `status` (VARCHAR): `Submitted`, `Pending`, `Assigned`, `In Progress`, `Resolved`, `Verified/Closed`, `Reopened`, `Escalated`.
   - `images` (JSONB): Array of attached photo URLs.
   - `resolution_images` (JSONB): Array of technician completion proof photos.
   - `assigned_technician_id` (UUID FK): References `technicians(id)`.
   - `ai_analysis` (JSONB): Full Gemini AI diagnostic report.
   - `is_escalated` (BOOLEAN): SLA violation indicator.
   - `escalation_reason` (TEXT): Reason for escalation.
   - `escalated_at`, `resolved_at`, `closed_at`: Timestamp tracking.

5. **`complaint_history`**:
   - `id` (UUID PK): Audit log entry ID.
   - `complaint_id` (UUID FK): References `complaints(id)`.
   - `action` (VARCHAR): Action description.
   - `previous_status`, `new_status` (VARCHAR).
   - `performed_by` (UUID FK): User who executed the action.
   - `performer_role` (VARCHAR).
   - `remarks` (TEXT): Audit comments.
   - `created_at` (TIMESTAMPTZ).

6. **`feedback`**:
   - `id` (UUID PK): Feedback identifier.
   - `complaint_id` (UUID FK UNIQUE): References `complaints(id)`.
   - `student_id` (UUID FK): References `users(id)`.
   - `rating` (INTEGER 1-5): Star rating.
   - `comments` (TEXT): Student review.

7. **`notifications`**:
   - `id` (UUID PK): Notification ID.
   - `user_id` (UUID FK): Targeted user.
   - `title`, `message`, `type` (info, warning, success, alert, escalation).
   - `complaint_id` (UUID FK): Associated ticket.
   - `is_read` (BOOLEAN).

---

## 4. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /register`: Registers student resident with room allocation.
- `POST /login`: Validates password and returns signed JWT token.
- `GET /rooms`: Lists all rooms grouped by hostel block.
- `GET /profile`: Fetches current authenticated user profile.
- `PUT /profile`: Updates phone number and contact details.

### Complaints (`/api/complaints`)
- `POST /`: Student lodges a complaint (triggers automated AI triage).
- `GET /`: Lists complaints filtered by role, status, block, priority, and search.
- `POST /ai-analyze`: Real-time AI pre-triage endpoint for complaint drafting.
- `POST /check-escalations`: Warden triggers automated overdue ticket escalation.
- `GET /:id`: Retrieves full complaint record, technician details, and history timeline.
- `PATCH /:id/status`: Updates complaint status (Technician / Admin).
- `PATCH /:id/assign`: Warden assigns technician and sets priority.
- `PATCH /:id/priority`: Warden overrides priority level.
- `POST /:id/reopen`: Student reopens an unresolved ticket.

### Analytics & AI Assistant (`/api/analytics`)
- `GET /dashboard`: Aggregates KPI counts, category share, block distribution, and technician leaderboard.
- `POST /assistant`: Warden queries Gemini AI copilot with live database context.

### Technicians & Feedback (`/api/technicians`, `/api/feedback`)
- `GET /technicians`: Lists all technicians with active task loads.
- `PATCH /technicians/:id/availability`: Toggles technician duty status.
- `POST /feedback/:complaintId`: Student submits 1-5 star review.

---

## 5. Security & Authorization Matrix

| Endpoint Action | Student | Maintenance Tech | Warden / Admin |
|---|:---:|:---:|:---:|
| Lodge Complaint | ✅ | ❌ | ❌ |
| View Own Complaints | ✅ | ❌ | ✅ |
| View Assigned Tasks | ❌ | ✅ (Assigned only) | ✅ (All) |
| Accept Work & Update Progress | ❌ | ✅ (Assigned only) | ✅ |
| Upload Resolution Photos | ❌ | ✅ (Assigned only) | ✅ |
| Reopen Complaint | ✅ (Own ticket) | ❌ | ❌ |
| Submit Rating & Review | ✅ (Own ticket) | ❌ | ❌ |
| Assign / Reassign Tech | ❌ | ❌ | ✅ |
| Override Priority | ❌ | ❌ | ✅ |
| Query AI Maintenance Copilot | ❌ | ❌ | ✅ |
| Trigger SLA Escalations | ❌ | ❌ | ✅ |

---

## 6. Automated SLA Escalation Engine

Overdue tickets are automatically detected based on priority thresholds:
- **Urgent**: Escalated if unresolved after **6 hours**.
- **High**: Escalated if unresolved after **24 hours**.
- **Medium**: Escalated if unresolved after **48 hours**.
- **Low**: Escalated if unresolved after **72 hours**.

When escalated:
1. `is_escalated` is set to `true` and status updates to `Escalated`.
2. A formal `complaint_history` record is created with role `system`.
3. In-app notifications are dispatched to both the student and all wardens.

