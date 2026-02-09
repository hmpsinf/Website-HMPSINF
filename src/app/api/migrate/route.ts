import { NextResponse } from "next/server";
import { migrateDivisions } from "@/../scripts/migrate-divisions";
import { migrateHimaInti } from "@/../scripts/migrate-hima-inti";
import { migrateEvents } from "@/../scripts/migrate-events";
import { getCurrentUser } from "@/lib/auth";

// POST /api/migrate - Run database migrations
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await migrateDivisions();
    await migrateHimaInti();
    await migrateEvents();

    return NextResponse.json({ message: "Migration completed successfully" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error.message || "Migration failed" },
      { status: 500 }
    );
  }
}
