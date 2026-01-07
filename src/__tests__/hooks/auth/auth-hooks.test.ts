/**
 * اختبارات Hooks المصادقة - مبسطة
 */

import { describe, it, expect, vi } from 'vitest';

describe('Auth Hooks', () => {
  it('useAuth should be importable', async () => {
    const module = await import('@/hooks/auth/useAuth');
    expect(module.useAuth).toBeDefined();
  });

  it('usePermissions should be importable', async () => {
    const module = await import('@/hooks/auth/usePermissions');
    expect(module.usePermissions).toBeDefined();
  });

  it('useUserRole should be importable', async () => {
    const module = await import('@/hooks/auth/useUserRole');
    expect(module.useUserRole).toBeDefined();
  });

  it('useProfile should be importable', async () => {
    const module = await import('@/hooks/auth/useProfile');
    expect(module.useProfile).toBeDefined();
  });

  it('useActiveSessions should be importable', async () => {
    const module = await import('@/hooks/auth/useActiveSessions');
    expect(module.useActiveSessions).toBeDefined();
  });

  it('useIdleTimeout should be importable', async () => {
    const module = await import('@/hooks/auth/useIdleTimeout');
    expect(module.useIdleTimeout).toBeDefined();
  });

  it('useChangePassword should be importable', async () => {
    const module = await import('@/hooks/auth/useChangePassword');
    expect(module.useChangePassword).toBeDefined();
  });

  it('useResetPassword should be importable', async () => {
    const module = await import('@/hooks/auth/useResetPassword');
    expect(module.useResetPassword).toBeDefined();
  });

  it('useBiometricAuth should be importable', async () => {
    const module = await import('@/hooks/auth/useBiometricAuth');
    expect(module.useBiometricAuth).toBeDefined();
  });

  it('useLeakedPassword should be importable', async () => {
    const module = await import('@/hooks/auth/useLeakedPassword');
    expect(module.useLeakedPassword).toBeDefined();
  });

  it('useSessionCleanup should be importable', async () => {
    const module = await import('@/hooks/auth/useSessionCleanup');
    expect(module.useSessionCleanup).toBeDefined();
  });

  it('useLightAuth should be importable', async () => {
    const module = await import('@/hooks/auth/useLightAuth');
    expect(module.useLightAuth).toBeDefined();
  });
});
