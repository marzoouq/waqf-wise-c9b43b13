/**
 * اختبارات خدمة الطلبات
 * Request Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestService } from '@/services/request.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('RequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all requests', async () => {
      setMockTableData('beneficiary_requests', [
        { id: 'req-1', beneficiary_id: 'ben-1', status: 'pending', description: 'طلب فزعة' },
        { id: 'req-2', beneficiary_id: 'ben-2', status: 'approved', description: 'طلب قرض' },
      ]);

      const result = await RequestService.getAll();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiary_requests');
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch request by ID', async () => {
      setMockTableData('beneficiary_requests', [
        { id: 'req-1', beneficiary_id: 'ben-1', status: 'pending' },
      ]);

      const result = await RequestService.getById('req-1');
      
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a new request', async () => {
      const newRequest = {
        beneficiary_id: 'ben-1',
        description: 'طلب مساعدة طارئة',
        request_type_id: 'type-1',
      };

      const result = await RequestService.create(newRequest);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiary_requests');
    });
  });

  describe('approve', () => {
    it('should approve request', async () => {
      const result = await RequestService.approve('req-1', 'user-1', 'Nazer', 'تمت الموافقة');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiary_requests');
    });
  });

  describe('reject', () => {
    it('should reject request', async () => {
      const result = await RequestService.reject('req-1', 'user-1', 'Nazer', 'لا يستوفي الشروط');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiary_requests');
    });
  });

  describe('getRequestTypes', () => {
    it('should return request types', async () => {
      setMockTableData('request_types', [
        { id: 'type-1', name: 'فزعة' },
        { id: 'type-2', name: 'قرض' },
      ]);

      const result = await RequestService.getRequestTypes();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
