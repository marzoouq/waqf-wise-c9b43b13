import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

// Mock environment
const originalEnv = import.meta.env.MODE;

describe('ProductionLogger', () => {
  let logger: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    
    // Set production mode
    import.meta.env.MODE = 'production';
    
    // Create a mock logger instance for testing
    logger = {
      queue: [],
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      flush: vi.fn(),
      cleanup: vi.fn(),
    };
  });

  afterEach(() => {
    import.meta.env.MODE = originalEnv;
    logger?.cleanup();
  });

  describe('info()', () => {
    it('should NOT add info messages to queue in production', async () => {
      const { productionLogger } = await import('../production-logger');
      
      // Clear queue before test
      (productionLogger as any).queue = [];
      
      productionLogger.info('Test info message', { data: 'test' });
      
      // Queue should be empty - info doesn't add to queue
      expect((productionLogger as any).queue).toHaveLength(0);
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('warn()', () => {
    it('should NOT add warn messages to queue by default', async () => {
      const { productionLogger } = await import('../production-logger');
      
      // Clear queue before test
      (productionLogger as any).queue = [];
      
      productionLogger.warn('Test warning', { data: 'test' });
      
      // Queue should be empty - warn doesn't add to queue unless high severity
      expect((productionLogger as any).queue).toHaveLength(0);
    });
  });

  describe('error()', () => {
    it('should add error messages to queue in production', async () => {
      const { productionLogger } = await import('../production-logger');
      
      // Clear queue before test
      (productionLogger as any).queue = [];
      
      productionLogger.error('Test error', new Error('Test'));
      
      expect((productionLogger as any).queue.length).toBeGreaterThan(0);
      expect((productionLogger as any).queue[0]).toMatchObject({
        level: 'error',
        message: 'Test error',
      });
    });
  });

  describe('flush()', () => {
    it('should send only error-level logs to server', async () => {
      const { productionLogger } = await import('../production-logger');
      mockInvoke.mockResolvedValue({ data: null, error: null });
      
      // Add mixed logs directly to queue
      (productionLogger as any).queue = [
        { level: 'error', message: 'Error 1', timestamp: new Date().toISOString(), data: {} },
        { level: 'warn', message: 'Warning 1', timestamp: new Date().toISOString(), data: {} },
        { level: 'info', message: 'Info 1', timestamp: new Date().toISOString(), data: {} },
        { level: 'error', message: 'Error 2', timestamp: new Date().toISOString(), data: {} },
      ];
      
      await (productionLogger as any).flush();
      
      // Should only send 2 errors
      expect(mockInvoke).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup()', () => {
    it('should clear interval on cleanup', async () => {
      const { productionLogger } = await import('../production-logger');
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      productionLogger.cleanup();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
