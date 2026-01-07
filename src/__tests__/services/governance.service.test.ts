/**
 * Governance Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Governance Service', () => {
  it('should import governance service', async () => {
    const module = await import('@/services/governance.service');
    expect(module).toBeDefined();
  });

  it('should have GovernanceService class', async () => {
    const { GovernanceService } = await import('@/services/governance.service');
    expect(GovernanceService).toBeDefined();
  });

  it('should have getDecisions method', async () => {
    const { GovernanceService } = await import('@/services/governance.service');
    expect(typeof GovernanceService.getDecisions).toBe('function');
  });
});
