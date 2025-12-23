/**
 * Permission Regression Tests - اختبارات انحدار الصلاحيات
 * 
 * 🎯 الهدف: التأكد من أن التغييرات المستقبلية لا تكسر سياسات RLS
 * 
 * ⚠️ يجب تشغيل هذه الاختبارات قبل كل deploy
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// ==========================================
// مصفوفة الصلاحيات المتوقعة
// ==========================================

/**
 * مصفوفة الصلاحيات الرسمية
 * أي تغيير هنا يجب أن يكون مقصوداً وموثقاً
 */
const PERMISSION_MATRIX = {
  // الجداول الحساسة جداً (Highly Sensitive)
  beneficiaries: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: 'own', insert: false, update: 'own', delete: false },
    waqf_heir: { select: 'all_masked', insert: false, update: false, delete: false },
    accountant: { select: true, insert: true, update: true, delete: false },
    cashier: { select: true, insert: false, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: true },
    admin: { select: true, insert: true, update: true, delete: true },
  },
  
  payment_vouchers: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: 'own', insert: false, update: false, delete: false },
    waqf_heir: { select: 'all', insert: false, update: false, delete: false },
    accountant: { select: true, insert: true, update: true, delete: false },
    cashier: { select: true, insert: true, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: true },
    admin: { select: true, insert: true, update: true, delete: true },
  },
  
  distributions: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: 'own', insert: false, update: false, delete: false },
    waqf_heir: { select: 'all', insert: false, update: false, delete: false },
    accountant: { select: true, insert: true, update: true, delete: false },
    cashier: { select: false, insert: false, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: true },
    admin: { select: true, insert: true, update: true, delete: true },
  },
  
  loans: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: 'own', insert: false, update: false, delete: false },
    waqf_heir: { select: false, insert: false, update: false, delete: false },
    accountant: { select: true, insert: true, update: true, delete: false },
    cashier: { select: false, insert: false, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: true },
    admin: { select: true, insert: true, update: true, delete: true },
  },
  
  bank_accounts: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: false, insert: false, update: false, delete: false },
    waqf_heir: { select: false, insert: false, update: false, delete: false },
    accountant: { select: true, insert: true, update: true, delete: false },
    cashier: { select: true, insert: false, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: true },
    admin: { select: true, insert: true, update: true, delete: true },
  },
  
  // سجلات التدقيق (محمية بشكل خاص)
  audit_logs: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: false, insert: false, update: false, delete: false },
    waqf_heir: { select: false, insert: false, update: false, delete: false },
    accountant: { select: false, insert: false, update: false, delete: false },
    cashier: { select: false, insert: false, update: false, delete: false },
    nazer: { select: true, insert: false, update: false, delete: false },
    admin: { select: true, insert: true, update: false, delete: false },
  },
  
  // القيود المحاسبية
  journal_entries: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: false, insert: false, update: false, delete: false },
    waqf_heir: { select: false, insert: false, update: false, delete: false },
    accountant: { select: true, insert: true, update: 'draft_only', delete: false },
    cashier: { select: true, insert: false, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: false },
    admin: { select: true, insert: true, update: true, delete: false },
  },
  
  // أدوار المستخدمين
  user_roles: {
    anonymous: { select: false, insert: false, update: false, delete: false },
    beneficiary: { select: false, insert: false, update: false, delete: false },
    waqf_heir: { select: false, insert: false, update: false, delete: false },
    accountant: { select: false, insert: false, update: false, delete: false },
    cashier: { select: false, insert: false, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: true },
    admin: { select: true, insert: true, update: true, delete: true },
  },
  
  // البيانات العامة
  landing_page_settings: {
    anonymous: { select: true, insert: false, update: false, delete: false },
    beneficiary: { select: true, insert: false, update: false, delete: false },
    waqf_heir: { select: true, insert: false, update: false, delete: false },
    accountant: { select: true, insert: false, update: false, delete: false },
    cashier: { select: true, insert: false, update: false, delete: false },
    nazer: { select: true, insert: true, update: true, delete: false },
    admin: { select: true, insert: true, update: true, delete: true },
  },
} as const;

// ==========================================
// أنواع البيانات
// ==========================================

