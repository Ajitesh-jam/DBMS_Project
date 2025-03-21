import { createEdge } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the incoming request body
    const body = await req.json();

    // Destructure required parameters from the request body
    const {
      startNodeLabel, // Array of start node labels
      startNodeWhere, // Object to identify start node
      endNodeLabel, // Array of end node labels
      endNodeWhere, // Object to identify end node
      edgeLabel, // Relationship label
      properties, // Properties for the relationship (optional)
    } = body;

    // Basic validation to ensure required fields are present
    if (
      !startNodeLabel ||
      !startNodeWhere ||
      !endNodeLabel ||
      !endNodeWhere ||
      !edgeLabel
    ) {
      return NextResponse.json(
        { error: "Missing required fields for creating an edge." },
        { status: 400 }
      );
    }

    // Log the inputs for debugging
    console.log("Creating edge with:", {
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel,
      properties,
    });

    // Call the createEdge function with extracted parameters
    const response = await createEdge(
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel,
      properties || {} // Use empty object if no properties provided
    );

    // Return the response with a 200 status
    return NextResponse.json(
      {
        message: "Edge created successfully.",
        result: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating edge:", error);

    // Handle errors gracefully
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
