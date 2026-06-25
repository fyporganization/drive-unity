import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { triggerOneDriveSync } from "@/lib/workflows/triggers";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.id;

        const { searchParams } = new URL(request.url);
        const driveId = searchParams.get("driveId");

        if (!driveId) {
            return NextResponse.json(
                { error: "Drive ID is required" },
                { status: 400 }
            );
        }

        const account = await db.oneDriveAccount.findFirst({
            where: {
                id: driveId,
                userId: userId
            },
            select: { id: true }
        });
        if (!account) {
            return NextResponse.json(
                {
                    error: "OneDrive account not found",
                    details: "No OneDrive account found with this ID for the current user"
                },
                { status: 404 }
            );
        }

        const trigger = await triggerOneDriveSync(userId, driveId);
        return NextResponse.json({
            ...trigger,
            message: "OneDrive sync workflow started",
        });

    } catch (error: any) {
        console.error("OneDrive metadata fetch error:", error);

        return NextResponse.json(
            {
                error: "Failed to fetch metadata",
                details: error.message,
            },
            { status: 500 }
        );
    }
}