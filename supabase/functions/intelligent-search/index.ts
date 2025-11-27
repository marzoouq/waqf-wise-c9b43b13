import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, searchType = 'all', limit = 20 } = await req.json();

    if (!query || query.trim().length < 2) {
      return errorResponse('يجب إدخال كلمة بحث (حرفين على الأقل)', 400);
    }

    const searchTerm = query.trim();
    const results: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      relevanceScore: number;
      metadata: Record<string, unknown>;
    }> = [];

    // البحث في المستندات
    if (searchType === 'all' || searchType === 'documents') {
      const { data: docs } = await supabase
        .from('documents')
        .select('id, name, description, category, file_type, created_at')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(limit);

      docs?.forEach(doc => {
        const nameMatch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ? 0.5 : 0;
        const descMatch = doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ? 0.3 : 0;
        
        results.push({
          id: doc.id,
          type: 'document',
          title: doc.name || 'مستند بدون عنوان',
          description: doc.description || '',
          relevanceScore: nameMatch + descMatch + 0.2,
          metadata: {
            category: doc.category,
            fileType: doc.file_type,
            createdAt: doc.created_at
          }
        });
      });
    }

    // البحث في محتوى OCR
    if (searchType === 'all' || searchType === 'ocr') {
      const { data: ocrResults } = await supabase
        .from('document_ocr_results')
        .select(`
          id,
          document_id,
          extracted_text,
          confidence_score,
          documents (name, category)
        `)
        .ilike('extracted_text', `%${searchTerm}%`)
        .limit(limit);

      ocrResults?.forEach(ocr => {
        const text = ocr.extracted_text || '';
        const matchCount = (text.toLowerCase().match(new RegExp(searchTerm.toLowerCase(), 'g')) || []).length;
        const doc = Array.isArray(ocr.documents) ? ocr.documents[0] : ocr.documents;
        
        results.push({
          id: ocr.document_id,
          type: 'ocr_content',
          title: doc?.name || 'محتوى مستند',
          description: text.substring(0, 200) + '...',
          relevanceScore: Math.min(0.95, 0.4 + (matchCount * 0.1)) * (ocr.confidence_score || 0.8),
          metadata: {
            ocrId: ocr.id,
            category: doc?.category,
            matchCount
          }
        });
      });
    }

    // البحث في المستفيدين
    if (searchType === 'all' || searchType === 'beneficiaries') {
      const { data: beneficiaries } = await supabase
        .from('beneficiaries')
        .select('id, full_name, national_id, phone, category, status')
        .or(`full_name.ilike.%${searchTerm}%,national_id.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(limit);

      beneficiaries?.forEach(ben => {
        results.push({
          id: ben.id,
          type: 'beneficiary',
          title: ben.full_name,
          description: `${ben.category} - ${ben.status}`,
          relevanceScore: ben.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ? 0.9 : 0.6,
          metadata: {
            nationalId: ben.national_id,
            phone: ben.phone,
            status: ben.status
          }
        });
      });
    }

    // البحث في العقود
    if (searchType === 'all' || searchType === 'contracts') {
      const { data: contracts } = await supabase
        .from('contracts')
        .select(`
          id, 
          contract_number, 
          tenant_name, 
          status,
          properties (name)
        `)
        .or(`contract_number.ilike.%${searchTerm}%,tenant_name.ilike.%${searchTerm}%`)
        .limit(limit);

      contracts?.forEach(contract => {
        const prop = Array.isArray(contract.properties) ? contract.properties[0] : contract.properties;
        results.push({
          id: contract.id,
          type: 'contract',
          title: `عقد ${contract.contract_number}`,
          description: `${contract.tenant_name} - ${prop?.name || 'عقار'}`,
          relevanceScore: 0.75,
          metadata: {
            tenantName: contract.tenant_name,
            status: contract.status
          }
        });
      });
    }

    // البحث في العقارات
    if (searchType === 'all' || searchType === 'properties') {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, name, property_type, address, status')
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .limit(limit);

      properties?.forEach(prop => {
        results.push({
          id: prop.id,
          type: 'property',
          title: prop.name,
          description: `${prop.property_type} - ${prop.address || ''}`,
          relevanceScore: prop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ? 0.85 : 0.6,
          metadata: {
            propertyType: prop.property_type,
            status: prop.status
          }
        });
      });
    }

    // ترتيب النتائج حسب الصلة
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // تسجيل البحث
    await supabase
      .from('audit_logs')
      .insert({
        action_type: 'intelligent_search',
        description: `بحث ذكي: "${searchTerm}"`,
        new_values: {
          query: searchTerm,
          searchType,
          resultsCount: results.length
        }
      });

    return jsonResponse({
      success: true,
      query: searchTerm,
      searchType,
      totalResults: results.length,
      results: results.slice(0, limit)
    });

  } catch (error) {
    console.error('Intelligent search error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ في البحث الذكي',
      500
    );
  }
});
