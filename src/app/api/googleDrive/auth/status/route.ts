import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { success } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        connected: false,
        accountsCount: 0,
        accounts: [],
      },
    {status:401});
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        googleDriveAccounts: {
          select: { 
            id: true,
            gmailAccount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        connected: false,
        accountsCount: 0,
        accounts: [],
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        role: user.role,
      },
      connected: user.googleDriveAccounts.length > 0,
      accountsCount: user.googleDriveAccounts.length,
      accounts: user.googleDriveAccounts,
    });

  } catch (error: any) {
    console.error('Error checking auth status:', error);
    
    return NextResponse.json({ 
      connected: false,
      user: null,
      accountsCount: 0,
      accounts: [],
    }, {
      status: 500,
    });
  }
}