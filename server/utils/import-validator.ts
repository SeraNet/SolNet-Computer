import { z } from 'zod';
import { sanitize } from './sanitize';
import { logger } from './logger';

/**
 * Import validation utilities for Excel/CSV imports
 * Provides comprehensive validation with detailed error reporting
 */

export interface ImportResult {
  success: boolean;
  validRecords: any[];
  errors: ImportError[];
  warnings: ImportWarning[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
}

export class ImportValidator {
  /**
   * Validate customer import data
   */
  async validateCustomers(data: any[]): Promise<ImportResult> {
    const validRecords: any[] = [];
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    // Define schema for customer import
    const customerImportSchema = z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      phone: z.string().min(10, 'Phone number too short'),
      email: z.string().email('Invalid email').optional().or(z.literal('')),
      address: z.string().max(500, 'Address too long').optional().or(z.literal('')),
    });

    logger.info('Starting customer import validation', { totalRecords: data.length });

    for (let i = 0; i < data.length; i++) {
      const row = i + 2; // +2 for header row and 1-based indexing
      const record = data[i];

      // Skip empty rows
      if (!record.name && !record.phone) {
        warnings.push({
          row,
          message: 'Empty row skipped',
        });
        continue;
      }

      try {
        // Validate basic structure
        const validated = customerImportSchema.parse({
          name: record.name?.trim() || '',
          phone: record.phone?.toString().trim() || '',
          email: record.email?.trim() || '',
          address: record.address?.trim() || '',
        });

        // Additional phone number validation and normalization
        try {
          validated.phone = sanitize.phone(validated.phone);
        } catch (e) {
          errors.push({
            row,
            field: 'phone',
            message: e instanceof Error ? e.message : 'Invalid phone number format',
            value: validated.phone,
          });
          continue;
        }

        // Email validation if provided
        if (validated.email) {
          try {
            validated.email = sanitize.email(validated.email);
          } catch (e) {
            errors.push({
              row,
              field: 'email',
              message: e instanceof Error ? e.message : 'Invalid email format',
              value: validated.email,
            });
            continue;
          }
        }

        // Check for duplicates within import file
        const duplicate = validRecords.find(r => r.phone === validated.phone);
        if (duplicate) {
          warnings.push({
            row,
            field: 'phone',
            message: `Duplicate phone number (also found in row ${validRecords.indexOf(duplicate) + 2})`,
          });
        }

        validRecords.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              row,
              field: err.path.join('.'),
              message: err.message,
              value: record[err.path[0]],
            });
          });
        } else {
          errors.push({
            row,
            message: 'Unknown validation error',
          });
        }
      }
    }

    logger.info('Customer import validation complete', {
      total: data.length,
      valid: validRecords.length,
      invalid: errors.length,
      warnings: warnings.length,
    });

    return {
      success: errors.length === 0,
      validRecords,
      errors,
      warnings,
      summary: {
        total: data.length,
        valid: validRecords.length,
        invalid: errors.length,
        warnings: warnings.length,
      },
    };
  }

  /**
   * Validate inventory import data
   */
  async validateInventory(data: any[]): Promise<ImportResult> {
    const validRecords: any[] = [];
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    const inventoryImportSchema = z.object({
      name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
      sku: z.string().max(50, 'SKU too long').optional().or(z.literal('')),
      category: z.string().min(1, 'Category is required').max(100),
      quantity: z.number().min(0, 'Quantity cannot be negative').int(),
      price: z.number().min(0, 'Price cannot be negative'),
      minimumStock: z.number().min(0).int().optional(),
      description: z.string().max(1000).optional().or(z.literal('')),
    });

    logger.info('Starting inventory import validation', { totalRecords: data.length });

    for (let i = 0; i < data.length; i++) {
      const row = i + 2;
      const record = data[i];

      // Skip empty rows
      if (!record.name) {
        warnings.push({ row, message: 'Empty row skipped' });
        continue;
      }

      try {
        const validated = inventoryImportSchema.parse({
          name: record.name?.trim() || '',
          sku: record.sku?.toString().trim() || '',
          category: record.category?.trim() || '',
          quantity: parseInt(record.quantity) || 0,
          price: parseFloat(record.price) || 0,
          minimumStock: record.minimumStock ? parseInt(record.minimumStock) : undefined,
          description: record.description?.trim() || '',
        });

        // Check for duplicate SKUs in import
        if (validated.sku) {
          const duplicate = validRecords.find(r => r.sku === validated.sku);
          if (duplicate) {
            warnings.push({
              row,
              field: 'sku',
              message: 'Duplicate SKU in import file',
            });
          }
        }

        // Warn if quantity is zero
        if (validated.quantity === 0) {
          warnings.push({
            row,
            field: 'quantity',
            message: 'Importing item with zero quantity',
          });
        }

        validRecords.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              row,
              field: err.path.join('.'),
              message: err.message,
              value: record[err.path[0]],
            });
          });
        } else {
          errors.push({ row, message: 'Unknown validation error' });
        }
      }
    }

    logger.info('Inventory import validation complete', {
      total: data.length,
      valid: validRecords.length,
      invalid: errors.length,
      warnings: warnings.length,
    });

    return {
      success: errors.length === 0,
      validRecords,
      errors,
      warnings,
      summary: {
        total: data.length,
        valid: validRecords.length,
        invalid: errors.length,
        warnings: warnings.length,
      },
    };
  }

  /**
   * Validate brands import data
   */
  async validateBrands(data: any[]): Promise<ImportResult> {
    const validRecords: any[] = [];
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    const brandImportSchema = z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
      description: z.string().max(500).optional().or(z.literal('')),
      website: z.string().max(255).optional().or(z.literal('')),
    });

    for (let i = 0; i < data.length; i++) {
      const row = i + 2;
      const record = data[i];

      if (!record.name) {
        warnings.push({ row, message: 'Empty row skipped' });
        continue;
      }

      try {
        const validated = brandImportSchema.parse({
          name: record.name?.trim() || '',
          description: record.description?.trim() || '',
          website: record.website?.trim() || '',
        });

        // Validate website URL if provided
        if (validated.website) {
          try {
            validated.website = sanitize.url(validated.website);
          } catch (e) {
            warnings.push({
              row,
              field: 'website',
              message: 'Invalid URL, will be skipped',
            });
            validated.website = '';
          }
        }

        // Check for duplicate names
        const duplicate = validRecords.find(
          r => r.name.toLowerCase() === validated.name.toLowerCase()
        );
        if (duplicate) {
          warnings.push({
            row,
            field: 'name',
            message: 'Duplicate brand name in import file',
          });
        }

        validRecords.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              row,
              field: err.path.join('.'),
              message: err.message,
              value: record[err.path[0]],
            });
          });
        } else {
          errors.push({ row, message: 'Unknown validation error' });
        }
      }
    }

    return {
      success: errors.length === 0,
      validRecords,
      errors,
      warnings,
      summary: {
        total: data.length,
        valid: validRecords.length,
        invalid: errors.length,
        warnings: warnings.length,
      },
    };
  }
}

export const importValidator = new ImportValidator();

