import { createAdjacentNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Extract JSON body from the request
    const body = await req.json();

    // Destructure required properties from the body
    const {
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel,
      properties,
    } = body;

    // Debugging information
    console.log("Request Data:", {
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel,
      properties,
    });

    // Call createAdjacentNode with correct parameters
    const response = await createAdjacentNode(
      startNodeLabel, // Array of start node labels
      startNodeWhere, // Object with properties to match the start node
      endNodeLabel, // Array of adjacent node labels
      endNodeWhere, // Object with properties to match/create adjacent node
      edgeLabel, // Relationship label
      properties ? properties : {} // Properties for the relationship
    );

    // Return a successful response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error creating adjacent node:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
