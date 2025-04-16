import neo4j from "neo4j-driver";

// Export runQuery helper
export async function runQuery(query, params = {}) {
    // const URI = process.env.URI;
    // const USER = process.env.USERNAME;
    // const PASSWORD = process.env.PASSWORD;
    const URI = process.env.NEO4J_URI;
    const USER = process.env.NEO4J_USERNAME;
    const PASSWORD = process.env.NEO4J_PASSWORD;

   
    if (!URI || !USER || !PASSWORD) {
    throw new Error("Missing Neo4j connection environment variables");
    }


    const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map((record) => record.toObject());
  } catch (err) {
    console.error("Query Error:", err);
    throw err;
  } finally {
    await session.close();
  }
}

export const getWholeGraph = async () => {
  //const session = driver.session();
  try {
     return await runQuery(`MATCH (n) RETURN n`);
    //res.json(graph);
    //res.json(result);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching graph" });
  }
};

export const getAllUsers = async () => {
  //const session = driver.session();
  try {
     return await runQuery(`MATCH (n:USER) RETURN n`);
    //res.json(graph);
    //res.json(result);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching graph" });
  }
};


export const getNodeByLabel = async (label, where = {}) => {

  let query = `MATCH (n:${label})`;

  // Build the conditions string
  const conditions = Object.entries(where)
    .map(([key]) => 
       `n.${key} = $where_${key}`  // Use parameterized query for strings, booleans, etc.
    )
    .join(" AND ");


  if (conditions) query += ` WHERE ${conditions}`;
  
  query += " RETURN n";
 
  // Prepare the parameters for the query
  const params = Object.fromEntries(
    Object.entries(where).map(([key, value]) => [`where_${key}`, value])
  );


  console.log("query :", query);
  return await runQuery(query, params);
};


