import { useState, useMemo } from "react";

interface UseAccountingFiltersProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  dateField?: keyof T;
  statusField?: keyof T;
  statusOptions?: { value: string; label: string }[];
}

export function useAccountingFilters<T extends Record<string, any>>({
  data,
  searchFields,
  dateField,
  statusField,
  statusOptions = [
    { value: "all", label: "الكل" },
    { value: "draft", label: "مسودة" },
    { value: "posted", label: "مرحّل" },
    { value: "cancelled", label: "ملغي" },
  ],
}: UseAccountingFiltersProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchQuery.toLowerCase());
          }
          if (typeof value === "object" && value !== null) {
            return Object.values(value).some(
              (v) =>
                typeof v === "string" &&
                v.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          return false;
        });

      // Status filter
      const matchesStatus =
        !statusField ||
        statusFilter === "all" ||
        item[statusField] === statusFilter;

      // Date filter
      const matchesDate =
        !dateField ||
        ((!dateFrom || String(item[dateField]) >= dateFrom) &&
          (!dateTo || String(item[dateField]) <= dateTo));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, searchQuery, statusFilter, dateFrom, dateTo, searchFields, dateField, statusField]);

  return {
    filteredData,
    filters: {
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
    },
  };
}
