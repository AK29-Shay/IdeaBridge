import { NextResponse } from "next/server";
import {
  IdeaPersistenceError,
  buildIdeaAnalyticsSnapshot,
} from "@/backend/services/ideaPersistenceService";

export async function GET() {
  try {
    const data = await buildIdeaAnalyticsSnapshot();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof IdeaPersistenceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load analytics." },
      { status: 500 }
    );
  }
}
