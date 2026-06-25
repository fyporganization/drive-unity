import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    fields?: Record<string, string[]>;
  };
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

export function apiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function apiValidationError(
  fields: Record<string, string[]>,
  message: string = 'Validation failed'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: 'VALIDATION_ERROR',
        fields,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 422 }
  );
}

export function apiUnauthorized(
  message: string = 'Authentication required'
): NextResponse<ApiErrorResponse> {
  return apiError(message, 401, 'UNAUTHORIZED');
}

export function apiForbidden(
  message: string = 'Access denied'
): NextResponse<ApiErrorResponse> {
  return apiError(message, 403, 'FORBIDDEN');
}

export function apiNotFound(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return apiError(`${resource} not found`, 404, 'NOT_FOUND');
}

export function apiRateLimitError(
  retryAfter?: number
): NextResponse<ApiErrorResponse> {
  const response = apiError(
    'Too many requests. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED'
  );

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

export function apiServerError(
  message: string = 'Internal server error',
  error?: unknown
): NextResponse<ApiErrorResponse> {
  if (error) {
    console.error('Server error:', error);
  }

  const publicMessage =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : message;

  return apiError(publicMessage, 500, 'INTERNAL_ERROR');
}

export function isApiError(
  response: unknown
): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

export function isApiSuccess<T>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}
