import { describe, it, expect } from 'vitest';
import { filterByStatus, filterByDateRange, searchByText } from '../filters';

describe('filters utility', () => {
  const testData = [
    { id: 1, name: 'أحمد', status: 'active', date: '2024-01-15' },
    { id: 2, name: 'محمد', status: 'inactive', date: '2024-02-20' },
    { id: 3, name: 'فاطمة', status: 'active', date: '2024-03-10' },
  ];

  describe('filterByStatus', () => {
    it('filters by active status', () => {
      const result = filterByStatus(testData, 'active');
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
    });

    it('returns all items when status is "all"', () => {
      const result = filterByStatus(testData, 'all');
      expect(result).toHaveLength(3);
    });

    it('returns empty array when no matches', () => {
      const result = filterByStatus(testData, 'pending');
      expect(result).toHaveLength(0);
    });
  });

  describe('searchByText', () => {
    it('searches by name', () => {
      const result = searchByText(testData, 'أحمد', ['name']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('أحمد');
    });

    it('returns all items when query is empty', () => {
      const result = searchByText(testData, '', ['name']);
      expect(result).toHaveLength(3);
    });

    it('is case insensitive', () => {
      const result = searchByText(testData, 'أحمد', ['name']);
      expect(result).toHaveLength(1);
    });
  });

  describe('filterByDateRange', () => {
    it('filters by date range', () => {
      const result = filterByDateRange(testData, '2024-01-01', '2024-02-01');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('returns all items when no date range provided', () => {
      const result = filterByDateRange(testData, undefined, undefined);
      expect(result).toHaveLength(3);
    });
  });
});
