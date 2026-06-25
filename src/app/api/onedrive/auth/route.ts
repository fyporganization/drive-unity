import { NextRequest, NextResponse } from "next/server";
import { getOneDriveAuthUrl } from "@/lib/one_drive_client";
import { getSession } from '@/lib/auth/session';
import { db } from "@/lib/db";

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
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const state = JSON.stringify({
            userId: userId,
            timestamp: Date.now(),
            random: Math.random().toString(36).substring(7),
        });

        const encodedState = Buffer.from(state).toString("base64");

        const authUrl = getOneDriveAuthUrl(encodedState);

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("OneDrive auth error:", error);
        return NextResponse.json(
            { error: "Failed to initiate OneDrive authentication" },
            { status: 500 }
        );
    }
}