import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'admin', 'technician']).default('student'),
    phone: z.string().optional(),
    roomId: z.string().optional().nullable(),
    specialization: z.string().optional(), // only for technician
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
