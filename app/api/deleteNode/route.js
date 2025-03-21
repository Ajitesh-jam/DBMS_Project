import { deleteNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); // Extract JSON body
    const { label, where } = body;

    console.log("Label and where:", label, where);
    const response = await deleteNode(label, where);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error deleting node:", error);
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
    const label = url.searchParams.get("label");
    const whereString = url.searchParams.get("where");

    if (!label || label.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'label' parameter" },
        { status: 400 }
      );
    }

    if (!whereString || whereString.trim() === "") {
      return NextResponse.json(
        { error: "'where' parameter is required" },
        { status: 400 }
      );
    }

    // Parse `where` string to JSON object
    let where;
    try {
      where = JSON.parse(whereString);
    } catch (error) {
      console.error("Error parsing 'where' parameter:", error);
      return NextResponse.json(
        { error: "Invalid 'where' parameter. Must be valid JSON." },
        { status: 400 }
      );
    }

    console.log("Label and where:", label, where);

    // Call deleteNode with extracted parameters
    const response = await deleteNode(label, where);

    // Check if node was deleted successfully
    if (response && response.records.length > 0) {
      return NextResponse.json(
        {
          message: "Node deleted successfully",
          data: response.records,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "No matching node found or deletion failed" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting node:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
