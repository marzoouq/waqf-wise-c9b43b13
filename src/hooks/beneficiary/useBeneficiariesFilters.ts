import { useMemo } from "react";
import { Beneficiary } from "@/types/beneficiary";
import { SearchCriteria } from "@/components/beneficiary/admin/AdvancedSearchDialog";
import { safeFilter } from "@/lib/utils/array-safe";
import { matchesStatus } from "@/lib/constants";

export function useBeneficiariesFilters(
  beneficiaries: Beneficiary[],
  searchQuery: string,
  advancedCriteria: SearchCriteria
) {
  const filteredBeneficiaries = useMemo(() => {
    let results = beneficiaries;
    
    // Apply quick search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = safeFilter(results, (b) =>
        b.full_name.toLowerCase().includes(query) ||
        b.national_id.includes(query) ||
        b.phone.includes(query) ||
        (b.family_name && b.family_name.toLowerCase().includes(query))
      );
    }
    
    // Apply advanced criteria
    if (advancedCriteria.fullName) {
      results = safeFilter(results, b => b.full_name.toLowerCase().includes(advancedCriteria.fullName!.toLowerCase()));
    }
    if (advancedCriteria.nationalId) {
      results = safeFilter(results, b => b.national_id.includes(advancedCriteria.nationalId!));
    }
    if (advancedCriteria.phone) {
      results = safeFilter(results, b => b.phone.includes(advancedCriteria.phone!));
    }
    if (advancedCriteria.category) {
      results = safeFilter(results, b => b.category === advancedCriteria.category);
    }
    if (advancedCriteria.status) {
      results = safeFilter(results, b => b.status === advancedCriteria.status);
    }
    if (advancedCriteria.tribe) {
      results = safeFilter(results, b => b.tribe && b.tribe.toLowerCase().includes(advancedCriteria.tribe!.toLowerCase()));
    }
    if (advancedCriteria.city) {
      results = safeFilter(results, b => b.city && b.city.toLowerCase().includes(advancedCriteria.city!.toLowerCase()));
    }
    if (advancedCriteria.gender) {
      results = safeFilter(results, b => b.gender === advancedCriteria.gender);
    }
    if (advancedCriteria.maritalStatus) {
      results = safeFilter(results, b => b.marital_status === advancedCriteria.maritalStatus);
    }
    if (advancedCriteria.priorityLevel) {
      results = safeFilter(results, b => String(b.priority_level || 1) === advancedCriteria.priorityLevel);
    }
    
    return results;
  }, [beneficiaries, searchQuery, advancedCriteria]);

  const stats = useMemo(() => {
    const activeBeneficiaries = safeFilter(beneficiaries, b => matchesStatus(b.status, 'active'));
    const suspendedBeneficiaries = safeFilter(beneficiaries, b => matchesStatus(b.status, 'suspended'));
    const beneficiariesWithFamily = beneficiaries?.filter(b => b.family_name) || [];
    
    return {
      total: beneficiaries?.length || 0,
      active: activeBeneficiaries.length,
      suspended: suspendedBeneficiaries.length,
      families: new Set(beneficiariesWithFamily.map(b => b.family_name)).size,
    };
  }, [beneficiaries]);

  return { filteredBeneficiaries, stats };
}
