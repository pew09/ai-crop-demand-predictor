import { NextResponse } from "next/server";
import { db } from "@/db";
import { regions } from "@/db/schema";

export async function GET() {
  try {
    const allRegions = await db.select().from(regions).orderBy(regions.name);
    return NextResponse.json({ success: true, data: allRegions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
