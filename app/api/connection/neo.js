import { q } from "framer-motion/client";
import { start } from "repl";

const neo4j = require("neo4j-driver");

const URI = process.env.URI;
const USER = process.env.NEXT_PUBLIC_USERNAME;
const PASSWORD = process.env.PASSWORD;

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

export const calculatePageRank = async () => {
  const session = driver.session();
  const dampingFactor = 0.85; // Damping factor (usually between 0.85 - 0.9)
  const maxIterations = 20;  // Maximum number of iterations to avoid infinite loops
  const threshold = 0.0001;  // Convergence threshold for stopping condition

  try {
    // Step 1: Get the total number of nodes in the graph
    const result = await session.run('MATCH (n) RETURN count(n) AS totalNodes');
    const totalNodes = result.records[0].get('totalNodes').toInt();
    
    // Step 2: Initialize PageRank for each node
    await session.run('MATCH (n) SET n.pageRank = 1.0 / $totalNodes', { totalNodes });
    
    let iteration = 0;
    let converged = false;
    
    while (iteration < maxIterations && !converged) {
      iteration++;

      // Step 3: Calculate the new PageRank for each node
      const updateResult = await session.run(`
        MATCH (n)
        SET n.pageRank = (1 - $dampingFactor) / $totalNodes +
                         $dampingFactor * SUM(
                             CASE WHEN (m)-[:LINKS_TO]->(n) THEN m.pageRank / SIZE((m)-[:LINKS_TO]->()) ELSE 0 END
                         )
        RETURN n.pageRank AS newPageRank, n
      `, { dampingFactor, totalNodes });

      // Step 4: Check for convergence
      const changes = updateResult.records.map((record) => {
        const newPageRank = record.get('newPageRank').toNumber();
        const oldPageRank = record.get('n').properties.pageRank;

        // Check if the change is below the threshold (convergence condition)
        return Math.abs(newPageRank - oldPageRank) < threshold;
      });

      // If all nodes have converged (i.e., the changes are below the threshold)
      converged = changes.every((change) => change);
      
      // If convergence happens, break early
      if (converged) {
        console.log(`PageRank calculation converged in ${iteration} iterations.`);
        break;
      }
      
      console.log(`Iteration ${iteration} complete, continuing...`);
    }

    // Step 5: Fetch updated PageRank values for all nodes
    const pageRankResult = await session.run('MATCH (n) RETURN n.name AS nodeName, n.pageRank AS pageRank');
    const pageRankValues = pageRankResult.records.map((record) => ({
      nodeName: record.get('nodeName'),
      pageRank: record.get('pageRank').toNumber()
    }));

    return pageRankValues;
  } catch (error) {
    console.error('Error calculating PageRank:', error);
    throw error;
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

export const checkEdge= async (
  label,
  where,
  edgeLabel,
  edgeWhere = {},
  adjNodeLabel,
  adjWhere = {}
) => {
  let query = `MATCH (n:${label}) -[e:${edgeLabel}]-> (m:${adjNodeLabel}) `;

  const whereString = Object.entries(where)
    .map(([key, value]) => `n.${key} = $where_${key}`)
    .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
    .map(([key, value]) => `e.${key} = $edgeWhere_${key}`)
    .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
    .map(([key, value]) => `m.${key} = $adjWhere_${key}`)
    .join(" AND ");

  const conditions = [whereString, edgeWhereString, adjWhereString].filter(Boolean);
  if (conditions.length > 0) {
    query += "WHERE " + conditions.join(" AND ") + " ";
  }

  query += "RETURN COUNT(e) > 0 AS edgeExists";

  const params = {
    ...Object.fromEntries(Object.entries(where).map(([k, v]) => [`where_${k}`, v])),
    ...Object.fromEntries(Object.entries(edgeWhere).map(([k, v]) => [`edgeWhere_${k}`, v])),
    ...Object.fromEntries(Object.entries(adjWhere).map(([k, v]) => [`adjWhere_${k}`, v])),
  };

  console.log("Final Cypher Query of check edge:", query);
  console.log("Final Cypher Params:", params);

  return await runQuery(query, params);
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


export const getAdjacentNodesOfAdjNode = async (
  label,
  where,
  edgeLabel,
  edgeWhere = {},
  adjNodeLabel,
  adjWhere = {},
  AdjNodesofAdjNodeLabel ,
  AdjNodesofAdjNodeEdgeLabel,
  AdjNodesofAdjNodeEdgeWhere = {}
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

  const adjNodeNodeWhereString = Object.entries(AdjNodesofAdjNodeEdgeWhere)
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
    ),
    ...Object.fromEntries(
      Object.entries(AdjNodesofAdjNodeEdgeWhere).map(([key, value]) => [`adjWhere_${key}`, value])
    )
        
    
  };
  // Append WHERE clause correctly
  if (AdjNodesofAdjNodeLabel) {
    query += ` OPTIONAL MATCH (m)-[r:${AdjNodesofAdjNodeEdgeLabel}]->(adj:${AdjNodesofAdjNodeLabel})`;

    const adjEdgeConditions = Object.entries(AdjNodesofAdjNodeEdgeWhere).map(
      ([key, value]) => `r.${key} = $adjEdgeWhere_${key}`
    );

    if (adjEdgeConditions.length > 0) {
      query += ` WHERE ${adjEdgeConditions.join(' AND ')}`;
    }

    query += ` RETURN adj`;
  } else {
    query += ` RETURN m`;
  }
  

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
    
    const startLabelString = startNodeLabel.join(":");
    const endLabelString = endNodeLabel.join(":");

    
    const propsString = Object.entries(properties)
      .map(([key, value]) => {
        if (typeof value === "string") return `${key}: "${value}"`;
        if (typeof value === "number" || typeof value === "boolean") return `${key}: ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(", ");

    
    const startWhereString = Object.keys(startNodeWhere)
      .map((k) => `n.${k} = $start_${k}`)
      .join(" AND ");

    const endWhereString = Object.keys(endNodeWhere)
      .map((k) => `m.${k} = $end_${k}`)
      .join(" AND ");


    let query = `
      MATCH (n:${startLabelString}), (m:${endLabelString})
    `;


    if (startWhereString || endWhereString) {
      query += `
      WHERE ${[startWhereString, endWhereString].filter(Boolean).join(" AND ")}
      `;
    }


    query += `
      MERGE (n)-[e:${edgeLabel} { ${propsString} }]->(m)
      RETURN e
    `;

    console.log("Final Cypher Query:", query);
    console.log("Properties:", properties);
    console.log("Start Node Where:", startNodeWhere);
    console.log("End Node Where:", endNodeWhere);

  
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
