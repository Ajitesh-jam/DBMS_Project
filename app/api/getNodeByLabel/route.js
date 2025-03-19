import { getNodeByLabel } from "../connection/neo";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const label = searchParams.get("label");
    const where = searchParams.get("where", null);

    console.log("label", label);
    console.log("where", where);

    const response = await getNodeByLabel(
      label,
      where ? JSON.parse(where) : {}
    );
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
