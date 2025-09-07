import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    console.log("=== AUTH EMAIL FUNCTION STARTED ===");
    
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log("Request payload:", payload);
    console.log("Request headers:", headers);

    // Verify webhook (optional, depends on your setup)
    // const wh = new Webhook(hookSecret);
    // const webhookData = wh.verify(payload, headers);

    // Parse the webhook payload
    const webhookData = JSON.parse(payload);
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url }
    } = webhookData;

    console.log("Processing auth email for:", user.email);
    console.log("Email action type:", email_action_type);

    let subject: string;
    let htmlContent: string;

    if (email_action_type === "signup" || email_action_type === "magiclink") {
      subject = "Connexion à FabDive - Lien magique 🪄";
      const confirmUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || site_url}`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${subject}</title>
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
                  🪄 FabDive 🪄
                </h1>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px 20px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">✨</div>
                
                <h2 style="
                  color: #333; 
                  margin-bottom: 20px; 
                  font-size: 24px;
                ">
                  Connexion à FabDive
                </h2>
                
                <p style="
                  color: #666; 
                  font-size: 18px; 
                  line-height: 1.6; 
                  margin-bottom: 30px;
                ">
                  Clique sur le bouton ci-dessous pour te connecter à ton compte FabDive !
                </p>

                <!-- CTA Button -->
                <div style="margin: 40px 0;">
                  <a href="${confirmUrl}" style="
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
                    Se connecter à FabDive 🚀
                  </a>
                </div>

                <p style="
                  color: #999; 
                  font-size: 14px; 
                  margin-top: 30px;
                ">
                  Ce lien expire dans 1 heure pour des raisons de sécurité.
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
                  Si tu n'as pas demandé cette connexion, ignore simplement ce message.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (email_action_type === "recovery") {
      subject = "Réinitialisation de ton mot de passe FabDive 🔑";
      const resetUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || site_url}`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${subject}</title>
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
                background: linear-gradient(135deg, #ff6b6b, #ffa726); 
                padding: 40px 20px; 
                text-align: center;
              ">
                <h1 style="
                  color: white; 
                  margin: 0; 
                  font-size: 28px; 
                  font-weight: bold;
                ">
                  🔑 FabDive 🔑
                </h1>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px 20px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">🔓</div>
                
                <h2 style="
                  color: #333; 
                  margin-bottom: 20px; 
                  font-size: 24px;
                ">
                  Réinitialisation de mot de passe
                </h2>
                
                <p style="
                  color: #666; 
                  font-size: 18px; 
                  line-height: 1.6; 
                  margin-bottom: 30px;
                ">
                  Clique sur le bouton ci-dessous pour réinitialiser ton mot de passe FabDive.
                </p>

                <!-- CTA Button -->
                <div style="margin: 40px 0;">
                  <a href="${resetUrl}" style="
                    display: inline-block;
                    background: linear-gradient(135deg, #ff6b6b, #ffa726);
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 30px;
                    font-size: 18px;
                    font-weight: bold;
                    box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
                    transition: all 0.3s ease;
                  ">
                    Réinitialiser mon mot de passe 🔄
                  </a>
                </div>

                <p style="
                  color: #999; 
                  font-size: 14px; 
                  margin-top: 30px;
                ">
                  Ce lien expire dans 1 heure pour des raisons de sécurité.
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
                  Si tu n'as pas demandé cette réinitialisation, ignore simplement ce message.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      // Default case
      subject = "Email de FabDive";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>FabDive</h2>
          <p>Un email automatique de FabDive.</p>
        </div>
      `;
    }

    // Send email using Resend API
    console.log("Sending email via Resend API...");

    const { data, error: resendError } = await resend.emails.send({
      from: 'FabDive <hello@fabdive.com>',
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      throw new Error(`Resend API error: ${resendError.message}`);
    }

    console.log("Auth email sent successfully via Resend:", data?.id);

    return new Response(JSON.stringify({
      success: true,
      message: "Email d'authentification envoyé avec succès"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Impossible d'envoyer l'email d'authentification",
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