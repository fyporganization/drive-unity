import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { triggerGoogleDriveSync } from "@/lib/workflows/triggers";

function getGoogleTokenExpiry(expiresInSeconds?: number): bigint {
  const expiresInMs = Number(expiresInSeconds ?? 3600) * 1000;
  return BigInt(Date.now() + expiresInMs);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
          new URL('/connections?success=connected', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    if (!code) {
      return NextResponse.redirect(
          new URL('/connections?success=connected', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    if (!state) {
      return NextResponse.redirect(
          new URL('/connections?success=connected', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    let userId: string;
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      userId = stateData.userId;

      if (!userId) {
        throw new Error('userId not found in state');
      }

    } catch (parseError) {
      console.error('Failed to parse state parameter:', parseError);
      return NextResponse.redirect(
          new URL('/connections?success=connected', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return NextResponse.redirect(
          new URL('/connections?success=connected', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_AUTH_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await userInfoResponse.json();

    const existingAccount = await db.googleDriveAccount.findUnique({
      where: { gmailAccount: userInfo.email },
    });

    const isFirstTimeConnection = !existingAccount;

    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = encrypt(tokens.refresh_token);

    const account = await db.googleDriveAccount.upsert({
      where: { gmailAccount: userInfo.email },
      create: {
        gmailAccount: userInfo.email,
        userId: userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresIn: getGoogleTokenExpiry(tokens.expires_in),
        scope: tokens.scope,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresIn: getGoogleTokenExpiry(tokens.expires_in),
        scope: tokens.scope,
        userId: userId,
      },
    });

    if (isFirstTimeConnection) {
      try {
        const trigger = await triggerGoogleDriveSync(userId, account.id);
        console.log('Triggered initial Google Drive sync workflow:', trigger);
        return NextResponse.redirect(
            new URL(
              `/connections/syncing?workflowId=${encodeURIComponent(trigger.workflow_id)}&accountId=${encodeURIComponent(account.id)}&provider=google`,
              process.env.NEXT_PUBLIC_APP_URL!
            )
        );
      } catch (syncError) {
        console.error('Failed to trigger initial Google Drive sync:', syncError);
      }
    }
    return NextResponse.redirect(
        new URL('/connections?success=connected', process.env.NEXT_PUBLIC_APP_URL!)
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
        new URL('/connections?success=connected', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}