import { z } from 'zod';

export const complaintCategories = [
  'Electrical',
  'Plumbing',
  'Water Supply',
  'Bathroom Maintenance',
  'Internet / Wi-Fi',
  'Furniture',
  'Cleaning',
  'Room Maintenance',
  'Safety and Infrastructure',
  'Other',
];

export const complaintStatuses = [
  'Submitted',
  'Pending',
  'Assigned',
  'In Progress',
  'Resolved',
  'Verified/Closed',
  'Reopened',
  'Escalated',
];

export const complaintPriorities = ['Low', 'Medium', 'High', 'Urgent'];

export const createComplaintSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(complaintCategories),
  priority: z.enum(complaintPriorities).optional(),
  roomId: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
});

export const updateStatusSchema = z.object({
  status: z.enum(complaintStatuses),
  remarks: z.string().optional(),
  resolutionImages: z.array(z.string()).optional(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().min(1, 'Valid technician ID required'),
  priority: z.enum(complaintPriorities).optional(),
  remarks: z.string().optional(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(complaintPriorities),
  remarks: z.string().optional(),
});

export const reopenComplaintSchema = z.object({
  reason: z.string().min(5, 'Please provide a clear reason for reopening'),
});
