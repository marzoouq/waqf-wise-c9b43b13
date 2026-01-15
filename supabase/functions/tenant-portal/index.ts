/**
 * Tenant Portal Edge Function
 * API موحدة لبوابة المستأجرين
 * @version 1.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-session",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  console.log("Creating supabase client with URL:", supabaseUrl ? "SET" : "MISSING");
  console.log("Service role key:", serviceRoleKey ? "SET" : "MISSING");

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' }
  });

  // التحقق من الجلسة
  const sessionToken = req.headers.get("x-tenant-session");
  if (!sessionToken) {
    return new Response(
      JSON.stringify({ error: "غير مصرح" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // جلب الجلسة والمستأجر
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("tenant_sessions")
    .select("*, tenants(*)")
    .eq("session_token", sessionToken)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (sessionError || !session) {
    return new Response(
      JSON.stringify({ error: "جلسة غير صالحة أو منتهية" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const tenant = session.tenants;
  const url = new URL(req.url);
  // ملاحظة: بعض العملاء قد يستدعون الوظيفة بدون action عن طريق الخطأ.
  // لتفادي كسر الواجهة، نجعل GET الافتراضي يعيد الملف الشخصي.
  const action = url.searchParams.get("action") ?? (req.method === "GET" ? "profile" : null);

  try {
    // تحديث نشاط الجلسة
    await supabaseAdmin
      .from("tenant_sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", session.id);

    // ===================== الإجراءات =====================

    // جلب بيانات المستأجر
    if (action === "profile" && req.method === "GET") {
      console.log("Fetching contracts for tenant:", tenant.id);
      
      // جلب العقود المرتبطة بالمستأجر
      const { data: contractsRaw, error: contractsError } = await supabaseAdmin
        .from("contracts")
        .select(`
          id, contract_number, start_date, end_date, status, property_id,
          properties(id, name, location, type)
        `)
        .eq("tenant_id", tenant.id);
      
      if (contractsError) {
        console.error("Contracts query error:", contractsError);
      }
      console.log("Contracts found:", contractsRaw?.length || 0);

      // جلب الوحدات المرتبطة بكل عقد
      const contracts = [];
      for (const contract of (contractsRaw || [])) {
        // جلب الوحدات التي تنتمي لهذا العقد
        const { data: units } = await supabaseAdmin
          .from("property_units")
          .select("id, unit_number, unit_name, unit_type")
          .eq("current_contract_id", contract.id);

        if (units && units.length > 0) {
          // إضافة كل وحدة كعقد منفصل
          for (const unit of units) {
            contracts.push({
              id: contract.id,
              contract_id: contract.id,
              contract_number: contract.contract_number,
              start_date: contract.start_date,
              end_date: contract.end_date,
              status: contract.status,
              property_id: contract.property_id,
              property_name: (contract as any).properties?.name || "غير محدد",
              property_location: (contract as any).properties?.location,
              property_type: (contract as any).properties?.type,
              unit_id: unit.id,
              unit_name: unit.unit_name || unit.unit_number || "الوحدة الرئيسية",
              unit_number: unit.unit_number,
              unit_type: unit.unit_type,
            });
          }
        } else {
          // عقد بدون وحدات محددة
          contracts.push({
            id: contract.id,
            contract_id: contract.id,
            contract_number: contract.contract_number,
            start_date: contract.start_date,
            end_date: contract.end_date,
            status: contract.status,
            property_id: contract.property_id,
            property_name: (contract as any).properties?.name || "غير محدد",
            property_location: (contract as any).properties?.location,
            property_type: (contract as any).properties?.type,
            unit_id: null,
            unit_name: "العقار كامل",
            unit_number: null,
            unit_type: null,
          });
        }
      }

      return new Response(
        JSON.stringify({
          tenant: {
            id: tenant.id,
            fullName: tenant.full_name,
            phone: tenant.phone,
            email: tenant.email,
            tenantNumber: tenant.tenant_number,
          },
          contracts,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // جلب طلبات الصيانة
    if (action === "requests" && req.method === "GET") {
      const { data: requests } = await supabaseAdmin
        .from("maintenance_requests")
        .select(`
          id, request_number, title, description, category, priority, status,
          location_in_unit, images, preferred_date, preferred_time_slot,
          is_urgent, tenant_notes, admin_response, rating, rating_feedback,
          scheduled_date, completed_date, created_at, updated_at,
          property_id, unit_id,
          properties(id, name, address),
          property_units(id, unit_number, unit_name)
        `)
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      // إضافة اسم العقار والوحدة للطلبات
      const enrichedRequests = (requests || []).map((r: any) => ({
        ...r,
        property_name: r.properties?.name || "غير محدد",
        unit_name: r.property_units?.unit_name || r.property_units?.unit_number || null,
      }));

      return new Response(
        JSON.stringify({ requests: enrichedRequests }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // إنشاء طلب صيانة جديد
    if (action === "create-request" && req.method === "POST") {
      const body = await req.json();

      // التحقق من البيانات المطلوبة
      if (!body.title || !body.category || !body.propertyId) {
        return new Response(
          JSON.stringify({ error: "البيانات المطلوبة غير مكتملة" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // توليد رقم الطلب
      const requestNumber = `MR-T-${Date.now().toString().slice(-8)}`;

      // تطبيع القيم لتوافق قيود قاعدة البيانات
      const normalizeCategory = (input: unknown): string => {
        const v = String(input ?? "").trim();
        if (!v) return "أخرى";
        if (v.includes("كهرب")) return "كهرباء";
        if (v.includes("سباك")) return "سباكة";
        if (v.includes("تكييف")) return "تكييف";
        if (v.includes("نظاف")) return "نظافة";
        if (v.includes("أمن")) return "أمن";
        return "أخرى";
      };

      const normalizePriority = (input: unknown, isUrgent: boolean): string => {
        if (isUrgent) return "عاجلة";
        const v = String(input ?? "").trim();
        if (v === "عاجلة" || v === "عاجل") return "عاجلة";
        if (v === "عالية" || v === "مرتفع" || v === "مرتفعة") return "عالية";
        if (v === "منخفضة" || v === "منخفض") return "منخفضة";
        return "عادية";
      };

      const category = normalizeCategory(body.category);
      const priority = normalizePriority(body.priority, Boolean(body.isUrgent));
      const status = "جديد";

      const { data: newRequest, error: createError } = await supabaseAdmin
        .from("maintenance_requests")
        .insert({
          request_number: requestNumber,
          tenant_id: tenant.id,
          property_id: body.propertyId,
          unit_id: body.unitId || null,
          title: body.title.trim(),
          description: body.description?.trim() || null,
          category,
          priority,
          status,
          location_in_unit: body.locationInUnit?.trim() || null,
          images: body.images || [],
          preferred_date: body.preferredDate || null,
          preferred_time_slot: body.preferredTimeSlot || "anytime",
          contact_preference: body.contactPreference || "phone",
          contact_phone: body.contactPhone || tenant.phone,
          contact_email: body.contactEmail || tenant.email,
          is_urgent: body.isUrgent || false,
          tenant_notes: body.tenantNotes?.trim() || null,
          submitted_via: "tenant_portal",
          requested_date: new Date().toISOString().split("T")[0],
          requested_by: tenant.full_name || tenant.phone,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating request:", createError);
        return new Response(
          JSON.stringify({ error: "فشل في إنشاء الطلب" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // إنشاء إشعار للمستأجر
      await supabaseAdmin.from("tenant_notifications").insert({
        tenant_id: tenant.id,
        title: "تم استلام طلب الصيانة",
        message: `تم استلام طلبك رقم ${requestNumber}. سيتم مراجعته والرد عليك قريباً.`,
        type: "success",
        related_request_id: newRequest.id,
      });

      return new Response(
        JSON.stringify({ success: true, request: newRequest }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تقييم طلب مكتمل
    if (action === "rate-request" && req.method === "POST") {
      const body = await req.json();

      if (!body.requestId || !body.rating) {
        return new Response(
          JSON.stringify({ error: "البيانات غير مكتملة" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("maintenance_requests")
        .update({
          rating: body.rating,
          rating_feedback: body.feedback?.trim() || null,
        })
        .eq("id", body.requestId)
        .eq("tenant_id", tenant.id)
        .eq("status", "مكتمل");

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "فشل في حفظ التقييم" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // جلب الإشعارات
    if (action === "notifications" && req.method === "GET") {
      const { data: notifications } = await supabaseAdmin
        .from("tenant_notifications")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(
        JSON.stringify({ notifications: notifications || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تحديد الإشعار كمقروء
    if (action === "mark-read" && req.method === "POST") {
      const body = await req.json();

      await supabaseAdmin
        .from("tenant_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", body.notificationId)
        .eq("tenant_id", tenant.id);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تسجيل الخروج
    if (action === "logout" && req.method === "POST") {
      await supabaseAdmin
        .from("tenant_sessions")
        .delete()
        .eq("session_token", sessionToken);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "إجراء غير معروف" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in tenant-portal:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ في الخادم" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
