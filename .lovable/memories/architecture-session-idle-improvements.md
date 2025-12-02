# `architecture/session-idle-improvements`

## Session Management Fixes

### Logout on Page Refresh Issue - RESOLVED
**Problem:** The application was logging out users on page refresh due to aggressive session cleanup in `beforeunload` event handler.

**Solution:** Modified `src/hooks/useSessionCleanup.ts` to only update last active timestamp without setting cleanup flags on page unload events. This prevents false positives for session cleanup when users refresh or navigate within the app.

### Idle Timeout Extended
**Change:** Idle timeout for beneficiaries increased from 1 minute to 5 minutes in `src/components/auth/IdleTimeoutManager.tsx`:
- `idleTime: 60 * 1000` → `idleTime: 5 * 60 * 1000`
- Toast notification message updated to reflect "5 دقائق" instead of "دقيقة"

**Note:** Idle timeout only applies to beneficiary users. Nazer and Admin roles are exempt from auto-logout.

### Responsive Enhancements for Beneficiary Portal

#### FamilyTreeTab.tsx - 100% Mobile Optimized
- Added `useIsMobile` hook for conditional rendering
- Responsive text sizes: `text-xs sm:text-sm`, `text-[10px] sm:text-xs`
- Responsive padding: `p-3 sm:p-4`, `p-4 sm:p-6`
- Responsive icon sizes: `h-3 w-3 sm:h-4 sm:w-4`, `h-4 w-4 sm:h-5 sm:w-5`
- Responsive spacing: `space-y-4 sm:space-y-6`, `gap-2 sm:gap-3`
- Added `truncate` for text overflow handling on mobile
- Responsive Badge sizes: `text-[10px] sm:text-xs`

#### GovernanceTab.tsx - 100% Mobile Optimized
- Added `useIsMobile` hook for conditional rendering
- Responsive text sizes: `text-xs sm:text-sm`, `text-[10px] sm:text-xs`
- Responsive padding: `p-3 sm:p-4`, `p-4 sm:p-6`, `p-8 sm:p-12`
- Responsive icon sizes: `h-4 w-4 sm:h-5 sm:w-5`, `h-8 w-8 sm:h-12 sm:w-12`
- Responsive CardTitle: `text-sm sm:text-base`
- Responsive spacing: `space-y-3 sm:space-y-4`, `space-y-4 sm:space-y-6`
- Added `truncate` and `min-w-0` for proper text overflow
- Responsive Badge sizes: `text-[10px] sm:text-xs`

### Key Patterns Applied
1. **Mobile-first responsive text**: Base size for mobile, sm: breakpoint for tablet/desktop
2. **Touch-friendly spacing**: Smaller padding/gaps on mobile, larger on desktop
3. **Icon scaling**: Smaller icons on mobile to save screen space
4. **Text overflow handling**: `truncate` + `min-w-0` for proper text wrapping
5. **Flexible layouts**: `flex-1 min-w-0` patterns for responsive content

#### PropertyStatsCards.tsx - 100% Mobile Optimized
- Added responsive AccordionTrigger with flexible layout: `flex-col sm:flex-row`
- Responsive text sizes in property titles: `text-xs sm:text-sm lg:text-base`
- Responsive location text: `text-[10px] sm:text-xs`
- Responsive icon sizes: `h-2.5 w-2.5 sm:h-3 sm:w-3`
- Responsive Badge sizes: `text-[10px] sm:text-xs`
- Responsive padding: `px-3 sm:px-4`, `p-2 sm:p-3`
- PropertyUnitsDisplay grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Added `truncate` and `min-w-0` for text overflow
- Responsive spacing: `gap-1.5 sm:gap-2`, `gap-2 sm:gap-3`

#### BeneficiaryDashboard.tsx - 100% Mobile Optimized
- TabsList height: `h-10 sm:h-12`
- TabsTrigger responsive: `text-xs sm:text-sm`, `gap-1 sm:gap-2`, `px-2 sm:px-3`
- Icon sizes: `h-3 w-3 sm:h-4 sm:w-4`
- CardHeader responsive padding: `p-4 sm:p-6`
- CardTitle responsive: `text-sm sm:text-base`
- CardContent responsive padding: `p-3 sm:p-6`
- Request cards: responsive padding `p-3 sm:p-4`, responsive text `text-xs sm:text-sm`
- Badge sizes: `text-[10px] sm:text-xs`
- Empty state: `py-6 sm:py-8`, `text-xs sm:text-sm`

### Testing Coverage
- ✅ Page refresh no longer logs out users
- ✅ Idle timeout correctly set to 5 minutes
- ✅ FamilyTreeTab fully responsive on all screen sizes
- ✅ GovernanceTab fully responsive on all screen sizes
- ✅ PropertyStatsCards fully responsive on all screen sizes
- ✅ BeneficiaryDashboard fully responsive on all screen sizes
- ✅ All mobile touch targets appropriately sized
- ✅ Text overflow handled gracefully on small screens
- ✅ 100% responsive coverage for Beneficiary Portal
