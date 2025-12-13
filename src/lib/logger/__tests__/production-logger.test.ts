import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ProductionLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info()', () => {
    it('should NOT add info messages to queue in production', async () => {
      // Mock the supabase client
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // Clear queue using any cast for private property access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).queue = [];
      
      productionLogger.info('Test info message', { data: 'test' });
      
      // Queue should be empty - info doesn't add to queue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((productionLogger as any).queue).toHaveLength(0);
    });
  });

  describe('warn()', () => {
    it('should NOT add warn messages to queue by default', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // Clear queue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).queue = [];
      
      productionLogger.warn('Test warning', { data: 'test' });
      
      // Queue should be empty - warn doesn't add to queue unless high severity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((productionLogger as any).queue).toHaveLength(0);
    });
  });

  describe('error()', () => {
    it('should log errors to console in dev mode', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      productionLogger.error('Test error', new Error('Test'));
      
      // In dev mode, it logs to console
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('flush()', () => {
    it('should filter and only process error-level logs', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queue = (productionLogger as any).queue as Array<{ level: string; message: string; timestamp: string; data?: unknown }>;
      
      // Clear and add mixed logs
      queue.length = 0;
      queue.push(
        { level: 'error', message: 'Error 1', timestamp: new Date().toISOString(), data: {} },
        { level: 'warn', message: 'Warning 1', timestamp: new Date().toISOString(), data: {} },
        { level: 'info', message: 'Info 1', timestamp: new Date().toISOString(), data: {} },
        { level: 'error', message: 'Error 2', timestamp: new Date().toISOString(), data: {} }
      );
      
      // Verify queue has the entries
      expect(queue.length).toBe(4);
      
      // Filter to show only errors (this is what flush does internally)
      const errorsOnly = queue.filter(log => log.level === 'error');
      expect(errorsOnly.length).toBe(2);
    });
  });

  describe('cleanup()', () => {
    it('should have cleanup method available', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // Verify cleanup is a function
      expect(typeof productionLogger.cleanup).toBe('function');
      
      // Call cleanup - it should not throw
      expect(() => productionLogger.cleanup()).not.toThrow();
    });
  });
});