export const getEdgesOfNode = async (
  label,
  where = {},
  edgeLabel,
  edgeWhere = {}
) => {
  let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m)`;
  let conditions = [];

  // Handle node conditions (n)
  if (where && typeof where === "object" && Object.keys(where).length > 0) {
    const nodeConditions = Object.entries(where)
      .map(([key, value]) => {
        if (typeof value === "string") return `n.${key} = "${value}"`;
        if (typeof value === "number" || typeof value === "boolean")
          return `n.${key} = ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(" AND ");

    if (nodeConditions) conditions.push(nodeConditions);
  }

  // Handle edge conditions (e)
  if (edgeWhere && typeof edgeWhere === "object" && Object.keys(edgeWhere).length > 0) {
    const edgeConditions = Object.entries(edgeWhere)
      .map(([key, value]) => {
        if (typeof value === "string") return `e.${key} = "${value}"`;
        if (typeof value === "number" || typeof value === "boolean")
          return `e.${key} = ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(" AND ");

    if (edgeConditions) conditions.push(edgeConditions);
  }

  // Append WHERE clause
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " RETURN e;";

  console.log("Final Cypher Query:", query);

  return await runQuery(query);
};


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
  .map(([key])=>
      `n.${key} = $where_${key}`)
  .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
  .map(([key])=>
      `e.${key} = $edgeWhere_${key}`)
  .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
  .map(([key])=>
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
    .map(([key]) => `n.${key} = $where_${key}`)
    .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
    .map(([key]) => `e.${key} = $edgeWhere_${key}`)
    .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
    .map(([key]) => `m.${key} = $adjWhere_${key}`)
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
  .map(([key])=>
      `n.${key} = $where_${key}`)
  .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
  .map(([key])=>
      `e.${key} = $edgeWhere_${key}`)
  .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
  .map(([key])=>
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
  .map(([key])=>
      `n.${key} = $where_${key}`)
  .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
  .map(([key])=>
      `e.${key} = $edgeWhere_${key}`)
  .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
  .map(([key])=>
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
      ([key]) => `r.${key} = $adjEdgeWhere_${key}`
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

let nodeCreationCounter = 0; // Counter to track the number of nodes created

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

  const result = await runQuery(query, properties);

  // Increment the node creation counter
  nodeCreationCounter++;

  // Call incremental PageRank for the newly created node
  if (result.length > 0) {
    const newNodeId = result[0].n.identity.toNumber();
    await incrementalPageRank(newNodeId);
  }

  // Call full PageRank after every 100 nodes
  if (nodeCreationCounter % 100 === 0) {
    await calculatePageRank();
  }

  return result;
};

let edgeCreationCounter = 0; // Counter to track the number of edges created

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


  
    const params = {
      ...Object.fromEntries(
        Object.entries(startNodeWhere).map(([k, v]) => [`start_${k}`, v])
      ),
      ...Object.fromEntries(
        Object.entries(endNodeWhere).map(([k, v]) => [`end_${k}`, v])
      ),
    };

    
    const result = await runQuery(query, params);

    // Increment the edge creation counter
    edgeCreationCounter++;

    // Call incremental PageRank for the newly created edge
    if (result.length > 0) {
      const newEdge = {
        sourceNodeId: result[0].e.start.toNumber(),
        targetNodeId: result[0].e.end.toNumber(),
      };
      await incrementalPageRank(null, newEdge);
    }

    // Call full PageRank after every 100 edges
    if (edgeCreationCounter % 100 === 0) {
      await calculatePageRank();
    }

    return result;
  } catch (error) {
    console.error(" Error creating edge:", error);
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
      .map(([k]) => `${k}: $start_${k}`)
      .join(", ")} })
    
    MERGE (m:${endLabelString} { ${Object.entries(endNodeWhere)
      .map(([k]) => `${k}: $end_${k}`)
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
        .map(([k]) => `n.${k} = $${k}`)
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
        .map(([k]) => `n.${k} = $start_${k}`)
        .join(" AND ")
    );
  }

  if (Object.keys(endNodeWhere).length > 0) {
    conditions.push(
      Object.entries(endNodeWhere)
        .map(([k]) => `m.${k} = $end_${k}`)
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
        .map(([k]) => `n.${k} = $start_${k}`)
        .join(" AND ")
    );
  }

  if (Object.keys(endNodeWhere).length > 0) {
    conditions.push(
      Object.entries(endNodeWhere)
        .map(([k]) => `m.${k} = $end_${k}`)
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
  .map(([key]) => `n.${key} = $where_${key}`)
  .join(" AND ");

  const updatesString = Object.entries(updates)
  .map(([key]) => `n.${key} = $updates_${key}`)
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
    .map(([key]) => `n.${key} = $start_${key}`)
    .join(" AND ");

  const endWhereString = Object.entries(endNodeWhere)
    .map(([key]) => `m.${key} = $end_${key}`)
    .join(" AND ");

  // Convert `updates` properties to a Cypher `SET` clause
  const updatesString = Object.entries(updates)
    .map(([key]) => `e.${key} = $update_${key}`) // Prefix with `update_` to avoid conflicts
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
    .map(([key]) => `n.${key} = $start_${key}`)
    .join(" AND ");

  const endWhereString = Object.entries(endNodeWhere)
    .map(([key]) => `m.${key} = $end_${key}`)
    .join(" AND ");

  // Convert `updates` properties to a Cypher `SET` clause
  const updatesString = Object.entries(updates)
    .map(([key]) => `m.${key} = $update_${key}`) // Prefix with `update_` to avoid conflicts
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


export const getEdgesToNode = async ( label , where , edgeLabel ,edgeWhere, adjNodeLabel,adjWhere) => {


  let query = `MATCH (n:${label}) <- [e:${edgeLabel}] - (m:${adjNodeLabel}) `;

  // Handle node conditions (n)
  const whereString = Object.entries(where)
  .map(([key])=>
      `n.${key} = $where_${key}`)
  .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
  .map(([key])=>
      `e.${key} = $edgeWhere_${key}`)
  .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
  .map(([key])=>
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
  
  query += " return e;";

  console.log("Final Cypher Query:", query);
  console.log("Final Cypher params:", params);

  return await runQuery(query,params);
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
export const incrementalPageRank = async (newNodeId = null, newEdge = null, options = {}) => {
  const URI = process.env.URI;
  const USER = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;

 
  if (!URI || !USER || !PASSWORD) {
  throw new Error("Missing Neo4j connection environment variables");
  }


  const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
  const session = driver.session();

  const { dampingFactor = 0.85, epsilon = 1e-4, maxIterations = 20 } = options;

  try {
    let affectedNodes = new Set();

    // Handle new node
    if (newNodeId) {
      await session.run(`
        MATCH (n) WHERE id(n) = $nodeId
        SET n.pagerank = $initialPR
      `, { nodeId: newNodeId, initialPR: 1 - dampingFactor });
      affectedNodes.add(newNodeId);
    }

    // Handle new edge
    if (newEdge) {
      const { sourceNodeId, targetNodeId } = newEdge;
      const neighborsQuery = `
        MATCH (n)-[:FOLLOWS]->(m)
        WHERE id(n) IN [$sourceId, $targetId] OR id(m) IN [$sourceId, $targetId]
        RETURN DISTINCT id(n) AS id1, id(m) AS id2
      `;
      const result = await session.run(neighborsQuery, {
        sourceId: sourceNodeId,
        targetId: targetNodeId,
      });
      result.records.forEach(rec => {
        affectedNodes.add(rec.get('id1').toNumber());
        affectedNodes.add(rec.get('id2').toNumber());
      });
    }

    if (affectedNodes.size === 0) return [];

    let converged = false;
    let iteration = 0;
    const nodePRMap = new Map();

    // Fetch initial PR values
    const fetchQuery = `
      MATCH (n:USER) WHERE id(n) IN $nodeIds
      RETURN id(n) AS nodeId, COALESCE(n.pagerank, $initialPR) AS pr
    `;
    const initialPRResult = await session.run(fetchQuery, {
      nodeIds: Array.from(affectedNodes),
      initialPR: 1 - dampingFactor,
    });
    initialPRResult.records.forEach(rec => {
      nodePRMap.set(rec.get('nodeId').toNumber(), rec.get('pr'));
    });

    // Iterative update
    while (!converged && iteration < maxIterations) {
      converged = true;
      const updateQuery = `
        MATCH (n:USER) WHERE id(n) IN $nodeIds
        OPTIONAL MATCH (m)-[:FOLLOWS]->(n)
        WITH m, n, COUNT { (m)-[:FOLLOWS]->() } AS outDegree
        WITH n, COALESCE(SUM(CASE WHEN outDegree = 0 THEN 0 ELSE m.pagerank / outDegree END), 0) AS incomingPR
        RETURN id(n) AS nodeId, (1 - $dampingFactor) + $dampingFactor * incomingPR AS newPR
      `;
      const result = await session.run(updateQuery, {
        nodeIds: Array.from(affectedNodes),
        dampingFactor,
      });

      const updatedPRs = new Map();
      let maxDiff = 0;
      result.records.forEach(rec => {
        const nodeId = rec.get('nodeId').toNumber();
        const newPR = rec.get('newPR');
        const oldPR = nodePRMap.get(nodeId) || 0;
        const diff = Math.abs(oldPR - newPR);
        maxDiff = Math.max(maxDiff, diff);
        updatedPRs.set(nodeId, newPR);
      });

      if (maxDiff > epsilon) converged = false;

      // Apply updates
      for (const [nodeId, newPR] of updatedPRs) {
        await session.run(`
          MATCH (n) WHERE id(n) = $nodeId
          SET n.pagerank = $pr
        `, { nodeId, pr: newPR });
        nodePRMap.set(nodeId, newPR);
      }

      iteration++;
    }

    return Array.from(affectedNodes).map(nodeId => ({
      nodeId,
      pagerank: nodePRMap.get(nodeId),
    }));
  } catch (error) {
    console.error('Error during incremental PageRank update:', error);
    throw error;
  } finally {
    await session.close();
  }
};
