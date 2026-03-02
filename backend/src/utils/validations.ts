import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .trim()
      .min(8, 'Phone number is required')
      .max(20, 'Phone number is too long')
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const createListingSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().trim().min(5, 'Description must be at least 5 characters'),
    price: z.coerce.number().positive('Price must be positive'),
    currency: z.string().default('USD'),
    categoryId: z.string().uuid('Invalid category ID'),
    subcategoryId: z.string().uuid().optional(),
    locationId: z.string().uuid('Invalid location ID'),
    images: z.array(z.string().url('Image must be a valid URL')).max(10, 'Maximum 10 images allowed').default([]),
  }),
});

export const updateListingSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100).optional(),
    description: z.string().trim().min(5).optional(),
    price: z.coerce.number().positive().optional(),
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    images: z.array(z.string().url()).max(10).optional(),
  }),
});

export const searchListingsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    sortBy: z.enum(['newest', 'price_low', 'price_high', 'relevance']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  }),
});

export const createMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid('Conversation ID is required'),
    content: z.string().min(1, 'Message cannot be empty').max(1000),
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    listingId: z.string().uuid('Invalid listing ID'),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    description: z.string().max(500).optional(),
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    listingId: z.string().uuid().optional(),
    paymentType: z.enum(['featured', 'premium']),
  }),
});

export const uuidSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ID'),
  }),
});

export const listingIdParamSchema = z.object({
  params: z.object({
    listingId: z.string().uuid('Invalid listing ID'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  }),
});
