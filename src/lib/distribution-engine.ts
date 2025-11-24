/**
 * محرك التوزيع الذكي - 5 أنماط توزيع
 */

export interface Beneficiary {
  id: string;
  full_name: string;
  beneficiary_number: string;
  beneficiary_type?: string;
  priority_level?: number;
  category: string;
  family_size?: number;
  monthly_income?: number;
  number_of_sons?: number;
  number_of_daughters?: number;
  number_of_wives?: number;
  iban?: string | null;
  bank_name?: string | null;
}

export interface DistributionResult {
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_number: string;
  category: string;
  allocated_amount: number;
  percentage: number;
  calculation_basis: string;
  iban?: string | null;
  bank_name?: string | null;
}

export interface DeductionsConfig {
  nazer_percentage: number;
  reserve_percentage: number;
  waqf_corpus_percentage: number;
  maintenance_percentage: number;
  development_percentage: number;
}

export interface DistributionParams {
  total_amount: number;
  beneficiaries: Beneficiary[];
  deductions: DeductionsConfig;
  pattern: 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid';
  custom_weights?: Record<string, number>; // للتوزيع المخصص
  hybrid_config?: {
    shariah_weight: number; // 0-1
    need_weight: number; // 0-1
  };
}

export interface DistributionSummary {
  total_amount: number;
  deductions: {
    nazer_share: number;
    reserve: number;
    waqf_corpus: number;
    maintenance: number;
    development: number;
    total: number;
  };
  distributable_amount: number;
  total_distributed: number;
  beneficiaries_count: number;
  pattern_used: string;
}

export class DistributionEngine {
  /**
   * حساب الاستقطاعات
   */
  private static calculateDeductions(
    totalAmount: number,
    config: DeductionsConfig
  ) {
    const nazer_share = totalAmount * (config.nazer_percentage || 0.05);
    const reserve = totalAmount * (config.reserve_percentage || 0.1);
    const waqf_corpus = totalAmount * (config.waqf_corpus_percentage || 0.05);
    const maintenance = totalAmount * (config.maintenance_percentage || 0.03);
    const development = totalAmount * (config.development_percentage || 0.02);

    const total_deductions = nazer_share + reserve + waqf_corpus + maintenance + development;

    return {
      nazer_share: Math.round(nazer_share * 100) / 100,
      reserve: Math.round(reserve * 100) / 100,
      waqf_corpus: Math.round(waqf_corpus * 100) / 100,
      maintenance: Math.round(maintenance * 100) / 100,
      development: Math.round(development * 100) / 100,
      total: Math.round(total_deductions * 100) / 100,
    };
  }

  /**
   * 1. التوزيع الشرعي (حسب الأنصبة الشرعية)
   * الذكر له ضعف الأنثى
   */
  static calculateShariahDistribution(
    params: DistributionParams
  ): { results: DistributionResult[]; summary: DistributionSummary } {
    const deductions = this.calculateDeductions(params.total_amount, params.deductions);
    const distributableAmount = params.total_amount - deductions.total;

    // حساب الأنصبة الشرعية
    let totalShares = 0;
    const beneficiaryShares: Record<string, number> = {};

    params.beneficiaries.forEach((b) => {
      let shares = 0;
      const type = b.beneficiary_type?.toLowerCase() || '';

      if (type.includes('ولد') || type.includes('ابن') || type.includes('son')) {
        shares = 2; // الذكر له سهمان
      } else if (type.includes('بنت') || type.includes('daughter')) {
        shares = 1; // الأنثى لها سهم
      } else if (type.includes('زوجة') || type.includes('wife')) {
        shares = 1; // الزوجة لها سهم
      } else if (type.includes('واقف')) {
        shares = 3; // الواقف له نصيب أكبر
      } else {
        shares = 1; // الباقي سهم واحد
      }

      beneficiaryShares[b.id] = shares;
      totalShares += shares;
    });

    // توزيع المبلغ حسب الأنصبة
    const shareValue = distributableAmount / totalShares;
    const results: DistributionResult[] = params.beneficiaries.map((b) => {
      const shares = beneficiaryShares[b.id];
      const amount = Math.round(shareValue * shares * 100) / 100;

      return {
        beneficiary_id: b.id,
        beneficiary_name: b.full_name,
        beneficiary_number: b.beneficiary_number,
        category: b.category,
        allocated_amount: amount,
        percentage: (amount / distributableAmount) * 100,
        calculation_basis: `${shares} سهم شرعي`,
        iban: b.iban,
        bank_name: b.bank_name,
      };
    });

    const totalDistributed = results.reduce((sum, r) => sum + r.allocated_amount, 0);

    return {
      results,
      summary: {
        total_amount: params.total_amount,
        deductions,
        distributable_amount: distributableAmount,
        total_distributed: Math.round(totalDistributed * 100) / 100,
        beneficiaries_count: params.beneficiaries.length,
        pattern_used: 'التوزيع الشرعي (حسب الأنصبة)',
      },
    };
  }

