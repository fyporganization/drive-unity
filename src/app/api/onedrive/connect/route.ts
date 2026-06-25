import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { triggerOneDriveAccountDelete } from "@/lib/workflows/triggers";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        const userId = session.id;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please login first." },
                { status: 401 }
            );
        }

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
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const oneDriveAccounts = await db.oneDriveAccount.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        const maxConnectedDrives =
            user.subscription?.subscriptionPlan?.maxConnectedDrives || 1;

        const googleDriveCount = await db.oneDriveAccount.count({
            where: { userId },
        });
        const oneDriveCount = oneDriveAccounts.length;
        const totalConnectedDrives = googleDriveCount + oneDriveCount;

        const canAddMore = totalConnectedDrives < maxConnectedDrives;
        const remainingSlots = Math.max(0, maxConnectedDrives - totalConnectedDrives);

        const drives = oneDriveAccounts.map((account) => ({
            id: account.id,
            onedriveAccount: account.onedriveAccount,
            createdAt: account.createdAt?.toISOString() || null,
            updatedAt: account.updatedAt?.toISOString() || null,
            deletionStatus: account.deletionStatus,
        }));

        return NextResponse.json({
            success: true,
            drives,
            totalCount: oneDriveCount,
            subscription: {
                maxConnectedDrives,
                tier: user.subscription?.subscriptionPlan?.tier || "FREE",
                packageName: user.subscription?.subscriptionPlan?.packageName || "Free Plan",
                canAddMore,
                remainingSlots,
            },
        });
    } catch (error) {
        console.error("OneDrive connect GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch OneDrive accounts" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        const userId = session.id;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please login first." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const driveId = searchParams.get("driveId");

        if (!driveId) {
            return NextResponse.json(
                { error: "Drive ID is required" },
                { status: 400 }
            );
        }

        const oneDriveAccount = await db.oneDriveAccount.findUnique({
            where: { id: driveId },
        });

        if (!oneDriveAccount) {
            return NextResponse.json(
                { error: "OneDrive account not found" },
                { status: 404 }
            );
        }

        if (oneDriveAccount.userId !== userId) {
            return NextResponse.json(
                { error: "Unauthorized to delete this OneDrive account" },
                { status: 403 }
            );
        }

        await db.oneDriveAccount.update({
            where: { id: driveId },
            data: { deletionStatus: 'deleting' },
        });

        await triggerOneDriveAccountDelete(driveId);

        const user = await db.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });

        if (user?.subscription) {
            await db.subscribedUser.update({
                where: { userId },
                data: {
                    connectedCloudAccounts: { decrement: 1 },
                    connectedAccounts: { decrement: 1 },
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: "OneDrive disconnection started",
            status: 'deleting',
        });
    } catch (error) {
        console.error("OneDrive disconnect error:", error);
        return NextResponse.json(
            { error: "Failed to disconnect OneDrive account" },
            { status: 500 }
        );
    }
}