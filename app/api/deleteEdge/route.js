import { deleteEdge } from "../connection/neo";
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
      "Labels and where:",
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel
    );
    const response = await deleteEdge(
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deleting edge:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// This code defines an API route for deleting an edge in a Neo4j database.