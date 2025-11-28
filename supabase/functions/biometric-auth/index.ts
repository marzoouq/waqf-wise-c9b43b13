import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { credentialId, userId } = await req.json();

    if (!credentialId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing credentialId or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for user operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify credential exists and belongs to user
    const { data: credential, error: credError } = await supabaseAdmin
      .from("webauthn_credentials")
      .select("user_id, credential_id")
      .eq("credential_id", credentialId)
      .eq("user_id", userId)
      .single();

    if (credError || !credential) {
      return new Response(
        JSON.stringify({ error: "Invalid credential or user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a magic link token for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email,
      options: {
        redirectTo: `${req.headers.get("origin") || ""}/dashboard`,
      },
    });

    if (linkError) {
      console.error("Magic link error:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate authentication" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last used timestamp
    await supabaseAdmin
      .from("webauthn_credentials")
      .update({ last_used_at: new Date().toISOString() })
      .eq("credential_id", credentialId);

    // Extract token from the magic link
    const magicLinkUrl = new URL(linkData.properties?.action_link || "");
    const token = magicLinkUrl.searchParams.get("token");
    const tokenType = magicLinkUrl.searchParams.get("type");

    return new Response(
      JSON.stringify({
        success: true,
        token,
        tokenType,
        email: userData.user.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Biometric auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
