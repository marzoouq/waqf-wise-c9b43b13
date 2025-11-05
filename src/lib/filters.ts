import { FilterParams } from "@/types";

/**
 * Generic filter function for lists
 */
export function filterItems<T extends Record<string, any>>(
  items: T[],
  filters: FilterParams,
  searchFields: (keyof T)[]
): T[] {
  return items.filter((item) => {
    // Search filter
    const matchesSearch =
      !filters.searchQuery ||
      searchFields.some((field) =>
        String(item[field])
          .toLowerCase()
          .includes(filters.searchQuery!.toLowerCase())
      );

    // Status filter
    const matchesStatus =
      !filters.status || filters.status === "all" || item.status === filters.status;

    // Category filter
    const matchesCategory =
      !filters.category || filters.category === "all" || item.category === filters.category;

    // Date filters
    let matchesDateFrom = true;
    let matchesDateTo = true;

    if (filters.dateFrom || filters.dateTo) {
      const itemDate = item.created_at || item.date || item.payment_date || item.entry_date;
      
      if (itemDate) {
        const date = new Date(itemDate);
        
        if (filters.dateFrom) {
          matchesDateFrom = date >= new Date(filters.dateFrom);
        }
        
        if (filters.dateTo) {
          matchesDateTo = date <= new Date(filters.dateTo);
        }
      }
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDateFrom && matchesDateTo;
  });
}

/**
 * Beneficiary specific filters
 */
export function filterBeneficiaries<T extends { full_name: string; national_id: string; phone: string; status: string; category?: string }>(
  beneficiaries: T[],
  searchQuery: string,
  statusFilter?: string,
  categoryFilter?: string
): T[] {
  return beneficiaries.filter((beneficiary) => {
    const matchesSearch =
      !searchQuery ||
      beneficiary.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.national_id.includes(searchQuery) ||
      beneficiary.phone.includes(searchQuery);

    const matchesStatus = !statusFilter || statusFilter === "all" || beneficiary.status === statusFilter;
    const matchesCategory = !categoryFilter || categoryFilter === "all" || beneficiary.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });
}

/**
 * Properties specific filters
 */
export function filterProperties<T extends { name: string; location: string; type: string; status: string }>(
  properties: T[],
  searchQuery: string,
  statusFilter?: string,
  typeFilter?: string
): T[] {
  return properties.filter((property) => {
    const matchesSearch =
      !searchQuery ||
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || statusFilter === "all" || property.status === statusFilter;
    const matchesType = !typeFilter || typeFilter === "all" || property.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });
}

/**
 * Payments specific filters
 */
export function filterPayments<T extends { payment_number: string; payer_name: string; description: string; payment_type: string; payment_date: string }>(
  payments: T[],
  searchQuery: string,
  typeFilter?: string,
  dateFrom?: string,
  dateTo?: string
): T[] {
  return payments.filter((payment) => {
    const matchesSearch =
      !searchQuery ||
      payment.payment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !typeFilter || typeFilter === "all" || payment.payment_type === typeFilter;

    let matchesDateFrom = true;
    let matchesDateTo = true;

    if (dateFrom || dateTo) {
      const paymentDate = new Date(payment.payment_date);
      
      if (dateFrom) {
        matchesDateFrom = paymentDate >= new Date(dateFrom);
      }
      
      if (dateTo) {
        matchesDateTo = paymentDate <= new Date(dateTo);
      }
    }

    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });
}

/**
 * Pagination helper
 */
export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMeta(totalItems: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex: (page - 1) * pageSize + 1,
    endIndex: Math.min(page * pageSize, totalItems),
  };
}

/**
 * Filter by status
 */
export function filterByStatus<T extends { status: string }>(
  items: T[],
  status: string
): T[] {
  if (status === "all") return items;
  return items.filter((item) => item.status === status);
}

/**
 * Filter by date range
 */
export function filterByDateRange<T extends { date: string }>(
  items: T[],
  dateFrom?: string,
  dateTo?: string
): T[] {
  if (!dateFrom && !dateTo) return items;
  
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    if (dateFrom && itemDate < new Date(dateFrom)) return false;
    if (dateTo && itemDate > new Date(dateTo)) return false;
    return true;
  });
}

/**
 * Search by text
 */
export function searchByText<T extends Record<string, any>>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) =>
      String(item[field]).toLowerCase().includes(lowerQuery)
    )
  );
}
