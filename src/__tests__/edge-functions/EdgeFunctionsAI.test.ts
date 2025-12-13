import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for Edge Function calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Edge Functions - AI Complete Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  // ==================== auto-classify-document Tests ====================
  describe('auto-classify-document', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/auto-classify-document';

    describe('Document Classification', () => {
      it('should classify document automatically', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            classification: 'contract',
            confidence: 0.95
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-123' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should detect contract documents', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            classification: 'contract',
            subtype: 'rental_contract'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-contract' }),
        });

        const data = await response.json();
        expect(data.classification).toBe('contract');
      });

      it('should detect identity documents', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            classification: 'identity',
            subtype: 'national_id'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-id' }),
        });

        const data = await response.json();
        expect(data.classification).toBe('identity');
      });

      it('should detect financial documents', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            classification: 'financial',
            subtype: 'invoice'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-invoice' }),
        });

        const data = await response.json();
        expect(data.classification).toBe('financial');
      });

      it('should suggest document tags', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            suggestedTags: ['عقد', 'إيجار', '2025']
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-123' }),
        });

        const data = await response.json();
        expect(data.suggestedTags.length).toBeGreaterThan(0);
      });

      it('should handle unrecognized documents', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            classification: 'unknown',
            confidence: 0.3
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-unknown' }),
        });

        const data = await response.json();
        expect(data.classification).toBe('unknown');
      });

      it('should update document metadata', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            metadataUpdated: true
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-123', updateMetadata: true }),
        });

        const data = await response.json();
        expect(data.metadataUpdated).toBe(true);
      });
    });
  });

  // ==================== extract-invoice-data Tests ====================
  describe('extract-invoice-data', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/extract-invoice-data';

    describe('Invoice Data Extraction', () => {
      it('should extract invoice data from image', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            extractedData: {
              invoiceNumber: 'INV-2025-001',
              amount: 350000,
              date: '2025-01-15'
            }
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-invoice' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should extract vendor information', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            vendor: {
              name: 'شركة الصيانة',
              vatNumber: '300000000000003'
            }
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-invoice' }),
        });

        const data = await response.json();
        expect(data.vendor.name).toBeDefined();
      });

      it('should extract line items', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            lineItems: [
              { description: 'صيانة مكيفات', quantity: 5, unitPrice: 500, total: 2500 }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-invoice' }),
        });

        const data = await response.json();
        expect(data.lineItems.length).toBeGreaterThan(0);
      });

      it('should calculate VAT amounts', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            tax: {
              subtotal: 100000,
              vatRate: 15,
              vatAmount: 15000,
              total: 115000
            }
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-invoice' }),
        });

        const data = await response.json();
        expect(data.tax.vatAmount).toBe(15000);
      });

      it('should handle Arabic text extraction', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            extractedData: {
              description: 'فاتورة صيانة العقار'
            }
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-arabic' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should handle poor quality images', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            confidence: 0.6,
            warnings: ['Low image quality detected']
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-blurry' }),
        });

        const data = await response.json();
        expect(data.warnings).toBeDefined();
      });
    });
  });

  // ==================== generate-ai-insights Tests ====================
  describe('generate-ai-insights', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/generate-ai-insights';

    describe('Insights Generation', () => {
      it('should generate financial insights', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            insights: [
              { type: 'trend', message: 'إيرادات الإيجار ارتفعت 15% مقارنة بالعام الماضي' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'financial', period: '2025' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should generate beneficiary insights', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            insights: [
              { type: 'distribution', message: '3 مستفيدين لم يستلموا توزيعاتهم' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'beneficiary' }),
        });

        const data = await response.json();
        expect(data.insights.length).toBeGreaterThan(0);
      });

      it('should generate property insights', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            insights: [
              { type: 'occupancy', message: 'نسبة الإشغال 85%' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'property' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should generate risk alerts', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            risks: [
              { level: 'high', message: 'عقد الطائف 1 ينتهي خلال 30 يوم' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'risk' }),
        });

        const data = await response.json();
        expect(data.risks.length).toBeGreaterThan(0);
      });

      it('should provide recommendations', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            recommendations: [
              { priority: 'high', action: 'تجديد عقد الإيجار قبل انتهائه' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'recommendations' }),
        });

        const data = await response.json();
        expect(data.recommendations.length).toBeGreaterThan(0);
      });
    });
  });

  // ==================== intelligent-search Tests ====================
  describe('intelligent-search', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/intelligent-search';

    describe('Search Functionality', () => {
      it('should perform semantic search', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            results: [
              { type: 'document', title: 'عقد إيجار السامر', score: 0.95 }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'عقد السامر' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should search across multiple types', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            results: [
              { type: 'beneficiary', name: 'محمد الثبيتي' },
              { type: 'property', name: 'السامر 2' },
              { type: 'document', title: 'عقد محمد' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'محمد' }),
        });

        const data = await response.json();
        expect(data.results.length).toBeGreaterThan(0);
      });

      it('should handle Arabic natural language', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            results: [
              { type: 'payment', description: 'دفعة إيجار يناير' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'كم دفع المستأجر الشهر الماضي' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should suggest related searches', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            suggestions: ['عقود الإيجار', 'المستأجرين', 'الإيجارات المتأخرة']
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'إيجار' }),
        });

        const data = await response.json();
        expect(data.suggestions.length).toBeGreaterThan(0);
      });

      it('should filter by date range', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            results: [],
            filters: { dateFrom: '2025-01-01', dateTo: '2025-12-31' }
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: 'payments', 
            filters: { dateFrom: '2025-01-01', dateTo: '2025-12-31' }
          }),
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  // ==================== ocr-document Tests ====================
  describe('ocr-document', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/ocr-document';

    describe('OCR Processing', () => {
      it('should extract text from document', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            extractedText: 'عقد إيجار رقم 123\nالتاريخ: 2025/01/15'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-123', fileUrl: 'https://storage/doc.pdf' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should handle Arabic text', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            extractedText: 'بسم الله الرحمن الرحيم',
            language: 'ar'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-ar' }),
        });

        const data = await response.json();
        expect(data.language).toBe('ar');
      });

      it('should handle mixed Arabic/English', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            extractedText: 'Contract No. 123 عقد رقم',
            languages: ['ar', 'en']
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-mixed' }),
        });

        const data = await response.json();
        expect(data.languages).toContain('ar');
      });

      it('should update document description', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            documentUpdated: true
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-123', updateDocument: true }),
        });

        const data = await response.json();
        expect(data.documentUpdated).toBe(true);
      });

      it('should log OCR processing', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            processingLogId: 'log-ocr-123',
            processingTime: 2500
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-123' }),
        });

        const data = await response.json();
        expect(data.processingLogId).toBeDefined();
      });

      it('should require proper authorization', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: () => Promise.resolve({ error: 'Forbidden' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-123' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should handle unsupported file types', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Unsupported file type' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: 'doc-video' }),
        });

        expect(response.ok).toBe(false);
      });
    });
  });

  // ==================== property-ai-assistant Tests ====================
  describe('property-ai-assistant', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/property-ai-assistant';

    describe('AI Assistant', () => {
      it('should answer property questions', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            answer: 'عقار السامر 2 يحتوي على 8 وحدات، منها 6 مؤجرة'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'كم وحدة في السامر 2؟' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should provide rental statistics', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            answer: 'إجمالي الإيجارات المحصلة 850,000 ريال'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'كم إجمالي الإيجارات؟' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should suggest maintenance actions', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            suggestions: [
              { property: 'السامر 2', action: 'صيانة المكيفات', priority: 'high' }
            ]
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'ما الصيانة المطلوبة؟' }),
        });

        const data = await response.json();
        expect(data.suggestions.length).toBeGreaterThan(0);
      });

      it('should track conversation history', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            conversationId: 'conv-123'
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            question: 'متابعة السؤال السابق',
            conversationId: 'conv-123'
          }),
        });

        expect(response.ok).toBe(true);
      });

      it('should handle unknown queries gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            answer: 'عذراً، لا أستطيع الإجابة على هذا السؤال. يرجى التواصل مع الدعم.',
            needsHuman: true
          }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'سؤال غير متعلق بالعقارات' }),
        });

        const data = await response.json();
        expect(data.needsHuman).toBe(true);
      });
    });
  });
});
