import { getAdjacentNodesOfAdjNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const {
      label,
      where = {},
      edgeLabel,
      edgeWhere = {},
      adjNodeLabel,
      adjWhere = {},
      AdjNodesofAdjNodeLabel,
      AdjNodesofAdjNodeEdgeLabel,
      AdjNodesofAdjNodeEdgeWhere = {},
    } = await req.json();



    const response = await getAdjacentNodesOfAdjNode(
      label,
      where,
      edgeLabel,
      edgeWhere,
      adjNodeLabel,
      adjWhere,
      AdjNodesofAdjNodeLabel,
      AdjNodesofAdjNodeEdgeLabel,
      AdjNodesofAdjNodeEdgeWhere
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
