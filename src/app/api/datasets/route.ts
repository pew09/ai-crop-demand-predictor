import { NextResponse } from "next/server";
import { db } from "@/db";
import { datasets } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allDatasets = await db
      .select()
      .from(datasets)
      .orderBy(desc(datasets.uploadedAt));
    return NextResponse.json({ success: true, data: allDatasets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    if (!file || !name || !type) {
      return NextResponse.json(
        { error: "File, name, and type are required" },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    const rows = content.split("\n").length - 1; // subtract header

    // Store metadata
    const [newDataset] = await db
      .insert(datasets)
      .values({
        name,
        type,
        rows,
        fileUrl: `data:${file.type};base64,${Buffer.from(content).toString("base64")}`,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newDataset,
      message: `Dataset "${name}" uploaded with ${rows} rows of data.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
