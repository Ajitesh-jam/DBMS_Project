
import { getAllUsers } from "../connection/neo"
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Fetching all users...");

    // Get users from Neo4j (already parsed objects)
    const allUsersData = await getAllUsers();



    // Process and validate user data
    const validUsers = allUsersData.map((record) => {
      const userNode = record.n || record.user || record.node; // fallback options
      const props = userNode?.properties || {};

      return {
        name: props.name || "Unknown",
        pagerank: props.pagerank ?? 0,
        imageURL: props.imageURL || null,
      };
    });

    // Sort by PageRank and take top 50
    const sampledUsers = validUsers
      .sort((a, b) => b.pagerank - a.pagerank)
      .slice(0, 50);

    

    return NextResponse.json(sampledUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

