import { env } from '../config/env';
import { getAuthTokenAsync } from '../utils/sessionUtils';
import { metrics } from './metrics';
import { getDevelopmentHeaders } from './devHeaders';

const API_BASE = env.API_URL;

// ============================================================================
// RATE LIMITING: Token Bucket Algorithm
// ============================================================================

interface RateLimiterConfig {
  maxRequests: number;      // Maximum number of requests
  windowMs: number;         // Time window in milliseconds
  refillRate: number;       // Requests to add per refill interval
  refillIntervalMs: number; // How often to refill tokens
}

class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefillTime: number;
  private config: RateLimiterConfig;
  private requestQueue: Array<{ timestamp: number; endpoint: string }> = [];

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.tokens = config.maxRequests;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timeSinceLastRefill = now - this.lastRefillTime;
    const tokensToAdd = Math.floor(
      (timeSinceLastRefill / this.config.refillIntervalMs) * this.config.refillRate
    );

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.config.maxRequests, this.tokens + tokensToAdd);
      this.lastRefillTime = now;
    }

    // Clean up old request entries
    const cutoff = now - this.config.windowMs;
    this.requestQueue = this.requestQueue.filter(r => r.timestamp > cutoff);
  }

  async tryAcquire(endpoint: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      this.requestQueue.push({ timestamp: Date.now(), endpoint });
      return { allowed: true };
    }

    // Calculate retry after based on refill rate
    const retryAfter = Math.ceil(this.config.refillIntervalMs / 1000);
    return { allowed: false, retryAfter };
  }
}

// Configure rate limits per endpoint type
const rateLimiters: Record<string, TokenBucketRateLimiter> = {
  // File upload: 5 requests per minute
  upload: new TokenBucketRateLimiter({
    maxRequests: 5,
    windowMs: 60000,
    refillRate: 1,
    refillIntervalMs: 12000, // 1 token every 12 seconds = 5/min
  }),
  // Voice processing: 10 requests per minute
  process: new TokenBucketRateLimiter({
    maxRequests: 10,
    windowMs: 60000,
    refillRate: 2,
    refillIntervalMs: 6000, // 2 tokens every 6 seconds = 20/min max
  }),
  // Synthesize: 15 requests per minute
  synthesize: new TokenBucketRateLimiter({
    maxRequests: 15,
    windowMs: 60000,
    refillRate: 3,
    refillIntervalMs: 4000, // 3 tokens every 4 seconds = 45/min max
  }),
  // General API: 100 requests per minute
  general: new TokenBucketRateLimiter({
    maxRequests: 100,
    windowMs: 60000,
    refillRate: 10,
    refillIntervalMs: 600, // 10 tokens every 600ms = high burst capacity
  }),
};

function getRateLimiterForEndpoint(endpoint: string): TokenBucketRateLimiter {
  if (endpoint.includes('upload')) return rateLimiters.upload;
  if (endpoint.includes('process')) return rateLimiters.process;
  if (endpoint.includes('synthesize')) return rateLimiters.synthesize;
  return rateLimiters.general;
}

// ============================================================================
// EXPONENTIAL BACKOFF
// ============================================================================

interface BackoffConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

async function fetchWithExponentialBackoff(
  input: RequestInfo | URL,
  init: RequestInit = {},
  backoffConfig: BackoffConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  },
  onRateLimit?: (retryAfter: number) => void
): Promise<Response> {
  let lastError: Error | null = null;
  let delayMs = backoffConfig.initialDelayMs;

  for (let attempt = 0; attempt <= backoffConfig.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(input, init);

      // Check for rate limit response
      if (response.status === 429) {
        if (attempt < backoffConfig.maxRetries) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
          if (onRateLimit) onRateLimit(retryAfter);

          // Wait with exponential backoff, respecting server's Retry-After
          const waitTime = Math.max(retryAfter * 1000, delayMs);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          delayMs = Math.min(delayMs * backoffConfig.backoffMultiplier, backoffConfig.maxDelayMs);
          continue;
        }
      }

      return response;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));

      // Only retry on network errors or timeouts
      if (attempt < backoffConfig.maxRetries && lastError.message.includes('timeout')) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * backoffConfig.backoffMultiplier, backoffConfig.maxDelayMs);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// ============================================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================================

