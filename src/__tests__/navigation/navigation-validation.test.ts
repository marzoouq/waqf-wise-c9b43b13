/**
 * Navigation Validation Tests
 * اختبارات التحقق من صحة التنقل
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  REGISTERED_ROUTES,
  NAVIGATION_REGISTRY,
  extractAllNavigationPaths,
  validateNavigationPath,
  auditNavigationPaths,
  getValidatedNavigation,
  getNavigationStats,
} from '@/config/navigation/navigationRegistry';

describe('Navigation Registry', () => {
  describe('REGISTERED_ROUTES', () => {
    it('should have all core dashboard routes', () => {
      const dashboardRoutes = [
        '/nazer-dashboard',
        '/admin-dashboard',
        '/accountant-dashboard',
        '/cashier-dashboard',
        '/archivist-dashboard',
        '/beneficiary-portal',
      ];
      
      dashboardRoutes.forEach(route => {
        expect(REGISTERED_ROUTES).toContain(route);
      });
    });

    it('should have security routes', () => {
      expect(REGISTERED_ROUTES).toContain('/security');
      expect(REGISTERED_ROUTES).toContain('/audit-logs');
    });

    it('should have governance routes', () => {
      expect(REGISTERED_ROUTES).toContain('/governance/decisions');
      expect(REGISTERED_ROUTES).toContain('/settings/roles');
    });

    it('should not have duplicate routes', () => {
      const uniqueRoutes = new Set(REGISTERED_ROUTES);
      expect(uniqueRoutes.size).toBe(REGISTERED_ROUTES.length);
    });
  });

  describe('NAVIGATION_REGISTRY', () => {
    it('should have navigation for all main roles', () => {
      const requiredRoles = ['nazer', 'admin', 'accountant', 'cashier', 'archivist', 'beneficiary'];
      
      requiredRoles.forEach(role => {
        expect(NAVIGATION_REGISTRY[role]).toBeDefined();
        expect(Array.isArray(NAVIGATION_REGISTRY[role])).toBe(true);
        expect(NAVIGATION_REGISTRY[role].length).toBeGreaterThan(0);
      });
    });

    it('should have waqf_heir using beneficiary navigation', () => {
      expect(NAVIGATION_REGISTRY['waqf_heir']).toBe(NAVIGATION_REGISTRY['beneficiary']);
    });

    it('each navigation item should have required properties', () => {
      Object.entries(NAVIGATION_REGISTRY).forEach(([role, items]) => {
        items.forEach((item, index) => {
          expect(item.id, `${role}[${index}] missing id`).toBeDefined();
          expect(item.label, `${role}[${index}] missing label`).toBeDefined();
          expect(item.icon, `${role}[${index}] missing icon`).toBeDefined();
          expect(item.path, `${role}[${index}] missing path`).toBeDefined();
        });
      });
    });
  });

  describe('extractAllNavigationPaths', () => {
    it('should return unique paths', () => {
      const paths = extractAllNavigationPaths();
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });

    it('should extract base paths without query params', () => {
      const paths = extractAllNavigationPaths();
      
      // جميع المسارات يجب أن تكون بدون query params
      paths.forEach(path => {
        expect(path).not.toContain('?');
      });
    });

    it('should include all dashboard paths', () => {
      const paths = extractAllNavigationPaths();
      
      expect(paths).toContain('/nazer-dashboard');
      expect(paths).toContain('/admin-dashboard');
      expect(paths).toContain('/beneficiary-portal');
    });
  });

  describe('validateNavigationPath', () => {
    it('should validate registered paths as valid', () => {
      const result = validateNavigationPath('/security');
      
      expect(result.isValid).toBe(true);
      expect(result.basePath).toBe('/security');
      expect(result.hasQueryParams).toBe(false);
      expect(result.matchedRoute).toBe('/security');
    });

    it('should handle paths with query params', () => {
      const result = validateNavigationPath('/beneficiary-portal?tab=distributions');
      
      expect(result.basePath).toBe('/beneficiary-portal');
      expect(result.hasQueryParams).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('should mark unregistered paths as invalid', () => {
      const result = validateNavigationPath('/non-existent-route');
      
      expect(result.isValid).toBe(false);
      expect(result.matchedRoute).toBeNull();
    });

    it('should validate child routes of registered parents', () => {
      // إذا كان /settings مسجل، فإن /settings/roles يجب أن يكون صالحاً
      const result = validateNavigationPath('/settings/roles');
      expect(result.isValid).toBe(true);
    });
  });

  describe('auditNavigationPaths', () => {
    let auditResult: ReturnType<typeof auditNavigationPaths>;
    
    beforeAll(() => {
      auditResult = auditNavigationPaths();
    });

    it('should return valid and invalid arrays', () => {
      expect(Array.isArray(auditResult.valid)).toBe(true);
      expect(Array.isArray(auditResult.invalid)).toBe(true);
      expect(Array.isArray(auditResult.warnings)).toBe(true);
    });

    it('should have more valid paths than invalid', () => {
      expect(auditResult.valid.length).toBeGreaterThan(auditResult.invalid.length);
    });

    it('should not have critical paths as invalid', () => {
      const criticalPaths = ['/security', '/settings', '/governance/decisions'];
      
      criticalPaths.forEach(path => {
        expect(auditResult.invalid).not.toContain(path);
      });
    });
  });

  describe('getValidatedNavigation', () => {
    it('should return items and audit for valid role', () => {
      const result = getValidatedNavigation('admin');
      
      expect(result.items).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.audit).toBeDefined();
    });

    it('should return empty items for unknown role', () => {
      const result = getValidatedNavigation('unknown-role');
      
      expect(result.items.length).toBe(0);
    });

    it('admin navigation should have valid paths', () => {
      const result = getValidatedNavigation('admin');
      
      // يجب أن تكون معظم المسارات صالحة
      expect(result.audit.valid.length).toBeGreaterThan(0);
    });

    it('nazer navigation should have /governance/decisions as valid', () => {
      const result = getValidatedNavigation('nazer');
      
      expect(result.audit.valid).toContain('/governance/decisions');
    });
  });

  describe('getNavigationStats', () => {
    it('should return correct structure', () => {
      const stats = getNavigationStats();
      
      expect(stats.totalRoles).toBeGreaterThan(0);
      expect(stats.totalItems).toBeGreaterThan(0);
      expect(stats.totalPaths).toBeGreaterThan(0);
      expect(typeof stats.pathsPerRole).toBe('object');
    });

    it('should have consistent item counts', () => {
      const stats = getNavigationStats();
      
      let calculatedTotal = 0;
      Object.values(stats.pathsPerRole).forEach(count => {
        calculatedTotal += count;
      });
      
      expect(calculatedTotal).toBe(stats.totalItems);
    });

    it('should report 5 items per standard role', () => {
      const stats = getNavigationStats();
      
      // معظم الأدوار لديها 5 عناصر تنقل
      expect(stats.pathsPerRole['admin']).toBe(5);
      expect(stats.pathsPerRole['nazer']).toBe(5);
      expect(stats.pathsPerRole['beneficiary']).toBe(5);
    });
  });
});

describe('Navigation Active State Logic', () => {
  /**
   * محاكاة دالة isItemActive من BottomNavigation
   */
  function mockIsItemActive(
    item: { path: string; matchPaths?: string[] },
    pathname: string,
    search: string
  ): boolean {
    const fullPath = pathname + search;
    
    // مطابقة دقيقة للمسار الكامل (مع query params)
    if (fullPath === item.path) return true;
    if (item.path.includes('?') && fullPath.startsWith(item.path)) return true;
    
    // مطابقة pathname فقط للمسارات بدون query
    if (!item.path.includes('?') && pathname === item.path) return true;
    
    // مطابقة matchPaths
    if (item.matchPaths?.some(p => {
      if (p.includes('?')) {
        return fullPath.startsWith(p) || fullPath === p;
      }
      return pathname.startsWith(p);
    })) return true;
    
    return false;
  }

  describe('Admin Navigation Active States', () => {
    it('should activate security tab on /security route', () => {
      const item = { path: '/security', matchPaths: ['/security', '/audit-logs'] };
      
      expect(mockIsItemActive(item, '/security', '')).toBe(true);
    });

    it('should activate users tab on /settings/roles route', () => {
      const item = { path: '/users', matchPaths: ['/users', '/settings/roles'] };
      
      expect(mockIsItemActive(item, '/settings/roles', '')).toBe(true);
    });
  });

  describe('Nazer Navigation Active States', () => {
    it('should activate more tab on /governance/decisions route', () => {
      const item = { path: '/settings', matchPaths: ['/settings', '/governance/decisions'] };
      
      expect(mockIsItemActive(item, '/governance/decisions', '')).toBe(true);
    });
  });

  describe('Beneficiary Navigation with Query Params', () => {
    it('should activate distributions tab with ?tab=distributions', () => {
      const item = { 
        path: '/beneficiary-portal?tab=distributions', 
        matchPaths: ['/beneficiary-portal?tab=distributions'] 
      };
      
      expect(mockIsItemActive(item, '/beneficiary-portal', '?tab=distributions')).toBe(true);
    });

    it('should activate requests tab with ?tab=requests', () => {
      const item = { 
        path: '/beneficiary-portal?tab=requests', 
        matchPaths: ['/beneficiary-portal?tab=requests', '/beneficiary/requests'] 
      };
      
      expect(mockIsItemActive(item, '/beneficiary-portal', '?tab=requests')).toBe(true);
    });

    it('should NOT activate distributions when on requests tab', () => {
      const item = { 
        path: '/beneficiary-portal?tab=distributions', 
        matchPaths: ['/beneficiary-portal?tab=distributions'] 
      };
      
      expect(mockIsItemActive(item, '/beneficiary-portal', '?tab=requests')).toBe(false);
    });

    it('should activate home on base beneficiary-portal without params', () => {
      const item = { 
        path: '/beneficiary-portal', 
        matchPaths: ['/beneficiary-portal'] 
      };
      
      expect(mockIsItemActive(item, '/beneficiary-portal', '')).toBe(true);
    });
  });

  describe('Cashier Navigation with Query Params', () => {
    it('should activate collect action with ?action=collect', () => {
      const item = { 
        path: '/pos?action=collect', 
        matchPaths: [] 
      };
      
      expect(mockIsItemActive(item, '/pos', '?action=collect')).toBe(true);
    });
  });
});
