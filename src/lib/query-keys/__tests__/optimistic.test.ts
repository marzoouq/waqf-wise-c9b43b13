import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { 
  createOptimistic, 
  createOptimisticDelete, 
  createOptimisticUpdate,
  getOptimisticStats,
  resetOptimisticStats,
} from '../optimistic';

describe('Optimistic Updates', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    resetOptimisticStats();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('createOptimistic', () => {
    it('should create handlers with all required methods', () => {
      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey: ['test'],
        updater: (old, newItem) => [...(old || []), newItem],
      });

      expect(handlers).toHaveProperty('onMutate');
      expect(handlers).toHaveProperty('onError');
      expect(handlers).toHaveProperty('onSuccess');
      expect(handlers).toHaveProperty('onSettled');
    });

    it('should update query data optimistically', async () => {
      const queryKey = ['items'] as const;
      queryClient.setQueryData(queryKey, ['item1', 'item2']);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      await handlers.onMutate('item3');

      const data = queryClient.getQueryData<string[]>(queryKey);
      expect(data).toEqual(['item1', 'item2', 'item3']);
    });

    it('should rollback on error', async () => {
      const queryKey = ['items'] as const;
      queryClient.setQueryData(queryKey, ['item1', 'item2']);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      const context = await handlers.onMutate('item3');
      
      // Simulate error
      handlers.onError(new Error('test error'), 'item3', context);

      const data = queryClient.getQueryData<string[]>(queryKey);
      expect(data).toEqual(['item1', 'item2']);
    });
  });

  describe('createOptimisticDelete', () => {
    it('should remove item optimistically', async () => {
      const queryKey = ['users'] as const;
      queryClient.setQueryData(queryKey, [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]);

      const handlers = createOptimisticDelete<{ id: string; name: string }>(
        queryClient,
        queryKey
      );

      await handlers.onMutate('1');

      const data = queryClient.getQueryData<{ id: string }[]>(queryKey);
      expect(data?.length).toBe(1);
      expect(data?.[0].id).toBe('2');
    });
  });

  describe('createOptimisticUpdate', () => {
    it('should update item optimistically', async () => {
      const queryKey = ['users'] as const;
      queryClient.setQueryData(queryKey, [
        { id: '1', name: 'User 1', status: 'active' },
        { id: '2', name: 'User 2', status: 'active' },
      ]);

      const handlers = createOptimisticUpdate<{ id: string; name: string; status: string }>(
        queryClient,
        queryKey
      );

      await handlers.onMutate({ id: '1', data: { status: 'inactive' } });

      const data = queryClient.getQueryData<{ id: string; status: string }[]>(queryKey);
      const updatedUser = data?.find(u => u.id === '1');
      expect(updatedUser?.status).toBe('inactive');
    });
  });

  // ═══════════════════════════════════════
  // Statistics Tests - اختبارات الإحصائيات
  // ═══════════════════════════════════════
  describe('Statistics', () => {
    it('should track success count', async () => {
      const queryKey = ['stats-test'] as const;
      queryClient.setQueryData(queryKey, ['item1']);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      await handlers.onMutate('item2');
      handlers.onSuccess();

      const stats = getOptimisticStats();
      expect(stats.successCount).toBeGreaterThanOrEqual(1);
      expect(stats.totalOperations).toBeGreaterThanOrEqual(1);
    });

    it('should track rollback count', async () => {
      const queryKey = ['rollback-test'] as const;
      queryClient.setQueryData(queryKey, ['item1']);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      const context = await handlers.onMutate('item2');
      handlers.onError(new Error('test'), 'item2', context);

      const stats = getOptimisticStats();
      expect(stats.rollbackCount).toBeGreaterThanOrEqual(1);
    });

    it('should calculate average duration', async () => {
      const queryKey = ['duration-test'] as const;
      queryClient.setQueryData(queryKey, []);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      await handlers.onMutate('item1');
      handlers.onSuccess();

      const stats = getOptimisticStats();
      expect(stats.averageDurationMs).toBeGreaterThanOrEqual(0);
    });
  });

  // ═══════════════════════════════════════
  // Edge Cases - الحالات الحدية
  // ═══════════════════════════════════════
  describe('Edge Cases', () => {
    it('should handle concurrent updates correctly', async () => {
      const queryKey = ['concurrent-test'] as const;
      queryClient.setQueryData(queryKey, ['item1']);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      // محاكاة تحديثين متزامنين
      const [context1, context2] = await Promise.all([
        handlers.onMutate('item2'),
        handlers.onMutate('item3'),
      ]);

      const data = queryClient.getQueryData<string[]>(queryKey);
      // يجب أن يحتوي على العناصر المضافة
      expect(data?.length).toBeGreaterThanOrEqual(2);
      expect(context1.previous).toBeDefined();
      expect(context2.previous).toBeDefined();
    });

    it('should handle empty initial data', async () => {
      const queryKey = ['empty-test'] as const;
      // لا نضع بيانات أولية

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      const context = await handlers.onMutate('item1');

      expect(context.previous).toBeUndefined();
      const data = queryClient.getQueryData<string[]>(queryKey);
      expect(data).toContain('item1');
    });

    it('should handle updater throwing error gracefully', async () => {
      const queryKey = ['error-test'] as const;
      queryClient.setQueryData(queryKey, ['item1']);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: () => {
          throw new Error('Updater error');
        },
      });

      // يجب ألا يرمي خطأ
      const context = await handlers.onMutate('item2');

      // البيانات القديمة يجب أن تكون محفوظة
      expect(context.previous).toEqual(['item1']);
    });

    it('should handle rapid successive updates', async () => {
      const queryKey = ['rapid-test'] as const;
      queryClient.setQueryData(queryKey, []);

      const handlers = createOptimistic<string[], string>(queryClient, {
        queryKey,
        updater: (old, newItem) => [...(old || []), newItem],
      });

      // 10 تحديثات سريعة
      for (let i = 0; i < 10; i++) {
        await handlers.onMutate(`item${i}`);
      }

      const data = queryClient.getQueryData<string[]>(queryKey);
      expect(data?.length).toBe(10);
    });

    it('should reset stats correctly', () => {
      resetOptimisticStats();
      const stats = getOptimisticStats();
      
      expect(stats.successCount).toBe(0);
      expect(stats.rollbackCount).toBe(0);
      expect(stats.totalOperations).toBe(0);
      expect(stats.averageDurationMs).toBe(0);
    });
  });
});
