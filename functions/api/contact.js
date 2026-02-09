export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const formData = await request.formData();

    const name = formData.get('name');
    const email = formData.get('email');
    const company = formData.get('company');
    const service = formData.get('service');
    const message = formData.get('message');

    var debug = "";

    // Basic validation
    if (!name || !email || !message) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    debug += ('Point A');

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 
        'content-type': 'application/json', 
        'api-key': env.BREVO_API_KEY,  // Use environment variable
        'accept': 'application/json' 
      },
      body: JSON.stringify({
        "sender": {
          "name": "Mossel Cloud Website",
          "email": "noreply@mossel.cloud"
        },
        "to": [{
          "email": "krijn@mossel.cloud",
          "name": "Krijn Mossel"
        }],
        "subject": "Mossel Cloud Form Submission",
        "textContent": `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nService: ${service || 'N/A'}\nMessage: ${message}`
      })
    });

    debug += ('Point B');

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status}`);
    }

    debug += ('Point C');

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send email - ' + error + debug }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