  /**
   * 2. التوزيع المتساوي (بالتساوي بين الجميع)
   */
  static calculateEqualDistribution(
    params: DistributionParams
  ): { results: DistributionResult[]; summary: DistributionSummary } {
    const deductions = this.calculateDeductions(params.total_amount, params.deductions);
    const distributableAmount = params.total_amount - deductions.total;

    const perBeneficiary = distributableAmount / params.beneficiaries.length;

    const results: DistributionResult[] = params.beneficiaries.map((b) => {
      const amount = Math.round(perBeneficiary * 100) / 100;

      return {
        beneficiary_id: b.id,
        beneficiary_name: b.full_name,
        beneficiary_number: b.beneficiary_number,
        category: b.category,
        allocated_amount: amount,
        percentage: (amount / distributableAmount) * 100,
        calculation_basis: 'توزيع متساوٍ',
        iban: b.iban,
        bank_name: b.bank_name,
      };
    });

    const totalDistributed = results.reduce((sum, r) => sum + r.allocated_amount, 0);

    return {
      results,
      summary: {
        total_amount: params.total_amount,
        deductions,
        distributable_amount: distributableAmount,
        total_distributed: Math.round(totalDistributed * 100) / 100,
        beneficiaries_count: params.beneficiaries.length,
        pattern_used: 'التوزيع المتساوي',
      },
    };
  }

  /**
   * 3. التوزيع حسب الحاجة (بناء على حجم الأسرة والدخل)
   */
  static calculateNeedBasedDistribution(
    params: DistributionParams
  ): { results: DistributionResult[]; summary: DistributionSummary } {
    const deductions = this.calculateDeductions(params.total_amount, params.deductions);
    const distributableAmount = params.total_amount - deductions.total;

    // حساب نقاط الحاجة لكل مستفيد
    let totalNeedPoints = 0;
    const beneficiaryNeeds: Record<string, number> = {};

    params.beneficiaries.forEach((b) => {
      // نقاط حجم الأسرة (1 نقطة لكل فرد)
      const familySize = (b.family_size || 1) + 
                        (b.number_of_sons || 0) + 
                        (b.number_of_daughters || 0) + 
                        (b.number_of_wives || 0);
      
      const familyPoints = familySize;

      // نقاط الدخل (عكسي: كلما قل الدخل زادت النقاط)
      const income = b.monthly_income || 0;
      const incomePoints = income === 0 ? 10 : Math.max(0, 10 - income / 1000);

      // إجمالي نقاط الحاجة
      const needPoints = familyPoints + incomePoints;

      beneficiaryNeeds[b.id] = needPoints;
      totalNeedPoints += needPoints;
    });

    // توزيع المبلغ حسب نقاط الحاجة
    const pointValue = distributableAmount / totalNeedPoints;
    const results: DistributionResult[] = params.beneficiaries.map((b) => {
      const needPoints = beneficiaryNeeds[b.id];
      const amount = Math.round(pointValue * needPoints * 100) / 100;

      return {
        beneficiary_id: b.id,
        beneficiary_name: b.full_name,
        beneficiary_number: b.beneficiary_number,
        category: b.category,
        allocated_amount: amount,
        percentage: (amount / distributableAmount) * 100,
        calculation_basis: `${Math.round(needPoints)} نقطة حاجة`,
        iban: b.iban,
        bank_name: b.bank_name,
      };
    });

    const totalDistributed = results.reduce((sum, r) => sum + r.allocated_amount, 0);

    return {
      results,
      summary: {
        total_amount: params.total_amount,
        deductions,
        distributable_amount: distributableAmount,
        total_distributed: Math.round(totalDistributed * 100) / 100,
        beneficiaries_count: params.beneficiaries.length,
        pattern_used: 'التوزيع حسب الحاجة',
      },
    };
  }

