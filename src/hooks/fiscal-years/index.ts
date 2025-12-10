/**
 * Fiscal Years Hooks - Centralized Exports
 * جميع hooks المتعلقة بالسنوات المالية
 * @version 2.8.76
 */

export {
  useActiveFiscalYear,
  useFiscalYearsList,
  useFiscalYearPublishInfo,
  ACTIVE_FISCAL_YEAR_QUERY_KEY,
  FISCAL_YEARS_QUERY_KEY,
  type ActiveFiscalYear,
} from "./useActiveFiscalYear";
export { useClosingPreview, useFiscalYearSummary } from "./useFiscalYearData";
export { useCreateFiscalYear } from "./useCreateFiscalYear";
export {
  useHistoricalRentalDetails,
  useHistoricalRentalMonthlySummary,
  useHistoricalRentalByMonth,
  useHistoricalRentalMutations,
  HISTORICAL_RENTAL_QUERY_KEY,
  type HistoricalRentalDetail,
  type HistoricalRentalMonthlySummary,
  type CreateHistoricalRentalInput,
} from "./useHistoricalRentalDetails";
