import { deleteAdjacentNodeNode } from "../connection/neo";
import { NextResponse } from "next/server";


export async function POST(req) {
    try {
        const body = await req.json(); // Extract JSON body
        const { label, where } = body;
    
        console.log("Label and where ; ", label, where);
        const response = await deleteAdjacentNodeNode(label, where);
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching nodes:", error);
        return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
        );
    }
}
// Compare this snippet from app/api/deleteNode/route.js:
