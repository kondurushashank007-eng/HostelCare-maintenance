import { z } from 'zod';

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  comments: z.string().optional().default(''),
});