  /**
   * 4. التوزيع المخصص (نسب يدوية)
   */
  static calculateCustomDistribution(
    params: DistributionParams
  ): { results: DistributionResult[]; summary: DistributionSummary } {
    const deductions = this.calculateDeductions(params.total_amount, params.deductions);
    const distributableAmount = params.total_amount - deductions.total;

    if (!params.custom_weights) {
      throw new Error('يجب تحديد الأوزان المخصصة للتوزيع المخصص');
    }

    const results: DistributionResult[] = params.beneficiaries.map((b) => {
      const weight = params.custom_weights![b.id] || 1;
      const percentage = weight;
      const amount = Math.round((distributableAmount * percentage / 100) * 100) / 100;

      return {
        beneficiary_id: b.id,
        beneficiary_name: b.full_name,
        beneficiary_number: b.beneficiary_number,
        category: b.category,
        allocated_amount: amount,
        percentage,
        calculation_basis: `${percentage}% (مخصص)`,
        iban: b.iban,
        bank_name: b.bank_name,
      };
    });

    const totalDistributed = results.reduce((sum, r) => sum + r.allocated_amount, 0);

    return {
      results,
      summary: {
        total_amount: params.total_amount,
        deductions,
        distributable_amount: distributableAmount,
        total_distributed: Math.round(totalDistributed * 100) / 100,
        beneficiaries_count: params.beneficiaries.length,
        pattern_used: 'التوزيع المخصص',
      },
    };
  }

  /**
   * 5. التوزيع المختلط (مزيج من الشرعي والحاجة)
   */
  static calculateHybridDistribution(
    params: DistributionParams
  ): { results: DistributionResult[]; summary: DistributionSummary } {
    const config = params.hybrid_config || { shariah_weight: 0.6, need_weight: 0.4 };
    
    // حساب التوزيع الشرعي
    const shariahResult = this.calculateShariahDistribution(params);
    
    // حساب التوزيع حسب الحاجة
    const needResult = this.calculateNeedBasedDistribution(params);

    // دمج النتائج
    const results: DistributionResult[] = params.beneficiaries.map((b) => {
      const shariahAmount = shariahResult.results.find(r => r.beneficiary_id === b.id)?.allocated_amount || 0;
      const needAmount = needResult.results.find(r => r.beneficiary_id === b.id)?.allocated_amount || 0;

      const amount = Math.round(
        (shariahAmount * config.shariah_weight + needAmount * config.need_weight) * 100
      ) / 100;

      return {
        beneficiary_id: b.id,
        beneficiary_name: b.full_name,
        beneficiary_number: b.beneficiary_number,
        category: b.category,
        allocated_amount: amount,
        percentage: (amount / shariahResult.summary.distributable_amount) * 100,
        calculation_basis: `مختلط (${Math.round(config.shariah_weight * 100)}% شرعي + ${Math.round(config.need_weight * 100)}% حاجة)`,
        iban: b.iban,
        bank_name: b.bank_name,
      };
    });

    const totalDistributed = results.reduce((sum, r) => sum + r.allocated_amount, 0);

    return {
      results,
      summary: {
        total_amount: params.total_amount,
        deductions: shariahResult.summary.deductions,
        distributable_amount: shariahResult.summary.distributable_amount,
        total_distributed: Math.round(totalDistributed * 100) / 100,
        beneficiaries_count: params.beneficiaries.length,
        pattern_used: 'التوزيع المختلط (شرعي + حاجة)',
      },
    };
  }

  /**
   * نقطة الدخول الرئيسية للمحرك
   */
  static calculate(params: DistributionParams): {
    results: DistributionResult[];
    summary: DistributionSummary;
  } {
    switch (params.pattern) {
      case 'shariah':
        return this.calculateShariahDistribution(params);
      case 'equal':
        return this.calculateEqualDistribution(params);
      case 'need_based':
        return this.calculateNeedBasedDistribution(params);
      case 'custom':
        return this.calculateCustomDistribution(params);
      case 'hybrid':
        return this.calculateHybridDistribution(params);
      default:
        throw new Error(`نمط توزيع غير مدعوم: ${params.pattern}`);
    }
  }
}
