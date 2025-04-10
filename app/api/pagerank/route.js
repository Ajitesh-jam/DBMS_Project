import { calculatePageRank, incrementalPageRank  } from "../../api/connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    if (body.type === "incremental") {
      const { newUserId, newEdge } = body;
      const response = await incrementalPageRank(newUserId, newEdge);
      return NextResponse.json(response, { status: 200 });
    } else {
      const response = await calculatePageRank();
      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}