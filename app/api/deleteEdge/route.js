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

// ✅ Handle GET Request
export async function GET(req) {
  try {
    // Extract query parameters from the URL
    const url = new URL(req.nextUrl);
    const startNodeLabel = url.searchParams.get("startNodeLabel");
    const startNodeWhereString = url.searchParams.get("startNodeWhere");
    const endNodeLabel = url.searchParams.get("endNodeLabel");
    const endNodeWhereString = url.searchParams.get("endNodeWhere");
    const edgeLabel = url.searchParams.get("edgeLabel");

    // Validate required parameters
    if (
      !startNodeLabel ||
      !endNodeLabel ||
      !edgeLabel ||
      !startNodeWhereString ||
      !endNodeWhereString
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Parse `startNodeWhere` and `endNodeWhere` to JSON objects
    let startNodeWhere, endNodeWhere;
    try {
      startNodeWhere = JSON.parse(startNodeWhereString);
      endNodeWhere = JSON.parse(endNodeWhereString);
    } catch (error) {
      console.error("Error parsing query parameters:", error);
      return NextResponse.json(
        { error: "Invalid query parameters. `startNodeWhere` and `endNodeWhere` must be valid JSON." },
        { status: 400 }
      );
    }

    console.log(
      "Labels and where:",
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel
    );

    // Call deleteEdge with extracted parameters
    const response = await deleteEdge(
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel
    );

    // Check if edge was deleted successfully
    if (response && response.records.length > 0) {
      return NextResponse.json(
        {
          message: "Edge deleted successfully",
          data: response.records,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "No matching edge found or deletion failed" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting edge:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
