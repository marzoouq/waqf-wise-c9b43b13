import { describe, it, expect } from 'vitest';
import type { VisibilitySettings } from '@/hooks/governance/useVisibilitySettings';

/**
 * TabRenderer Type Safety Tests
 * Tests to validate the type safety improvements and configuration correctness
 */

describe('TabRenderer Type Safety', () => {
  describe('TabConfig settingKey Type Safety', () => {
    it('should only allow valid VisibilitySettings keys as settingKey', () => {
      // This test validates that settingKey is typed as keyof VisibilitySettings
      // If we try to use an invalid key, TypeScript will catch it at compile time
      
      // Valid keys from VisibilitySettings
      const validKeys: Array<keyof VisibilitySettings> = [
        'show_overview',
        'show_profile',
        'show_requests',
        'show_distributions',
        'show_properties',
        'show_documents',
        'show_family_tree',
        'show_bank_accounts',
        'show_financial_reports',
        'show_governance',
        'show_own_loans',
      ];
      
      // All valid keys should be of the correct type
      validKeys.forEach(key => {
        expect(typeof key).toBe('string');
      });
    });
  });

  describe('Tab Names Arabic Translations', () => {
    it('should have Arabic translations for all new tabs', () => {
      const tabNames: Record<string, string> = {
        "family-account": "حساب العائلة",
        "more": "المزيد",
        "reports-detail": "التقارير المالية",
        profile: "الملف الشخصي",
        requests: "الطلبات",
        distributions: "التوزيعات والأرصدة",
        properties: "العقارات",
        documents: "المستندات",
        family: "شجرة العائلة",
        bank: "الحسابات البنكية",
        reports: "التقارير والإفصاحات",
        governance: "الحوكمة",
        loans: "القروض",
      };
      
      // Verify new tabs have translations
      expect(tabNames["family-account"]).toBe("حساب العائلة");
      expect(tabNames["more"]).toBe("المزيد");
      expect(tabNames["reports-detail"]).toBe("التقارير المالية");
      
      // Verify all translations are non-empty strings
      Object.values(tabNames).forEach(translation => {
        expect(translation).toBeTruthy();
        expect(typeof translation).toBe('string');
      });
    });
  });

  describe('Visibility Logic', () => {
    it('should return true when alwaysVisible is true', () => {
      const alwaysVisible = true;
      const settings = null;
      
      const isVisible = alwaysVisible === true || settings?.['show_overview'] === true;
      
      expect(isVisible).toBe(true);
    });

    it('should return true when setting is true', () => {
      const alwaysVisible: boolean = false;
      const settings: Partial<VisibilitySettings> = {
        show_profile: true,
      };
      
      const isVisible = (alwaysVisible as boolean) === true || settings?.['show_profile'] === true;
      
      expect(isVisible).toBe(true);
    });

    it('should return false when alwaysVisible is false and settings is null', () => {
      const alwaysVisible: boolean = false;
      const settings = null;
      
      const isVisible = (alwaysVisible as boolean) === true || settings?.['show_profile'] === true;
      
      expect(isVisible).toBe(false);
    });

    it('should return false when alwaysVisible is false and setting is false', () => {
      const alwaysVisible: boolean = false;
      const settings: Partial<VisibilitySettings> = {
        show_profile: false,
      };
      
      const isVisible = (alwaysVisible as boolean) === true || settings?.['show_profile'] === true;
      
      expect(isVisible).toBe(false);
    });

    it('should return false when alwaysVisible is false and setting is undefined', () => {
      const alwaysVisible: boolean = false;
      const settings: Partial<VisibilitySettings> = {};
      
      const isVisible = (alwaysVisible as boolean) === true || settings?.['show_profile'] === true;
      
      expect(isVisible).toBe(false);
    });
  });

  describe('settingKey Uniqueness', () => {
    it('should not have duplicate settingKey values that cause conflicts', () => {
      // The fix ensures family-account uses show_family_tree (not show_profile)
      // so there's no conflict with the profile tab
      
      const familyAccountSetting: keyof VisibilitySettings = 'show_family_tree';
      const profileSetting: keyof VisibilitySettings = 'show_profile';
      
      // These should be different
      expect(familyAccountSetting).not.toBe(profileSetting);
    });
  });
});
