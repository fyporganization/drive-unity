import { db } from "@/lib/db";
import { refreshOneDriveToken } from "@/lib/one_drive_client";
import { encrypt, decrypt } from "@/lib/encryption";

export async function getValidOneDriveToken(accountId: string): Promise<string> {
    const account = await db.oneDriveAccount.findUnique({
        where: { id: accountId },
    });

    if (!account) {
        throw new Error("OneDrive account not found");
    }

    const expiresAt = new Date(account.expiresIn);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt <= fiveMinutesFromNow) {
        try {
            const decryptedRefreshToken = decrypt(account.refreshToken);
            const newTokens = await refreshOneDriveToken(decryptedRefreshToken);

            await db.oneDriveAccount.update({
                where: { id: accountId },
                data: {
                    accessToken: encrypt(newTokens.accessToken),
                    refreshToken: encrypt(newTokens.refreshToken),
                    expiresIn: newTokens.expiresIn,
                    updatedAt: new Date(),
                },
            });

            return newTokens.accessToken;
        } catch (error) {
            console.error("Failed to refresh OneDrive token:", error);
            throw new Error("Failed to refresh OneDrive access token");
        }
    }

    return decrypt(account.accessToken);
}

export async function getValidOneDriveTokenByEmail(
    userId: string,
    onedriveEmail: string
): Promise<string> {
    const account = await db.oneDriveAccount.findFirst({
        where: {
            userId,
            onedriveAccount: onedriveEmail,
        },
    });

    if (!account) {
        throw new Error("OneDrive account not found");
    }

    return getValidOneDriveToken(account.id);
}

export async function refreshAllUserOneDriveTokens(userId: string) {
    const accounts = await db.oneDriveAccount.findMany({
        where: { userId },
    });

    const results = await Promise.allSettled(
        accounts.map(async (account) => {
            try {
                await getValidOneDriveToken(account.id);
                return { accountId: account.id, status: "success" };
            } catch (error) {
                return {
                    accountId: account.id,
                    status: "failed",
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }
        })
    );

    return results;
}
