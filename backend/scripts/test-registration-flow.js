import app from '../src/app.js';
import http from 'http';

async function testRegistrationFlow() {
  console.log('====================================================');
  console.log('   Testing HostelCare Student Registration Flow');
  console.log('====================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098/api';

  try {
    // 1. Fetch available rooms
    console.log('[Step 1] Fetching available hostel rooms from /api/auth/rooms...');
    const roomsRes = await fetch(`${baseUrl}/auth/rooms`).then((r) => r.json());
    if (!roomsRes.success || !Array.isArray(roomsRes.data) || roomsRes.data.length === 0) {
      throw new Error(`Failed to fetch rooms: ${JSON.stringify(roomsRes)}`);
    }
    console.log(`✓ Successfully retrieved ${roomsRes.data.length} hostel rooms from Supabase.`);
    console.log(`  Sample room: Block ${roomsRes.data[0].block} - Room ${roomsRes.data[0].room_number} (ID: ${roomsRes.data[0].id})\n`);

    const selectedRoom = roomsRes.data[0];

    // 2. Test registration WITHOUT roomId (must be rejected)
    console.log('[Step 2] Testing student registration WITHOUT room selection (expecting 400 failure)...');
    const invalidReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student No Room',
        email: `noroom.${Date.now()}@hostel.edu`,
        password: 'Password@123',
        role: 'student',
        roomId: '', // empty room!
      }),
    });
    const invalidJson = await invalidReg.json();
    if (invalidReg.status === 400 && !invalidJson.success) {
      console.log('✓ Validation correctly REJECTED registration without room selection:');
      console.log(`  Message: ${JSON.stringify(invalidJson.message || invalidJson.errors)}\n`);
    } else {
      throw new Error(`Expected 400 rejection, but got status ${invalidReg.status}: ${JSON.stringify(invalidJson)}`);
    }

    // 3. Test registration with a NON-EXISTENT roomId (must be rejected)
    console.log('[Step 3] Testing student registration with a NON-EXISTENT roomId (expecting 400 failure)...');
    const fakeRoomReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student Fake Room',
        email: `fakeroom.${Date.now()}@hostel.edu`,
        password: 'Password@123',
        role: 'student',
        roomId: '00000000-0000-0000-0000-000000000099',
      }),
    });
    const fakeRoomJson = await fakeRoomReg.json();
    if (fakeRoomReg.status === 400 && !fakeRoomJson.success) {
      console.log('✓ Validation correctly REJECTED registration with non-existent room:');
      console.log(`  Message: ${fakeRoomJson.message}\n`);
    } else {
      throw new Error(`Expected 400 rejection, but got status ${fakeRoomReg.status}: ${JSON.stringify(fakeRoomJson)}`);
    }

    // 4. Test valid student registration with actual room
    const testEmail = `student.reg.${Date.now()}@hostel.edu`;
    console.log(`[Step 4] Testing valid student registration with Room Block ${selectedRoom.block}-${selectedRoom.room_number}...`);
    const validReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Deepa Roy',
        email: testEmail,
        password: 'Password@123',
        role: 'student',
        phone: '+91 98888 77777',
        roomId: selectedRoom.id,
      }),
    });
    const validJson = await validReg.json();
    if (validReg.status === 201 && validJson.success) {
      console.log('✓ Student registration SUCCEEDED:');
      console.log(`  Created User: ${validJson.data.user.name} (${validJson.data.user.email})`);
      console.log(`  Assigned Room ID: ${validJson.data.user.roomId}`);
      console.log(`  JWT Token issued: ${validJson.data.token.slice(0, 30)}...\n`);
    } else {
      throw new Error(`Valid registration failed: ${JSON.stringify(validJson)}`);
    }

    // 5. Test Login with new student credentials
    console.log('[Step 5] Testing login with new student credentials to verify room association...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123',
      }),
    });
    const loginJson = await loginRes.json();
    if (loginJson.success && loginJson.data?.user?.room) {
      console.log('✓ Student login verified with linked room details:');
      console.log(`  Resident: ${loginJson.data.user.name}`);
      console.log(`  Room: Block ${loginJson.data.user.room.block} — Room ${loginJson.data.user.room.room_number} (Floor ${loginJson.data.user.room.floor})\n`);
    } else {
      throw new Error(`Login or room resolution failed: ${JSON.stringify(loginJson)}`);
    }

    console.log('====================================================');
    console.log('   ALL STUDENT ROOM & REGISTRATION TESTS PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('Registration test flow failed:', err);
  } finally {
    server.close();
  }
}

testRegistrationFlow();

