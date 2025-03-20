import { updateAdjacentNode } from "../connection/neo";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json(); // Extract JSON body
        const { label, where, updates } = body;
    
        console.log("Label and where and updates; ", label, where, updates);
        const response = await updateAdjacentNode(label, where, updates);
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching nodes:", error);
        return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
        );
    }
}
