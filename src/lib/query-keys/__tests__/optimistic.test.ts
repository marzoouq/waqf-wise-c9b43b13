import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { createOptimistic, createOptimisticDelete, createOptimisticUpdate } from '../optimistic';

describe('Optimistic Updates', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
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
});
