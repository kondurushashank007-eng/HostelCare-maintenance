import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase.js';
import { config } from '../config/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator.js';

export const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    const supabase = getSupabase();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validated.email.toLowerCase())
      .single();

    if (existingUser) {
      return sendError(res, 'User with this email already registered', 400);
    }

    // Validate that student provides an actual existing hostel room
    if (validated.role === 'student') {
      if (!validated.roomId) {
        return sendError(res, 'Hostel block and room selection is required for student registration', 400);
      }
      const { data: roomExists, error: roomCheckErr } = await supabase
        .from('hostel_rooms')
        .select('id, block, room_number')
        .eq('id', validated.roomId)
        .single();

      if (roomCheckErr || !roomExists) {
        return sendError(res, 'Selected hostel room was not found in database. Please choose a valid room.', 400);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const newUser = {
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: validated.role,
      phone: validated.phone || null,
      room_id: validated.roomId || null,
    };

    const { data: createdUser, error } = await supabase
      .from('users')
      .insert(newUser)
      .select();

    if (error) {
      return sendError(res, `Failed to create user: ${error.message}`, 500);
    }

    const userRecord = Array.isArray(createdUser) ? createdUser[0] : createdUser;

    // If technician, create technician profile record
    if (validated.role === 'technician') {
      await supabase.from('technicians').insert({
        user_id: userRecord.id,
        specialization: validated.specialization || 'General Maintenance',
        is_available: true,
        active_tasks_count: 0,
        rating_average: 5.0,
      });
    }

    // Generate JWT
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
    };

    return sendSuccess(res, 'Registration successful', { user: safeUser, token }, 201);
  } catch (err) {
    next(err);
  }
};

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
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
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

    // If technician, fetch technician record
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
    };

    return sendSuccess(res, 'Login successful', { user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, room_id, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return sendError(res, 'User profile not found', 404);
    }

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
      room,
      technician,
    });
  } catch (err) {
    next(err);
  }
};

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

