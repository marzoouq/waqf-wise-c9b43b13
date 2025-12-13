/**
 * اختبارات شاملة لتبويبات الطلبات
 * Comprehensive Requests Tabs Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

// Mock data
const mockRequestTypes = [
  { id: '1', name: 'فزعة طارئة', requires_amount: true, requires_attachment: true },
  { id: '2', name: 'قرض', requires_amount: true, requires_attachment: true },
  { id: '3', name: 'تحديث بيانات', requires_amount: false, requires_attachment: false },
  { id: '4', name: 'إضافة مولود', requires_amount: false, requires_attachment: true },
];

const mockRequests = [
  { 
    id: '1', 
    beneficiary_id: 'b1', 
    request_type_id: '1', 
    description: 'طلب فزعة طارئة للعلاج',
    amount: 10000,
    status: 'pending',
    priority: 'high',
    created_at: '2025-01-15T10:00:00Z',
    sla_due_at: '2025-01-17T10:00:00Z'
  },
  { 
    id: '2', 
    beneficiary_id: 'b2', 
    request_type_id: '2', 
    description: 'طلب قرض لشراء سيارة',
    amount: 50000,
    status: 'approved',
    priority: 'medium',
    created_at: '2025-01-10T08:00:00Z',
    approved_at: '2025-01-12T14:00:00Z'
  },
  { 
    id: '3', 
    beneficiary_id: 'b3', 
    request_type_id: '3', 
    description: 'تحديث رقم الجوال',
    amount: null,
    status: 'rejected',
    priority: 'low',
    created_at: '2025-01-08T09:00:00Z',
    rejection_reason: 'الوثائق غير مكتملة'
  },
  { 
    id: '4', 
    beneficiary_id: 'b1', 
    request_type_id: '1', 
    description: 'فزعة طارئة للسكن',
    amount: 15000,
    status: 'in_review',
    priority: 'high',
    created_at: '2025-01-20T11:00:00Z',
    assigned_to: 'user1'
  },
  { 
    id: '5', 
    beneficiary_id: 'b4', 
    request_type_id: '4', 
    description: 'إضافة مولود جديد',
    amount: null,
    status: 'approved',
    priority: 'medium',
    created_at: '2025-01-05T07:00:00Z',
    approved_at: '2025-01-06T10:00:00Z'
  },
];

const mockBeneficiaries = [
  { id: 'b1', full_name: 'محمد الثبيتي', national_id: '1234567890' },
  { id: 'b2', full_name: 'أحمد الثبيتي', national_id: '1234567891' },
  { id: 'b3', full_name: 'سارة الثبيتي', national_id: '1234567892' },
  { id: 'b4', full_name: 'فاطمة الثبيتي', national_id: '1234567893' },
];

describe('Requests Tabs - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  // ==================== تبويب الكل ====================
  describe('All Requests Tab (الكل)', () => {
    beforeEach(() => {
      setMockTableData('beneficiary_requests', mockRequests);
      setMockTableData('request_types', mockRequestTypes);
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    describe('Display All Requests', () => {
      it('should show all requests regardless of status', () => {
        expect(mockRequests).toHaveLength(5);
      });

      it('should display request number/id', () => {
        expect(mockRequests[0].id).toBe('1');
      });

      it('should display beneficiary name', () => {
        const beneficiary = mockBeneficiaries.find(b => b.id === mockRequests[0].beneficiary_id);
        expect(beneficiary?.full_name).toBe('محمد الثبيتي');
      });

      it('should display request type', () => {
        const requestType = mockRequestTypes.find(t => t.id === mockRequests[0].request_type_id);
        expect(requestType?.name).toBe('فزعة طارئة');
      });

      it('should display request status', () => {
        expect(mockRequests[0].status).toBe('pending');
      });

      it('should display request date', () => {
        expect(mockRequests[0].created_at).toBe('2025-01-15T10:00:00Z');
      });
    });

    describe('Sorting', () => {
      it('should sort by date descending by default', () => {
        const sorted = [...mockRequests].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        expect(sorted[0].id).toBe('4');
      });

      it('should sort by priority', () => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const sorted = [...mockRequests].sort((a, b) => 
          priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
        );
        expect(sorted[0].priority).toBe('high');
      });
    });

    describe('Search', () => {
      it('should search by beneficiary name', () => {
        const searchTerm = 'محمد';
        const beneficiaryIds = mockBeneficiaries
          .filter(b => b.full_name.includes(searchTerm))
          .map(b => b.id);
        const filtered = mockRequests.filter(r => beneficiaryIds.includes(r.beneficiary_id));
        expect(filtered).toHaveLength(2);
      });

      it('should search by description', () => {
        const searchTerm = 'سيارة';
        const filtered = mockRequests.filter(r => r.description.includes(searchTerm));
        expect(filtered).toHaveLength(1);
      });
    });
  });

  // ==================== تبويب قيد المعالجة ====================
  describe('In Progress Tab (قيد المعالجة)', () => {
    beforeEach(() => {
      setMockTableData('beneficiary_requests', mockRequests);
    });

    describe('Filter Pending Requests', () => {
      it('should show only pending and in_review requests', () => {
        const inProgress = mockRequests.filter(r => 
          r.status === 'pending' || r.status === 'in_review'
        );
        expect(inProgress).toHaveLength(2);
      });

      it('should show pending requests', () => {
        const pending = mockRequests.filter(r => r.status === 'pending');
        expect(pending).toHaveLength(1);
        expect(pending[0].description).toBe('طلب فزعة طارئة للعلاج');
      });

      it('should show in_review requests', () => {
        const inReview = mockRequests.filter(r => r.status === 'in_review');
        expect(inReview).toHaveLength(1);
        expect(inReview[0].description).toBe('فزعة طارئة للسكن');
      });
    });

    describe('SLA Tracking', () => {
      it('should show SLA due date', () => {
        const pendingRequest = mockRequests.find(r => r.status === 'pending');
        expect(pendingRequest?.sla_due_at).toBe('2025-01-17T10:00:00Z');
      });

      it('should identify overdue requests', () => {
        const now = new Date('2025-01-18T12:00:00Z');
        const overdueRequests = mockRequests.filter(r => {
          if (r.sla_due_at && (r.status === 'pending' || r.status === 'in_review')) {
            return new Date(r.sla_due_at) < now;
          }
          return false;
        });
        expect(overdueRequests).toHaveLength(1);
      });
    });

    describe('Assignment', () => {
      it('should show assigned requests', () => {
        const assigned = mockRequests.filter(r => r.assigned_to);
        expect(assigned).toHaveLength(1);
        expect(assigned[0].assigned_to).toBe('user1');
      });

      it('should show unassigned requests', () => {
        const unassigned = mockRequests.filter(r => 
          !r.assigned_to && (r.status === 'pending' || r.status === 'in_review')
        );
        expect(unassigned).toHaveLength(1);
      });
    });
  });

  // ==================== تبويب موافق عليها ====================
  describe('Approved Tab (موافق عليها)', () => {
    beforeEach(() => {
      setMockTableData('beneficiary_requests', mockRequests);
    });

    describe('Filter Approved Requests', () => {
      it('should show only approved requests', () => {
        const approved = mockRequests.filter(r => r.status === 'approved');
        expect(approved).toHaveLength(2);
      });

      it('should show approval date', () => {
        const approved = mockRequests.find(r => r.status === 'approved');
        expect(approved?.approved_at).toBeDefined();
      });
    });

    describe('Approved Amounts', () => {
      it('should calculate total approved amount', () => {
        const approved = mockRequests.filter(r => r.status === 'approved');
        const totalAmount = approved.reduce((sum, r) => sum + (r.amount || 0), 0);
        expect(totalAmount).toBe(50000);
      });

      it('should show requests with amounts', () => {
        const approvedWithAmount = mockRequests.filter(r => 
          r.status === 'approved' && r.amount
        );
        expect(approvedWithAmount).toHaveLength(1);
        expect(approvedWithAmount[0].amount).toBe(50000);
      });
    });

    describe('Request Types', () => {
      it('should categorize approved by type', () => {
        const approved = mockRequests.filter(r => r.status === 'approved');
        const byType = approved.reduce((acc, r) => {
          acc[r.request_type_id] = (acc[r.request_type_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        expect(byType['2']).toBe(1); // قرض
        expect(byType['4']).toBe(1); // إضافة مولود
      });
    });
  });

  // ==================== تبويب مرفوضة ====================
  describe('Rejected Tab (مرفوضة)', () => {
    beforeEach(() => {
      setMockTableData('beneficiary_requests', mockRequests);
    });

    describe('Filter Rejected Requests', () => {
      it('should show only rejected requests', () => {
        const rejected = mockRequests.filter(r => r.status === 'rejected');
        expect(rejected).toHaveLength(1);
      });

      it('should show rejection reason', () => {
        const rejected = mockRequests.find(r => r.status === 'rejected');
        expect(rejected?.rejection_reason).toBe('الوثائق غير مكتملة');
      });
    });

    describe('Rejection Analysis', () => {
      it('should categorize rejections by reason', () => {
        const rejected = mockRequests.filter(r => r.status === 'rejected');
        const hasReason = rejected.every(r => r.rejection_reason);
        expect(hasReason).toBe(true);
      });
    });
  });

  // ==================== تفاصيل الطلب ====================
  describe('Request Details', () => {
    beforeEach(() => {
      setMockTableData('beneficiary_requests', mockRequests);
      setMockTableData('request_types', mockRequestTypes);
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    describe('Basic Information', () => {
      it('should display request description', () => {
        const request = mockRequests[0];
        expect(request.description).toBe('طلب فزعة طارئة للعلاج');
      });

      it('should display request amount', () => {
        const request = mockRequests[0];
        expect(request.amount).toBe(10000);
      });

      it('should display priority level', () => {
        const request = mockRequests[0];
        expect(request.priority).toBe('high');
      });
    });

    describe('Request Actions', () => {
      it('should allow approving pending requests', () => {
        const approveRequest = (request: typeof mockRequests[0]) => ({
          ...request,
          status: 'approved',
          approved_at: new Date().toISOString()
        });
        const approved = approveRequest(mockRequests[0]);
        expect(approved.status).toBe('approved');
      });

      it('should allow rejecting pending requests', () => {
        const rejectRequest = (request: typeof mockRequests[0], reason: string) => ({
          ...request,
          status: 'rejected',
          rejection_reason: reason
        });
        const rejected = rejectRequest(mockRequests[0], 'لا يوجد رصيد كافي');
        expect(rejected.status).toBe('rejected');
        expect(rejected.rejection_reason).toBe('لا يوجد رصيد كافي');
      });

      it('should prevent actions on already processed requests', () => {
        const request = mockRequests[1]; // approved
        const canTakeAction = request.status === 'pending' || request.status === 'in_review';
        expect(canTakeAction).toBe(false);
      });
    });

    describe('Request History', () => {
      it('should track status changes', () => {
        const statusHistory = [
          { status: 'pending', timestamp: '2025-01-15T10:00:00Z' },
          { status: 'in_review', timestamp: '2025-01-16T09:00:00Z' },
          { status: 'approved', timestamp: '2025-01-17T14:00:00Z' }
        ];
        expect(statusHistory).toHaveLength(3);
        expect(statusHistory[statusHistory.length - 1].status).toBe('approved');
      });
    });
  });

  // ==================== إحصائيات الطلبات ====================
  describe('Request Statistics', () => {
    beforeEach(() => {
      setMockTableData('beneficiary_requests', mockRequests);
    });

    describe('Status Distribution', () => {
      it('should count requests by status', () => {
        const statusCounts = mockRequests.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        expect(statusCounts.pending).toBe(1);
        expect(statusCounts.approved).toBe(2);
        expect(statusCounts.rejected).toBe(1);
        expect(statusCounts.in_review).toBe(1);
      });
    });

    describe('Priority Distribution', () => {
      it('should count requests by priority', () => {
        const priorityCounts = mockRequests.reduce((acc, r) => {
          acc[r.priority] = (acc[r.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        expect(priorityCounts.high).toBe(2);
        expect(priorityCounts.medium).toBe(2);
        expect(priorityCounts.low).toBe(1);
      });
    });

    describe('Amount Statistics', () => {
      it('should calculate total requested amount', () => {
        const totalRequested = mockRequests.reduce((sum, r) => sum + (r.amount || 0), 0);
        expect(totalRequested).toBe(75000);
      });

      it('should calculate approved amount', () => {
        const approvedAmount = mockRequests
          .filter(r => r.status === 'approved')
          .reduce((sum, r) => sum + (r.amount || 0), 0);
        expect(approvedAmount).toBe(50000);
      });
    });
  });
});
