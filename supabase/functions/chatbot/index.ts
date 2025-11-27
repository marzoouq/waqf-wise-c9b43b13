import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 🔐 SECURITY: Verify Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return unauthorizedResponse('غير مصرح - يجب تسجيل الدخول');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 🔐 SECURITY: Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Invalid token:', authError);
      return unauthorizedResponse('رمز المصادقة غير صحيح');
    }

    // 🔐 SECURITY: Check if user is staff (not beneficiary)
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ Error checking roles:', roleError);
      return errorResponse('خطأ في التحقق من الصلاحيات', 500);
    }

    const isStaff = roles?.some(r => ['admin', 'nazer', 'accountant', 'cashier', 'archivist'].includes(r.role));
    if (!isStaff) {
      console.error('❌ User is not staff:', { userId: user.id, roles });
      return forbiddenResponse('هذه الخدمة متاحة للموظفين فقط');
    }

    console.log('✅ Authorized chatbot request from:', { userId: user.id, email: user.email });

    const { message, userId, quickReplyId } = await req.json();

    console.log('📨 Chatbot request:', { message, userId, quickReplyId });

    // جلب البيانات السياقية الشاملة
    interface ContextData {
      beneficiaries?: {
        total: number;
        active: number;
        inactive: number;
        categories: Record<string, number>;
        cities: Record<string, number>;
        topCategories: [string, number][];
        directLink: string;
      };
      financial?: {
        recentEntries: number;
        postedEntries: number;
        draftEntries: number;
        totalDebits: number;
        totalCredits: number;
        balance: number;
        accountsCount: number;
        accountsByType?: Record<string, number>;
        directLink: string;
      };
      properties?: {
        total: number;
        occupied: number;
        vacant: number;
        maintenance: number;
        monthlyRentIncome: number;
        activeContracts: number;
        expiringContracts: number;
        propertyTypes?: Record<string, number>;
        occupancyRate: number;
        directLink: string;
      };
      loans?: {
        total: number;
        active: number;
        paid: number;
        defaulted: number;
        totalLoaned: number;
        defaultRate: number;
        directLink: string;
      };
      requests?: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        highPriority: number;
        overdue: number;
        totalAmount: number;
        pendingAmount: number;
        requestsByType?: Record<string, number>;
        approvalRate: number;
        directLink: string;
      };
      distributions?: {
        total: number;
        approved: number;
        pending: number;
        draft: number;
        totalDistributed: number;
        totalBeneficiaries: number;
        avgPerBeneficiary: number;
        pendingApprovals: number;
        recent?: Array<{
          date: string;
          amount: number;
          beneficiaries: number;
          status: string;
          month: string;
        }>;
        directLink: string;
      };
      support?: {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        avgResponseTime: number;
        directLink: string;
      };
      families?: {
        total: number;
        active: number;
        totalMembers: number;
        avgMembersPerFamily: number;
        tribes: Record<string, number>;
        directLink: string;
      };
      invoices?: {
        total: number;
        paid: number;
        pending: number;
        overdue: number;
        totalAmount: number;
        paidAmount: number;
        collectionRate: number;
        directLink: string;
      };
    }
    
    const contextData: ContextData = {};
    const messageText = message.toLowerCase();
    
    // جلب بيانات المستفيدين
    if (quickReplyId === 'balance' || messageText.includes('رصيد') || messageText.includes('مستفيد')) {
      const { data: beneficiaries, count } = await supabase
        .from('beneficiaries')
        .select('id, full_name, status, category, monthly_income, city, tribe', { count: 'exact' })
        .limit(100);
      
      const activeCount = beneficiaries?.filter(b => b.status === 'active').length || 0;
      const inactiveCount = beneficiaries?.filter(b => b.status === 'inactive').length || 0;
      const categories = beneficiaries?.reduce((acc: Record<string, number>, b) => {
        acc[b.category] = (acc[b.category] || 0) + 1;
        return acc;
      }, {}) || {};
      
      const cities = beneficiaries?.reduce((acc: Record<string, number>, b) => {
        if (b.city) acc[b.city] = (acc[b.city] || 0) + 1;
        return acc;
      }, {}) || {};
      
      contextData.beneficiaries = {
        total: count || 0,
        active: activeCount,
        inactive: inactiveCount,
        categories,
        cities,
        topCategories: Object.entries(categories)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5) as [string, number][],
        directLink: '/beneficiaries'
      };
    }
    
    // جلب التقارير المالية الشاملة
    if (quickReplyId === 'reports' || messageText.includes('تقرير') || messageText.includes('مالي') || messageText.includes('محاسب')) {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('id, entry_date, entry_number, reference, status, journal_entry_lines(debit_amount, credit_amount)')
        .order('entry_date', { ascending: false })
        .limit(50);
      
      let totalDebits = 0;
      let totalCredits = 0;
      const postedEntries = entries?.filter(e => e.status === 'posted').length || 0;
      const draftEntries = entries?.filter(e => e.status === 'draft').length || 0;
      
      entries?.forEach(entry => {
        entry.journal_entry_lines?.forEach((line: { debit_amount?: number; credit_amount?: number }) => {
          totalDebits += line.debit_amount || 0;
          totalCredits += line.credit_amount || 0;
        });
      });
      
      // جلب الحسابات
      const { data: accounts, count: accountsCount } = await supabase
        .from('accounts')
        .select('account_type, current_balance', { count: 'exact' })
        .eq('is_active', true);
      
      const accountsByType = accounts?.reduce((acc: Record<string, number>, a) => {
        acc[a.account_type] = (acc[a.account_type] || 0) + 1;
        return acc;
      }, {}) || {};
      
      contextData.financial = {
        recentEntries: entries?.length || 0,
        postedEntries,
        draftEntries,
        totalDebits: Math.round(totalDebits),
        totalCredits: Math.round(totalCredits),
        balance: Math.round(totalDebits - totalCredits),
        accountsCount: accountsCount || 0,
        accountsByType,
        directLink: '/accounting'
      };
    }
    
    // جلب بيانات العقارات والإيجارات
    if (quickReplyId === 'properties' || messageText.includes('عقار') || messageText.includes('إيجار') || messageText.includes('عقد')) {
      const { data: properties, count } = await supabase
        .from('properties')
        .select('id, name, status, property_type, contracts(id, status, monthly_rent, start_date, end_date)', { count: 'exact' });
      
      const occupied = properties?.filter(p => p.status === 'occupied').length || 0;
      const vacant = properties?.filter(p => p.status === 'vacant').length || 0;
      const maintenance = properties?.filter(p => p.status === 'maintenance').length || 0;
      
      let totalRent = 0;
      let activeContracts = 0;
      let expiringContracts = 0;
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      properties?.forEach(p => {
        const activeContract = p.contracts?.find((c: { status: string; monthly_rent?: number; end_date: string }) => c.status === 'نشط' || c.status === 'active');
        if (activeContract) {
          totalRent += activeContract.monthly_rent || 0;
          activeContracts++;
          
          const endDate = new Date(activeContract.end_date);
          if (endDate <= thirtyDaysFromNow && endDate >= today) {
            expiringContracts++;
          }
        }
      });
      
      // أنواع العقارات
      const propertyTypes = properties?.reduce((acc: Record<string, number>, p) => {
        acc[p.property_type] = (acc[p.property_type] || 0) + 1;
        return acc;
      }, {}) || {};
      
      contextData.properties = {
        total: count || 0,
        occupied,
        vacant,
        maintenance,
        monthlyRentIncome: Math.round(totalRent),
        activeContracts,
        expiringContracts,
        propertyTypes,
        occupancyRate: count ? Math.round((occupied / count) * 100) : 0,
        directLink: '/properties'
      };
    }
    
    // جلب بيانات الطلبات الشاملة
    if (quickReplyId === 'requests' || messageText.includes('طلب') || messageText.includes('فزعة')) {
      const { data: allRequests } = await supabase
        .from('beneficiary_requests')
        .select('id, status, priority, request_type_id, amount, created_at, is_overdue')
        .order('created_at', { ascending: false })
        .limit(100);
      
      const pending = allRequests?.filter(r => r.status === 'قيد المراجعة').length || 0;
      const approved = allRequests?.filter(r => r.status === 'موافق عليه').length || 0;
      const rejected = allRequests?.filter(r => r.status === 'مرفوض').length || 0;
      const highPriority = allRequests?.filter(r => r.priority === 'high').length || 0;
      const overdue = allRequests?.filter(r => r.is_overdue).length || 0;
      
      const totalAmount = allRequests?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const pendingAmount = allRequests
        ?.filter(r => r.status === 'قيد المراجعة')
        ?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      
      // جلب أنواع الطلبات
      const { data: requestTypes } = await supabase
        .from('request_types')
        .select('id, name_ar');
      
      const requestsByType = allRequests?.reduce((acc: Record<string, number>, r) => {
        const type = requestTypes?.find(rt => rt.id === r.request_type_id);
        const typeName = type?.name_ar || 'غير محدد';
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
      }, {}) || {};
      
      contextData.requests = {
        total: allRequests?.length || 0,
        pending,
        approved,
        rejected,
        highPriority,
        overdue,
        totalAmount: Math.round(totalAmount),
        pendingAmount: Math.round(pendingAmount),
        requestsByType,
        approvalRate: allRequests?.length ? Math.round((approved / allRequests.length) * 100) : 0,
        directLink: '/requests'
      };
    }
    
    // جلب بيانات التوزيعات الشاملة
    if (quickReplyId === 'distributions' || messageText.includes('توزيع') || messageText.includes('صرف')) {
      const { data: distributions, count } = await supabase
        .from('distributions')
        .select('id, distribution_date, total_amount, beneficiaries_count, status, month, notes', { count: 'exact' })
        .order('distribution_date', { ascending: false })
        .limit(50);
      
      const approved = distributions?.filter(d => d.status === 'معتمد').length || 0;
      const pending = distributions?.filter(d => d.status === 'قيد المراجعة').length || 0;
      const draft = distributions?.filter(d => d.status === 'مسودة').length || 0;
      
      const totalDistributed = distributions
        ?.filter(d => d.status === 'معتمد')
        ?.reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;
      
      const totalBeneficiaries = distributions
        ?.filter(d => d.status === 'معتمد')
        ?.reduce((sum, d) => sum + (d.beneficiaries_count || 0), 0) || 0;
      
      const avgPerBeneficiary = totalBeneficiaries > 0 
        ? Math.round(totalDistributed / totalBeneficiaries) 
        : 0;
      
      // جلب بيانات الموافقات
      const { data: approvals } = await supabase
        .from('distribution_approvals')
        .select('status')
        .in('distribution_id', distributions?.map(d => d.id) || []);
      
      const pendingApprovals = approvals?.filter(a => a.status === 'قيد المراجعة').length || 0;
      
      contextData.distributions = {
        total: count || 0,
        approved,
        pending,
        draft,
        totalDistributed: Math.round(totalDistributed),
        totalBeneficiaries,
        avgPerBeneficiary,
        pendingApprovals,
        recent: distributions?.slice(0, 5).map(d => ({
          date: d.distribution_date,
          amount: Math.round(d.total_amount),
          beneficiaries: d.beneficiaries_count,
          status: d.status,
          month: d.month
        })),
        directLink: '/funds'
      };
    }
    
    // جلب بيانات القروض
    if (messageText.includes('قرض') || messageText.includes('قروض')) {
      const { data: loans, count } = await supabase
        .from('loans')
        .select('id, loan_amount, status, interest_rate, term_months')
        .limit(100);
      
      const active = loans?.filter(l => l.status === 'active').length || 0;
      const paid = loans?.filter(l => l.status === 'paid').length || 0;
      const defaulted = loans?.filter(l => l.status === 'defaulted').length || 0;
      
      const totalLoaned = loans?.reduce((sum, l) => sum + (l.loan_amount || 0), 0) || 0;
      
      contextData.loans = {
        total: count || 0,
        active,
        paid,
        defaulted,
        totalLoaned: Math.round(totalLoaned),
        defaultRate: count ? Math.round((defaulted / count) * 100) : 0,
        directLink: '/loans'
      };
    }
    
    // جلب بيانات العائلات
    if (messageText.includes('عائلة') || messageText.includes('عائلات')) {
      const { data: families, count } = await supabase
        .from('families')
        .select('id, family_name, status, total_members, tribe')
        .limit(100);
      
      const active = families?.filter(f => f.status === 'نشط').length || 0;
      const totalMembers = families?.reduce((sum, f) => sum + (f.total_members || 0), 0) || 0;
      const avgMembersPerFamily = count ? Math.round(totalMembers / count) : 0;
      
      const tribes = families?.reduce((acc: Record<string, number>, f) => {
        if (f.tribe) acc[f.tribe] = (acc[f.tribe] || 0) + 1;
        return acc;
      }, {}) || {};
      
      contextData.families = {
        total: count || 0,
        active,
        totalMembers,
        avgMembersPerFamily,
        tribes,
        directLink: '/families'
      };
    }
    
    // جلب بيانات الفواتير
    if (messageText.includes('فاتورة') || messageText.includes('فواتير')) {
      const { data: invoices, count } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, status, due_date')
        .limit(100);
      
      const paid = invoices?.filter(i => i.status === 'paid').length || 0;
      const pending = invoices?.filter(i => i.status === 'pending').length || 0;
      const overdue = invoices?.filter(i => i.status === 'overdue').length || 0;
      
      const totalAmount = invoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
      const paidAmount = invoices
        ?.filter(i => i.status === 'paid')
        ?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
      
      contextData.invoices = {
        total: count || 0,
        paid,
        pending,
        overdue,
        totalAmount: Math.round(totalAmount),
        paidAmount: Math.round(paidAmount),
        collectionRate: totalAmount ? Math.round((paidAmount / totalAmount) * 100) : 0,
        directLink: '/invoices'
      };
    }

    // بناء السياق للذكاء الاصطناعي
    const contextSummary = Object.entries(contextData)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');

    // استخدام Lovable AI API
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY is not set');
      return errorResponse('API Key not configured', 500);
    }

    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي لمنصة إدارة الأوقاف. ساعد المستخدم بالإجابة على أسئلته بناءً على البيانات المتاحة.
            
البيانات المتاحة:
${contextSummary}

قواعد الرد:
1. استخدم اللغة العربية الفصحى
2. كن مختصراً ومفيداً
3. إذا طُلبت بيانات غير متوفرة، أخبر المستخدم
4. قدم روابط مباشرة للصفحات المناسبة عند الحاجة
5. استخدم الأرقام والإحصائيات من البيانات المتاحة`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      return errorResponse(`AI API Error: ${aiResponse.status}`, 500);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك.';

    return jsonResponse({
      success: true,
      response: responseText,
      context: contextData,
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      500
    );
  }
});
