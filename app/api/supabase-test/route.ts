import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Simple Next.js GET route that tests Supabase connectivity.
// It queries the `profiles` table (adjust table name if needed)
// and logs success or error to the server console.

export async function GET() {
  try {
    const { data, error } = await supabase.from("profiles").select("*").limit(10);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const rowCount = Array.isArray(data) ? data.length : 0;
    console.log(`Supabase fetch successful — rows: ${rowCount}`);

    return NextResponse.json({ success: true, rowCount, sample: data?.slice(0, 3) ?? [] });
  } catch (err) {
    console.error("Unexpected error querying Supabase:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
