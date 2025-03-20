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
  if (Array.isArray(where) && where.length > 0) {
    const conditions = where
      .map((condition) => {
        // Extract key-value pair from each object
        const [key, value] = Object.entries(condition)[0]; // Extract the first key-value pair
        console.log("KEY, VALUE:", key, value);

        if (typeof value === "string") return `n.${key} = "${value}"`;
        else if (typeof value === "number") return `n.${key} = ${value}`;
        else if (typeof value === "boolean") return `n.${key} = ${value}`;
        return "";
      })
      .filter(Boolean) // Remove empty strings
      .join(" AND ");

    console.log("WHERE conditions:", conditions);
    if (conditions) query += ` WHERE ${conditions}`;
  }
  query += " RETURN n";
  console.log("Query:", query);
  return await runQuery(query);
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
        console.log("Node Condition -> KEY:", key, "VALUE:", value);

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
        console.log("Edge Condition -> KEY:", key, "VALUE:", value);

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

export const getAdjacentNode = async (
  label,
  where,
  edgeLabel,
  edgeWhere = {},
  adjNodeLabel,
  adjWhere = {}
) => {
  let query = `MATCH (n:${label}) - [e:${edgeLabel}] -> (m:${adjNodeLabel})`;
  let conditions = [];

  // Handle node conditions (n)
  if (Array.isArray(where) && where.length > 0) {
    const nodeConditions = where
      .map((condition) => {
        const [key, value] = Object.entries(condition)[0]; // Extract key-value pair
        console.log("Node Condition -> KEY:", key, "VALUE:", value);

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
        console.log("Edge Condition -> KEY:", key, "VALUE:", value);

        if (typeof value === "string") return `e.${key} = "${value}"`;
        if (typeof value === "number") return `e.${key} = ${value}`;
        if (typeof value === "boolean") return `e.${key} = ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(" AND ");

    if (edgeConditions) conditions.push(edgeConditions);
  }
  // Handle adj node conditions (m)
  if (Array.isArray(adjWhere) && adjWhere.length > 0) {
    const adjConditions = adjWhere
      .map((condition) => {
        const [key, value] = Object.entries(condition)[0];
        console.log("Ad node Condition -> KEY:", key, "VALUE:", value);

        if (typeof value === "string") return `m.${key} = "${value}"`;
        if (typeof value === "number") return `m.${key} = ${value}`;
        if (typeof value === "boolean") return `m.${key} = ${value}`;
        return "";
      })
      .filter(Boolean)
      .join(" AND ");

    if (adjConditions) conditions.push(adjConditions);
  }

  // Append WHERE clause correctly
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  query += " return m;";

  console.log("Final Cypher Query:", query);

  return await runQuery(query);
};

export const createNode = async (label, properties) => {
  const props = Object.keys(properties)
    .map((key) => `${key}: $${key}`)
    .join(", ");
  const query = `CREATE (n:${label} { ${props} }) RETURN n`;
  return await runQuery(query, properties);
};

export const updateNode = async (label, where, updateProps) => {
  let query = `MATCH (n:${label})`;
  if (Object.keys(where).length > 0) {
    query +=
      ` WHERE ` +
      Object.entries(where)
        .map(([k, v]) => `n.${k} = $${k}`)
        .join(" AND ");
  }
  query +=
    ` SET ` +
    Object.entries(updateProps)
      .map(([k, v]) => `n.${k} = $update_${k}`)
      .join(", ");
  query += " RETURN n";
  return await runQuery(query, {
    ...where,
    ...Object.fromEntries(
      Object.entries(updateProps).map(([k, v]) => [`update_${k}`, v])
    ),
  });
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
  return await runQuery(query, where);
};
