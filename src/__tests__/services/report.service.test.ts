/**
 * Report Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Report Service', () => {
  it('should import report service', async () => {
    const module = await import('@/services/report.service');
    expect(module).toBeDefined();
  });

  it('should have ReportService class', async () => {
    const { ReportService } = await import('@/services/report.service');
    expect(ReportService).toBeDefined();
  });

  it('should have generateReport method', async () => {
    const { ReportService } = await import('@/services/report.service');
    expect(typeof ReportService.generateReport).toBe('function');
  });
});
