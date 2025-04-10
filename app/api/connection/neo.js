// import { q } from "framer-motion/client";
// import { start } from "repl";

const neo4j = require("neo4j-driver");

const URI = process.env.URI || "bolt://localhost:7687"; // Fallback to default URI
const USER = process.env.NEXT_PUBLIC_USERNAME || "neo4j"; // Fallback to default username
const PASSWORD = process.env.PASSWORD || "password"; // Fallback to default password

if (!URI || !USER || !PASSWORD) {
  console.log("error in connection");
  throw new Error("Missing Neo4j connection details. Please check your environment variables.");
}

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
(async () => {
  try {
    const serverInfo = await driver.getServerInfo();
    console.log("Connection established to Neo4j");
    console.log(serverInfo);
  } catch (err) {
    console.error(`Connection error\n${err}\nCause: ${err.cause}`);
    process.exit(1);
  }
})();

// Ensure the driver is not closed prematurely
process.on("exit", () => {
  driver.close();
  console.log("Neo4j driver closed.");
});

export const getWholeGraph = async () => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (n) RETURN n");
    const graph = result.records.map((record) => record.get("n").properties);
    //res.json(graph);
    //res.json(result);
    return graph;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching graph" });
  } finally {
    session.close();
  }
};




async function runQuery(query, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map((record) => record.toObject());
  } catch (err) {
    console.error("Query Error: ", err);
    throw err;
  } finally {
    await session.close();
  }
}

export const getNodeByLabel = async (label, where = {}) => {
  console.log("getNodeByLabel where:", where);
  let query = `MATCH (n:${label})`;

  // Build the conditions string
  const conditions = Object.entries(where)
    .map(([key, value]) => 
       `n.${key} = $where_${key}`  // Use parameterized query for strings, booleans, etc.
    )
    .join(" AND ");

  console.log("WHERE conditions:", conditions);
  if (conditions) query += ` WHERE ${conditions}`;
  
  query += " RETURN n";
  console.log("Query:", query);

  // Prepare the parameters for the query
  const params = Object.fromEntries(
    Object.entries(where).map(([key, value]) => [`where_${key}`, value])
  );


  console.log("query :", query);
  return await runQuery(query, params);
};

