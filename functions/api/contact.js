export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const data = await request.json();

    const { name, email, company, service, message } = data;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const serviceLabels = {
      cto: 'Fractional CTO & Advisory',
      observability: 'Observability & Splunk',
      cloud: 'Cloud Architecture & Migration',
      chatbot: 'AI Chatbot Development',
      other: 'Other',
    };

    const serviceName = serviceLabels[service] || service || 'Not specified';

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Mossel Cloud Website',
          email: 'krijn@mossel.cloud',
        },
        to: [{
          email: 'krijn@mossel.cloud',
          name: 'Krijn Mossel',
        }],
        replyTo: {
          email: email,
          name: name,
        },
        subject: `New inquiry: ${serviceName} — ${name}`,
        htmlContent: `
          <h2>New contact form submission</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px;">
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Company</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${company || 'Not provided'}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;">Service</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${serviceName}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:8px 12px;">${message.replace(/\n/g, '<br>')}</td></tr>
          </table>
        `,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Brevo API error:', response.status, errBody);
      throw new Error(`Brevo API error: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send message. Please try again or email directly.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