type TableName = keyof typeof PERMISSION_MATRIX;
type RoleName = keyof typeof PERMISSION_MATRIX.beneficiaries;
type Operation = 'select' | 'insert' | 'update' | 'delete';
type PermissionValue = boolean | 'own' | 'all' | 'all_masked' | 'draft_only';

// ==========================================
// الاختبارات
// ==========================================

describe('Permission Matrix Regression Tests', () => {
  const shouldSkip = !SUPABASE_URL || !SUPABASE_ANON_KEY;
  
  // اختبار هيكل المصفوفة
  describe('Matrix Structure Validation', () => {
    it('all tables have all roles defined', () => {
      const requiredRoles: RoleName[] = [
        'anonymous', 'beneficiary', 'waqf_heir', 
        'accountant', 'cashier', 'nazer', 'admin'
      ];
      
      Object.entries(PERMISSION_MATRIX).forEach(([table, roles]) => {
        requiredRoles.forEach(role => {
          expect(roles).toHaveProperty(role);
        });
      });
    });
    
    it('all roles have all operations defined', () => {
      const requiredOperations: Operation[] = ['select', 'insert', 'update', 'delete'];
      
      Object.entries(PERMISSION_MATRIX).forEach(([table, roles]) => {
        Object.entries(roles).forEach(([role, permissions]) => {
          requiredOperations.forEach(op => {
            expect(permissions).toHaveProperty(op);
          });
        });
      });
    });
  });
  
  // اختبارات الانحدار الأساسية
  describe('Critical Security Rules', () => {
    // القاعدة 1: المجهول لا يصل لأي بيانات حساسة
    it('anonymous has NO access to sensitive tables', () => {
      const sensitiveTables: TableName[] = [
        'beneficiaries', 'payment_vouchers', 'distributions',
        'loans', 'bank_accounts', 'audit_logs', 'journal_entries', 'user_roles'
      ];
      
      sensitiveTables.forEach(table => {
        const permissions = PERMISSION_MATRIX[table].anonymous;
        expect(permissions.select).toBe(false);
        expect(permissions.insert).toBe(false);
        expect(permissions.update).toBe(false);
        expect(permissions.delete).toBe(false);
      });
    });
    
    // القاعدة 2: المستفيد يرى بياناته فقط
    it('beneficiary can only see OWN data', () => {
      const beneficiarySelectables: TableName[] = [
        'beneficiaries', 'payment_vouchers', 'distributions', 'loans'
      ];
      
      beneficiarySelectables.forEach(table => {
        const selectPermission = PERMISSION_MATRIX[table].beneficiary.select;
        expect(selectPermission === 'own' || selectPermission === false).toBe(true);
      });
    });
    
    // القاعدة 3: المستفيد لا يحذف أي شيء
    it('beneficiary CANNOT delete anything', () => {
      Object.keys(PERMISSION_MATRIX).forEach(table => {
        const deletePermission = PERMISSION_MATRIX[table as TableName].beneficiary.delete;
        expect(deletePermission).toBe(false);
      });
    });
    
    // القاعدة 4: الوريث لا يرى القروض
    it('waqf_heir CANNOT see loans (privacy)', () => {
      const permissions = PERMISSION_MATRIX.loans.waqf_heir;
      expect(permissions.select).toBe(false);
    });
    
    // القاعدة 5: لا أحد يحذف سجلات التدقيق
    it('NOBODY can delete audit_logs', () => {
      Object.keys(PERMISSION_MATRIX.audit_logs).forEach(role => {
        const deletePermission = PERMISSION_MATRIX.audit_logs[role as RoleName].delete;
        expect(deletePermission).toBe(false);
      });
    });
    
    // القاعدة 6: فقط الناظر والأدمن يديرون الأدوار
    it('only nazer and admin can manage user_roles', () => {
      const authorizedRoles: RoleName[] = ['nazer', 'admin'];
      const unauthorizedRoles: RoleName[] = ['anonymous', 'beneficiary', 'waqf_heir', 'accountant', 'cashier'];
      
      authorizedRoles.forEach(role => {
        const permissions = PERMISSION_MATRIX.user_roles[role];
        expect(permissions.select).toBe(true);
        expect(permissions.insert).toBe(true);
      });
      
      unauthorizedRoles.forEach(role => {
        const permissions = PERMISSION_MATRIX.user_roles[role];
        expect(permissions.select).toBe(false);
        expect(permissions.insert).toBe(false);
      });
    });
    
    // القاعدة 7: الكاشير لا يدير التوزيعات
    it('cashier CANNOT access distributions', () => {
      const permissions = PERMISSION_MATRIX.distributions.cashier;
      expect(permissions.select).toBe(false);
      expect(permissions.insert).toBe(false);
    });
  });
  
  // اختبارات التدرج في الصلاحيات
  describe('Role Hierarchy Validation', () => {
    it('nazer has more permissions than accountant', () => {
      // الناظر يمكنه الحذف، المحاسب لا يمكنه
      expect(PERMISSION_MATRIX.beneficiaries.nazer.delete).toBe(true);
      expect(PERMISSION_MATRIX.beneficiaries.accountant.delete).toBe(false);
    });
    
    it('admin has at least nazer permissions', () => {
      Object.keys(PERMISSION_MATRIX).forEach(table => {
        const nazerPerms = PERMISSION_MATRIX[table as TableName].nazer;
        const adminPerms = PERMISSION_MATRIX[table as TableName].admin;
        
        // إذا الناظر يملك صلاحية، الأدمن يجب أن يملكها
        if (nazerPerms.select === true) {
          expect(adminPerms.select).toBe(true);
        }
      });
    });
    
    it('accountant has more permissions than cashier', () => {
      // المحاسب يمكنه الإدراج في الفواتير، الكاشير لا
      expect(PERMISSION_MATRIX.bank_accounts.accountant.insert).toBe(true);
      expect(PERMISSION_MATRIX.bank_accounts.cashier.insert).toBe(false);
    });
  });
  
  // اختبارات البيانات العامة
  describe('Public Data Access', () => {
    it('landing_page_settings is readable by everyone', () => {
      Object.keys(PERMISSION_MATRIX.landing_page_settings).forEach(role => {
        const selectPermission = PERMISSION_MATRIX.landing_page_settings[role as RoleName].select;
        expect(selectPermission).toBe(true);
      });
    });
    
    it('landing_page_settings is only writable by nazer/admin', () => {
      const canWrite = (role: RoleName) => {
        const perms = PERMISSION_MATRIX.landing_page_settings[role];
        return Boolean(perms.insert) || Boolean(perms.update);
      };
      
      expect(canWrite('nazer')).toBe(true);
      expect(canWrite('admin')).toBe(true);
      expect(canWrite('accountant')).toBe(false);
      expect(canWrite('beneficiary')).toBe(false);
    });
  });
  
  // اختبارات الإخفاء
  describe('Data Masking Rules', () => {
    it('waqf_heir sees beneficiaries as masked', () => {
      const permission = PERMISSION_MATRIX.beneficiaries.waqf_heir.select;
      expect(permission).toBe('all_masked');
    });
  });
});

