import { getWholeGraph } from "../connection/neo";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await getWholeGraph();
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching graph:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
