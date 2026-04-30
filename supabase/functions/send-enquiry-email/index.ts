import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EnquiryPayload {
  full_name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: EnquiryPayload = await req.json();
    const { full_name, email, phone, category, message } = payload;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const TO_EMAIL = "skdanish2911@gmail.com";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY secret is not set");
      return new Response(
        JSON.stringify({ ok: false, error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const categoryColors: Record<string, string> = {
      Investor: "#1d4ed8",
      Inventor: "#d97706",
      Advisor: "#059669",
    };
    const badgeColor = categoryColors[category] || "#6b7280";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1e3a5f;padding:24px 32px;">
            <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Vinprof</span>
            <span style="color:#94a3b8;font-size:13px;margin-left:12px;">Network of Visionary Professionals</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 6px;font-size:22px;color:#111827;">New ${category} Enquiry</h2>
            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;">
              A new enquiry was submitted via the <strong>${category} Portal</strong> on Vinprof.
            </p>

            <!-- Detail rows -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              <tr style="background:#f9fafb;">
                <td style="padding:12px 16px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:140px;">Full Name</td>
                <td style="padding:12px 16px;color:#111827;font-size:14px;font-weight:600;">${full_name}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td style="padding:12px 16px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Email</td>
                <td style="padding:12px 16px;font-size:14px;"><a href="mailto:${email}" style="color:#1d4ed8;text-decoration:none;">${email}</a></td>
              </tr>
              <tr style="background:#f9fafb;border-top:1px solid #e5e7eb;">
                <td style="padding:12px 16px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Phone</td>
                <td style="padding:12px 16px;color:#111827;font-size:14px;">${phone}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td style="padding:12px 16px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Category</td>
                <td style="padding:12px 16px;">
                  <span style="background:${badgeColor};color:#ffffff;padding:3px 12px;border-radius:999px;font-size:12px;font-weight:600;">${category}</span>
                </td>
              </tr>
              <tr style="background:#f9fafb;border-top:1px solid #e5e7eb;">
                <td style="padding:12px 16px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Message</td>
                <td style="padding:12px 16px;color:#374151;font-size:14px;line-height:1.7;">${message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>

            <!-- Reply CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr>
                <td style="background:#1e3a5f;border-radius:8px;">
                  <a href="mailto:${email}?subject=Re: Your Vinprof ${category} Enquiry"
                     style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                    Reply to ${full_name}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px;">
            Sent automatically by Vinprof &mdash; This message was triggered by a form submission.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Vinprof Enquiries <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[Vinprof] New ${category} Enquiry from ${full_name}`,
        html,
      }),
    });

    const resendData = await resendRes.json();
    console.log("Resend response:", JSON.stringify(resendData));

    if (!resendRes.ok) {
      console.error("Resend error:", JSON.stringify(resendData));
      return new Response(
        JSON.stringify({ ok: false, error: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, id: resendData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
