/**
 * Beneficiary Service - خدمة إدارة المستفيدين (Facade)
 * @version 2.8.82
 * 
 * هذا الملف يعمل كـ Facade للتوافق مع الكود القديم
 * الخدمات الفعلية موجودة في مجلد beneficiary/
 */

import { 
  BeneficiaryCoreService, 
  BeneficiaryDocumentsService, 
  BeneficiaryAnalyticsService, 
  BeneficiaryVerificationService,
  BeneficiaryTabsService,
  type BeneficiaryFilters,
  type BeneficiaryStats,
  type ApprovalLogItem,
  type BeneficiaryBankAccount,
} from './beneficiary/index';

// Re-export types
export type { BeneficiaryFilters, BeneficiaryStats, ApprovalLogItem, BeneficiaryBankAccount };

/**
 * Facade class for backward compatibility
 */
export class BeneficiaryService {
  // ==================== Core Methods ====================
  static getAll = BeneficiaryCoreService.getAll;
  static getById = BeneficiaryCoreService.getById;
  static getByNationalId = BeneficiaryCoreService.getByNationalId;
  static create = BeneficiaryCoreService.create;
  static update = BeneficiaryCoreService.update;
  static delete = BeneficiaryCoreService.delete;
  static updateStatus = BeneficiaryCoreService.updateStatus;
  static verify = BeneficiaryCoreService.verify;
  static getStats = BeneficiaryCoreService.getStats;
  static getStatistics = BeneficiaryCoreService.getStatistics;
  static getFamilyMembers = BeneficiaryCoreService.getFamilyMembers;
  static advancedSearch = BeneficiaryCoreService.advancedSearch;
  static getCategories = BeneficiaryCoreService.getCategories;
  static enableLogin = BeneficiaryCoreService.enableLogin;
  static updateNotificationPreferences = BeneficiaryCoreService.updateNotificationPreferences;

  // ==================== Documents Methods ====================
  static getDocuments = BeneficiaryDocumentsService.getDocuments;
  static uploadDocument = BeneficiaryDocumentsService.uploadDocument;
  static deleteDocument = BeneficiaryDocumentsService.deleteDocument;
  static getActivity = BeneficiaryDocumentsService.getActivity;
  static getBankAccounts = BeneficiaryDocumentsService.getBankAccounts;

  // ==================== Analytics Methods ====================
  static getStatements = BeneficiaryAnalyticsService.getStatements;
  static getPaymentsHistory = BeneficiaryAnalyticsService.getPaymentsHistory;
  static getProperties = BeneficiaryAnalyticsService.getProperties;
  static getEmergencyAid = BeneficiaryAnalyticsService.getEmergencyAid;
  static getStatisticsRPC = BeneficiaryAnalyticsService.getStatisticsRPC;
  static getYearlyDistributions = BeneficiaryAnalyticsService.getYearlyDistributions;
  static getMonthlyRevenue = BeneficiaryAnalyticsService.getMonthlyRevenue;
  static getPropertyStats = BeneficiaryAnalyticsService.getPropertyStats;
  static getTimeline = BeneficiaryAnalyticsService.getTimeline;

  // ==================== Verification Methods ====================
  static assessEligibility = BeneficiaryVerificationService.assessEligibility;
  static getEligibilityAssessments = BeneficiaryVerificationService.getEligibilityAssessments;
  static runEligibilityAssessment = BeneficiaryVerificationService.runEligibilityAssessment;
  static verifyIdentity = BeneficiaryVerificationService.verifyIdentity;

  // ==================== Tabs Methods ====================
  static getDistributions = BeneficiaryTabsService.getDistributions;
  static getByUserId = BeneficiaryTabsService.getByUserId;
  static getBeneficiaryIdByUserId = BeneficiaryTabsService.getBeneficiaryIdByUserId;
  static getAccountStatementData = BeneficiaryTabsService.getAccountStatementData;
  static getBeneficiaryPayments = BeneficiaryTabsService.getBeneficiaryPayments;
  static getProfile = BeneficiaryTabsService.getProfile;
  static updateSession = BeneficiaryTabsService.updateSession;
  static endSession = BeneficiaryTabsService.endSession;
  static getRequests = BeneficiaryTabsService.getRequests;
  static createRequest = BeneficiaryTabsService.createRequest;
  static getFamilyTree = BeneficiaryTabsService.getFamilyTree;
  static getDisclosures = BeneficiaryTabsService.getDisclosures;
  static getYearlyRequests = BeneficiaryTabsService.getYearlyRequests;
  static getIntegrationStats = BeneficiaryTabsService.getIntegrationStats;
  static getWaqfDistributionsSummary = BeneficiaryTabsService.getWaqfDistributionsSummary;
  static getQuickList = BeneficiaryTabsService.getQuickList;
  static getApprovalsLog = BeneficiaryTabsService.getApprovalsLog;
  static getWaqfBankAccounts = BeneficiaryTabsService.getWaqfBankAccounts;
  static getStatementsSimple = BeneficiaryTabsService.getStatementsSimple;
  static getAnnualDisclosures = BeneficiaryTabsService.getAnnualDisclosures;
  static getDistributionChartData = BeneficiaryTabsService.getDistributionChartData;
  static getRequestsWithTypes = BeneficiaryTabsService.getRequestsWithTypes;
  static getYearlyComparison = BeneficiaryTabsService.getYearlyComparison;
  static importBeneficiaries = BeneficiaryTabsService.importBeneficiaries;
  static uploadAttachment = BeneficiaryTabsService.uploadAttachment;
  static deleteAttachment = BeneficiaryTabsService.deleteAttachment;
  static createAuthAccount = BeneficiaryTabsService.createAuthAccount;
  static toggleLogin = BeneficiaryTabsService.toggleLogin;
  static assessEligibilityRPC = BeneficiaryTabsService.assessEligibilityRPC;
}
