import { NextRequest, NextResponse } from "next/server";
import {
    getOneDriveTokenFromCode,
    getOneDriveUserInfo
} from "@/lib/one_drive_client";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { triggerOneDriveSync } from "@/lib/workflows/triggers";

function parseOneDriveState(state: string): { userId: string } | null {
    try {
        const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
        const stateAge = Date.now() - decoded.timestamp;
        if (stateAge > 10 * 60 * 1000) {
            return null;
        }
        return decoded;
    } catch (err) {
        console.error("Invalid state parameter:", err);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (error) {
            console.error("OneDrive OAuth error:", error, errorDescription);
            return NextResponse.redirect(
                new URL(
                    `/dashboard?error=${encodeURIComponent(errorDescription || error)}`,
                    process.env.NEXT_PUBLIC_APP_URL!
                )
            );
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL(
                    "/dashboard?error=Missing authorization code or state",
                    process.env.NEXT_PUBLIC_APP_URL!
                )
            );
        }

        const decodedState = parseOneDriveState(state);
        if (!decodedState) {
            return NextResponse.redirect(
                new URL("/dashboard?error=Invalid state parameter", process.env.NEXT_PUBLIC_APP_URL!)
            );
        }

        const userId = decodedState.userId;

        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: {
                        subscriptionPlan: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.redirect(
                new URL("/dashboard?error=User not found", process.env.NEXT_PUBLIC_APP_URL!)
            );
        }

        const currentOneDriveAccounts = await db.oneDriveAccount.count({
            where: { userId },
        });

        const maxCloudAccounts =
            user.subscription?.subscriptionPlan?.maxConnectedDrives || 1;

        if (currentOneDriveAccounts >= maxCloudAccounts) {
            return NextResponse.redirect(
                new URL(
                    `/dashboard?error=OneDrive account limit reached. Maximum allowed: ${maxCloudAccounts}`,
                    process.env.NEXT_PUBLIC_APP_URL!
                )
            );
        }

        const tokenData = await getOneDriveTokenFromCode(code);

        const userInfo = await getOneDriveUserInfo(tokenData.accessToken);

        const existingAccount = await db.oneDriveAccount.findUnique({
            where: { onedriveAccount: userInfo.email },
        });

        let accountId: string;
        let isNewConnection = false;

        const encryptedAccessToken = encrypt(tokenData.accessToken);
        const encryptedRefreshToken = encrypt(tokenData.refreshToken);

        if (existingAccount) {
            if (existingAccount.userId !== userId) {
                return NextResponse.redirect(
                    new URL(
                        "/dashboard?error=This OneDrive account is already connected to another user",
                        process.env.NEXT_PUBLIC_APP_URL!
                    )
                );
            }

            await db.oneDriveAccount.update({
                where: { id: existingAccount.id },
                data: {
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    expiresIn: tokenData.expiresIn,
                    scope: tokenData.scope,
                    updatedAt: new Date(),
                },
            });

            accountId = existingAccount.id;
        } else {
            const newAccount = await db.oneDriveAccount.create({
                data: {
                    onedriveAccount: userInfo.email,
                    userId: userId,
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    expiresIn: tokenData.expiresIn,
                    scope: tokenData.scope,
                },
            });

            accountId = newAccount.id;
            isNewConnection = true;

            await db.subscribedUser.update({
                where: { userId },
                data: {
                    connectedCloudAccounts: {
                        increment: 1,
                    },
                    connectedAccounts: {
                        increment: 1,
                    },
                },
            }).catch((err) => {
                console.error('Failed to update subscription counts:', err);
            });
        }

        let triggerWorkflowId: string | null = null;
        try {
            const trigger = await triggerOneDriveSync(userId, accountId);
            console.log('Triggered OneDrive sync workflow:', trigger);
            triggerWorkflowId = trigger.workflow_id;
        } catch (syncError) {
            console.error('Failed to trigger OneDrive sync:', syncError);
        }

        if (isNewConnection && triggerWorkflowId) {
            return NextResponse.redirect(
                new URL(
                    `/connections/syncing?workflowId=${encodeURIComponent(triggerWorkflowId)}&accountId=${encodeURIComponent(accountId)}&provider=onedrive`,
                    process.env.NEXT_PUBLIC_APP_URL!
                )
            );
        }

        const successMessage = isNewConnection
            ? "OneDrive account connected and synced successfully"
            : "OneDrive account reconnected and synced successfully";

        return NextResponse.redirect(
            new URL(
                `/dashboard?success=${encodeURIComponent(successMessage)}`,
                process.env.NEXT_PUBLIC_APP_URL!
            )
        );
    } catch (error) {
        console.error("OneDrive callback error:", error);
        return NextResponse.redirect(
            new URL(
                `/dashboard?error=${encodeURIComponent(
                    error instanceof Error ? error.message : "Failed to connect OneDrive account"
                )}`,
                process.env.NEXT_PUBLIC_APP_URL!
            )
        );
    }
}