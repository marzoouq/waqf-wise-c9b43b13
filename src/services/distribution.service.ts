/**
 * Distribution Service - خدمة إدارة التوزيعات (Facade)
 * 
 * يعيد تصدير جميع الخدمات من الملفات المقسمة للحفاظ على التوافق
 * @version 3.0.0
 */

import { 
  DistributionCoreService,
  DistributionBeneficiaryService,
  DistributionVoucherService,
  DistributionApprovalService,
  DistributionBankService,
  type DistributionSummary,
  type VoucherRecord,
  type VoucherStats,
  type DistributionApproval,
  type ApprovalHistoryItem
} from './distribution';

// إعادة تصدير الأنواع
export type { DistributionSummary, VoucherRecord, VoucherStats, DistributionApproval, ApprovalHistoryItem };

/**
 * Facade Class للحفاظ على التوافق مع الكود القديم
 */
export class DistributionService {
  // === Core Operations ===
  static getAll = DistributionCoreService.getAll;
  static getById = DistributionCoreService.getById;
  static create = DistributionCoreService.create;
  static update = DistributionCoreService.update;
  static delete = DistributionCoreService.delete;
  static approve = DistributionCoreService.approve;
  static reject = DistributionCoreService.reject;
  static getSummary = DistributionCoreService.getSummary;
  static simulate = DistributionCoreService.simulate;

  // === Beneficiary Operations ===
  static getHeirDistributions = DistributionBeneficiaryService.getHeirDistributions;
  static getByBeneficiary = DistributionBeneficiaryService.getByBeneficiary;
  static selectBeneficiaries = DistributionBeneficiaryService.selectBeneficiaries;
  static getFamilyMembers = DistributionBeneficiaryService.getFamilyMembers;
  static getDisclosureBeneficiaries = DistributionBeneficiaryService.getDisclosureBeneficiaries;
  static getBeneficiariesForSelector = DistributionBeneficiaryService.getBeneficiariesForSelector;
  static calculateShariahDistribution = DistributionBeneficiaryService.calculateShariahDistribution;

  // === Voucher Operations ===
  static getVouchers = DistributionVoucherService.getVouchers;
  static createVoucher = DistributionVoucherService.createVoucher;
  static getDistributionVouchersWithDetails = DistributionVoucherService.getDistributionVouchersWithDetails;
  static getDistributionVoucherStats = DistributionVoucherService.getDistributionVoucherStats;
  static getPaymentVouchersList = DistributionVoucherService.getPaymentVouchersList;

  // === Approval Operations ===
  static getDistributionApprovals = DistributionApprovalService.getDistributionApprovals;
  static getDistributionHistory = DistributionApprovalService.getDistributionHistory;
  
  /**
   * جلب الجدول الزمني للتوزيع
   */
  static async getTimeline(distributionId: string) {
    const distribution = await DistributionCoreService.getById(distributionId);
    if (!distribution) throw new Error('التوزيع غير موجود');
    return DistributionApprovalService.getTimeline(distributionId, distribution);
  }

  // === Bank Operations ===
  static uploadBankStatement = DistributionBankService.uploadBankStatement;
  static trackTransferStatus = DistributionBankService.trackTransferStatus;
  static getTransferDetails = DistributionBankService.getTransferDetails;
  static getByFiscalYear = DistributionBankService.getByFiscalYear;

  /**
   * إنشاء ملف تحويل بنكي
   */
  static async generateBankTransfer(distributionId: string) {
    return DistributionBankService.generateBankTransfer(
      distributionId,
      DistributionCoreService.getById,
      DistributionVoucherService.getVouchers
    );
  }
}
