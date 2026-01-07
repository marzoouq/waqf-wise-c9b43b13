/**
 * اختبارات خدمة التخزين
 */

import { describe, it, expect } from 'vitest';

describe('Storage Service', () => {
  it('storage service module should be importable', async () => {
    const module = await import('@/services/storage.service');
    expect(module).toBeDefined();
  });

  it('should have StorageService class', async () => {
    const { StorageService } = await import('@/services/storage.service');
    expect(StorageService).toBeDefined();
  });

  it('should have uploadFile method', async () => {
    const { StorageService } = await import('@/services/storage.service');
    expect(typeof StorageService.uploadFile).toBe('function');
  });

  it('should have downloadFile method', async () => {
    const { StorageService } = await import('@/services/storage.service');
    expect(typeof StorageService.downloadFile).toBe('function');
  });

  it('should have deleteFile method', async () => {
    const { StorageService } = await import('@/services/storage.service');
    expect(typeof StorageService.deleteFile).toBe('function');
  });

  it('should have getPublicUrl method', async () => {
    const { StorageService } = await import('@/services/storage.service');
    expect(typeof StorageService.getPublicUrl).toBe('function');
  });

  it('should have listFiles method', async () => {
    const { StorageService } = await import('@/services/storage.service');
    expect(typeof StorageService.listFiles).toBe('function');
  });

  it('should have moveFile method', async () => {
    const { StorageService } = await import('@/services/storage.service');
    expect(typeof StorageService.moveFile).toBe('function');
  });
});
