/**
 * اختبارات خدمة المصادقة
 */

import { describe, it, expect } from 'vitest';

describe('Auth Service', () => {
  it('auth service module should be importable', async () => {
    const module = await import('@/services/auth.service');
    expect(module).toBeDefined();
  });

  it('should have AuthService class', async () => {
    const { AuthService } = await import('@/services/auth.service');
    expect(AuthService).toBeDefined();
  });

  it('should have login method', async () => {
    const { AuthService } = await import('@/services/auth.service');
    expect(typeof AuthService.login).toBe('function');
  });

  it('should have logout method', async () => {
    const { AuthService } = await import('@/services/auth.service');
    expect(typeof AuthService.logout).toBe('function');
  });

  it('should have getSession method', async () => {
    const { AuthService } = await import('@/services/auth.service');
    expect(typeof AuthService.getSession).toBe('function');
  });

  it('should have getCurrentUser method', async () => {
    const { AuthService } = await import('@/services/auth.service');
    expect(typeof AuthService.getCurrentUser).toBe('function');
  });

  it('should have getUserProfile method', async () => {
    const { AuthService } = await import('@/services/auth.service');
    expect(typeof AuthService.getUserProfile).toBe('function');
  });

  it('should have getUserRoles method', async () => {
    const { AuthService } = await import('@/services/auth.service');
    expect(typeof AuthService.getUserRoles).toBe('function');
  });
});
