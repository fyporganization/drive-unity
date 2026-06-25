interface OneDriveTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    scope: string;
}

interface OneDriveUserInfo {
    email: string;
    name: string;
    id: string;
}

const CLIENT_ID = process.env.ONE_DRIVE_CLIENT_ID!;
const CLIENT_SECRET = process.env.ONE_DRIVE_CLIENT_SECRET_VALUE!;
const REDIRECT_URI = process.env.ONEDRIVE_REDIRECT_URI!;
const TENANT_ID = 'common';

const AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}`;
const AUTH_ENDPOINT = `${AUTHORITY}/oauth2/v2.0/authorize`;
const TOKEN_ENDPOINT = `${AUTHORITY}/oauth2/v2.0/token`;
const GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0';

const SCOPES = [
    'User.Read',
    'Files.Read.All',
    'Files.ReadWrite.All',
    'offline_access',
].join(' ');

export function getOneDriveAuthUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        state: state,
        response_mode: 'query',
        prompt: 'consent',
    });

    return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export async function getOneDriveTokenFromCode(
    code: string
): Promise<OneDriveTokenResponse> {
    try {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OneDrive token error:', errorData);
            throw new Error(
                errorData.error_description || 'Failed to get OneDrive access token'
            );
        }

        const data = await response.json();

        const expiresInSeconds = data.expires_in || 3600;
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: expiresAt.toISOString(),
            scope: data.scope,
        };
    } catch (error) {
        console.error('Error getting OneDrive token from code:', error);
        throw error;
    }
}

export async function refreshOneDriveToken(
    refreshToken: string
): Promise<OneDriveTokenResponse> {
    try {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
                scope: SCOPES,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OneDrive refresh token error:', errorData);
            throw new Error(
                errorData.error_description || 'Failed to refresh OneDrive access token'
            );
        }

        const data = await response.json();

        const expiresInSeconds = data.expires_in || 3600;
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken, // Use old refresh token if new one not provided
            expiresIn: expiresAt.toISOString(),
            scope: data.scope,
        };
    } catch (error) {
        console.error('Error refreshing OneDrive token:', error);
        throw error;
    }
}

export async function getOneDriveUserInfo(
    accessToken: string
): Promise<OneDriveUserInfo> {
    try {
        const response = await fetch(`${GRAPH_API_ENDPOINT}/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OneDrive user info error:', errorData);
            throw new Error('Failed to get OneDrive user information');
        }

        const data = await response.json();

        return {
            email: data.mail || data.userPrincipalName,
            name: data.displayName,
            id: data.id,
        };
    } catch (error) {
        console.error('Error getting OneDrive user info:', error);
        throw error;
    }
}

export async function getOneDriveDriveInfo(accessToken: string) {
    try {
        const response = await fetch(`${GRAPH_API_ENDPOINT}/me/drive`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OneDrive drive info error:', errorData);
            throw new Error('Failed to get OneDrive drive information');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting OneDrive drive info:', error);
        throw error;
    }
}

export async function listOneDriveFiles(
    accessToken: string,
    folderId?: string
) {
    try {
        const endpoint = folderId
            ? `${GRAPH_API_ENDPOINT}/me/drive/items/${folderId}/children`
            : `${GRAPH_API_ENDPOINT}/me/drive/root/children`;

        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OneDrive list files error:', errorData);
            throw new Error('Failed to list OneDrive files');
        }

        return await response.json();
    } catch (error) {
        console.error('Error listing OneDrive files:', error);
        throw error;
    }
}

export async function validateOneDriveToken(accessToken: string): Promise<boolean> {
    try {
        const response = await fetch(`${GRAPH_API_ENDPOINT}/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Error validating OneDrive token:', error);
        return false;
    }
}

export async function revokeOneDriveToken(accessToken: string): Promise<void> {
    try {
        console.log('OneDrive token revocation requested');
    } catch (error) {
        console.error('Error revoking OneDrive token:', error);
        throw error;
    }
}