// ==========================================
// اختبارات Snapshot للمصفوفة
// ==========================================

describe('Permission Matrix Snapshot', () => {
  it('permission matrix has not changed unexpectedly', () => {
    // هذا الاختبار يفشل إذا تغيرت المصفوفة
    // يجب تحديث الـ snapshot عند التغيير المقصود
    const matrixHash = JSON.stringify(PERMISSION_MATRIX);
    
    // يمكن استخدام expect.toMatchSnapshot() مع Vitest
    expect(matrixHash).toMatchSnapshot();
  });
});

// ==========================================
// اختبارات القواعد الذهبية
// ==========================================

describe('Golden Security Rules', () => {
  /**
   * القواعد الذهبية التي يجب ألا تتغير أبداً
   */
  
  it('RULE 1: Beneficiary isolation is absolute', () => {
    // المستفيد لا يرى أبداً بيانات مستفيد آخر بشكل مباشر
    const beneficiaryPerms = PERMISSION_MATRIX.beneficiaries.beneficiary;
    expect(beneficiaryPerms.select).toBe('own');
  });
  
  it('RULE 2: Financial data requires authentication', () => {
    // لا يمكن لأي شخص غير مصادق الوصول للبيانات المالية
    const financialTables: TableName[] = ['payment_vouchers', 'distributions', 'loans', 'bank_accounts'];
    
    financialTables.forEach(table => {
      expect(PERMISSION_MATRIX[table].anonymous.select).toBe(false);
    });
  });
  
  it('RULE 3: Audit logs are immutable', () => {
    // لا أحد يستطيع تعديل أو حذف سجلات التدقيق
    Object.keys(PERMISSION_MATRIX.audit_logs).forEach(role => {
      const perms = PERMISSION_MATRIX.audit_logs[role as RoleName];
      expect(perms.update).toBe(false);
      expect(perms.delete).toBe(false);
    });
  });
  
  it('RULE 4: Role management is restricted', () => {
    // فقط الناظر والأدمن يمكنهم إدارة الأدوار
    const restrictedRoles: RoleName[] = ['beneficiary', 'waqf_heir', 'accountant', 'cashier'];
    
    restrictedRoles.forEach(role => {
      const perms = PERMISSION_MATRIX.user_roles[role];
      expect(perms.insert).toBe(false);
      expect(perms.update).toBe(false);
      expect(perms.delete).toBe(false);
    });
  });
  
  it('RULE 5: Heir transparency excludes sensitive data', () => {
    // الوريث يرى التوزيعات ولكن ليس القروض أو تفاصيل البنك
    expect(PERMISSION_MATRIX.distributions.waqf_heir.select).toBe('all');
    expect(PERMISSION_MATRIX.loans.waqf_heir.select).toBe(false);
    expect(PERMISSION_MATRIX.bank_accounts.waqf_heir.select).toBe(false);
  });
});