export const getEdgesOfNode = async (
  label,
  where = [],
  edgeLabel,
  edgeWhere = []
) => {
  let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m)`;
  let conditions = [];

  // Handle node conditions (n)
  if (Array.isArray(where) && where.length > 0) {
    const nodeConditions = where
      .map((condition) => {
        const [key, value] = Object.entries(condition)[0]; // Extract key-value pair

        if (typeof value === "string") return `n.${key} = "${value}"`;
        if (typeof value === "number") return `n.${key} = ${value}`;
        if (typeof value === "boolean") return `n.${key} = ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(" AND ");

    if (nodeConditions) conditions.push(nodeConditions);
  }

  // Handle edge conditions (e)
  if (Array.isArray(edgeWhere) && edgeWhere.length > 0) {
    const edgeConditions = edgeWhere
      .map((condition) => {
        const [key, value] = Object.entries(condition)[0];

        if (typeof value === "string") return `e.${key} = "${value}"`;
        if (typeof value === "number") return `e.${key} = ${value}`;
        if (typeof value === "boolean") return `e.${key} = ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(" AND ");

    if (edgeConditions) conditions.push(edgeConditions);
  }

  // Append WHERE clause correctly
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  query += " return e;";

  console.log("Final Cypher Query:", query);

  return await runQuery(query);
};

// export const getAdjacentNode = async (
//   label,
//   where,
//   edgeLabel,
//   edgeWhere = {},
//   adjNodeLabel,
//   adjWhere = {}
// ) => {
//   let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m:${adjNodeLabel})`;
//   let conditions = [];

//   // Handle node conditions (n)
//   if (Array.isArray(where) && where.length > 0) {
//     const nodeConditions = where
//       .map((condition) => {
//         const [key, value] = Object.entries(condition)[0]; // Extract key-value pair

//         if (typeof value === "string") return `n.${key} = "${value}"`;
//         if (typeof value === "number") return `n.${key} = ${value}`;
//         if (typeof value === "boolean") return `n.${key} = ${value}`;
//         return "";
//       })
//       .filter(Boolean)
//       .join(" AND ");

//     if (nodeConditions) conditions.push(nodeConditions);
//   }

//   // Handle edge conditions (e)
//   if (Array.isArray(edgeWhere) && edgeWhere.length > 0) {
//     const edgeConditions = edgeWhere
//       .map((condition) => {
//         const [key, value] = Object.entries(condition)[0];
//         console.log("Edge Condition -> KEY:", key, "VALUE:", value);

//         if (typeof value === "string") return `e.${key} = "${value}"`;
//         if (typeof value === "number") return `e.${key} = ${value}`;
//         if (typeof value === "boolean") return `e.${key} = ${value}`;
//         return "";
//       })
//       .filter(Boolean)
//       .join(" AND ");

//     if (edgeConditions) conditions.push(edgeConditions);
//   }
//   // Handle adj node conditions (m)
//   if (Array.isArray(adjWhere) && adjWhere.length > 0) {
//     const adjConditions = adjWhere
//       .map((condition) => {
//         const [key, value] = Object.entries(condition)[0];
//         console.log("Ad node Condition -> KEY:", key, "VALUE:", value);

//         if (typeof value === "string") return `m.${key} = "${value}"`;
//         if (typeof value === "number") return `m.${key} = ${value}`;
//         if (typeof value === "boolean") return `m.${key} = ${value}`;
//         return "";
//       })
//       .filter(Boolean)
//       .join(" AND ");

//     if (adjConditions) conditions.push(adjConditions);
//   }

//   // Append WHERE clause correctly
//   if (conditions.length > 0) {
//     query += ` WHERE ${conditions.join(" AND ")}`;
//   }
//   query += " return m;";

//   console.log("Final Cypher Query:", query);

//   return await runQuery(query);
// };
export const getStartAdjacentNode = async (
  label,
  where,
  edgeLabel,
  edgeWhere = {},
  adjNodeLabel,
  adjWhere = {}
) => {
  let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m:${adjNodeLabel}) `;

  // Handle node conditions (n)
  const whereString = Object.entries(where)
  .map(([key,value])=>
      `n.${key} = $where_${key}`)
  .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
  .map(([key,value])=>
      `e.${key} = $edgeWhere_${key}`)
  .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
  .map(([key,value])=>
      `m.${key} = $adjWhere_${key}`)
  .join(" AND ");

  console.log("WHERE conditions:", whereString);
  if(whereString || adjWhereString || edgeWhereString)
    query += " WHERE ";
  if (whereString) query += whereString;
  if (whereString && edgeWhereString) query += " AND ";
  if (edgeWhereString) query += edgeWhereString;
  if (whereString && adjWhereString) query += " AND ";
  if (adjWhereString) query += adjWhereString;

  const params = {
    ...Object.fromEntries(
      Object.entries(where).map(([key, value]) => [`where_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(edgeWhere).map(([key, value]) => [`edgeWhere_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(adjWhere).map(([key, value]) => [`adjWhere_${key}`, value])
    )
        
    
  };
  // Append WHERE clause correctly
  query += " return n;";

  console.log("Final Cypher Query:", query);
  console.log("Final Cypher params:", params);


  return await runQuery(query,params);
};

export const getAdjacentNode = async (
  label,
  where,
  edgeLabel,
  edgeWhere = {},
  adjNodeLabel,
  adjWhere = {}
) => {
  let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m:${adjNodeLabel}) `;

  // Handle node conditions (n)
  const whereString = Object.entries(where)
  .map(([key,value])=>
      `n.${key} = $where_${key}`)
  .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
  .map(([key,value])=>
      `e.${key} = $edgeWhere_${key}`)
  .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
  .map(([key,value])=>
      `m.${key} = $adjWhere_${key}`)
  .join(" AND ");

  console.log("WHERE conditions:", whereString);
  if(whereString || adjWhereString || edgeWhereString)
    query += " WHERE ";
  if (whereString) query += whereString;
  if (whereString && edgeWhereString) query += " AND ";
  if (edgeWhereString) query += edgeWhereString;
  if (whereString && adjWhereString) query += " AND ";
  if (adjWhereString) query += adjWhereString;

  const params = {
    ...Object.fromEntries(
      Object.entries(where).map(([key, value]) => [`where_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(edgeWhere).map(([key, value]) => [`edgeWhere_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(adjWhere).map(([key, value]) => [`adjWhere_${key}`, value])
    )
        
    
  };
  // Append WHERE clause correctly
  query += " return m;";

  console.log("Final Cypher Query:", query);
  console.log("Final Cypher params:", params);


  return await runQuery(query,params);
};

export const createNode = async (labels, properties) => {
  // Convert labels into a string format
  const labelString = labels.join(":"); // Example: ["Person", "Employee"] → "Person:Employee"

  // Convert properties into a Cypher-compatible key-value string
  const propsString = Object.entries(properties)
    .map(([key, value]) => {
      if (typeof value === "string") return `${key}: "${value}"`;
      if (typeof value === "number" || typeof value === "boolean")
        return `${key}: ${value}`;
      return "";
    })
    .filter(Boolean) // Removes any empty values
    .join(", ");

  // Construct the final query
  const query = `CREATE (n:${labelString} { ${propsString} }) RETURN n`;
  console.log("Final Cypher Query:", query);

  return await runQuery(query, properties);
};

export const createEdge = async (
  startNodeLabel,
  startNodeWhere,
  endNodeLabel,
  endNodeWhere,
  edgeLabel,
  properties = {}
) => {
  try {
    // ✅ Convert labels into a string format
    const startLabelString = startNodeLabel.join(":");
    const endLabelString = endNodeLabel.join(":");

    // ✅ Convert properties into a Cypher-compatible key-value string
    const propsString = Object.entries(properties)
      .map(([key, value]) => {
        if (typeof value === "string") return `${key}: "${value}"`;
        if (typeof value === "number" || typeof value === "boolean") return `${key}: ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(", ");

    // ✅ Construct WHERE clauses for start and end nodes
    const startWhereString = Object.keys(startNodeWhere)
      .map((k) => `n.${k} = $start_${k}`)
      .join(" AND ");

    const endWhereString = Object.keys(endNodeWhere)
      .map((k) => `m.${k} = $end_${k}`)
      .join(" AND ");

    // ✅ Final Cypher query with proper conditions
    let query = `
      MATCH (n:${startLabelString}), (m:${endLabelString})
    `;

    // ✅ Add WHERE clause only if there are conditions
    if (startWhereString || endWhereString) {
      query += `
      WHERE ${[startWhereString, endWhereString].filter(Boolean).join(" AND ")}
      `;
    }

    // ✅ Handle properties dynamically in MERGE
    query += `
      MERGE (n)-[e:${edgeLabel} { ${propsString} }]->(m)
      RETURN e
    `;

    console.log("✅ Final Cypher Query:", query);
    console.log("📚 Properties:", properties);
    console.log("🔎 Start Node Where:", startNodeWhere);
    console.log("🔎 End Node Where:", endNodeWhere);

    // ✅ Prepare query parameters
    const params = {
      ...Object.fromEntries(
        Object.entries(startNodeWhere).map(([k, v]) => [`start_${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(endNodeWhere).map(([k, v]) => [`end_${k}`, v])
      ),
    };

    // ✅ Run query using runQuery function
    const result = await runQuery(query, params);
    return result;
  } catch (error) {
    console.error("❌ Error creating edge:", error);
    throw error;
  }
};



export const createAdjacentNode = async (
  startNodeLabel, // Array of labels for start node
  startNodeWhere, // Conditions to identify start node
  endNodeLabel, // Array of labels for adjacent node
  endNodeWhere, // Conditions to identify or create adjacent node
  edgeLabel, // Relationship label
  properties // Properties for the relationship (optional)
) => {
  // Convert labels into Cypher-compatible string format
  const startLabelString = startNodeLabel.join(":");
  const endLabelString = endNodeLabel.join(":");

  // Convert properties into a Cypher-compatible key-value string
  const propsString = Object.entries(properties)
    .map(([key, value]) => {
      if (typeof value === "string") return `${key}: "${value}"`;
      if (typeof value === "number" || typeof value === "boolean")
        return `${key}: ${value}`;
      return "";
    })
    .filter(Boolean) // Removes any empty or invalid values
    .join(", ");

  // Construct the final Cypher query
  const query = `
    MERGE (n:${startLabelString} { ${Object.entries(startNodeWhere)
      .map(([k, v]) => `${k}: $start_${k}`)
      .join(", ")} })
    
    MERGE (m:${endLabelString} { ${Object.entries(endNodeWhere)
      .map(([k, v]) => `${k}: $end_${k}`)
      .join(", ")} })

    MERGE (n)-[e:${edgeLabel} { ${propsString} }]->(m)
    
    RETURN m
  `;

  // Debugging information
  console.log("Final Cypher Query:", query);
  console.log("Properties:", properties);
  console.log("Start Node Where:", startNodeWhere);
  console.log("End Node Where:", endNodeWhere);
  const params = {
    // Add start node conditions with prefix `start_`
    ...Object.fromEntries(
      Object.entries(startNodeWhere).map(([k, v]) => [`start_${k}`, v])
    ),
    // Add end node conditions with prefix `end_`
    ...Object.fromEntries(
      Object.entries(endNodeWhere).map(([k, v]) => [`end_${k}`, v])
    ),
    // Add edge properties directly
    ...properties,
  };
  // Run the query and return the result
  return await runQuery(query,params);
};


export const deleteNode = async (label, where) => {
  let query = `MATCH (n:${label})`;

  if (Object.keys(where).length > 0) {
    query +=
      ` WHERE ` +
      Object.entries(where)
        .map(([k, v]) => `n.${k} = $${k}`)
        .join(" AND ");
  }

  query += " DETACH DELETE n";
  console.log("Final Delete Node Query:", query);
  return await runQuery(query, where);
};


export const deleteEdge = async (
  startNodeLabel,
  startNodeWhere,
  endNodeLabel,
  endNodeWhere,
  edgeLabel
) => {
  let query = `MATCH (n:${startNodeLabel})-[e:${edgeLabel}]->(m:${endNodeLabel})`;
  let conditions = [];

  if (Object.keys(startNodeWhere).length > 0) {
    conditions.push(
      Object.entries(startNodeWhere)
        .map(([k, v]) => `n.${k} = $start_${k}`)
        .join(" AND ")
    );
  }

  if (Object.keys(endNodeWhere).length > 0) {
    conditions.push(
      Object.entries(endNodeWhere)
        .map(([k, v]) => `m.${k} = $end_${k}`)
        .join(" AND ")
    );
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " DELETE e";
  const params = {
    ...Object.fromEntries(
      Object.entries(startNodeWhere).map(([key, value]) => [`start_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(endNodeWhere).map(([key, value]) => [`end_${key}`, value])
    ),
  };
  console.log("Final Delete Edge Query:", query);
  return await runQuery(query,params);
};



export const deleteAdjacentNode = async (
  startNodeLabel,
  startNodeWhere,
  endNodeLabel,
  endNodeWhere,
  edgeLabel
) => {
  let query = `MATCH (n:${startNodeLabel})-[e:${edgeLabel}]->(m:${endNodeLabel})`;
  let conditions = [];

  if (Object.keys(startNodeWhere).length > 0) {
    conditions.push(
      Object.entries(startNodeWhere)
        .map(([k, v]) => `n.${k} = $start_${k}`)
        .join(" AND ")
    );
  }

  if (Object.keys(endNodeWhere).length > 0) {
    conditions.push(
      Object.entries(endNodeWhere)
        .map(([k, v]) => `m.${k} = $end_${k}`)
        .join(" AND ")
    );
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " DELETE e DETACH DELETE m"; 

  console.log("Final Delete Adjacent Node Query:", query);
  const params = {
    ...Object.fromEntries(
      Object.entries(startNodeWhere).map(([key, value]) => [`start_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(endNodeWhere).map(([key, value]) => [`end_${key}`, value])
    ),
  };
  return await runQuery(query, params);
};



export const updateNode = async (label, where, updates) => {
  const whereString = Object.entries(where)
  .map(([key, value]) => `n.${key} = $where_${key}`)
  .join(" AND ");

  const updatesString = Object.entries(updates)
  .map(([key, value]) => `n.${key} = $updates_${key}`)
  .join(", ");

  const query = `MATCH (n:${label}) WHERE ${whereString} SET ${updatesString} RETURN n;`;

  const params = {
  ...Object.fromEntries(
    Object.entries(where).map(([key, value]) => [`where_${key}`, value])
  ),
  ...Object.fromEntries(
    Object.entries(updates).map(([key, value]) => [`updates_${key}`, value])
  ),
};
console.log("Final Cypher Query:", query);
return await runQuery(query, params);

};



export const updateEdge = async (
  startNodeLabel,
  startNodeWhere,
  endNodeLabel,
  endNodeWhere,
  edgeLabel,
  updates
) => {
  // Convert `where` conditions to Cypher for start and end nodes
  const startWhereString = Object.entries(startNodeWhere)
    .map(([key, value]) => `n.${key} = $start_${key}`)
    .join(" AND ");

  const endWhereString = Object.entries(endNodeWhere)
    .map(([key, value]) => `m.${key} = $end_${key}`)
    .join(" AND ");

  // Convert `updates` properties to a Cypher `SET` clause
  const updatesString = Object.entries(updates)
    .map(([key, value]) => `e.${key} = $update_${key}`) // Prefix with `update_` to avoid conflicts
    .join(", ");

  // Construct query
  const query = `
    MATCH (n:${startNodeLabel})-[e:${edgeLabel}]->(m:${endNodeLabel}) 
    WHERE ${startWhereString} AND ${endWhereString}
    SET ${updatesString}
    RETURN e;
  `;
  console.log("Final Cypher Query:", query);

  // Prepare params for query
  const params = {
    // Prefixing start and end node properties with 'start_' and 'end_'
    ...Object.fromEntries(
      Object.entries(startNodeWhere).map(([key, value]) => [`start_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(endNodeWhere).map(([key, value]) => [`end_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [`update_${key}`, value])
    ),
  };

  // Run query with params
  return await runQuery(query, params);
};

export const updateAdjacentNode = async (
  startNodeLabel,
  startNodeWhere,
  endNodeLabel,
  endNodeWhere,
  edgeLabel,
  updates
) => {
  // Convert `where` conditions to Cypher for start and end nodes
  const startWhereString = Object.entries(startNodeWhere)
    .map(([key, value]) => `n.${key} = $start_${key}`)
    .join(" AND ");

  const endWhereString = Object.entries(endNodeWhere)
    .map(([key, value]) => `m.${key} = $end_${key}`)
    .join(" AND ");

  // Convert `updates` properties to a Cypher `SET` clause
  const updatesString = Object.entries(updates)
    .map(([key, value]) => `m.${key} = $update_${key}`) // Prefix with `update_` to avoid conflicts
    .join(", ");

  // Construct query
  const query = `
    MATCH (n:${startNodeLabel})-[e:${edgeLabel}]->(m:${endNodeLabel}) 
    WHERE ${startWhereString} AND ${endWhereString}
    SET ${updatesString}
    RETURN m;
  `;
  console.log("Final Cypher Query:", query);

  // Prepare params for query
  const params = {
    // Prefixing start and end node properties with 'start_' and 'end_'
    ...Object.fromEntries(
      Object.entries(startNodeWhere).map(([key, value]) => [`start_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(endNodeWhere).map(([key, value]) => [`end_${key}`, value])
    ),
    ...Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [`update_${key}`, value])
    ),
  };

  // Run query with params
  return await runQuery(query, params);
}

export const toNativeNumber = (value) => {
  try {
    if(typeof value === "number") {
      return value; // Already a native number
    }
    if (typeof value === "string") {
      return parseInt(value, 10); // Convert string to number
    }
    if (typeof value === "object" && value !== null) {
      return value.low;
    }
    return 0; // Default value if conversion fails         
  } catch (error) {
    console.error("Error converting to native number:", error);
    return 0;
  }
};

export const calculatePageRank = async () => {
  const session = driver.session();
  try {
    // Check if the graph already exists
    const checkGraphQuery = `CALL gds.graph.exists('myGraph') YIELD exists`;
    const checkResult = await session.run(checkGraphQuery);
    const graphExists = checkResult.records[0].get('exists');

    // Drop the graph if it exists
    if (graphExists) {
      const dropGraphQuery = `CALL gds.graph.drop('myGraph')`;
      await session.run(dropGraphQuery);
    }

    // Project the graph
    const projectQuery = `
      CALL gds.graph.project(
        'myGraph',
        'USER',
        {
          FOLLOWS: {
            orientation: 'NATURAL'
          }
        }
      )
    `;
    await session.run(projectQuery);

    // Calculate PageRank
    const pageRankQuery = `
      CALL gds.pageRank.stream('myGraph')
      YIELD nodeId, score
      RETURN gds.util.asNode(nodeId) AS node, score
      ORDER BY score DESC
    `;
    const result = await session.run(pageRankQuery);

    // Save PageRank values to nodes
    for (const record of result.records) {
      const node = record.get('node');
      const score = record.get('score');

      const updateQuery = `
        MATCH (n) WHERE id(n) = $nodeId
        SET n.pagerank = $score
      `;
      await session.run(updateQuery, { nodeId: node.identity, score });
    }

    // Map results to an array of objects
    return result.records.map((record) => ({
      name: record.get('node').properties.name,
      score: record.get('score')
    }));
  } catch (error) {
    console.error("Error calculating PageRank:", error);
    throw error;
  } finally {
    session.close();
  }
};

// export const incrementalPageRank = async (newNodeId = null, newEdge = null) => {
//   const session = driver.session();
//   const dampingFactor = 0.85;
//   const epsilon = 1e-4; // convergence threshold
//   const maxIterations = 20;

//   try {
//     console.log('Starting incremental PageRank update...');

//     if (newNodeId) {
//       console.log(`New node detected: ${newNodeId}`);
//       await session.run(`
//         MATCH (n) WHERE id(n) = $nodeId
//         SET n.pagerank = ${1 - dampingFactor}
//       `, { nodeId: newNodeId });
//       return [newNodeId];
//     }

//     let affectedNodes = new Set();

//     if (newEdge) {
//       const { sourceNodeId, targetNodeId } = newEdge;
//       console.log(`New edge detected: ${sourceNodeId} -> ${targetNodeId}`);

//       // Update affected nodes: source, target, and their neighbors
//       const neighborsQuery = `
//         MATCH (n)-[:FOLLOWS]->(m)
//         WHERE id(n) IN [$sourceId, $targetId]
//         RETURN DISTINCT id(n) AS id1, id(m) AS id2
//       `;
//       const result = await session.run(neighborsQuery, {
//         sourceId: sourceNodeId,
//         targetId: targetNodeId,
//       });
//       result.records.forEach((rec) => {
//         //console.log(`Affected nodes: ${rec.get('id1').toInt()}, ${rec.get('id2').toInt()}`);
//         affectedNodes.add(rec.get('id1').toInt());
//         affectedNodes.add(rec.get('id2').toInt());
//       });
//     }
//     console.log(`Affected nodes: ${Array.from(affectedNodes)}`);
//     let converged = false;
//     let iteration = 0;
//     const nodePRMap = new Map();

//     // Step 1: Fetch initial PR values
//     const fetchQuery = `
//       MATCH (n:USER)
//       WHERE id(n) IN $nodeIds
//       RETURN id(n) AS nodeId, n.pagerank AS pr
//     `;
//     const initialPRResult = await session.run(fetchQuery, { nodeIds: Array.from(affectedNodes) });
//     //console.log(`Initial PageRank values fetched for ${initialPRResult.records.length} nodes.`);
//     initialPRResult.records.forEach(rec => {
//       console.log(`Initial PageRank for node ${rec.get('nodeId').toInt()}: ${rec.get('pr')}`);
//       nodePRMap.set(rec.get('nodeId').toInt(), rec.get('pr'));
//     });

//     while (!converged && iteration < maxIterations) {
//       converged = true;
//       const updatedPRs = new Map();

//       for (const nodeId of affectedNodes) {
//         // Recalculate PR
//         const prQuery = `
//             MATCH (n) 
//             WHERE id(n) = $nodeId
//             MATCH (m)-[:FOLLOWS]->(n)
//             return m.pagerank AS incomingPR
//           `;

//         const prResult = await session.run(prQuery, { nodeId });
//         //console.log("incomingPR:",prResult);
//         const incomingPR = prResult.records[0].get('incomingPR');
//         console.log(`Incoming PR for node ${nodeId}: ${incomingPR}`);
//         const newPR = (1 - dampingFactor) + dampingFactor * incomingPR;

//         const oldPR = nodePRMap.get(nodeId) || 0;
//         const diff = Math.abs(oldPR - newPR);

//         if (diff > epsilon) {
//           converged = false;
//         }

//         updatedPRs.set(nodeId, newPR);
//       }

//       // Apply new PRs and store them for next iteration
//       for (const [nodeId, newPR] of updatedPRs) {
//         await session.run(`MATCH (n) WHERE id(n) = $nodeId SET n.pagerank = $pr`, {
//           nodeId,
//           pr: newPR,
//         });
//         nodePRMap.set(nodeId, newPR);
//       }

//       iteration++;
//       console.log(`Iteration ${iteration} completed.`);
//     }

//     console.log('Incremental PageRank update completed successfully.');
//     return Array.from(affectedNodes);
//   } catch (error) {
//     console.error('Error during incremental PageRank update:', error);
//     throw error;
//   } finally {
//     await session.close();
//   }
// };
