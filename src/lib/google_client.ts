import dotenv from 'dotenv';
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
dotenv.config();

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

function getClientConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_AUTH_REDIRECT_URI || "",
    projectId: process.env.GOOGLE_PROJECT_ID || '',
    jsOrigin: process.env.GOOGLE_JS_ORIGINS || '',
  };
}

export function getOAuth2Client() {
  const cfg = getClientConfig();
  return new OAuth2Client(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
}

export function getAuthUrl(userId?: string): string {
  const oauth2Client = getOAuth2Client();
  const redirectUri = process.env.GOOGLE_AUTH_REDIRECT_URI;

  if (!redirectUri) {
    throw new Error("GOOGLE_AUTH_REDIRECT_URI environment variable is not set");
  }

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    redirect_uri: redirectUri,
    state: JSON.stringify({ userId }),
  });
}


export function buildDriveService(accessToken: string, refreshToken?: string) {
  const cfg = getClientConfig();
  const auth = new OAuth2Client(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.drive({ version: "v3", auth });
}

export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}