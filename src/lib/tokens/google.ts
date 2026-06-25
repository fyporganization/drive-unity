import { db } from "@/lib/db";
import { refreshAccessToken } from "@/lib/google_client";
import { encrypt, decrypt } from "@/lib/encryption";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const DEFAULT_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

function getGoogleExpiryDate(expiresIn: bigint, referenceDate: Date): Date {
	const expiryValue = Number(expiresIn);

	if (!Number.isFinite(expiryValue) || expiryValue <= 0) {
		return new Date(0);
	}

	if (expiryValue < 10_000_000_000) {
		return new Date(referenceDate.getTime() + expiryValue * 1000);
	}

	return new Date(expiryValue);
}

function getStoredGoogleExpiry(credentials: {
	expiry_date?: number | null;
	expires_in?: number | null;
}): bigint {
	if (typeof credentials.expiry_date === "number" && Number.isFinite(credentials.expiry_date)) {
		return BigInt(Math.trunc(credentials.expiry_date));
	}

	const expiresInSeconds = Number(credentials.expires_in ?? DEFAULT_TOKEN_LIFETIME_MS / 1000);
	return BigInt(Date.now() + expiresInSeconds * 1000);
}

export async function getValidGoogleDriveToken(accountId: string): Promise<string> {
	const account = await db.googleDriveAccount.findUnique({
		where: { id: accountId },
	});

	if (!account) {
		throw new Error("Google Drive account not found");
	}

	const referenceDate = account.updatedAt ?? account.createdAt ?? new Date(0);
	const expiresAt = getGoogleExpiryDate(account.expiresIn, referenceDate);
	const now = new Date();
	const fiveMinutesFromNow = new Date(now.getTime() + TOKEN_REFRESH_BUFFER_MS);

	if (expiresAt <= fiveMinutesFromNow) {
		try {
			const decryptedRefreshToken = decrypt(account.refreshToken);
			const newTokens = await refreshAccessToken(decryptedRefreshToken);
			const accessToken = newTokens.access_token;

			if (!accessToken) {
				throw new Error("Google refresh response did not include an access token");
			}

			const encryptedAccessToken = encrypt(accessToken);
			const encryptedRefreshToken = newTokens.refresh_token
				? encrypt(newTokens.refresh_token)
				: account.refreshToken;

			await db.googleDriveAccount.update({
				where: { id: accountId },
				data: {
					accessToken: encryptedAccessToken,
					refreshToken: encryptedRefreshToken,
					expiresIn: getStoredGoogleExpiry({
						expiry_date: newTokens.expiry_date,
					}),
					updatedAt: new Date(),
				},
			});

			return accessToken;
		} catch (error) {
			console.error("Failed to refresh Google Drive token:", error);
			throw new Error("Failed to refresh Google Drive access token");
		}
	}

	return decrypt(account.accessToken);
}

export async function getValidGoogleDriveTokenByEmail(
	userId: string,
	gmailAccount: string,
): Promise<string> {
	const account = await db.googleDriveAccount.findFirst({
		where: {
			userId,
			gmailAccount,
		},
	});

	if (!account) {
		throw new Error("Google Drive account not found");
	}

	return getValidGoogleDriveToken(account.id);
}

export async function refreshAllUserGoogleDriveTokens(userId: string) {
	const accounts = await db.googleDriveAccount.findMany({
		where: { userId },
	});

	const results = await Promise.allSettled(
		accounts.map(async (account) => {
			try {
				await getValidGoogleDriveToken(account.id);
				return { accountId: account.id, status: "success" };
			} catch (error) {
				return {
					accountId: account.id,
					status: "failed",
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),
	);

	return results;
}
