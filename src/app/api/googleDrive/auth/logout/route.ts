import { NextResponse } from "next/server";

export async function POST() {
  try {
    const TOKEN = process.env.TOKEN || "USER_INFO";

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.delete(TOKEN);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to logout",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const TOKEN = process.env.TOKEN || "USER_INFO";

    const response = NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
    );
    response.cookies.delete(TOKEN);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(
      new URL(
        "/?error=logout_failed",
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      )
    );
  }
}
