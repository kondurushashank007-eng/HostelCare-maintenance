import { z } from 'zod';

export const studentRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters').optional(),
    phone: z.string().optional(),
    roomId: z.string().min(1, 'Hostel block and room selection is required'),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export const wardenRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters').optional(),
    phone: z.string().min(5, 'Valid phone number is required'),
    assignedBlock: z.string().min(1, 'Assigned hostel block is required'),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

export const technicianRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters').optional(),
    phone: z.string().min(5, 'Valid phone number is required'),
    employeeId: z.string().min(2, 'Employee ID is required'),
    assignedBlocks: z.union([z.array(z.string()), z.string()]).transform((val) => {
      if (Array.isArray(val)) return val;
      return val ? [val] : [];
    }),
    specialization: z.string().min(2, 'Specialization is required'),
    trade: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );

// Generic / backward-compatible register schema
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
    role: z.enum(['student', 'admin', 'technician']).default('student'),
    phone: z.string().optional(),
    roomId: z.string().optional().nullable(),
    specialization: z.string().optional(),
    employeeId: z.string().optional(),
    assignedBlocks: z.any().optional(),
    assignedBlock: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'student') {
        return Boolean(data.roomId && data.roomId.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Hostel block and room selection is required for student registration',
      path: ['roomId'],
    }
  );

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  roomId: z.string().optional().nullable(),
});
