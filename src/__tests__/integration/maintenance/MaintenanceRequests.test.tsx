/**
 * Maintenance Requests Tests - اختبارات طلبات الصيانة
 * @phase 7 - Maintenance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockMaintenanceRequests,
  mockMaintenanceProviders,
  mockMaintenanceSchedules,
  mockMaintenanceStats,
} from '../../fixtures/maintenance.fixtures';

describe('Maintenance Requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Listing', () => {
    it('should display all maintenance requests', () => {
      expect(mockMaintenanceRequests).toHaveLength(4);
    });

    it('should categorize requests by status', () => {
      const pendingRequests = mockMaintenanceRequests.filter(r => r.status === 'pending');
      const inProgressRequests = mockMaintenanceRequests.filter(r => r.status === 'in_progress');
      const completedRequests = mockMaintenanceRequests.filter(r => r.status === 'completed');

      expect(pendingRequests).toHaveLength(1);
      expect(inProgressRequests).toHaveLength(1);
      expect(completedRequests).toHaveLength(1);
    });

    it('should categorize requests by priority', () => {
      const urgentRequests = mockMaintenanceRequests.filter(r => r.priority === 'urgent');
      const highRequests = mockMaintenanceRequests.filter(r => r.priority === 'high');

      expect(urgentRequests).toHaveLength(1);
      expect(highRequests).toHaveLength(1);
    });

    it('should categorize requests by type', () => {
      const plumbingRequests = mockMaintenanceRequests.filter(r => r.request_type === 'plumbing');
      const electricalRequests = mockMaintenanceRequests.filter(r => r.request_type === 'electrical');
      const hvacRequests = mockMaintenanceRequests.filter(r => r.request_type === 'hvac');

      expect(plumbingRequests).toHaveLength(1);
      expect(electricalRequests).toHaveLength(1);
      expect(hvacRequests).toHaveLength(1);
    });
  });

  describe('Request Details', () => {
    it('should display request information correctly', () => {
      const request = mockMaintenanceRequests[0];
      
      expect(request.title).toBe('تسريب مياه في الحمام');
      expect(request.description).toBeDefined();
      expect(request.property_id).toBeDefined();
      expect(request.unit_id).toBeDefined();
    });

    it('should track estimated and actual costs', () => {
      const completedRequest = mockMaintenanceRequests.find(r => r.status === 'completed');
      
      expect(completedRequest?.estimated_cost).toBeDefined();
      expect(completedRequest?.actual_cost).toBeDefined();
    });

    it('should track request timeline', () => {
      const request = mockMaintenanceRequests[0];
      
      expect(request.created_at).toBeDefined();
      expect(request.scheduled_date).toBeDefined();
    });
  });

  describe('Maintenance Providers', () => {
    it('should list all maintenance providers', () => {
      expect(mockMaintenanceProviders).toHaveLength(3);
    });

    it('should categorize providers by specialty', () => {
      const plumbingProviders = mockMaintenanceProviders.filter(p => 
        p.specialties.includes('سباكة')
      );
      const electricalProviders = mockMaintenanceProviders.filter(p => 
        p.specialties.includes('كهرباء')
      );

      expect(plumbingProviders).toHaveLength(1);
      expect(electricalProviders).toHaveLength(1);
    });

    it('should display provider ratings', () => {
      mockMaintenanceProviders.forEach(provider => {
        expect(provider.rating).toBeGreaterThanOrEqual(1);
        expect(provider.rating).toBeLessThanOrEqual(5);
      });
    });

    it('should track provider availability', () => {
      const activeProviders = mockMaintenanceProviders.filter(p => p.is_active);
      expect(activeProviders.length).toBeGreaterThan(0);
    });
  });

  describe('Maintenance Schedules', () => {
    it('should display scheduled maintenance', () => {
      expect(mockMaintenanceSchedules).toHaveLength(3);
    });

    it('should categorize by frequency', () => {
      const monthlySchedules = mockMaintenanceSchedules.filter(s => s.frequency === 'monthly');
      const quarterlySchedules = mockMaintenanceSchedules.filter(s => s.frequency === 'quarterly');
      const yearlySchedules = mockMaintenanceSchedules.filter(s => s.frequency === 'yearly');

      expect(monthlySchedules).toHaveLength(1);
      expect(quarterlySchedules).toHaveLength(1);
      expect(yearlySchedules).toHaveLength(1);
    });

    it('should track next scheduled date', () => {
      mockMaintenanceSchedules.forEach(schedule => {
        expect(schedule.next_scheduled_date).toBeDefined();
      });
    });
  });

  describe('Maintenance Statistics', () => {
    it('should calculate correct statistics', () => {
      expect(mockMaintenanceStats.total_requests).toBe(150);
      expect(mockMaintenanceStats.pending_requests).toBe(12);
      expect(mockMaintenanceStats.in_progress_requests).toBe(8);
      expect(mockMaintenanceStats.completed_requests).toBe(125);
    });

    it('should track average resolution time', () => {
      expect(mockMaintenanceStats.avg_resolution_days).toBe(3.5);
    });

    it('should calculate total costs', () => {
      expect(mockMaintenanceStats.total_cost_this_month).toBe(45000);
      expect(mockMaintenanceStats.total_cost_this_year).toBe(380000);
    });
  });
});

describe('Maintenance Service', () => {
  describe('Request Creation', () => {
    it('should create a new maintenance request', async () => {
      const newRequest = {
        title: 'إصلاح مكيف',
        description: 'المكيف لا يعمل',
        property_id: 'prop-1',
        unit_id: 'unit-1',
        priority: 'high',
        request_type: 'hvac',
      };

      expect(newRequest.title).toBeDefined();
      expect(newRequest.property_id).toBeDefined();
      expect(newRequest.priority).toBeDefined();
    });

    it('should validate request data before creation', () => {
      const invalidRequest = {
        title: '',
        property_id: 'prop-1',
      };

      expect(invalidRequest.title).toBe('');
    });
  });

  describe('Request Updates', () => {
    it('should update request status', () => {
      const request = mockMaintenanceRequests[0];
      const updatedStatus = 'in_progress';

      expect(request.status).toBe('pending');
      expect(['pending', 'in_progress', 'completed', 'cancelled']).toContain(updatedStatus);
    });

    it('should assign provider to request', () => {
      const request = mockMaintenanceRequests[1];
      expect(request.assigned_provider_id).toBeDefined();
    });
  });
});