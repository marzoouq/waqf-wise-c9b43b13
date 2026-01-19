/**
 * بطاقات المستفيد
 * Beneficiary Card Components
 */

export { NotificationsCard } from '../NotificationsCard';
export { AnnualDisclosureCard } from '../AnnualDisclosureCard';
export { PropertyStatsCards } from '../PropertyStatsCards';
// StatsCardSkeleton removed - use unified skeletons from @/components/dashboard/KPISkeleton
export { ReportsExplanationCard } from '../ReportsExplanationCard';

// Mobile Card Base
export { 
  MobileCardBase, 
  CardInfoRow, 
  CardInfoGrid, 
  CardInfoItem,
  type MobileCardBaseProps,
  type CardInfoRowProps,
  type CardInfoGridProps,
  type CardInfoItemProps,
} from './MobileCardBase';

// Mobile Cards
export { MobileDistributionCard } from './MobileDistributionCard';
export { MobileStatementCard } from './MobileStatementCard';
export { MobilePropertyCard } from './MobilePropertyCard';
export { MobileContractCard } from './MobileContractCard';
