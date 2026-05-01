import { NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/rules";

export async function POST(request: Request) {
  try {
    const { message, crop, region } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = getChatbotResponse(message, { crop, region });

    return NextResponse.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
