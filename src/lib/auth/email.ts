const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const BRAND_PRIMARY = '#2563eb';
const BRAND_PRIMARY_DARK = '#1d4ed8';
const TEXT_DARK = '#1a1a2e';
const TEXT_MUTED = '#6b7280';
const BG_SOFT = '#eff6ff';
const BORDER_SOFT = '#e5e7eb';

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

    const error: Error & { code?: string } = new Error(
      `Failed to send email via Brevo (${response.status})`
    );
    error.code = response.status === 401 ? 'AUTH' : 'CONNECTION';
    throw error;
  }

  return response.json();
}

interface EmailLayoutOptions {
  preheader: string;
  heading: string;
  bodyHtml: string;
  footerHtml?: string;
}

function renderLayout({ preheader, heading, bodyHtml, footerHtml }: EmailLayoutOptions): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drive-unity.com';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${heading}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .email-body { padding: 32px 24px !important; }
      .code-cell { font-size: 32px !important; letter-spacing: 8px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
    a { color: ${BRAND_PRIMARY}; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${BG_SOFT}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color:${TEXT_DARK};">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none; overflow:hidden; line-height:1px; opacity:0; max-height:0; max-width:0;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_SOFT};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(102,126,234,0.08);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_PRIMARY_DARK} 100%); padding:36px 40px; text-align:left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:rgba(255,255,255,0.15); border-radius:10px; width:40px; height:40px; text-align:center; vertical-align:middle;">
                          <span style="color:#ffffff; font-size:22px; font-weight:800; line-height:40px; display:inline-block;">D</span>
                        </td>
                        <td style="padding-left:14px; vertical-align:middle;">
                          <div style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:-0.3px;">DriveUnity</div>
                          <div style="color:rgba(255,255,255,0.75); font-size:12px; margin-top:2px;">Multi-Cloud Drive Manager</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:48px 40px 40px 40px;">
              <h1 style="margin:0 0 20px 0; font-size:24px; font-weight:700; color:${TEXT_DARK}; letter-spacing:-0.4px; line-height:1.3;">
                ${heading}
              </h1>
              ${bodyHtml}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid ${BORDER_SOFT};"></div>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:24px 40px; background-color:${BG_SOFT};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:top; width:24px;">
                    <div style="color:${TEXT_MUTED}; font-size:16px; line-height:1;">🔒</div>
                  </td>
                  <td style="padding-left:12px; vertical-align:top;">
                    <div style="color:${TEXT_MUTED}; font-size:13px; line-height:1.6;">
                      For your security, this message was sent to you because you requested access.
                      If you didn't make this request, you can safely ignore this email — no changes will be made to your account.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px; text-align:center; background-color:#ffffff;">
              ${footerHtml ?? ''}
              <div style="color:${TEXT_MUTED}; font-size:12px; line-height:1.6;">
                &copy; ${year} DriveUnity. All rights reserved.<br />
                <a href="${appUrl}" style="color:${TEXT_MUTED}; text-decoration:underline;">${appUrl.replace(/^https?:\/\//, '')}</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendMagicLinkEmail(email: string, name: string, token: string) {
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  const firstName = name.split(' ')[0] || name;

  const bodyHtml = `
    <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6; color:${TEXT_DARK};">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 32px 0; font-size:16px; line-height:1.6; color:${TEXT_DARK};">
      Click the button below to sign in to your DriveUnity account. This link will expire in <strong>15 minutes</strong> and can only be used once.
    </p>

    <!-- CTA button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
      <tr>
        <td style="border-radius:10px; background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_PRIMARY_DARK} 100%);">
          <a href="${magicLink}" class="cta-button" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px; letter-spacing:0.2px;">
            Sign in to DriveUnity &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:${TEXT_MUTED};">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0; font-size:13px; line-height:1.5; word-break:break-all;">
      <a href="${magicLink}" style="color:${BRAND_PRIMARY}; text-decoration:underline;">${magicLink}</a>
    </p>
  `;

  await sendBrevoEmail({
    to: [{ email, name }],
    subject: 'Your DriveUnity sign-in link',
    htmlContent: renderLayout({
      preheader: 'Your one-time sign-in link is ready. It expires in 15 minutes.',
      heading: 'Sign in to DriveUnity',
      bodyHtml,
    }),
  });
}

export async function sendOTPEmail(email: string, name: string, code: string) {
  const firstName = name.split(' ')[0] || name;

  const bodyHtml = `
    <p style="margin:0 0 16px 0; font-size:16px; line-height:1.6; color:${TEXT_DARK};">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:${TEXT_DARK};">
      Use the verification code below to complete your sign-in. This code expires in <strong>10 minutes</strong>.
    </p>

    <!-- OTP code box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
      <tr>
        <td align="center" style="background-color:${BG_SOFT}; border:1px solid ${BORDER_SOFT}; border-radius:14px; padding:28px 20px;">
          <div style="font-size:12px; font-weight:600; color:${TEXT_MUTED}; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px;">
            Verification Code
          </div>
          <div class="code-cell" style="font-family: 'SF Mono', 'Courier New', Consolas, monospace; font-size:40px; font-weight:700; color:${TEXT_DARK}; letter-spacing:12px; line-height:1.2;">
            ${code}
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0; font-size:13px; line-height:1.6; color:${TEXT_MUTED};">
      Enter this code in the DriveUnity verification page to continue. Never share this code with anyone — DriveUnity staff will never ask for it.
    </p>
  `;

  await sendBrevoEmail({
    to: [{ email, name }],
    subject: `${code} is your DriveUnity verification code`,
    htmlContent: renderLayout({
      preheader: `Your verification code is ${code}. It expires in 10 minutes.`,
      heading: 'Verify your email',
      bodyHtml,
    }),
  });
}
