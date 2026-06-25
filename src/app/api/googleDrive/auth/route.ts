'use server';
import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google_client";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.redirect("/auth");
    }

    const authUrl = getAuthUrl(session.id);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Auth initiation error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
