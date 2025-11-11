import validator from 'validator';
import { ValidationError } from './errors';

/**
 * Input sanitization utilities to prevent injection attacks and ensure data quality
 */
export const sanitize = {
  /**
   * Remove HTML tags and encode special characters
   */
  text: (input: string): string => {
    if (!input) return '';
    return validator.escape(validator.stripLow(input.trim()));
  },

  /**
   * Sanitize and validate email addresses
   */
  email: (input: string): string => {
    if (!input) return '';
    const email = input.trim().toLowerCase();
    if (!validator.isEmail(email)) {
      throw new ValidationError('Invalid email format');
    }
    return validator.normalizeEmail(email) || email;
  },

  /**
   * Sanitize and validate Ethiopian phone numbers
   * Normalizes to +251 format
   */
  phone: (input: string): string => {
    if (!input) throw new ValidationError('Phone number is required');
    
    // Remove all non-numeric characters except +
    const cleaned = input.replace(/[^0-9+]/g, '');
    
    // Ethiopian phone validation pattern
    // Accepts: +251912345678, 251912345678, 0912345678, 912345678
    const ethiopianPattern = /^(\+251|251|0)?[97]\d{8}$/;
    
    if (!ethiopianPattern.test(cleaned)) {
      throw new ValidationError('Invalid Ethiopian phone number format. Must start with 9 or 7 and be 9 digits.');
    }
    
    // Normalize to +251 format
    if (cleaned.startsWith('0')) {
      return '+251' + cleaned.slice(1);
    } else if (cleaned.startsWith('251')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('+251')) {
      return cleaned;
    } else if (cleaned.match(/^[97]\d{8}$/)) {
      // Just the 9 digits starting with 9 or 7
      return '+251' + cleaned;
    }
    
    throw new ValidationError('Invalid phone number format');
  },

  /**
   * Sanitize and validate URLs
   */
  url: (input: string): string => {
    if (!input) return '';
    const url = input.trim();
    
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'], 
      require_protocol: true,
      require_valid_protocol: true,
    })) {
      throw new ValidationError('Invalid URL format. Must start with http:// or https://');
    }
    
    return url;
  },

  /**
   * Sanitize and validate UUIDs
   */
  uuid: (input: string): string => {
    if (!input) throw new ValidationError('ID is required');
    const cleaned = input.trim();
    
    if (!validator.isUUID(cleaned)) {
      throw new ValidationError('Invalid ID format');
    }
    
    return cleaned;
  },

  /**
   * Sanitize search queries
   * Removes SQL special characters and limits length
   */
  searchQuery: (input: string): string => {
    if (!input) return '';
    
    // Remove special SQL characters that could be used for injection
    return input
      .trim()
      .replace(/[;'"\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .substring(0, 100); // Limit length to prevent DoS
  },

  /**
   * Sanitize numeric values
   */
  number: (input: any): number => {
    const num = Number(input);
    if (isNaN(num)) {
      throw new ValidationError('Invalid number format');
    }
    return num;
  },

  /**
   * Sanitize decimal/currency values
   */
  decimal: (input: any, maxDecimals: number = 2): number => {
    const num = parseFloat(input);
    if (isNaN(num)) {
      throw new ValidationError('Invalid decimal format');
    }
    return Number(num.toFixed(maxDecimals));
  },

  /**
   * Sanitize boolean values
   */
  boolean: (input: any): boolean => {
    if (typeof input === 'boolean') return input;
    if (input === 'true' || input === '1' || input === 1) return true;
    if (input === 'false' || input === '0' || input === 0) return false;
    throw new ValidationError('Invalid boolean format');
  },

  /**
   * Sanitize date inputs
   */
  date: (input: any): Date => {
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new ValidationError('Invalid date format');
    }
    return date;
  },

  /**
   * Sanitize HTML content (allows safe HTML tags)
   */
  html: (input: string, allowedTags?: string[]): string => {
    if (!input) return '';
    // For now, just escape all HTML
    // Could use a library like DOMPurify for more sophisticated HTML sanitization
    return validator.escape(input.trim());
  },

  /**
   * Sanitize JSON input
   */
  json: (input: any): any => {
    try {
      if (typeof input === 'string') {
        return JSON.parse(input);
      }
      return input;
    } catch (error) {
      throw new ValidationError('Invalid JSON format');
    }
  },
};

/**
 * Sanitize an entire object based on a schema map
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, (value: any) => any>
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const key in schema) {
    if (obj[key] !== undefined) {
      try {
        sanitized[key] = schema[key](obj[key]);
      } catch (error) {
        throw new ValidationError(`Invalid ${String(key)}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
  
  return sanitized;
}

