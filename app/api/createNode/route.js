import { createNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); // Extract JSON body
    const { label, properties } = body;

    console.log("Label and where ; \n", label, properties);
    const response = await createNode(label, properties ? properties : {});
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
