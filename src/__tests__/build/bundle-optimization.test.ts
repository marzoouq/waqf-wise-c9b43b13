import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';

/**
 * اختبارات تحسين Bundle
 * تتحقق من جودة البناء ومنع تراجع الأداء
 */
describe('Bundle Optimization', () => {
  const distPath = path.resolve(__dirname, '../../../dist/assets');

  it('should not have any file larger than 500KB', () => {
    if (!fs.existsSync(distPath)) {
      console.log('Skipping: dist folder not found (run build first)');
      return;
    }
    
    const files = fs.readdirSync(distPath);
    const largeFiles: string[] = [];
    
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      
      if (sizeKB > 500) {
        largeFiles.push(`${file} (${sizeKB.toFixed(2)}KB)`);
      }
    });
    
    expect(largeFiles).toEqual([]);
  });

  it('should not contain console.log in production JS files', () => {
    if (!fs.existsSync(distPath)) {
      console.log('Skipping: dist folder not found (run build first)');
      return;
    }
    
    const jsFiles = fs.readdirSync(distPath).filter(f => f.endsWith('.js'));
    const filesWithConsoleLogs: string[] = [];
    
    jsFiles.forEach(file => {
      const content = fs.readFileSync(path.join(distPath, file), 'utf8');
      // Check for console.log but allow console.error and console.warn for debugging
      if (content.includes('console.log(')) {
        filesWithConsoleLogs.push(file);
      }
    });
    
    expect(filesWithConsoleLogs).toEqual([]);
  });

  it('should not contain core-js polyfills (modern browsers only)', () => {
    if (!fs.existsSync(distPath)) {
      console.log('Skipping: dist folder not found (run build first)');
      return;
    }
    
    const jsFiles = fs.readdirSync(distPath).filter(f => f.endsWith('.js'));
    const filesWithPolyfills: string[] = [];
    
    jsFiles.forEach(file => {
      const content = fs.readFileSync(path.join(distPath, file), 'utf8');
      if (content.includes('core-js') || content.includes('regenerator-runtime')) {
        filesWithPolyfills.push(file);
      }
    });
    
    expect(filesWithPolyfills).toEqual([]);
  });

  it('should have reasonable number of chunks (code splitting working)', () => {
    if (!fs.existsSync(distPath)) {
      console.log('Skipping: dist folder not found (run build first)');
      return;
    }
    
    const jsFiles = fs.readdirSync(distPath).filter(f => f.endsWith('.js'));
    
    // Should have multiple chunks (evidence of code splitting)
    expect(jsFiles.length).toBeGreaterThan(5);
    
    // But not too many (avoid over-splitting)
    expect(jsFiles.length).toBeLessThan(100);
  });

  it('should have font files with content hashes', () => {
    if (!fs.existsSync(distPath)) {
      console.log('Skipping: dist folder not found (run build first)');
      return;
    }
    
    const fontFiles = fs.readdirSync(distPath).filter(f => 
      f.endsWith('.woff2') || f.endsWith('.woff')
    );
    
    // All font files should have hash in filename (for cache busting)
    const hashPattern = /-[a-zA-Z0-9]{8}\./;
    fontFiles.forEach(file => {
      expect(file).toMatch(hashPattern);
    });
  });
});
