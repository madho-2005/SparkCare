import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string({ required_error: 'Email address is required' })
      .trim()
      .email('Please provide a valid email address'),
    password: z.string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit'),
    phoneNumber: z.string({ required_error: 'Phone number is required' })
      .trim()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number cannot exceed 15 digits'),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string({ required_error: 'Email is required' })
      .trim()
      .email('Please provide a valid email address'),
    password: z.string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  }),
};

export const updateProfileSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50).optional(),
    phoneNumber: z.string().trim().min(10).max(15).optional(),
    addresses: z.array(
      z.object({
        street: z.string().trim().min(1, 'Street is required'),
        city: z.string().trim().min(1, 'City is required'),
        state: z.string().trim().min(1, 'State is required'),
        zipCode: z.string().trim().min(1, 'Zip code is required'),
        isDefault: z.boolean().optional(),
      })
    ).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long').optional(),
  }).strict('Unexpected properties detected. Role/privilege modification is not allowed.'),
};

