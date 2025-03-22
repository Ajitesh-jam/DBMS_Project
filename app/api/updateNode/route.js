import { updateNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); // Extract JSON body
    const { label, where, updates } = body;

    // Validate input data
    // if (!label || typeof label !== "string") {
    //   return NextResponse.json(
    //     { error: "Invalid or missing 'label'" },
    //     { status: 400 }
    //   );
    // }

    if (!where || Object.keys(where).length === 0) {
      return NextResponse.json(
        { error: "'where' condition is required to update a node" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "'updates' properties are required" },
        { status: 400 }
      );
    }

    console.log("Updating Node - Label, Where, Updates: ", label, where, updates);

    // Call updateNode with validated data
    const response = await updateNode(label, where, updates);
    console.log("Update Response:", response);
    console.log("Response Records:", response.records);

    if (response && response.length > 0) {
      return NextResponse.json(
        { message: "Node updated successfully", data: response[0].n.properties },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "No matching node found or update failed" },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error("Error updating node:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
