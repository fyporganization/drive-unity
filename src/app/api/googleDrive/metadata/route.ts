import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getValidGoogleDriveToken } from "@/lib/tokens/google";
import { triggerGoogleDriveSync } from "@/lib/workflows/triggers";

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

    const account = await db.googleDriveAccount.findFirst({
      where: {
        id: driveId,
        userId: userId
      },
      select: { id: true }
    });

    if (!account) {
      return NextResponse.json(
          {
            error: "Google Drive account not found",
            details: "No Google Drive account found with this ID for the current user"
          },
          { status: 404 }
      );
    }

    try {
      await getValidGoogleDriveToken(account.id);
    } catch (tokenError: any) {
      return NextResponse.json(
          {
            error: "Failed to refresh Google Drive token",
            details: tokenError?.message || "Unable to refresh token before metadata sync"
          },
          { status: 401 }
      );
    }

    const trigger = await triggerGoogleDriveSync(userId, driveId);
    return NextResponse.json({
      ...trigger,
      message: "Google Drive sync workflow started",
    });

  } catch (error: any) {
    console.error("Metadata fetch error:", error);

    return NextResponse.json(
        {
          error: "Failed to fetch metadata",
          details: error.message,
        },
        { status: 500 }
    );
  }
}