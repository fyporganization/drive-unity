import { z } from 'zod';

export const checkEmailSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),
});

export const sendOTPSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim()
    .optional(),
});

export const verifyOTPSchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, 'Code must be exactly 6 digits')
    .length(6, 'Code must be 6 digits'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export const fileSizeFilterSchema = z.object({
  minSize: z
    .number()
    .int()
    .nonnegative('Minimum size cannot be negative')
    .optional(),
  maxSize: z
    .number()
    .int()
    .nonnegative('Maximum size cannot be negative')
    .optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
}).refine(
  (data) => {
    if (data.minSize !== undefined && data.maxSize !== undefined) {
      return data.minSize <= data.maxSize;
    }
    return true;
  },
  {
    message: 'Minimum size cannot be greater than maximum size',
    path: ['minSize'],
  }
);

export const dateRangeFilterSchema = z.object({
  startDate: z
    .string()
    .datetime({ message: 'Invalid start date format (use ISO 8601)' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'))
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'Invalid end date format (use ISO 8601)' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'))
    .optional(),
  userId: z.string().uuid('Invalid user ID'),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    }
    return true;
  },
  {
    message: 'Start date cannot be after end date',
    path: ['startDate'],
  }
);

export const smartSearchSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .max(200, 'Search query is too long')
    .trim(),
  limit: z
    .number()
    .int()
    .positive()
    .max(100, 'Limit cannot exceed 100')
    .default(50)
    .optional(),
  offset: z
    .number()
    .int()
    .nonnegative()
    .default(0)
    .optional(),
});

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email is too long')
    .toLowerCase()
    .trim()
    .optional(),
});

export const fetchMetadataSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  accountId: z.string().uuid('Invalid account ID').optional(),
});

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string[]>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return {
    success: false,
    errors,
  };
}

export async function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  const result = validateData(schema, data);

  if (!result.success) {
    throw new ValidationError('Validation failed', result.errors);
  }

  return result.data;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email is too long')
  .toLowerCase()
  .trim();

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const sortSchema = z.object({
  sortBy: z.string().min(1, 'Sort field is required'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
