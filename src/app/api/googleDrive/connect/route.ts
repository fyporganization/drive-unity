import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { triggerGoogleDriveAccountDelete } from "@/lib/workflows/triggers";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
          {
            success: false,
            message: "Unauthorized"
          },
          { status: 401 }
      );
    }

    const userId = session.id;

    const userInfo = await db.user.findFirst({
      where: { id: userId },
      select: {
        googleDriveAccounts: {
          select: {
            id: true,
            gmailAccount: true,
            createdAt: true,
            updatedAt: true,
            deletionStatus: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        subscription: {
          select: {
            subscriptionPlan: {
              select: {
                maxConnectedDrives: true,
                packageName: true,
                tier: true,
              }
            }
          }
        }
      }
    });

    if (!userInfo) {
      return NextResponse.json(
          {
            success: false,
            message: "User not found"
          },
          { status: 404 }
      );
    }

    const maxDrives = userInfo.subscription?.subscriptionPlan?.maxConnectedDrives || 2;
    const subscriptionTier = userInfo.subscription?.subscriptionPlan?.tier || 'FREE';
    const packageName = userInfo.subscription?.subscriptionPlan?.packageName || 'Free';
    const googleDriveCount = userInfo.googleDriveAccounts.length;
    const oneDriveCount = await db.oneDriveAccount.count({
      where: { userId }
    });
    const totalConnectedDrives = googleDriveCount + oneDriveCount;

    return NextResponse.json({
      success: true,
      drives: userInfo.googleDriveAccounts,
      totalCount: userInfo.googleDriveAccounts.length,
      subscription: {
        maxConnectedDrives: maxDrives,
        tier: subscriptionTier,
        packageName: packageName,
        canAddMore: userInfo.googleDriveAccounts.length < maxDrives,
        remainingSlots: Math.max(0, maxDrives - totalConnectedDrives)
      }
    });

  } catch (error) {
    console.error("Error fetching drives:", error);
    return NextResponse.json(
        {
          success: false,
          message: "Internal server error"
        },
        { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
          {
            success: false,
            message: "Unauthorized"
          },
          { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get('driveId');

    if (!driveId) {
      return NextResponse.json(
          {
            success: false,
            message: "Drive ID required"
          },
          { status: 400 }
      );
    }

    const userId = session.id;

    const drive = await db.googleDriveAccount.findFirst({
      where: {
        id: driveId,
        userId: userId,
      }
    });

    if (!drive) {
      return NextResponse.json(
          {
            success: false,
            message: "Drive not found"
          },
          { status: 404 }
      );
    }

    await db.googleDriveAccount.update({
      where: { id: driveId },
      data: { deletionStatus: 'deleting' },
    });

    await triggerGoogleDriveAccountDelete(driveId);

    return NextResponse.json({
      success: true,
      message: "Drive disconnection started",
      status: 'deleting',
    });

  } catch (error) {
    console.error("Error deleting drive:", error);
    return NextResponse.json(
        {
          success: false,
          message: "Internal server error"
        },
        { status: 500 }
    );
  }
}