/**
 * Email validation regex (RFC 5322 compliant but simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sanitize a string by removing potentially dangerous characters
 */
function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  // Remove null bytes and limit length
  let sanitized = input.replace(/\0/g, '').substring(0, maxLength);
  // Prevent XSS by escaping HTML special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return sanitized;
}

/**
 * Validate email address
 */
function validateEmail(email: unknown): { valid: boolean; error?: string } {
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  return { valid: true };
}

/**
 * Validate and sanitize URL parameters
 */
function sanitizeUrlParams(params: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    // Sanitize key
    const sanitizedKey = sanitizeString(key, 100);

    if (sanitizedKey && value !== null && value !== undefined) {
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = sanitizeString(value, 500);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[sanitizedKey] = String(value);
      }
    }
  }

  return sanitized;
}

/**
 * Validate profile update data
 */
function validateProfileUpdates(updates: Record<string, unknown>): {
  valid: boolean;
  sanitized: Record<string, unknown>;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitized: Record<string, unknown> = {};
  const allowedFields = ['name', 'email', 'company', 'phone', 'bio', 'avatar_url'];
  const maxFieldLengths = {
    name: 100,
    company: 100,
    phone: 20,
    bio: 500,
    avatar_url: 500,
  };

  // Check for unexpected fields
  for (const field of Object.keys(updates)) {
    if (!allowedFields.includes(field)) {
      errors.push(`Unexpected field: ${field}`);
    }
  }

  // Validate email if present
  if ('email' in updates && updates.email !== null && updates.email !== undefined) {
    const emailValidation = validateEmail(updates.email);
    if (!emailValidation.valid) {
      errors.push(emailValidation.error || 'Invalid email');
    } else {
      sanitized.email = updates.email;
    }
  }

  // Sanitize string fields
  for (const [field, value] of Object.entries(updates)) {
    if (field === 'email') continue; // Already validated
    if (typeof value === 'string' && field in maxFieldLengths) {
      const sanitizedValue = sanitizeString(value, maxFieldLengths[field as keyof typeof maxFieldLengths]);
      if (sanitizedValue) {
        sanitized[field] = sanitizedValue;
      }
    } else if (value !== null && value !== undefined) {
      sanitized[field] = value;
    }
  }

  return { valid: errors.length === 0, sanitized, errors };
}

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

interface FileUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  onProgress?: (percent: number) => void;
  onRateLimit?: (retryAfter: number) => void;
}

const DEFAULT_UPLOAD_OPTIONS: FileUploadOptions = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB default
  allowedTypes: ['audio/*'],
};

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove any path components
  let sanitized = filename.replace(/^.*[\\/]/, '');

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');

  // Limit length
  sanitized = sanitized.substring(0, 255);

  // Remove or replace dangerous characters
  // Keep alphanumeric, spaces, hyphens, underscores, and dots
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '_');

  // Prevent directory traversal
  sanitized = sanitized.replace(/\.\./g, '');

  // Prevent leading dots (.hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  return sanitized || 'upload';
}

/**
 * Validate file before upload
 */
function validateFileForUpload(file: File | Blob, options: FileUploadOptions): {
  valid: boolean;
  error?: string;
} {
  const maxSize = options.maxSizeBytes || DEFAULT_UPLOAD_OPTIONS.maxSizeBytes!;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type if file is not a generic Blob
  if (file instanceof File && file.type) {
    const allowedTypes = options.allowedTypes || DEFAULT_UPLOAD_OPTIONS.allowedTypes!;

    const typeAllowed = allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        const category = allowedType.split('/')[0];
        return file.type.startsWith(category + '/');
      }
      return file.type === allowedType;
    });

    if (!typeAllowed) {
      return {
        valid: false,
        error: `File type '${file.type}' is not allowed`,
      };
    }
  }

  return { valid: true };
}

/**
 * Upload file with progress tracking
 */
