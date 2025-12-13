/**
 * اختبارات خدمة الصناديق
 * Fund Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FundService } from '@/services/fund.service';
import { supabase } from '@/integrations/supabase/client';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('FundService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all funds', async () => {
      setMockTableData('funds', [
        { id: 'fund-1', name: 'صندوق الوقف', balance: 100000 },
        { id: 'fund-2', name: 'صندوق الصيانة', balance: 50000 },
      ]);

      const result = await FundService.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('funds');
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch fund by ID', async () => {
      setMockTableData('funds', [
        { id: 'fund-1', name: 'صندوق الوقف', balance: 100000 },
      ]);

      const result = await FundService.getById('fund-1');
      
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a new fund', async () => {
      const newFund = {
        name: 'صندوق جديد',
        category: 'waqf',
      };

      const result = await FundService.create(newFund);
      
      expect(supabase.from).toHaveBeenCalledWith('funds');
    });
  });

  describe('update', () => {
    it('should update fund', async () => {
      const result = await FundService.update('fund-1', { name: 'اسم محدث' });
      
      expect(supabase.from).toHaveBeenCalledWith('funds');
    });
  });

  describe('delete', () => {
    it('should delete fund', async () => {
      const result = await FundService.delete('fund-1');
      
      expect(supabase.from).toHaveBeenCalledWith('funds');
    });
  });

});
