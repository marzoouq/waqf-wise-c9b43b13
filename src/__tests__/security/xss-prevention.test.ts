/**
 * Security Tests - XSS Prevention
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

describe('Security - XSS Prevention', () => {
  it('should sanitize script tags', () => {
    const dirty = '<script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('<script');
  });

  it('should sanitize event handlers', () => {
    const dirty = '<img src="x" onerror="alert(1)">';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('onerror');
  });

  it('should sanitize javascript: URLs', () => {
    const dirty = '<a href="javascript:alert(1)">Click</a>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('javascript:');
  });

  it('should allow safe HTML', () => {
    const safe = '<p>Hello <strong>World</strong></p>';
    const clean = DOMPurify.sanitize(safe);
    expect(clean).toBe(safe);
  });

  it('should sanitize data attributes with scripts', () => {
    const dirty = '<div data-x="<script>alert(1)</script>">Test</div>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('<script');
  });
});
