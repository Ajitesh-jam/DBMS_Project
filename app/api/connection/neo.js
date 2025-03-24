const neo4j = require("neo4j-driver");

const URI = process.env.URI;
const USER = process.env.USERNAME;
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

  console.log("Params:", params);
  return await runQuery(query, params);
};


export const getEdgesOfNode = async (
  label,
  where = {},
  edgeLabel,
  edgeWhere = {}
) => {

  // Handle node conditions (n)
    const whereString = Object.entries(where)
    .map(([key,value]) => `n.${key} = $where_${key}`)
    .join(" AND ");

    const edgeWhereString = Object.entries(edgeWhere)
    .map(([key,value]) => `e.${key} = $edgeWhere_${key}`)
    .join(" AND ");
    
    const params = {
      ...Object.fromEntries(
        Object.entries(where).map(([key, value]) => [`where_${key}`, value])
      ),
      ...Object.fromEntries(
        Object.entries(edgeWhere).map(([key, value]) => [`edgeWhere_${key}`, value])
      )
          
      
    };
    
  let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m)`;

  // Append WHERE clause correctly
  
  if (whereString || edgeWhereString) {
    query += " WHERE ";
    if (whereString) query += whereString;
    if (whereString && edgeWhereString) query += " AND ";
    if (edgeWhereString) query += edgeWhereString;
  }
    console.log("query before return:",query);
  query += " return e;";

  console.log("Final Cypher Query:", query);
  console.log("Params:", params);
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
  let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m:${adjNodeLabel})`;

  // Handle node conditions (n)
  const whereString = Object.entries(where)
  .map(([key,value])=>
      `n.${key} = $where_${key}`)
  .join(" AND ");

  const edgeWhereString = Object.entries(edgeWhere)
  .map(([key,value])=>
      `n.${key} = $edgeWhere_${key}`)
  .join(" AND ");

  const adjWhereString = Object.entries(adjWhere)
  .map(([key,value])=>
      `n.${key} = $adjWhere_${key}`)
  .join(" AND ");

  console.log("WHERE conditions:", whereString);
  if (whereString) query += ` WHERE ${whereString}`;
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
  properties
) => {
  // Convert labels into a string format
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
    .filter(Boolean) // Removes any empty values
    .join(", ");

  // Construct the final query
  const query = `MATCH (n:${startLabelString}) WHERE ${Object.entries(
    startNodeWhere
  )
    .map(([k, v]) => `n.${k} = $start_${k}`)
    .join(" AND ")}
    MATCH (m:${endLabelString}) WHERE ${Object.entries(endNodeWhere)
      .map(([k, v]) => `m.${k} = $end_${k}`)
      .join(" AND ")}
    CREATE (n)-[e:${edgeLabel} { ${propsString} }]->(m)
    RETURN e`;
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
  return await runQuery(query, params);
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

  query += " DELETE e, m"; // Deletes the edge and the adjacent node
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