async function uploadFileWithProgress(
  url: string,
  file: File | Blob,
  headers: Record<string, string>,
  options: FileUploadOptions = {}
): Promise<Response> {
  // Validate file before upload
  const validation = validateFileForUpload(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Sanitize filename
  const filename = file instanceof File ? sanitizeFilename(file.name) : 'upload';

  const formData = new FormData();
  formData.append('file', file, filename);

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress!(percent);
        }
      });
    }

    xhr.addEventListener('load', () => {
      const response = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
      });
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else if (xhr.status === 429) {
        // Rate limited
        const retryAfter = parseInt(xhr.getResponseHeader('Retry-After') || '1', 10);
        if (options.onRateLimit) {
          options.onRateLimit(retryAfter);
        }
        const error = new Error(
          `Upload rate limited. Please wait ${retryAfter} seconds before trying again.`
        );
        (error as any).code = 'RATE_LIMITED';
        (error as any).retryAfter = retryAfter;
        reject(error);
      } else {
        reject(new Error(xhr.responseText || 'Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out'));
    });

    xhr.open('POST', url, true);

    // Set headers
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.timeout = 120000; // 2 minutes
    xhr.send(formData);
  });
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Create a user-friendly error message (generic in production)
 */
function createUserFriendlyError(error: unknown, defaultPrefix: string = 'An error occurred'): ApiError {
  const isDev = import.meta.env.DEV;

  if (error instanceof Error) {
    // In production, don't expose detailed error messages
    if (!isDev) {
      // Log detailed error for monitoring
      logDetailedError(error, defaultPrefix);

      return {
        message: `${defaultPrefix}. Please try again.`,
        code: 'API_ERROR',
      };
    }

    // In development, provide more details
    return {
      message: error.message,
      code: 'API_ERROR',
      details: {
        name: error.name,
        stack: error.stack,
      },
    };
  }

  if (typeof error === 'string') {
    return {
      message: !isDev ? `${defaultPrefix}. Please try again.` : error,
      code: 'API_ERROR',
    };
  }

  return {
    message: `${defaultPrefix}. Please try again.`,
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Log detailed errors to monitoring (placeholder for Sentry/LogRocket)
 */
function logDetailedError(error: unknown, context: string): void {
  // Placeholder for error logging service integration
  // Example with Sentry (commented out):
  // import * as Sentry from '@sentry/browser';
  // Sentry.captureException(error, { tags: { context } });

  // For now, log to console in development
  if (import.meta.env.DEV) {
    console.error(`[API Error] ${context}:`, error);
  }

  // In production, this would send to your error tracking service
  // Could also integrate with custom metrics
  try {
    const page = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    metrics.trackError(context, page);
  } catch {
    // Silently fail if metrics tracking doesn't work
  }
}

// ============================================================================
// AUTH HEADERS
// ============================================================================

export async function getAuthHeader(userId?: string): Promise<Record<string, string>> {
  const token = await getAuthTokenAsync();

  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(userId ? { 'X-User-Id': userId } : {}),
    ...getDevelopmentHeaders(), // Only includes dev headers in development mode
  };
}

// ============================================================================
// FETCH WITH TIMEOUT (with rate limiting and better error handling)
// ============================================================================

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController();

  if (init.signal) {
    if (init.signal.aborted) {
      return Promise.reject(new Error('Request was already aborted'));
    }
    init.signal.addEventListener('abort', () => controller.abort());
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const url = typeof input === 'string' ? input : input.toString();
  const startTime = performance.now();

  try {
    // Apply rate limiting before making    // the request
    const rateLimiter = getRateLimiterForEndpoint(url);
    const rateLimitResult = await rateLimiter.tryAcquire(url);

    if (!rateLimitResult.allowed) {
      clearTimeout(timeoutId);
      const error = new Error(
        `Rate limit exceeded. Please wait ${rateLimitResult.retryAfter} seconds before trying again.`
      );
      (error as any).code = 'RATE_LIMITED';
      (error as any).retryAfter = rateLimitResult.retryAfter;
      throw error;
    }

    const response = await fetch(input, { ...init, signal: controller.signal });
    const durationMs = performance.now() - startTime;

    clearTimeout(timeoutId);

    // Track metrics for all API calls
    if (url.startsWith(API_BASE)) {
      const endpoint = url.replace(API_BASE, '');
      metrics.trackApiLatency(endpoint, init.method || 'GET', response.status, durationMs / 1000);
    }

    if (!response.ok) {
      // Don't consume the body here, but we should log it for debugging
      try {
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        console.error(`[API Error Response Body]:`, text.substring(0, 500));
      } catch {
        console.error('[API Error] Could not clone response for logging');
      }

      // Check if the response is actually JSON before returning
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[API Error] Expected JSON but got:', text.substring(0, 500));
        // Return a synthetic JSON response to avoid downstream parse errors
        return new Response(JSON.stringify({ detail: text.substring(0, 200) }), {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return response;
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    console.error(`[API Network Error] ${url}`, e);
    throw e;
  }
}

// ============================================================================
// API CLIENT METHODS
// ============================================================================

export const api = {
  /**
   * Upload voice file with validation, rate limiting, and progress tracking
   */
  async uploadVoice(
    file: File | Blob,
    options: FileUploadOptions = {}
  ) {
    const uploadOptions = {
      maxSizeBytes: 10 * 1024 * 1024, // 10MB for voice files
      allowedTypes: ['audio/*'],
      ...options,
    };

    let uploadProgress = 0;

    try {
      const headers = await getAuthHeader();
      const response = await uploadFileWithProgress(
        `${API_BASE}/voice/upload`,
        file,
        headers,
        {
          ...uploadOptions,
          onProgress: (percent) => {
            uploadProgress = percent;
            if (options.onProgress) {
              options.onProgress(percent);
            }
          },
        }
      );

      return response.json(); // { url: string }
    } catch (error) {
      const userError = createUserFriendlyError(error, 'Voice upload failed');
      if (userError.code === 'RATE_LIMITED') {
        userError.message = `Upload rate limit exceeded. Please wait ${(error as any).retryAfter} seconds.`;
      }
      throw userError;
    }
  },

  /**
   * Process voice with input validation
   */
  async processVoice(voiceSampleUrl: string) {
    // Validate URL
    if (!voiceSampleUrl || typeof voiceSampleUrl !== 'string') {
      const error = createUserFriendlyError(new Error('Voice sample URL is required'), 'Processing failed');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Sanitize URL parameter
    const sanitizedUrl = sanitizeString(voiceSampleUrl, 1000);
    if (!sanitizedUrl || !sanitizedUrl.startsWith('http')) {
      const error = createUserFriendlyError(new Error('Invalid voice sample URL'), 'Processing failed');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithExponentialBackoff(
        `${API_BASE}/voice/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({ voice_sample_url: sanitizedUrl }),
        },
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
          backoffMultiplier: 2,
        }
      );

      if (!response.ok) {
        throw new Error(`Processing failed with status ${response.status}`);
      }

      return response.json(); // { audio_url: string | null, clone_id: string, status: string }
    } catch (error) {
      throw createUserFriendlyError(error, 'Voice processing failed');
    }
  },

  /**
   * Get voice status
   */
  async getVoiceStatus(cloneId: string) {
    // Validate clone ID
    if (!cloneId || typeof cloneId !== 'string') {
      const error = createUserFriendlyError(new Error('Clone ID is required'), 'Status check failed');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const sanitizedCloneId = sanitizeString(cloneId, 100);
    if (!sanitizedCloneId) {
      const error = createUserFriendlyError(new Error('Invalid clone ID'), 'Status check failed');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/voice/status/${sanitizedCloneId}`, {
        headers,
      }, 15000);

      if (!response.ok) {
        throw new Error('Failed to get voice status');
      }

      return response.json(); // { id: string, status: string, sample_url: string | null }
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to retrieve voice status');
    }
  },

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/profile`, {
        headers,
      }, 15000);

      if (!response.ok) {
        throw new Error('Failed to get profile');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to retrieve profile');
    }
  },

  /**
   * Update user profile with validation and sanitization
   */
  async updateProfile(updates: Record<string, unknown>) {
    // Validate and sanitize updates
    const validation = validateProfileUpdates(updates);

    if (!validation.valid) {
      const error = new Error(`Validation failed: ${validation.errors.join(', ')}`);
      const userError = createUserFriendlyError(error, 'Profile update failed');
      userError.code = 'VALIDATION_ERROR';
      throw userError;
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(validation.sanitized),
      }, 30000);

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to update profile');
    }
  },

  /**
   * Synthesize speech with input validation
   */
  async synthesize(text: string, voiceSampleUrl: string) {
    // Validate text
    if (!text || typeof text !== 'string') {
      const error = createUserFriendlyError(new Error('Text is required'), 'Synthesis failed');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Sanitize text (limit length to prevent abuse)
    const sanitizedText = sanitizeString(text, 10000);
    if (!sanitizedText) {
      const error = createUserFriendlyError(new Error('Invalid text'), 'Synthesis failed');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Validate and sanitize voice sample URL
    const sanitizedUrl = sanitizeString(voiceSampleUrl, 1000);
    if (!sanitizedUrl || !sanitizedUrl.startsWith('http')) {
      const error = createUserFriendlyError(new Error('Invalid voice sample URL'), 'Synthesis failed');
      error.code = 'INVALID_INPUT';
      throw error;
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithExponentialBackoff(
        `${API_BASE}/synthesize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify({
            text: sanitizedText,
            voice_sample_url: sanitizedUrl
          }),
        },
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 15000,
          backoffMultiplier: 2,
        }
      );

      if (!response.ok) {
        throw new Error(`Synthesis failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Speech synthesis failed');
    }
  },

  // --- Voice Settings API ---

  /**
   * Get voices with query parameter sanitization
   */
  async getVoices(filters?: { gender?: string; language?: string }) {
    try {
      const headers = await getAuthHeader();

      // Sanitize filters
      const sanitizedFilters = filters ? sanitizeUrlParams(filters) : {};
      const params = new URLSearchParams();

      if (sanitizedFilters.gender && sanitizedFilters.gender !== 'all') {
        params.append('gender', sanitizedFilters.gender);
      }
      if (sanitizedFilters.language) {
        params.append('language', sanitizedFilters.language);
      }

      const queryString = params.toString();
      const url = `${API_BASE}/voices${queryString ? `?${queryString}` : ''}`;

      const response = await fetchWithTimeout(url, {
        headers,
      }, 15000);

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      return response.json(); // { data: Voice[], count: number }
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to fetch voices');
    }
  },

  /**
   * Get voice sample URL with query parameter sanitization
   */
  getVoiceSampleUrl(voiceId: string, text?: string) {
    const sanitizedVoiceId = sanitizeString(voiceId, 100);
    const params = new URLSearchParams();

    if (text) {
      const sanitizedText = sanitizeString(text, 500);
      params.append('text', sanitizedText);
    }

    const queryString = params.toString();
    return `${API_BASE}/samples/${sanitizedVoiceId}${queryString ? `?${queryString}` : ''}`;
  },

  /**
   * Get voice settings
   */
  async getVoiceSettings() {
    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/voice-settings`, {
        headers,
      }, 15000);

      if (!response.ok) {
        throw new Error('Failed to fetch voice settings');
      }

      return response.json(); // VoiceSettings
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to fetch voice settings');
    }
  },

  /**
   * Update voice settings with input validation
   */
  async updateVoiceSettings(updates: Record<string, unknown>) {
    // Sanitize updates (basic validation)
    const sanitized: Record<string, unknown> = {};
    const allowedFields = ['pitch', 'speed', 'volume', 'default_voice_id'];

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) continue;

      if (typeof value === 'number') {
        // Clamp numeric values
        if (key === 'pitch' || key === 'speed' || key === 'volume') {
          sanitized[key] = Math.max(0, Math.min(2, value));
        } else {
          sanitized[key] = value;
        }
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value, 100);
      }
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/voice-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(sanitized),
      }, 30000);

      if (!response.ok) {
        throw new Error('Failed to update voice settings');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to update voice settings');
    }
  },

  // --- Business Setup API ---

  /**
   * Get business setup
   */
  async getBusinessSetup() {
    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/business-setup`, {
        headers,
      }, 15000);

      if (!response.ok) {
        throw new Error('Failed to fetch business setup');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to fetch business setup');
    }
  },

  /**
   * Update business setup with input validation
   */
  async updateBusinessSetup(updates: Record<string, unknown>) {
    // Sanitize business setup updates
    const sanitized: Record<string, unknown> = {};
    const allowedFields = [
      'business_name', 'industry', 'website', 'description',
      'phone', 'email', 'address', 'timezone'
    ];
    const maxFieldLengths = {
      business_name: 200,
      industry: 100,
      website: 500,
      description: 1000,
      phone: 50,
      email: 254,
      address: 500,
      timezone: 50,
    };

    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.includes(key)) continue;

      if (key === 'email') {
        const emailValidation = validateEmail(value);
        if (emailValidation.valid) {
          sanitized[key] = value;
        }
      } else if (typeof value === 'string' && key in maxFieldLengths) {
        sanitized[key] = sanitizeString(value, maxFieldLengths[key as keyof typeof maxFieldLengths]);
      } else if (value !== null && value !== undefined) {
        sanitized[key] = value;
      }
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/business-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(sanitized),
      }, 30000);

      if (!response.ok) {
        throw new Error('Failed to update business setup');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to update business setup');
    }
  },

  /**
   * Get billing information
   */
  async getBilling() {
    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/billing`, {
        headers,
      }, 15000);

      if (!response.ok) {
        throw new Error('Failed to fetch billing info');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to fetch billing information');
    }
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Record<string, unknown>) {
    // Sanitize notification settings
    const sanitized: Record<string, unknown> = {};
    const allowedFields = [
      'email_notifications', 'sms_notifications', 'push_notifications',
      'booking_reminders', 'cancellation_alerts', 'promotion_updates'
    ];

    for (const [key, value] of Object.entries(settings)) {
      if (!allowedFields.includes(key)) continue;

      if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else {
        sanitized[key] = Boolean(value);
      }
    }

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(sanitized),
      }, 30000);

      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to update notification settings');
    }
  },

  /**
   * Get booking requirements
   */
  async getBookingRequirements() {
    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/booking-requirements`, {
        headers,
      }, 15000);

      if (!response.ok) {
        throw new Error('Failed to fetch booking requirements');
      }

      return response.json(); // { data: BookingRequirement[], count: number }
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to fetch booking requirements');
    }
  },

  /**
   * Update booking requirements with input validation
   */
  async updateBookingRequirements(
    requirements: Array<{
      field_name: string;
      required: boolean;
      field_type: string;
      description?: string;
      status?: 'optional' | 'recommended' | 'required';
    }>
  ) {
    // Validate and sanitize requirements
    const sanitized = requirements.map(req => ({
      field_name: sanitizeString(req.field_name, 100),
      required: Boolean(req.required),
      field_type: sanitizeString(req.field_type, 50),
      description: req.description ? sanitizeString(req.description, 500) : undefined,
      status: req.status && ['optional', 'recommended', 'required'].includes(req.status)
        ? req.status
        : undefined,
    }));

    try {
      const headers = await getAuthHeader();
      const response = await fetchWithTimeout(`${API_BASE}/booking-requirements`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(sanitized),
      }, 30000);

      if (!response.ok) {
        throw new Error('Failed to update booking requirements');
      }

      return response.json();
    } catch (error) {
      throw createUserFriendlyError(error, 'Failed to update booking requirements');
    }
  }

// ============================================================================
// EXPORTS FOR TESTING AND MONITORING
// ============================================================================

export const rateLimitersExport = rateLimiters;
export const getRateLimiterForEndpointExport = getRateLimiterForEndpoint;
export const sanitizeStringExport = sanitizeString;
export const validateEmailExport = validateEmail;
export const validateProfileUpdatesExport = validateProfileUpdates;
export const sanitizeUrlParamsExport = sanitizeUrlParams;
export const createUserFriendlyErrorExport = createUserFriendlyError;
export const logDetailedErrorExport = logDetailedError;

