import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CrushEmailRequest {
  email: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CRUSH EMAIL FUNCTION STARTED ===");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    const { email, userId }: CrushEmailRequest = JSON.parse(requestBody);

    console.log("Parsed request data:", { email, userId });

    if (!email || !userId) {
      console.error("VALIDATION ERROR: Email and userId are required", { email, userId });
      return new Response(
        JSON.stringify({ error: "Email and userId are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log("Sending crush email to:", email);

    // First, save the crush attempt to database
    const { data: crushRecord, error: dbError } = await supabase
      .from('crushes')
      .insert({
        sender_user_id: userId,
        recipient_email: email,
        email_sent: false
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Impossible de sauvegarder le crush" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Crush saved to database:", crushRecord.id);

    // Send email using SendGrid API
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: "Quelqu'un pense à toi 💕"
        }
      ],
      from: {
        email: "welcome@fabdive.app",
        name: "FabDive"
      },
      content: [
        {
          type: "text/html",
          value: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Quelqu'un pense à toi</title>
              </head>
              <body style="
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                margin: 0; 
                padding: 20px;
                min-height: 100vh;
              ">
                <div style="
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: white; 
                  border-radius: 20px; 
                  overflow: hidden; 
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                ">
                  
                  <!-- Header -->
                  <div style="
                    background: linear-gradient(135deg, #e91e63, #f06292); 
                    padding: 40px 20px; 
                    text-align: center;
                  ">
                    <h1 style="
                      color: white; 
                      margin: 0; 
                      font-size: 28px; 
                      font-weight: bold;
                    ">
                      💕 FabDive 💕
                    </h1>
                  </div>

                  <!-- Main Content -->
                  <div style="padding: 40px 20px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🌟</div>
                    
                    <h2 style="
                      color: #333; 
                      margin-bottom: 20px; 
                      font-size: 24px;
                    ">
                      Quelqu'un pense à toi !
                    </h2>
                    
                    <p style="
                      color: #666; 
                      font-size: 18px; 
                      line-height: 1.6; 
                      margin-bottom: 30px;
                    ">
                      Une personne secrète a pensé à toi sur FabDive.<br>
                      Inscris-toi pour tenter de découvrir de qui il s'agit ! ✨
                    </p>

                    <!-- CTA Button -->
                    <div style="margin: 40px 0;">
                      <a href="https://fabdive.lovable.app/?crush=1" style="
                        display: inline-block;
                        background: linear-gradient(135deg, #e91e63, #f06292);
                        color: white;
                        text-decoration: none;
                        padding: 15px 30px;
                        border-radius: 30px;
                        font-size: 18px;
                        font-weight: bold;
                        box-shadow: 0 10px 20px rgba(233, 30, 99, 0.3);
                        transition: all 0.3s ease;
                      ">
                        Découvrir qui c'est 🔍
                      </a>
                    </div>

                    <p style="
                      color: #999; 
                      font-size: 14px; 
                      margin-top: 30px;
                    ">
                      Tu as de la chance ! Quelqu'un a pensé à toi... 💫
                    </p>
                  </div>

                  <!-- Footer -->
                  <div style="
                    background: #f8f9fa; 
                    padding: 20px; 
                    text-align: center; 
                    border-top: 1px solid #eee;
                  ">
                    <p style="
                      color: #999; 
                      font-size: 12px; 
                      margin: 0;
                    ">
                      FabDive - L'app de rencontre authentique<br>
                      Si tu ne souhaites plus recevoir ces emails, ignore simplement ce message.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `
        }
      ],
      categories: ["crush-notification"]
    };

    console.log("Sending email via SendGrid API...");

    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    });

    console.log("SendGrid response status:", emailResponse.status);
    console.log("SendGrid response headers:", Object.fromEntries(emailResponse.headers.entries()));

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("SendGrid error response:", errorText);
      throw new Error(`SendGrid API error: ${emailResponse.status} - ${errorText}`);
    }

    const emailId = emailResponse.headers.get('x-message-id') || `sendgrid_${Date.now()}`;
    console.log("Email sent successfully via SendGrid, ID:", emailId);

    // Update the crush record with success status
    await supabase
      .from('crushes')
      .update({
        email_sent: true,
        email_id: emailId
      })
      .eq('id', crushRecord.id);

    return new Response(JSON.stringify({
      success: true,
      message: "Email envoyé avec succès !",
      emailId: emailId,
      crushId: crushRecord.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-crush-email function:", error);
    
    // Note: We can't re-parse the request body here as it's already been consumed
    // The error will be logged for debugging purposes

    return new Response(
      JSON.stringify({ 
        error: "Impossible d'envoyer l'email",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);