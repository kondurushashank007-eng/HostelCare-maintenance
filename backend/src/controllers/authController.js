import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase.js';
import { config } from '../config/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  studentRegisterSchema,
  wardenRegisterSchema,
  technicianRegisterSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/authValidator.js';

// Helper to safely parse metadata stored in avatar_url
export const parseUserMeta = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== 'string') return {};
  try {
    if (avatarUrl.startsWith('{') && avatarUrl.endsWith('}')) {
      return JSON.parse(avatarUrl);
    }
  } catch {
    return { avatarUrl };
  }
  return { avatarUrl };
};

// Helper to serialize metadata into avatar_url
export const serializeUserMeta = (existingAvatarUrl, newMeta) => {
  const current = parseUserMeta(existingAvatarUrl);
  return JSON.stringify({ ...current, ...newMeta });
};

// Helper to verify unique employee ID across staff
const checkDuplicateEmployeeId = async (supabase, employeeId) => {
  if (!employeeId) return false;
  const target = employeeId.trim().toLowerCase();
  const { data: allUsers, error } = await supabase.from('users').select('id, avatar_url');
  if (error || !allUsers) return false;

  for (const u of allUsers) {
    const meta = parseUserMeta(u.avatar_url);
    if (meta.employeeId && meta.employeeId.trim().toLowerCase() === target) {
      return true;
    }
  }
  return false;
};

