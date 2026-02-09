import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/settings/[key] - Get a specific setting by key
export async function GET(
    request: Request,
    context: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await context.params;

        const result = await db.execute({
            sql: "SELECT value FROM site_settings WHERE key = ?",
            args: [key],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ key, value: null }, { status: 200 });
        }

        return NextResponse.json({
            key,
            value: result.rows[0].value,
        });
    } catch (error) {
        console.error("Error fetching setting:", error);
        return NextResponse.json(
            { error: "Failed to fetch setting" },
            { status: 500 }
        );
    }
}
