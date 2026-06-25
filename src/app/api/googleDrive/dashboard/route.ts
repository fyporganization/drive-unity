import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.id) {
      return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
      );
    }

    const userId = session.id;

    const userAccounts = await db.googleDriveAccount.findMany({
      where: { userId },
      select: { id: true },
    });

    if (userAccounts.length === 0) {
      return NextResponse.json({
        success: true,
        fileCount: 0,
        folderCount: 0,
        hasConnectedAccount: false,
      });
    }

    const accountIds = userAccounts.map((acc) => acc.id);

    const [fileCount, folderCount] = await Promise.all([
      db.googleDriveFile.count({
        where: {
          googleDriveAccountId: {
            in: accountIds,
          },
        },
      }),
      db.googleDriveFolder.count({
        where: {
          googleDriveAccountId: {
            in: accountIds,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      fileCount,
      folderCount,
      hasConnectedAccount: true,
      connectedAccountsCount: userAccounts.length,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
        {
          success: false,
          message: "Error fetching dashboard data",
        },
        { status: 500 }
    );
  }
}