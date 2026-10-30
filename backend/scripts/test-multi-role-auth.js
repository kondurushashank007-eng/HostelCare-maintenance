import express from 'express';
import cors from 'cors';
import authRoutes from '../src/routes/authRoutes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { getSupabase } from '../src/config/supabase.js';

// Setup test express app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

const server = app.listen(5099, async () => {
  console.log('--- STARTING HOSTELCARE MULTI-ROLE AUTH TEST SUITE ---\n');

  const BASE_URL = 'http://127.0.0.1:5099/api/auth';
  const sb = getSupabase();
  const testIdsToClean = [];

  try {
    // 0. Ensure at least one room exists for student registration test
    const { data: rooms } = await sb.from('hostel_rooms').select('id, block, room_number').limit(1);
    let testRoomId = rooms?.[0]?.id;
    if (!testRoomId) {
      const { data: newRoom } = await sb.from('hostel_rooms').insert({
        block: 'TEST-A',
        room_number: '999',
        floor: 1,
        capacity: 2
      }).select();
      testRoomId = (Array.isArray(newRoom) ? newRoom[0] : newRoom).id;
      console.log('Created temporary test room:', testRoomId);
    }

    const timestamp = Date.now();

    // TEST 1: Student Registration
    console.log('[TEST 1] Testing Student Registration (/register/student)...');
    const studentEmail = `test.student.${timestamp}@hostel.edu`;
    const studentRes = await fetch(`${BASE_URL}/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student Rahul',
        email: studentEmail,
        phone: '+91 99999 11111',
        roomId: testRoomId,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });
    const studentData = await studentRes.json();
    console.log('Status:', studentRes.status, 'Success:', studentData.success);
    if (!studentData.success || !studentData.data?.token || studentData.data?.user?.role !== 'student') {
      throw new Error(`Student registration failed: ${JSON.stringify(studentData)}`);
    }
    testIdsToClean.push(studentData.data.user.id);
    console.log('✓ Student registered and received JWT token successfully.\n');

    // TEST 2: Student Missing Room Validation
    console.log('[TEST 2] Testing Student Missing Room Validation...');
    const invalidStudentRes = await fetch(`${BASE_URL}/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Student',
        email: `invalid.${timestamp}@hostel.edu`,
        roomId: '', // Empty room
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });
    console.log('Status:', invalidStudentRes.status, '(Expected 400)');
    if (invalidStudentRes.status !== 400) {
      throw new Error('Expected 400 for student registration without room selection');
    }
    console.log('✓ Student missing room validation passed.\n');

    // TEST 3: Warden Registration (Pending Approval)
    console.log('[TEST 3] Testing Warden Registration (/register/warden)...');
    const wardenEmail = `test.warden.${timestamp}@hostelcare.com`;
    const wardenRes = await fetch(`${BASE_URL}/register/warden`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Warden K. Raman',
        email: wardenEmail,
        phone: '+91 99999 22222',
        assignedBlock: 'Block A',
        password: 'WardenPassword@123',
        confirmPassword: 'WardenPassword@123',
      }),
    });
    const wardenData = await wardenRes.json();
    console.log('Status:', wardenRes.status, 'RequiresApproval:', wardenData.data?.requiresApproval);
    if (!wardenData.success || !wardenData.data?.requiresApproval) {
      throw new Error(`Warden registration failed: ${JSON.stringify(wardenData)}`);
    }
    const wardenId = wardenData.data.user.id;
    testIdsToClean.push(wardenId);
    console.log('✓ Warden registered with requiresApproval flag.\n');

    // TEST 4: Unapproved Warden Login Attempt
    console.log('[TEST 4] Testing Unapproved Warden Login Attempt (Should be 403)...');
    const unapprovedWardenLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: wardenEmail,
        password: 'WardenPassword@123',
      }),
    });
    const unapprovedWardenLoginData = await unapprovedWardenLoginRes.json();
    console.log('Status:', unapprovedWardenLoginRes.status, 'Message:', unapprovedWardenLoginData.message);
    if (unapprovedWardenLoginRes.status !== 403) {
      throw new Error('Expected 403 Forbidden for unapproved warden login attempt');
    }
    console.log('✓ Security check passed: Unapproved warden blocked from unrestricted login.\n');

    // TEST 5: Electrician Registration (/register/technician)
    console.log('[TEST 5] Testing Electrician Registration...');
    const elecEmail = `test.elec.${timestamp}@hostelcare.com`;
    const testElecEmpId = `EMP-TEST-ELEC-${timestamp.toString().slice(-4)}`;
    const elecRes = await fetch(`${BASE_URL}/register/technician`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Electrician Test Worker',
        email: elecEmail,
        phone: '+91 99999 33333',
        employeeId: testElecEmpId,
        assignedBlocks: ['Block A', 'Block B'],
        specialization: 'Electrical',
        trade: 'Electrician',
        password: 'TechPassword@123',
        confirmPassword: 'TechPassword@123',
      }),
    });
    const elecData = await elecRes.json();
    console.log('Status:', elecRes.status, 'Specialization:', elecData.data?.user?.specialization);
    if (!elecData.success || elecData.data?.user?.specialization !== 'Electrical') {
      throw new Error(`Electrician registration failed: ${JSON.stringify(elecData)}`);
    }
    const elecId = elecData.data.user.id;
    testIdsToClean.push(elecId);
    console.log('✓ Electrician registered successfully with Employee ID and Blocks.\n');

    // TEST 6: Duplicate Employee ID Rejection
    console.log('[TEST 6] Testing Duplicate Employee ID Rejection...');
    const duplicateEmpIdRes = await fetch(`${BASE_URL}/register/technician`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Electrician',
        email: `another.elec.${timestamp}@hostelcare.com`,
        phone: '+91 99999 44444',
        employeeId: testElecEmpId, // Duplicate ID
        assignedBlocks: ['Block C'],
        specialization: 'Electrical',
        trade: 'Electrician',
        password: 'TechPassword@123',
        confirmPassword: 'TechPassword@123',
      }),
    });
    const duplicateEmpIdData = await duplicateEmpIdRes.json();
    console.log('Status:', duplicateEmpIdRes.status, 'Message:', duplicateEmpIdData.message);
    if (duplicateEmpIdRes.status !== 400) {
      throw new Error('Expected 400 Bad Request for duplicate Employee ID');
    }
    console.log('✓ Duplicate Employee ID correctly rejected.\n');

    // TEST 7: Plumber Registration
    console.log('[TEST 7] Testing Plumber Registration...');
    const plumEmail = `test.plum.${timestamp}@hostelcare.com`;
    const testPlumEmpId = `EMP-TEST-PLUM-${timestamp.toString().slice(-4)}`;
    const plumRes = await fetch(`${BASE_URL}/register/technician`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Plumber Test Worker',
        email: plumEmail,
        phone: '+91 99999 55555',
        employeeId: testPlumEmpId,
        assignedBlocks: ['Block B', 'Block C'],
        specialization: 'Plumbing',
        trade: 'Plumber',
        password: 'TechPassword@123',
        confirmPassword: 'TechPassword@123',
      }),
    });
    const plumData = await plumRes.json();
    console.log('Status:', plumRes.status, 'Specialization:', plumData.data?.user?.specialization);
    if (!plumData.success || plumData.data?.user?.specialization !== 'Plumbing') {
      throw new Error(`Plumber registration failed: ${JSON.stringify(plumData)}`);
    }
    const plumId = plumData.data.user.id;
    testIdsToClean.push(plumId);
    console.log('✓ Plumber registered successfully.\n');

    // TEST 8: Admin Login & Staff Approval Workflow
    console.log('[TEST 8] Testing Admin Login & Approving Pending Warden...');
    const adminLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hostelcare.com',
        password: 'Admin@123',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success || !adminLoginData.data?.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    }
    const adminToken = adminLoginData.data.token;
    console.log('Admin authenticated. Token received.');

    // Approve the pending warden
    const approveWardenRes = await fetch(`${BASE_URL}/staff/${wardenId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const approveWardenData = await approveWardenRes.json();
    console.log('Approval response:', approveWardenData.message);
    if (!approveWardenData.success) {
      throw new Error(`Warden approval failed: ${JSON.stringify(approveWardenData)}`);
    }

    // Now attempt warden login after approval (Should be 200 OK!)
    const approvedWardenLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: wardenEmail,
        password: 'WardenPassword@123',
      }),
    });
    const approvedWardenLoginData = await approvedWardenLoginRes.json();
    console.log('Status after approval:', approvedWardenLoginRes.status, 'Success:', approvedWardenLoginData.success);
    if (!approvedWardenLoginData.success || !approvedWardenLoginData.data?.token) {
      throw new Error('Approved warden should be allowed to login!');
    }
    console.log('✓ Approved warden successfully logged in and received portal token.\n');

    // Clean up test records
    console.log('[CLEANUP] Cleaning up test records from database...');
    for (const id of testIdsToClean) {
      try {
        await sb.from('technicians').delete().eq('user_id', id);
        await sb.from('users').delete().eq('id', id);
      } catch (e) {}
    }
    console.log('✓ Test records cleaned up.\n');

    console.log('====================================================');
    console.log('ALL MULTI-ROLE AUTH & SECURITY TESTS PASSED! 100% OK');
    console.log('====================================================');
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
});

