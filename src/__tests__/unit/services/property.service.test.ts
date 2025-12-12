/**
 * اختبارات خدمة العقارات
 * Property Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropertyService } from '@/services/property.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockProperties } from '../../utils/data.fixtures';

describe('PropertyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all properties', async () => {
      setMockTableData('properties', mockProperties);

      const result = await PropertyService.getAll();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('properties');
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch property by ID', async () => {
      const testProperty = mockProperties[0];
      setMockTableData('properties', [testProperty]);

      const result = await PropertyService.getById(testProperty.id);
      
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create new property', async () => {
      const newProperty = {
        name: 'عقار جديد',
        location: 'الرياض',
        type: 'سكني',
        status: 'نشط',
      };

      setMockTableData('properties', [{ id: 'new-id', ...newProperty }]);

      const result = await PropertyService.create(newProperty);
      
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing property', async () => {
      const existingProperty = mockProperties[0];
      const updates = { name: 'اسم محدث' };

      setMockTableData('properties', [{ ...existingProperty, ...updates }]);

      const result = await PropertyService.update(existingProperty.id, updates);
      
      expect(result).toBeDefined();
    });
  });
});