// 1. Student Registration (Self-service, immediate login)
export const registerStudent = async (req, res, next) => {
  try {
    const validated = studentRegisterSchema.parse(req.body);
    const supabase = getSupabase();

    // Check duplicate email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validated.email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 400);
    }

    // Validate hostel room exists
    const { data: roomExists, error: roomCheckErr } = await supabase
      .from('hostel_rooms')
      .select('id, block, room_number')
      .eq('id', validated.roomId)
      .single();

    if (roomCheckErr || !roomExists) {
      return sendError(res, 'Selected hostel room was not found. Please choose a valid room from the list.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const newUser = {
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: 'student',
      phone: validated.phone?.trim() || null,
      room_id: validated.roomId,
      avatar_url: JSON.stringify({
        designation: 'Resident Student',
        isApproved: true,
        approvalStatus: 'approved',
        registeredAt: new Date().toISOString(),
      }),
    };

    const { data: createdUser, error } = await supabase
      .from('users')
      .insert(newUser)
      .select();

    if (error) {
      return sendError(res, `Failed to create student account: ${error.message}`, 500);
    }

    const userRecord = Array.isArray(createdUser) ? createdUser[0] : createdUser;

    const token = jwt.sign(
      {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        roomId: userRecord.room_id,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const safeUser = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      phone: userRecord.phone,
      roomId: userRecord.room_id,
      room: roomExists,
      designation: 'Resident Student',
      isApproved: true,
    };

    return sendSuccess(res, 'Student account registered successfully', { user: safeUser, token }, 201);
  } catch (err) {
    next(err);
  }
};

// 2. Warden Registration (Requires Administrator Approval)
export const registerWarden = async (req, res, next) => {
  try {
    const validated = wardenRegisterSchema.parse(req.body);
    const supabase = getSupabase();

    // Check duplicate email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validated.email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Store warden metadata with pending approval status
    const meta = {
      designation: 'Hostel Warden',
      assignedBlock: validated.assignedBlock,
      isApproved: false,
      approvalStatus: 'pending',
      registeredAt: new Date().toISOString(),
    };

    const newUser = {
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: 'admin', // Stored under management/admin tier with approval guard
      phone: validated.phone.trim(),
      room_id: null,
      avatar_url: JSON.stringify(meta),
    };

    const { data: createdUser, error } = await supabase
      .from('users')
      .insert(newUser)
      .select();

    if (error) {
      return sendError(res, `Failed to submit warden registration: ${error.message}`, 500);
    }

    const userRecord = Array.isArray(createdUser) ? createdUser[0] : createdUser;

    return sendSuccess(
      res,
      'Warden registration submitted successfully! For security, new warden accounts require administrator approval before login is enabled.',
      {
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          role: 'warden',
          designation: 'Hostel Warden',
          assignedBlock: validated.assignedBlock,
          isApproved: false,
          approvalStatus: 'pending',
        },
        requiresApproval: true,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

// 3. Technician Registration (Electrician / Plumber with Employee ID & Admin Approval)
export const registerTechnician = async (req, res, next) => {
  try {
    const validated = technicianRegisterSchema.parse(req.body);
    const supabase = getSupabase();

    // Check duplicate email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validated.email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 400);
    }

    // Check duplicate Employee ID
    const isEmpIdTaken = await checkDuplicateEmployeeId(supabase, validated.employeeId);
    if (isEmpIdTaken) {
      return sendError(
        res,
        `Employee ID '${validated.employeeId}' is already registered with another technician account.`,
        400
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const tradeTitle = validated.trade || (validated.specialization === 'Electrical' ? 'Electrician' : 'Plumber');

    const meta = {
      designation: tradeTitle,
      employeeId: validated.employeeId.trim(),
      assignedBlocks: validated.assignedBlocks,
      specialization: validated.specialization,
      isApproved: false,
      approvalStatus: 'pending',
      registeredAt: new Date().toISOString(),
    };

    const newUser = {
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: 'technician',
      phone: validated.phone.trim(),
      room_id: null,
      avatar_url: JSON.stringify(meta),
    };

    const { data: createdUser, error } = await supabase
      .from('users')
      .insert(newUser)
      .select();

    if (error) {
      return sendError(res, `Failed to submit technician registration: ${error.message}`, 500);
    }

    const userRecord = Array.isArray(createdUser) ? createdUser[0] : createdUser;

    // Create technician profile record
    const { error: techErr } = await supabase.from('technicians').insert({
      user_id: userRecord.id,
      specialization: validated.specialization,
      is_available: false, // Inactive until approved
      active_tasks_count: 0,
      rating_average: 5.0,
    });

    if (techErr) {
      console.warn('Note: Technician profile creation error:', techErr.message);
    }

    return sendSuccess(
      res,
      `${tradeTitle} registration submitted successfully! Your account will be activated once verified by the hostel administration.`,
      {
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          role: 'technician',
          designation: tradeTitle,
          employeeId: validated.employeeId,
          assignedBlocks: validated.assignedBlocks,
          specialization: validated.specialization,
          isApproved: false,
          approvalStatus: 'pending',
        },
        requiresApproval: true,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

// 4. Backward-compatible generic registration
export const register = async (req, res, next) => {
  try {
    const role = req.body.role || 'student';
    if (role === 'warden') return registerWarden(req, res, next);
    if (role === 'technician' || role === 'electrician' || role === 'plumber') {
      const specialization =
        req.body.specialization || (role === 'electrician' ? 'Electrical' : role === 'plumber' ? 'Plumbing' : 'General Maintenance');
      req.body.specialization = specialization;
      req.body.trade = role === 'electrician' ? 'Electrician' : role === 'plumber' ? 'Plumber' : 'Technician';
      return registerTechnician(req, res, next);
    }
    return registerStudent(req, res, next);
  } catch (err) {
    next(err);
  }
};

// 5. User Login with Security Verification
export const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', validated.email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Inspect user metadata for approval status
    const meta = parseUserMeta(user.avatar_url);

    // Security Gate: Check if account requires administrative approval
    if (meta.isApproved === false || meta.approvalStatus === 'pending') {
      const roleName = meta.designation || (user.role === 'admin' ? 'Warden' : 'Technician');
      return sendError(
        res,
        `Your ${roleName} account is currently pending administrator verification. Please contact the Chief Administrator / Warden Office for approval.`,
        403
      );
    }

    // Fetch room details if assigned
    let roomDetails = null;
    if (user.room_id) {
      const { data: room } = await supabase
        .from('hostel_rooms')
        .select('*')
        .eq('id', user.room_id)
        .single();
      roomDetails = room || null;
    }

    // Fetch technician record if technician
    let technicianDetails = null;
    if (user.role === 'technician') {
      const { data: tech } = await supabase
        .from('technicians')
        .select('*')
        .eq('user_id', user.id)
        .single();
      technicianDetails = tech || null;
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomId: user.room_id,
        technicianId: technicianDetails ? technicianDetails.id : null,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      roomId: user.room_id,
      room: roomDetails,
      technician: technicianDetails,
      designation: meta.designation || (user.role === 'admin' ? 'Administrator' : user.role === 'technician' ? 'Technician' : 'Student'),
      employeeId: meta.employeeId || null,
      assignedBlocks: meta.assignedBlocks || null,
      assignedBlock: meta.assignedBlock || null,
      isApproved: meta.isApproved !== false,
    };

    return sendSuccess(res, 'Login successful', { user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

// 6. User Profile
export const getProfile = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, room_id, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return sendError(res, 'User profile not found', 404);
    }

    const meta = parseUserMeta(user.avatar_url);

    let room = null;
    if (user.room_id) {
      const { data: roomData } = await supabase
        .from('hostel_rooms')
        .select('*')
        .eq('id', user.room_id)
        .single();
      room = roomData || null;
    }

    let technician = null;
    if (user.role === 'technician') {
      const { data: techData } = await supabase
        .from('technicians')
        .select('*')
        .eq('user_id', user.id)
        .single();
      technician = techData || null;
    }

    return sendSuccess(res, 'Profile retrieved', {
      ...user,
      designation: meta.designation || (user.role === 'admin' ? 'Administrator' : user.role === 'technician' ? 'Technician' : 'Student'),
      employeeId: meta.employeeId || null,
      assignedBlocks: meta.assignedBlocks || null,
      assignedBlock: meta.assignedBlock || null,
      isApproved: meta.isApproved !== false,
      room,
      technician,
    });
  } catch (err) {
    next(err);
  }
};

// 7. Update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const supabase = getSupabase();

    const updates = {};
    if (validated.name) updates.name = validated.name.trim();
    if (validated.phone !== undefined) updates.phone = validated.phone;
    if (validated.roomId !== undefined) updates.room_id = validated.roomId;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id);

    if (error) {
      return sendError(res, `Failed to update profile: ${error.message}`, 500);
    }

    return sendSuccess(res, 'Profile updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// 8. Get Hostel Rooms
export const getRooms = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: rooms, error } = await supabase
      .from('hostel_rooms')
      .select('*')
      .order('block', { ascending: true })
      .order('room_number', { ascending: true });

    if (error) {
      return sendError(res, 'Failed to fetch rooms', 500);
    }

    return sendSuccess(res, 'Hostel rooms retrieved', rooms || []);
  } catch (err) {
    next(err);
  }
};

// 9. Admin Review: Get Pending Staff Registrations
export const getPendingStaff = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, avatar_url, created_at')
      .in('role', ['admin', 'technician']);

    if (error) {
      return sendError(res, `Failed to fetch staff: ${error.message}`, 500);
    }

    const pendingList = (users || [])
      .map((u) => {
        const meta = parseUserMeta(u.avatar_url);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          designation: meta.designation || (u.role === 'admin' ? 'Warden' : 'Technician'),
          employeeId: meta.employeeId || 'N/A',
          assignedBlocks: meta.assignedBlocks || (meta.assignedBlock ? [meta.assignedBlock] : []),
          isApproved: meta.isApproved !== false,
          approvalStatus: meta.approvalStatus || 'approved',
          registeredAt: meta.registeredAt || u.created_at,
        };
      })
      .filter((u) => !u.isApproved || u.approvalStatus === 'pending');

    return sendSuccess(res, 'Pending staff registrations retrieved', pendingList);
  } catch (err) {
    next(err);
  }
};

// 10. Admin Action: Approve Staff Registration
export const approveStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (findErr || !user) {
      return sendError(res, 'Staff member not found', 404);
    }

    const meta = parseUserMeta(user.avatar_url);
    const updatedMeta = {
      ...meta,
      isApproved: true,
      approvalStatus: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: req.user.id,
    };

    const { error: updateErr } = await supabase
      .from('users')
      .update({ avatar_url: JSON.stringify(updatedMeta) })
      .eq('id', id);

    if (updateErr) {
      return sendError(res, `Failed to approve staff member: ${updateErr.message}`, 500);
    }

    // If technician, activate them in technicians table
    if (user.role === 'technician') {
      await supabase
        .from('technicians')
        .update({ is_available: true })
        .eq('user_id', id);
    }

    return sendSuccess(res, `Staff member '${user.name}' has been approved and granted portal access.`);
  } catch (err) {
    next(err);
  }
};
