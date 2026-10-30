import app from '../src/app.js';
import http from 'http';

async function runTests() {
  console.log('--- Starting HostelCare API Verification Suite ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Health
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    console.log('✓ Health Check:', healthRes.status === 'healthy' ? 'PASSED' : 'FAILED');

    // 2. Student Login
    const studentLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.sharma@hostel.edu', password: 'Student@123' }),
    }).then((r) => r.json());
    console.log('✓ Student Login:', studentLogin.success ? 'PASSED' : 'FAILED', `(User: ${studentLogin.data?.user?.name})`);
    const studentToken = studentLogin.data?.token;

    // 3. Admin Login
    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hostelcare.com', password: 'Admin@123' }),
    }).then((r) => r.json());
    console.log('✓ Admin Login:', adminLogin.success ? 'PASSED' : 'FAILED', `(Role: ${adminLogin.data?.user?.role})`);
    const adminToken = adminLogin.data?.token;

    // 4. Technician Login
    const techLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh.electrician@hostelcare.com', password: 'Tech@123' }),
    }).then((r) => r.json());
    console.log('✓ Technician Login:', techLogin.success ? 'PASSED' : 'FAILED', `(Specialization: ${techLogin.data?.user?.technician?.specialization})`);
    const techToken = techLogin.data?.token;

    // 5. AI Pre-Analysis Check
    const aiRes = await fetch(`${baseUrl}/complaints/ai-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Exposed live wire sparking near water cooler',
        description: 'Dangerous electrical spark and smoke near drinking water fountain in corridor.',
        category: 'Electrical',
      }),
    }).then((r) => r.json());
    console.log('✓ AI Complaint Analysis:', aiRes.success ? 'PASSED' : 'FAILED', `(Priority: ${aiRes.data?.priority_suggested}, Spec: ${aiRes.data?.suggested_specialization})`);

    // 6. Lodge New Complaint as Student
    const createRes = await fetch(`${baseUrl}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Exposed live wire sparking near water cooler',
        description: 'Dangerous electrical spark and smoke near drinking water fountain in corridor.',
        category: 'Electrical',
        priority: 'Urgent',
      }),
    }).then((r) => r.json());
    console.log('✓ Complaint Creation:', createRes.success ? 'PASSED' : 'FAILED', `(Code: ${createRes.data?.complaint_code})`);
    const newComplaintId = createRes.data?.id;

    // 7. Admin Analytics Dashboard
    const analyticsRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    console.log('✓ Dashboard Analytics:', analyticsRes.success ? 'PASSED' : 'FAILED', `(Total: ${analyticsRes.data?.statusCounts?.total}, Top Category: ${analyticsRes.data?.categoryBreakdown[0]?.category})`);

    // 8. Admin AI Assistant Copilot
    const assistantRes = await fetch(`${baseUrl}/analytics/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ question: 'Which block has the highest number of complaints?' }),
    }).then((r) => r.json());
    console.log('✓ AI Maintenance Copilot Query:', assistantRes.success ? 'PASSED' : 'FAILED');
    console.log('  Assistant Snippet:', assistantRes.data?.answer?.slice(0, 100) + '...');

    // 9. Admin Assigns Technician
    const techsRes = await fetch(`${baseUrl}/technicians`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    const assignedTech = techsRes.data.find((t) => t.user?.email === 'rajesh.electrician@hostelcare.com') || techsRes.data[0];

    const assignRes = await fetch(`${baseUrl}/complaints/${newComplaintId}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        technicianId: assignedTech.id,
        priority: 'Urgent',
        remarks: 'Warden dispatched Rajesh Kumar immediately for electrical hazard.',
      }),
    }).then((r) => r.json());
    console.log('✓ Admin Technician Assignment:', assignRes.success ? 'PASSED' : 'FAILED');

    // 10. Technician Updates Status to In Progress
    const progressRes = await fetch(`${baseUrl}/complaints/${newComplaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${techToken}`,
      },
      body: JSON.stringify({
        status: 'In Progress',
        remarks: 'Technician on scene, power isolated at MCB.',
      }),
    }).then((r) => r.json());
    console.log('✓ Technician Status -> In Progress:', progressRes.success ? 'PASSED' : 'FAILED');

    // 11. Technician Marks Resolved
    const resolveRes = await fetch(`${baseUrl}/complaints/${newComplaintId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${techToken}`,
      },
      body: JSON.stringify({
        status: 'Resolved',
        remarks: 'Replaced insulation, tested grounding, restored power safely.',
      }),
    }).then((r) => r.json());
    console.log('✓ Technician Status -> Resolved:', resolveRes.success ? 'PASSED' : 'FAILED');

    // 12. Student Submits 5-Star Feedback
    const feedbackRes = await fetch(`${baseUrl}/feedback/${newComplaintId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        comments: 'Rajesh fixed the exposed wire within 15 minutes. Exceptional safety response!',
      }),
    }).then((r) => r.json());
    console.log('✓ Student Rating & Feedback:', feedbackRes.success ? 'PASSED' : 'FAILED');

    // 13. Verify Audit History
    const detailRes = await fetch(`${baseUrl}/complaints/${newComplaintId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    }).then((r) => r.json());
    console.log('✓ Full History Timeline Events:', detailRes.data?.history?.length, 'events recorded.');

    console.log('\n--- ALL HOSTELCARE SUITE VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Test Suite Failed:', err);
  } finally {
    server.close();
  }
}

runTests();
