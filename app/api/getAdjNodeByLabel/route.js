import { getAdjacentNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const label = searchParams.get("label");
    const where = searchParams.get("where");
    const edgeLabel = searchParams.get("edgeLabel");
    const edgeWhere = searchParams.get("edgeWhere");
    const adjacentNodeLabel = searchParams.get("adjacentNodeLabel");
    const adjWhere = searchParams.get("adjWhere");
    console.log("label", label, "adjacentNodeLabel", adjacentNodeLabel);
    const response = await getAdjacentNode(
      label,
      where ? JSON.parse(where) : {},
      edgeLabel,
      edgeWhere ? JSON.parse(edgeWhere) : {},
      adjacentNodeLabel,
      adjWhere ? JSON.parse(adjWhere) : {}
    );
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching adjacent nodes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
