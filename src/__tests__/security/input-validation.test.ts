/**
 * Security Tests - Input Validation
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('Security - Input Validation', () => {
  const emailSchema = z.string().email();
  const phoneSchema = z.string().regex(/^[0-9+\-\s()]+$/);
  const nationalIdSchema = z.string().regex(/^[0-9]{10}$/);

  it('should validate email format', () => {
    expect(() => emailSchema.parse('valid@email.com')).not.toThrow();
    expect(() => emailSchema.parse('invalid-email')).toThrow();
  });

  it('should validate phone format', () => {
    expect(() => phoneSchema.parse('+966501234567')).not.toThrow();
    expect(() => phoneSchema.parse('abc123')).toThrow();
  });

  it('should validate national ID format', () => {
    expect(() => nationalIdSchema.parse('1234567890')).not.toThrow();
    expect(() => nationalIdSchema.parse('12345')).toThrow();
  });

  it('should reject SQL injection patterns', () => {
    const safeStringSchema = z.string().refine(
      (val) => !val.includes("'") && !val.includes('"') && !val.includes('--'),
      'Invalid characters detected'
    );
    
    expect(() => safeStringSchema.parse("Robert'); DROP TABLE users;--")).toThrow();
  });

  it('should validate positive numbers', () => {
    const amountSchema = z.number().positive();
    expect(() => amountSchema.parse(100)).not.toThrow();
    expect(() => amountSchema.parse(-50)).toThrow();
  });
});
