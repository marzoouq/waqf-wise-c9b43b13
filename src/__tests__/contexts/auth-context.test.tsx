/**
 * AuthContext Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('AuthContext', () => {
  it('should import AuthContext', async () => {
    const module = await import('@/contexts/AuthContext');
    expect(module).toBeDefined();
  });

  it('should export AuthProvider', async () => {
    const { AuthProvider } = await import('@/contexts/AuthContext');
    expect(AuthProvider).toBeDefined();
  });

  it('should export useAuth hook', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });
});
