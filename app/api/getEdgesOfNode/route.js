import { getEdgesOfNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const label = searchParams.get("label");
    const where = searchParams.get("where");
    const edgeLabel = searchParams.get("edgeLabel");
    const edgeWhere = searchParams.get("edgeWhere");
    console.log("label", label, "edgeLabel", edgeLabel);
    const response = await getEdgesOfNode(
      label,
      where ? JSON.parse(where) : {},
      edgeLabel,
      edgeWhere ? JSON.parse(edgeWhere) : {}
    );
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching edges:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
