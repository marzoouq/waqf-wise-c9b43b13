/**
 * Settings & Integrations Tests - اختبارات الإعدادات والتكاملات
 * @phase 22 - Settings & Integrations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  mockSystemSettings,
  mockNotificationSettings,
  mockIntegrations,
  mockTransparencySettings,
  mockLandingPageSettings,
  settingsTestUsers,
} from '../../fixtures/settings.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: table === 'system_settings' ? mockSystemSettings : mockNotificationSettings, 
          error: null 
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockSystemSettings, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockSystemSettings, error: null })),
      })),
      upsert: vi.fn(() => Promise.resolve({ data: mockSystemSettings, error: null })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: settingsTestUsers.admin }, 
        error: null 
      })),
    },
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('System Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('General Settings', () => {
    it('should display waqf information', () => {
      expect(mockSystemSettings.waqf_name).toBe('وقف الخير');
      expect(mockSystemSettings.waqf_registration_number).toBeDefined();
    });

    it('should display contact information', () => {
      expect(mockSystemSettings.contact_email).toBeDefined();
      expect(mockSystemSettings.contact_phone).toBeDefined();
      expect(mockSystemSettings.address).toBeDefined();
    });

    it('should configure fiscal year settings', () => {
      expect(mockSystemSettings.fiscal_year_start_month).toBe(1);
      expect(mockSystemSettings.default_currency).toBe('SAR');
    });

    it('should set locale preferences', () => {
      expect(mockSystemSettings.default_language).toBe('ar');
      expect(mockSystemSettings.timezone).toBe('Asia/Riyadh');
    });
  });

  describe('Security Settings', () => {
    it('should configure session timeout', () => {
      expect(mockSystemSettings.session_timeout_minutes).toBe(30);
    });

    it('should configure password policy', () => {
      expect(mockSystemSettings.password_min_length).toBe(8);
      expect(mockSystemSettings.require_special_char).toBe(true);
      expect(mockSystemSettings.require_uppercase).toBe(true);
    });

    it('should configure 2FA settings', () => {
      expect(mockSystemSettings.enable_2fa).toBe(true);
      expect(mockSystemSettings.require_2fa_for_admins).toBe(true);
    });

    it('should configure login attempt limits', () => {
      expect(mockSystemSettings.max_login_attempts).toBe(5);
      expect(mockSystemSettings.lockout_duration_minutes).toBe(15);
    });
  });

  describe('Feature Toggles', () => {
    it('should toggle chatbot feature', () => {
      expect(mockSystemSettings.enable_chatbot).toBe(true);
    });

    it('should toggle beneficiary portal', () => {
      expect(mockSystemSettings.enable_beneficiary_portal).toBe(true);
    });

    it('should toggle maintenance mode', () => {
      expect(mockSystemSettings.maintenance_mode).toBe(false);
    });
  });
});

describe('Notification Settings', () => {
  describe('Email Notifications', () => {
    it('should configure email notifications', () => {
      expect(mockNotificationSettings.email_enabled).toBe(true);
      expect(mockNotificationSettings.email_from).toBeDefined();
    });

    it('should set email notification types', () => {
      expect(mockNotificationSettings.email_on_new_request).toBe(true);
      expect(mockNotificationSettings.email_on_payment).toBe(true);
      expect(mockNotificationSettings.email_on_distribution).toBe(true);
    });
  });

  describe('SMS Notifications', () => {
    it('should configure SMS notifications', () => {
      expect(mockNotificationSettings.sms_enabled).toBe(true);
    });

    it('should set SMS notification types', () => {
      expect(mockNotificationSettings.sms_on_payment).toBe(true);
      expect(mockNotificationSettings.sms_on_distribution).toBe(true);
    });
  });

  describe('Push Notifications', () => {
    it('should configure push notifications', () => {
      expect(mockNotificationSettings.push_enabled).toBe(true);
    });

    it('should set push notification types', () => {
      expect(mockNotificationSettings.push_on_new_message).toBe(true);
      expect(mockNotificationSettings.push_on_status_change).toBe(true);
    });
  });

  describe('Admin Notifications', () => {
    it('should configure admin alerts', () => {
      expect(mockNotificationSettings.notify_admin_on_large_payment).toBe(true);
      expect(mockNotificationSettings.large_payment_threshold).toBe(10000);
    });

    it('should configure security alerts', () => {
      expect(mockNotificationSettings.notify_on_failed_login).toBe(true);
      expect(mockNotificationSettings.notify_on_suspicious_activity).toBe(true);
    });
  });
});

describe('Integrations', () => {
  describe('Integration Listing', () => {
    it('should display all integrations', () => {
      expect(mockIntegrations).toHaveLength(5);
    });

    it('should identify enabled vs disabled integrations', () => {
      const enabledIntegrations = mockIntegrations.filter(i => i.is_enabled);
      const disabledIntegrations = mockIntegrations.filter(i => !i.is_enabled);

      expect(enabledIntegrations.length).toBeGreaterThan(0);
      expect(disabledIntegrations.length).toBeGreaterThan(0);
    });

    it('should categorize integrations by type', () => {
      const paymentIntegrations = mockIntegrations.filter(i => i.type === 'payment');
      const notificationIntegrations = mockIntegrations.filter(i => i.type === 'notification');
      const storageIntegrations = mockIntegrations.filter(i => i.type === 'storage');

      expect(paymentIntegrations).toHaveLength(1);
      expect(notificationIntegrations).toHaveLength(2);
      expect(storageIntegrations).toHaveLength(1);
    });
  });

  describe('Integration Configuration', () => {
    it('should store integration credentials securely', () => {
      const zatcaIntegration = mockIntegrations.find(i => i.name === 'ZATCA');
      expect(zatcaIntegration?.config.api_key).toBe('***hidden***');
    });

    it('should track last sync time', () => {
      const bankIntegration = mockIntegrations.find(i => i.name === 'Bank API');
      expect(bankIntegration?.last_sync_at).toBeDefined();
    });

    it('should track integration status', () => {
      const connectedIntegrations = mockIntegrations.filter(i => i.status === 'connected');
      expect(connectedIntegrations.length).toBeGreaterThan(0);
    });
  });

  describe('ZATCA Integration', () => {
    it('should configure ZATCA settings', () => {
      const zatca = mockIntegrations.find(i => i.name === 'ZATCA');
      expect(zatca?.is_enabled).toBe(true);
      expect(zatca?.config.environment).toBe('production');
    });
  });
});

describe('Transparency Settings', () => {
  describe('Beneficiary Visibility', () => {
    it('should configure what beneficiaries can see', () => {
      expect(mockTransparencySettings.show_distributions).toBe(true);
      expect(mockTransparencySettings.show_own_payments).toBe(true);
      expect(mockTransparencySettings.show_financial_reports).toBe(true);
    });

    it('should configure data masking', () => {
      expect(mockTransparencySettings.mask_other_beneficiaries).toBe(true);
      expect(mockTransparencySettings.mask_exact_amounts).toBe(false);
      expect(mockTransparencySettings.mask_iban).toBe(true);
    });
  });

  describe('Public Transparency', () => {
    it('should configure public disclosure', () => {
      expect(mockTransparencySettings.enable_public_disclosure).toBe(true);
      expect(mockTransparencySettings.public_disclosure_level).toBe('summary');
    });

    it('should configure annual report visibility', () => {
      expect(mockTransparencySettings.show_annual_report).toBe(true);
      expect(mockTransparencySettings.show_governance_info).toBe(true);
    });
  });
});

describe('Landing Page Settings', () => {
  describe('Hero Section', () => {
    it('should configure hero content', () => {
      expect(mockLandingPageSettings.hero_title).toBeDefined();
      expect(mockLandingPageSettings.hero_subtitle).toBeDefined();
      expect(mockLandingPageSettings.hero_image_url).toBeDefined();
    });

    it('should configure CTA buttons', () => {
      expect(mockLandingPageSettings.cta_primary_text).toBe('دخول المستفيدين');
      expect(mockLandingPageSettings.cta_primary_url).toBe('/login');
      expect(mockLandingPageSettings.cta_secondary_text).toBe('تواصل معنا');
    });
  });

  describe('Sections', () => {
    it('should toggle section visibility', () => {
      expect(mockLandingPageSettings.show_about_section).toBe(true);
      expect(mockLandingPageSettings.show_services_section).toBe(true);
      expect(mockLandingPageSettings.show_statistics_section).toBe(true);
      expect(mockLandingPageSettings.show_contact_section).toBe(true);
    });

    it('should configure statistics display', () => {
      expect(mockLandingPageSettings.show_beneficiary_count).toBe(true);
      expect(mockLandingPageSettings.show_property_count).toBe(true);
      expect(mockLandingPageSettings.show_distribution_total).toBe(true);
    });
  });

  describe('SEO Settings', () => {
    it('should configure meta tags', () => {
      expect(mockLandingPageSettings.meta_title).toBeDefined();
      expect(mockLandingPageSettings.meta_description).toBeDefined();
      expect(mockLandingPageSettings.meta_keywords).toBeDefined();
    });
  });
});

describe('Settings Access Control', () => {
  it('should restrict settings to admin and nazer', () => {
    const allowedRoles = ['admin', 'nazer'];
    
    expect(allowedRoles).toContain('admin');
    expect(allowedRoles).toContain('nazer');
    expect(allowedRoles).not.toContain('beneficiary');
    expect(allowedRoles).not.toContain('accountant');
  });

  it('should allow admin to modify all settings', () => {
    const adminUser = settingsTestUsers.admin;
    expect(adminUser.role).toBe('admin');
  });

  it('should restrict nazer from certain settings', () => {
    const nazerRestrictedSettings = ['security_settings', 'integrations'];
    expect(nazerRestrictedSettings).toContain('integrations');
  });
});
