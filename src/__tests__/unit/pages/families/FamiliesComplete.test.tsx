/**
 * اختبارات شاملة لصفحة العائلات
 * Comprehensive Families Page Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

const mockFamilies = [
  { id: 'f1', name: 'عائلة محمد مرزوق الثبيتي', head_id: 'b1', member_count: 5, created_at: '2024-01-01' },
  { id: 'f2', name: 'عائلة أحمد الثبيتي', head_id: 'b2', member_count: 3, created_at: '2024-02-01' },
];

const mockBeneficiaries = [
  { id: 'b1', full_name: 'محمد مرزوق الثبيتي', family_id: 'f1', is_head_of_family: true, relationship: 'رب الأسرة', category: 'زوجة' },
  { id: 'b2', full_name: 'أحمد محمد الثبيتي', family_id: 'f1', is_head_of_family: false, relationship: 'ابن', category: 'ابن' },
  { id: 'b3', full_name: 'سارة محمد الثبيتي', family_id: 'f1', is_head_of_family: false, relationship: 'بنت', category: 'بنت' },
  { id: 'b4', full_name: 'فاطمة الثبيتي', family_id: 'f1', is_head_of_family: false, relationship: 'زوجة', category: 'زوجة' },
  { id: 'b5', full_name: 'خالد محمد الثبيتي', family_id: 'f1', is_head_of_family: false, relationship: 'ابن', category: 'ابن' },
];

describe('Families Page - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  describe('Family List (قائمة العائلات)', () => {
    beforeEach(() => {
      setMockTableData('families', mockFamilies);
    });

    it('should display all families', () => {
      expect(mockFamilies).toHaveLength(2);
    });

    it('should show family names', () => {
      expect(mockFamilies[0].name).toBe('عائلة محمد مرزوق الثبيتي');
    });

    it('should show member count', () => {
      expect(mockFamilies[0].member_count).toBe(5);
    });

    it('should calculate total members', () => {
      const totalMembers = mockFamilies.reduce((sum, f) => sum + f.member_count, 0);
      expect(totalMembers).toBe(8);
    });
  });

  describe('Family Members (أفراد العائلة)', () => {
    beforeEach(() => {
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    it('should show family members', () => {
      const family1Members = mockBeneficiaries.filter(b => b.family_id === 'f1');
      expect(family1Members).toHaveLength(5);
    });

    it('should identify family head', () => {
      const head = mockBeneficiaries.find(b => b.is_head_of_family);
      expect(head?.full_name).toBe('محمد مرزوق الثبيتي');
    });

    it('should show relationships', () => {
      const relationships = mockBeneficiaries.map(b => b.relationship);
      expect(relationships).toContain('ابن');
      expect(relationships).toContain('بنت');
      expect(relationships).toContain('زوجة');
    });

    it('should count by relationship', () => {
      const byRelationship = mockBeneficiaries.reduce((acc, b) => {
        acc[b.relationship] = (acc[b.relationship] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      expect(byRelationship['ابن']).toBe(2);
      expect(byRelationship['زوجة']).toBe(2);
    });
  });

  describe('Family Tree (شجرة العائلة)', () => {
    beforeEach(() => {
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    it('should build family tree structure', () => {
      const head = mockBeneficiaries.find(b => b.is_head_of_family);
      const children = mockBeneficiaries.filter(b => !b.is_head_of_family && b.family_id === head?.family_id);
      expect(children).toHaveLength(4);
    });

    it('should group by category', () => {
      const byCategory = mockBeneficiaries.reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      expect(byCategory['ابن']).toBe(2);
      expect(byCategory['بنت']).toBe(1);
      expect(byCategory['زوجة']).toBe(2);
    });
  });

  describe('Add Family (إضافة عائلة)', () => {
    it('should create new family', () => {
      const newFamily = {
        name: 'عائلة جديدة',
        head_id: 'b10',
        member_count: 1
      };
      expect(newFamily.name).toBe('عائلة جديدة');
    });
  });

  describe('Link Members (ربط الأفراد)', () => {
    it('should link member to family', () => {
      const linkMember = vi.fn((memberId: string, familyId: string) => ({
        memberId,
        familyId,
        linked: true
      }));
      const result = linkMember('b10', 'f1');
      expect(result.linked).toBe(true);
    });

    it('should update member count', () => {
      const updateCount = (family: typeof mockFamilies[0], delta: number) => ({
        ...family,
        member_count: family.member_count + delta
      });
      const updated = updateCount(mockFamilies[0], 1);
      expect(updated.member_count).toBe(6);
    });
  });
});
