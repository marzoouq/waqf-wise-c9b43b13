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
    it('should NOT add info messages to queue (info is never queued)', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).queue = [];
      
      productionLogger.info('Test info message', { data: 'test' });
      
      // Queue should be empty - info never adds to queue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((productionLogger as any).queue).toHaveLength(0);
    });
  });

  describe('warn()', () => {
    it('should NOT add warn messages to queue (only sent directly for high severity)', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).queue = [];
      
      productionLogger.warn('Test warning', { data: 'test' });
      
      // Queue should be empty - warn doesn't add to queue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((productionLogger as any).queue).toHaveLength(0);
    });
  });

  describe('error()', () => {
    it('should call console.error in DEV environment', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { productionLogger } = await import('../production-logger');
      
      productionLogger.error('Test error', new Error('Test'));
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should NOT add to queue in DEV environment (IS_PROD is false)', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      // Suppress console.error output during this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { productionLogger } = await import('../production-logger');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).queue = [];
      
      productionLogger.error('Test error', new Error('Test'));
      
      // In DEV, addToQueue checks IS_PROD and doesn't add
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((productionLogger as any).queue).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });

  describe('flush()', () => {
    it('should clear queue immediately in DEV environment', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const { productionLogger } = await import('../production-logger');
      
      // Manually add items to queue for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).queue = [
        { level: 'error', message: 'Error 1', timestamp: new Date().toISOString(), data: {} },
        { level: 'warn', message: 'Warning 1', timestamp: new Date().toISOString(), data: {} },
      ];
      
      // Call flush
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (productionLogger as any).flush();
      
      // In DEV, flush clears queue and returns immediately
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((productionLogger as any).queue).toHaveLength(0);
    });
  });

  describe('cleanup()', () => {
    it('should not call clearInterval if flushInterval is null', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { productionLogger } = await import('../production-logger');
      
      // Ensure flushInterval is null (it should be in DEV since constructor doesn't start it)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).flushInterval = null;
      
      productionLogger.cleanup();
      
      expect(clearIntervalSpy).not.toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should call clearInterval if flushInterval exists', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          functions: { invoke: vi.fn() },
          auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
        },
      }));

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { productionLogger } = await import('../production-logger');
      
      // Set a fake interval
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fakeInterval = setInterval(() => {}, 1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (productionLogger as any).flushInterval = fakeInterval;
      
      productionLogger.cleanup();
      
      expect(clearIntervalSpy).toHaveBeenCalledWith(fakeInterval);
      clearIntervalSpy.mockRestore();
    });
  });
});
