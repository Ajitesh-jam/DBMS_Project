import { getNodeByLabel } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json(); // Extract JSON body
    const { label, where } = body;

    const response = await getNodeByLabel(label, where ? where : {});

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
