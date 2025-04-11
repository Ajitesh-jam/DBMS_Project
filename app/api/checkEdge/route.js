import { checkEdge } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
      const {
        label,
        where,
        edgeLabel,
        edgeWhere,
        adjNodeLabel,
        adjWhere,
      } = await req.json();
  
      const response = await checkEdge(
        label,
        where || {},
        edgeLabel,
        edgeWhere || {},
        adjNodeLabel,
        adjWhere || {}
      );
  
      // Assuming runQuery returns an array of results
      const edgeExists = response[0]?.edgeExists ?? false;
  
      return NextResponse.json({ edgeExists }, { status: 200 });
    } catch (error) {
      console.error("Error checking edge existence:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  