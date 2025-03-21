import { deleteAdjacentNode } from "../connection/neo"; // Fixed import
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); // Extract JSON body
    const {
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel,
    } = body;

    console.log(
      "StartNodeLabel, StartNodeWhere, EndNodeLabel, EndNodeWhere, EdgeLabel: ",
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel
    );

    // Call the correct function with appropriate params
    const response = await deleteAdjacentNode(
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel
    );

    // Return successful response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deleting adjacent node:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
