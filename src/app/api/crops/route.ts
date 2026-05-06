import { NextResponse } from "next/server";
import { db } from "@/db";
import { crops } from "@/db/schema";

export async function GET() {
  try {
    const allCrops = await db.select().from(crops).orderBy(crops.name).catch(() => [] as any[]);
    return NextResponse.json({ success: true, data: allCrops });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
