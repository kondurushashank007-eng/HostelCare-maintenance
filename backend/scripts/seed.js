import bcrypt from 'bcryptjs';
import { getSupabase, localDb, isUsingFallbackDb } from '../src/config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('[Seed] Starting HostelCare database seed script...');

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const techPassword = await bcrypt.hash('Tech@123', salt);
  const studentPassword = await bcrypt.hash('Student@123', salt);

  // 1. Hostel Rooms
  const rooms = [
    { id: '11111111-1111-1111-1111-111111111101', block: 'A', room_number: '101', floor: 1, capacity: 2 },
    { id: '11111111-1111-1111-1111-111111111102', block: 'A', room_number: '102', floor: 1, capacity: 2 },
    { id: '11111111-1111-1111-1111-111111111201', block: 'A', room_number: '201', floor: 2, capacity: 2 },
    { id: '11111111-1111-1111-1111-111111111204', block: 'A', room_number: '204', floor: 2, capacity: 2 },
    { id: '22222222-2222-2222-2222-222222222105', block: 'B', room_number: '105', floor: 1, capacity: 2 },
    { id: '22222222-2222-2222-2222-222222222202', block: 'B', room_number: '202', floor: 2, capacity: 2 },
    { id: '22222222-2222-2222-2222-222222222301', block: 'B', room_number: '301', floor: 3, capacity: 2 },
    { id: '33333333-3333-3333-3333-333333333102', block: 'C', room_number: '102', floor: 1, capacity: 2 },
    { id: '33333333-3333-3333-3333-333333333205', block: 'C', room_number: '205', floor: 2, capacity: 2 },
    { id: '33333333-3333-3333-3333-333333333302', block: 'C', room_number: '302', floor: 3, capacity: 2 },
    { id: '44444444-4444-4444-4444-444444444101', block: 'D', room_number: '101', floor: 1, capacity: 2 },
    { id: '44444444-4444-4444-4444-444444444203', block: 'D', room_number: '203', floor: 2, capacity: 2 },
  ];

  // 2. Users
  const users = [
    // Admin
    {
      id: 'aaaa0000-0000-0000-0000-000000000001',
      name: 'Dr. Ramesh Verma',
      email: 'admin@hostelcare.com',
      password_hash: adminPassword,
      role: 'admin',
      phone: '+91 98765 43210',
      room_id: null,
    },
    // Technicians
    {
      id: 'bbbb0000-0000-0000-0000-000000000001',
      name: 'Rajesh Kumar',
      email: 'rajesh.electrician@hostelcare.com',
      password_hash: techPassword,
      role: 'technician',
      phone: '+91 98111 22334',
      room_id: null,
    },
    {
      id: 'bbbb0000-0000-0000-0000-000000000002',
      name: 'Suresh Sharma',
      email: 'suresh.plumber@hostelcare.com',
      password_hash: techPassword,
      role: 'technician',
      phone: '+91 98222 33445',
      room_id: null,
    },
    {
      id: 'bbbb0000-0000-0000-0000-000000000003',
      name: 'Amit Patel',
      email: 'amit.wifi@hostelcare.com',
      password_hash: techPassword,
      role: 'technician',
      phone: '+91 98333 44556',
      room_id: null,
    },
    {
      id: 'bbbb0000-0000-0000-0000-000000000004',
      name: 'Manoj Singh',
      email: 'manoj.carpenter@hostelcare.com',
      password_hash: techPassword,
      role: 'technician',
      phone: '+91 98444 55667',
      room_id: null,
    },
    // Students
    {
      id: 'cccc0000-0000-0000-0000-000000000001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@hostel.edu',
      password_hash: studentPassword,
      role: 'student',
      phone: '+91 97111 11222',
      room_id: '11111111-1111-1111-1111-111111111204', // Block A - Room 204
    },
    {
      id: 'cccc0000-0000-0000-0000-000000000002',
      name: 'Priya Patel',
      email: 'priya.patel@hostel.edu',
      password_hash: studentPassword,
      role: 'student',
      phone: '+91 97222 22333',
      room_id: '22222222-2222-2222-2222-222222222105', // Block B - Room 105
    },
    {
      id: 'cccc0000-0000-0000-0000-000000000003',
      name: 'Arun Kumar',
      email: 'arun.kumar@hostel.edu',
      password_hash: studentPassword,
      role: 'student',
      phone: '+91 97333 33444',
      room_id: '33333333-3333-3333-3333-333333333302', // Block C - Room 302
    },
  ];

  // 3. Technicians Table
  const technicians = [
    {
      id: 'bbbb0000-0000-0000-0000-000000000001',
      user_id: 'bbbb0000-0000-0000-0000-000000000001',
      specialization: 'Electrical',
      is_available: true,
      active_tasks_count: 2,
      rating_average: 4.8,
    },
    {
      id: 'bbbb0000-0000-0000-0000-000000000002',
      user_id: 'bbbb0000-0000-0000-0000-000000000002',
      specialization: 'Plumbing',
      is_available: true,
      active_tasks_count: 1,
      rating_average: 4.9,
    },
    {
      id: 'bbbb0000-0000-0000-0000-000000000003',
      user_id: 'bbbb0000-0000-0000-0000-000000000003',
      specialization: 'Internet / Wi-Fi',
      is_available: true,
      active_tasks_count: 1,
      rating_average: 4.6,
    },
    {
      id: 'bbbb0000-0000-0000-0000-000000000004',
      user_id: 'bbbb0000-0000-0000-0000-000000000004',
      specialization: 'Furniture',
      is_available: true,
      active_tasks_count: 0,
      rating_average: 4.7,
    },
  ];

  // 4. Complaints
  const complaints = [
    {
      id: 'dddd0000-0000-0000-0000-000000000001',
      complaint_code: 'HC-2025-1011',
      student_id: 'cccc0000-0000-0000-0000-000000000001', // Rahul
      room_id: '11111111-1111-1111-1111-111111111204',
      title: 'Ceiling Fan Making Burning Smell & Sparks',
      description: 'The regulator is hot to touch and whenever we turn the fan speed to 4, small sparks appear inside the ceiling canopy with an electrical burning smell. Urgent hazard.',
      category: 'Electrical',
      priority: 'Urgent',
      status: 'In Progress',
      images: [],
      resolution_images: [],
      assigned_technician_id: 'bbbb0000-0000-0000-0000-000000000001', // Rajesh (Electrician)
      ai_analysis: {
        category_suggested: 'Electrical',
        priority_suggested: 'Urgent',
        suggested_specialization: 'Electrician',
        summary: 'Ceiling fan sparking and emitting burning smell; immediate fire hazard.',
        urgency_flags: ['Safety Hazard Detected', 'Electrical Spark / Fire Risk'],
        confidence: 0.98,
        source: 'gemini-ai',
      },
      is_escalated: false,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'dddd0000-0000-0000-0000-000000000002',
      complaint_code: 'HC-2025-1012',
      student_id: 'cccc0000-0000-0000-0000-000000000002', // Priya
      room_id: '22222222-2222-2222-2222-222222222105',
      title: 'Washbasin Pipe Leaking Heavily in Bathroom',
      description: 'The pipe joint under the sink has cracked and water is continuously flooding the bathroom floor. Tap valve is tight and cannot be turned off manually.',
      category: 'Plumbing',
      priority: 'High',
      status: 'Assigned',
      images: [],
      resolution_images: [],
      assigned_technician_id: 'bbbb0000-0000-0000-0000-000000000002', // Suresh (Plumber)
      ai_analysis: {
        category_suggested: 'Plumbing',
        priority_suggested: 'High',
        suggested_specialization: 'Plumber',
        summary: 'Cracked washbasin joint leaking continuously, causing bathroom flooding.',
        urgency_flags: ['Essential Amenity Disrupted'],
        confidence: 0.95,
        source: 'gemini-ai',
      },
      is_escalated: false,
      created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    },
    {
      id: 'dddd0000-0000-0000-0000-000000000003',
      complaint_code: 'HC-2025-1013',
      student_id: 'cccc0000-0000-0000-0000-000000000003', // Arun
      room_id: '33333333-3333-3333-3333-333333333302',
      title: 'No Wi-Fi Signal on Floor 3 West Wing',
      description: 'Hostel access point AP-C3-02 has all LED lights blinking red. No device can obtain an IP address or access the portal.',
      category: 'Internet / Wi-Fi',
      priority: 'Medium',
      status: 'Pending',
      images: [],
      resolution_images: [],
      assigned_technician_id: null,
      ai_analysis: {
        category_suggested: 'Internet / Wi-Fi',
        priority_suggested: 'Medium',
        suggested_specialization: 'Network / IT Specialist',
        summary: 'Access point blinking red, floor-wide DHCP/connectivity disruption.',
        confidence: 0.92,
        source: 'gemini-ai',
      },
      is_escalated: false,
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      id: 'dddd0000-0000-0000-0000-000000000004',
      complaint_code: 'HC-2025-1008',
      student_id: 'cccc0000-0000-0000-0000-000000000001', // Rahul
      room_id: '11111111-1111-1111-1111-111111111204',
      title: 'Study Table Drawer Broken & Jammed',
      description: 'The wooden slider runner broke off, so the main drawer cannot open or close properly.',
      category: 'Furniture',
      priority: 'Low',
      status: 'Resolved',
      images: [],
      resolution_images: [],
      assigned_technician_id: 'bbbb0000-0000-0000-0000-000000000004', // Manoj
      ai_analysis: {
        category_suggested: 'Furniture',
        priority_suggested: 'Low',
        suggested_specialization: 'Carpenter',
        summary: 'Jammed study table drawer with broken wooden slider.',
        confidence: 0.94,
        source: 'rule-based-engine',
      },
      is_escalated: false,
      resolved_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      closed_at: new Date(Date.now() - 20 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: 'dddd0000-0000-0000-0000-000000000005',
      complaint_code: 'HC-2025-1002',
      student_id: 'cccc0000-0000-0000-0000-000000000002', // Priya
      room_id: '22222222-2222-2222-2222-222222222105',
      title: 'Water Supply Overhead Tank Valve Jammed (No Water)',
      description: 'No running water in any taps for more than 30 hours. Tank supply line is completely dry.',
      category: 'Water Supply',
      priority: 'Urgent',
      status: 'Escalated',
      images: [],
      resolution_images: [],
      assigned_technician_id: 'bbbb0000-0000-0000-0000-000000000002',
      ai_analysis: {
        category_suggested: 'Water Supply',
        priority_suggested: 'Urgent',
        suggested_specialization: 'Plumber',
        summary: 'Overhead tank valve jammed, zero water supply across entire wing for >30 hrs.',
        urgency_flags: ['Safety Hazard Detected', 'Severe Amenity Deprivation'],
        confidence: 0.99,
        source: 'gemini-ai',
      },
      is_escalated: true,
      escalation_reason: 'Automated Escalation: Ticket HC-2025-1002 exceeded 6h threshold for Urgent priority.',
      escalated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
  ];

  // 5. Complaint History
  const complaint_history = [
    {
      id: 'eeee0000-0000-0000-0000-000000000001',
      complaint_id: 'dddd0000-0000-0000-0000-000000000001',
      action: 'Submitted',
      previous_status: null,
      new_status: 'Submitted',
      performed_by: 'cccc0000-0000-0000-0000-000000000001',
      performer_role: 'student',
      remarks: 'Lodged via Student Portal.',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'eeee0000-0000-0000-0000-000000000002',
      complaint_id: 'dddd0000-0000-0000-0000-000000000001',
      action: 'Technician Assigned',
      previous_status: 'Submitted',
      new_status: 'Assigned',
      performed_by: 'aaaa0000-0000-0000-0000-000000000001',
      performer_role: 'admin',
      remarks: 'Assigned to Rajesh Kumar (Electrical Specialist) with Urgent priority.',
      created_at: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    },
    {
      id: 'eeee0000-0000-0000-0000-000000000003',
      complaint_id: 'dddd0000-0000-0000-0000-000000000001',
      action: 'Status Changed to In Progress',
      previous_status: 'Assigned',
      new_status: 'In Progress',
      performed_by: 'bbbb0000-0000-0000-0000-000000000001',
      performer_role: 'technician',
      remarks: 'Technician on-site. Testing capacitor and regulator wiring.',
      created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'eeee0000-0000-0000-0000-000000000004',
      complaint_id: 'dddd0000-0000-0000-0000-000000000004',
      action: 'Resolved',
      previous_status: 'In Progress',
      new_status: 'Resolved',
      performed_by: 'bbbb0000-0000-0000-0000-000000000004',
      performer_role: 'technician',
      remarks: 'Drawer runner replaced with new heavy-duty metal channel. Tested smooth operation.',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'eeee0000-0000-0000-0000-000000000005',
      complaint_id: 'dddd0000-0000-0000-0000-000000000004',
      action: 'Feedback Submitted',
      previous_status: 'Resolved',
      new_status: 'Verified/Closed',
      performed_by: 'cccc0000-0000-0000-0000-000000000001',
      performer_role: 'student',
      remarks: 'Student rated 5/5 stars: "Carpenter fixed it very neatly and promptly!"',
      created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
  ];

  // 6. Feedback
  const feedback = [
    {
      id: 'ffff0000-0000-0000-0000-000000000001',
      complaint_id: 'dddd0000-0000-0000-0000-000000000004',
      student_id: 'cccc0000-0000-0000-0000-000000000001',
      rating: 5,
      comments: 'Carpenter fixed it very neatly and promptly! Excellent service.',
      created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    },
  ];

  // 7. Notifications
  const notifications = [
    {
      id: '99990000-0000-0000-0000-000000000001',
      user_id: 'aaaa0000-0000-0000-0000-000000000001', // Admin
      title: 'Urgent Complaint Lodged: HC-2025-1011',
      message: 'Ceiling Fan Making Burning Smell & Sparks in Room A-204.',
      type: 'alert',
      complaint_id: 'dddd0000-0000-0000-0000-000000000001',
      is_read: false,
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: '99990000-0000-0000-0000-000000000002',
      user_id: 'bbbb0000-0000-0000-0000-000000000001', // Electrician
      title: 'New Task Assigned: HC-2025-1011',
      message: 'Room A-204 ceiling fan spark hazard assigned to you with Urgent priority.',
      type: 'info',
      complaint_id: 'dddd0000-0000-0000-0000-000000000001',
      is_read: false,
      created_at: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    },
    {
      id: '99990000-0000-0000-0000-000000000003',
      user_id: 'cccc0000-0000-0000-0000-000000000001', // Rahul (Student)
      title: 'Technician Assigned',
      message: 'Rajesh Kumar has been dispatched to Room A-204 for your complaint HC-2025-1011.',
      type: 'info',
      complaint_id: 'dddd0000-0000-0000-0000-000000000001',
      is_read: false,
      created_at: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    },
    {
      id: '99990000-0000-0000-0000-000000000004',
      user_id: 'aaaa0000-0000-0000-0000-000000000001', // Admin
      title: 'Ticket Escalated: HC-2025-1002',
      message: 'Overdue water supply complaint in Block B has reached critical escalation threshold.',
      type: 'escalation',
      complaint_id: 'dddd0000-0000-0000-0000-000000000005',
      is_read: false,
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  // Save to Local DB JSON store
  const storePath = path.resolve(__dirname, '../database/local_store.json');
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const storeData = {
    hostel_rooms: rooms,
    users,
    technicians,
    complaints,
    complaint_history,
    feedback,
    notifications,
  };

  fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf8');
  console.log('[Seed] Successfully generated local persistent store at:', storePath);

  // If Supabase is connected, insert into Supabase PostgreSQL
  if (!isUsingFallbackDb()) {
    try {
      const supabase = getSupabase();
      console.log('[Seed] Seeding live Supabase PostgreSQL database...');
      await supabase.from('hostel_rooms').upsert(rooms, { onConflict: 'id' });
      await supabase.from('users').upsert(users, { onConflict: 'id' });
      await supabase.from('technicians').upsert(technicians, { onConflict: 'id' });
      await supabase.from('complaints').upsert(complaints, { onConflict: 'id' });
      await supabase.from('complaint_history').upsert(complaint_history, { onConflict: 'id' });
      await supabase.from('feedback').upsert(feedback, { onConflict: 'id' });
      await supabase.from('notifications').upsert(notifications, { onConflict: 'id' });
      console.log('[Seed] Live Supabase PostgreSQL seeded successfully!');
    } catch (err) {
      console.warn('[Seed] Supabase upsert error (skipping live insert):', err.message);
    }
  }

  console.log('[Seed] Seed completed successfully!');
  console.log('\n--- DEMO ACCOUNTS CREATED ---');
  console.log('Admin:      admin@hostelcare.com              / Admin@123');
  console.log('Electrician:rajesh.electrician@hostelcare.com / Tech@123');
  console.log('Plumber:    suresh.plumber@hostelcare.com     / Tech@123');
  console.log('Student 1:  rahul.sharma@hostel.edu           / Student@123 (Room A-204)');
  console.log('Student 2:  priya.patel@hostel.edu            / Student@123 (Room B-105)');
  console.log('----------------------------\n');
}

runSeed().catch((err) => {
  console.error('[Seed Error]:', err);
});

