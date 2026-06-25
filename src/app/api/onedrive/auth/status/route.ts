import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.id) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          connected: false,
          accountsCount: 0,
          accounts: [],
        },
        { status: 401 }
      );
    }

    const userId = session.id;

    // Fetch user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          connected: false,
          accountsCount: 0,
          accounts: [],
        },
        { status: 401 }
      );
    }

    // Fetch all connected OneDrive accounts for this user
    const oneDriveAccounts = await db.oneDriveAccount.findMany({
      where: { userId },
      select: {
        id: true,
        onedriveAccount: true,
      },
    });

    const accounts = oneDriveAccounts.map((acc) => ({
      id: acc.id,
      onedriveAccount: acc.onedriveAccount,
    }));

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email, name: user.name },
      connected: accounts.length > 0,
      accountsCount: accounts.length,
      accounts,
    });
  } catch (error) {
    console.error("OneDrive auth status error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        connected: false,
        accountsCount: 0,
        accounts: [],
      },
      { status: 500 }
    );
  }
}