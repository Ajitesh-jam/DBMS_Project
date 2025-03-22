import { updateAdjacentNode } from "../connection/neo";
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
      updates,
    } = body;

    // Validate input data
    if (!startNodeLabel || typeof startNodeLabel !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing 'startNodeLabel'" },
        { status: 400 }
      );
    }

    if (!startNodeWhere || Object.keys(startNodeWhere).length === 0) {
      return NextResponse.json(
        { error: "'startNodeWhere' condition is required to update the edge" },
        { status: 400 }
      );
    }

    if (!endNodeLabel || typeof endNodeLabel !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing 'endNodeLabel'" },
        { status: 400 }
      );
    }

    if (!endNodeWhere || Object.keys(endNodeWhere).length === 0) {
      return NextResponse.json(
        { error: "'endNodeWhere' condition is required to update the edge" },
        { status: 400 }
      );
    }

    if (!edgeLabel || typeof edgeLabel !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing 'edgeLabel'" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "'updates' properties are required" },
        { status: 400 }
      );
    }

    console.log(
      "Updating AdjacentNode - StartLabel, StartWhere, EndLabel, EndWhere, EdgeLabel, Updates: ",
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel,
      updates
    );

    // Call updateEdge with validated data
    const response = await updateAdjacentNode(
      startNodeLabel,
      startNodeWhere,
      endNodeLabel,
      endNodeWhere,
      edgeLabel,
      updates
    );

    // Check if an edge was updated successfully
    if (response && response.length > 0) {
      return NextResponse.json(
        {
          message: "Adjacent Node updated successfully",
          data: response[0].m.properties 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "No matching edge found or update failed" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating edge:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
