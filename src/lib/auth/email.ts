const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface BrevoEmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}

async function sendBrevoEmail(payload: BrevoEmailPayload) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!senderEmail) {
    throw new Error('BREVO_SENDER_EMAIL environment variable is not set');
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'DriveUnity',
        email: senderEmail,
      },
      ...payload,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('Brevo API error:', response.status, body);

    const error: any = new Error(
      `Failed to send email via Brevo (${response.status})`
    );
    error.code = response.status === 401 ? 'AUTH' : 'CONNECTION';
    throw error;
  }

  return response.json();
}

export async function sendMagicLinkEmail(
  email: string,
  name: string,
  token: string
) {
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await sendBrevoEmail({
    to: [{ email, name }],
    subject: 'Your DriveUnity Sign-In Link',
    htmlContent: `
      <h2>Hi ${name}!</h2>
      <p>Click the link below to sign in:</p>
      <a href="${magicLink}">Sign In to DriveUnity</a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
}

export async function sendOTPEmail(
  email: string,
  name: string,
  code: string
) {
  await sendBrevoEmail({
    to: [{ email, name }],
    subject: 'Your DriveUnity Verification Code',
    htmlContent: `
      <h2>Hi ${name}!</h2>
      <p>Your verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
}
