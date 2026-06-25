import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const driveId = searchParams.get("driveId");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User ID is required",
                },
                { status: 400 }
            );
        }

        if (!driveId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Drive ID is required",
                },
                { status: 400 }
            );
        }

        const driveAccount = await db.oneDriveAccount.findFirst({
            where: {
                id: driveId,
                userId: userId,
            },
        });

        if (!driveAccount) {
            return NextResponse.json({
                success: false,
                message: "Drive not found or access denied",
            }, { status: 404 });
        }

        const fileData = await db.oneDriveFile.findMany({
            where: {
                userId: userId,
                oneDriveAccountId: driveId,
            },
            select: {
                id: true,
                fileId: true,
                fileName: true,
                mimeType: true,
                fileSize: true,
                fileCreatedTime: true,
                last_modified_time: true,
                filePath: true,
                webViewLink: true,
                md5Checksum: true,
                userId: true,
                updatedAt: true,
            },
            orderBy: {
                fileCreatedTime: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            fileData: fileData.map((file) => ({
                ...file,
                fileSize: file.fileSize ? Number(file.fileSize) : null,
            })),
            count: fileData.length,
        });
    } catch (error) {
        console.error("Failed to fetch file data:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch data",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}