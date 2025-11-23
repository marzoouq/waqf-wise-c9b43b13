import { useMemo } from "react";
import { Beneficiary } from "@/types/beneficiary";
import { SearchCriteria } from "@/components/beneficiaries/AdvancedSearchDialog";

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
      results = results.filter(
        (b) =>
          b.full_name.toLowerCase().includes(query) ||
          b.national_id.includes(query) ||
          b.phone.includes(query) ||
          (b.family_name && b.family_name.toLowerCase().includes(query))
      );
    }
    
    // Apply advanced criteria
    if (advancedCriteria.fullName) {
      results = results.filter(b => b.full_name.toLowerCase().includes(advancedCriteria.fullName!.toLowerCase()));
    }
    if (advancedCriteria.nationalId) {
      results = results.filter(b => b.national_id.includes(advancedCriteria.nationalId!));
    }
    if (advancedCriteria.phone) {
      results = results.filter(b => b.phone.includes(advancedCriteria.phone!));
    }
    if (advancedCriteria.category) {
      results = results.filter(b => b.category === advancedCriteria.category);
    }
    if (advancedCriteria.status) {
      results = results.filter(b => b.status === advancedCriteria.status);
    }
    if (advancedCriteria.tribe) {
      results = results.filter(b => b.tribe && b.tribe.toLowerCase().includes(advancedCriteria.tribe!.toLowerCase()));
    }
    if (advancedCriteria.city) {
      results = results.filter(b => b.city && b.city.toLowerCase().includes(advancedCriteria.city!.toLowerCase()));
    }
    if (advancedCriteria.gender) {
      results = results.filter(b => b.gender === advancedCriteria.gender);
    }
    if (advancedCriteria.maritalStatus) {
      results = results.filter(b => b.marital_status === advancedCriteria.maritalStatus);
    }
    if (advancedCriteria.priorityLevel) {
      results = results.filter(b => String(b.priority_level || 1) === advancedCriteria.priorityLevel);
    }
    
    return results;
  }, [beneficiaries, searchQuery, advancedCriteria]);

  const stats = useMemo(() => ({
    total: beneficiaries.length,
    active: beneficiaries.filter(b => b.status === "نشط").length,
    suspended: beneficiaries.filter(b => b.status === "معلق").length,
    families: new Set(beneficiaries.map(b => b.family_name).filter(Boolean)).size,
  }), [beneficiaries]);

  return { filteredBeneficiaries, stats };
}