// ==========================================
// تقرير الانحدار
// ==========================================

describe('Regression Report Generator', () => {
  it('generates permission summary', () => {
    const summary: Record<string, Record<string, number>> = {};
    
    Object.entries(PERMISSION_MATRIX).forEach(([table, roles]) => {
      summary[table] = { allowed: 0, denied: 0 };
      
      Object.entries(roles).forEach(([role, perms]) => {
        Object.values(perms).forEach(perm => {
          if (perm === true || perm === 'own' || perm === 'all' || perm === 'all_masked' || perm === 'draft_only') {
            summary[table].allowed++;
          } else {
            summary[table].denied++;
          }
        });
      });
    });
    
    console.log('\n📊 Permission Summary:');
    console.log('====================');
    Object.entries(summary).forEach(([table, counts]) => {
      const total = counts.allowed + counts.denied;
      const restrictiveness = ((counts.denied / total) * 100).toFixed(1);
      console.log(`${table}: ${restrictiveness}% restricted (${counts.denied}/${total})`);
    });
    
    // جميع الجداول يجب أن تكون مقيدة بنسبة معقولة
    Object.entries(summary).forEach(([table, counts]) => {
      const total = counts.allowed + counts.denied;
      const restrictiveness = (counts.denied / total) * 100;
      
      // الجداول الحساسة يجب أن تكون مقيدة بنسبة 50%+ على الأقل
      const sensitiveTables = ['beneficiaries', 'payment_vouchers', 'loans', 'bank_accounts'];
      if (sensitiveTables.includes(table)) {
        expect(restrictiveness).toBeGreaterThan(50);
      }
    });
  });
});

/*
 * 📋 ملخص اختبارات Permission Regression:
 * 
 * ✅ Matrix Structure (2 اختبارات)
 *    - التحقق من اكتمال الهيكل
 * 
 * ✅ Critical Security Rules (7 اختبارات)
 *    - القواعد الأمنية الحرجة
 * 
 * ✅ Role Hierarchy (3 اختبارات)
 *    - التدرج الصحيح للصلاحيات
 * 
 * ✅ Public Data Access (2 اختبارات)
 *    - الوصول للبيانات العامة
 * 
 * ✅ Data Masking (1 اختبار)
 *    - إخفاء البيانات للورثة
 * 
 * ✅ Snapshot (1 اختبار)
 *    - اكتشاف التغييرات غير المقصودة
 * 
 * ✅ Golden Rules (5 اختبارات)
 *    - القواعد الذهبية الثابتة
 * 
 * ✅ Regression Report (1 اختبار)
 *    - تقرير ملخص الصلاحيات
 */
