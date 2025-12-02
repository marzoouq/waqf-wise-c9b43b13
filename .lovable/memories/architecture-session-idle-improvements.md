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

### Testing Coverage
- ✅ Page refresh no longer logs out users
- ✅ Idle timeout correctly set to 5 minutes
- ✅ FamilyTreeTab fully responsive on all screen sizes
- ✅ GovernanceTab fully responsive on all screen sizes
- ✅ All mobile touch targets appropriately sized
- ✅ Text overflow handled gracefully on small screens
