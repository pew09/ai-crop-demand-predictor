import { NextResponse } from "next/server";
import { recommendCrops } from "@/lib/rules";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const regionName = searchParams.get("region") || "North Cotabato";

    const recommendations = recommendCrops(month, regionName);

    return NextResponse.json({
      success: true,
      data: {
        month,
        region: regionName,
        recommendations: recommendations.slice(0, 5),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
