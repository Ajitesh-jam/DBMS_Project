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

  if (Object.keys(where).length > 0) {
    const conditions = Object.entries(where)
      .map(([key, value]) => {
        if (typeof value === "string") return `n.${key} = "${value}"`;
        else if (typeof value === "number") return `n.${key} = ${value}`;
        else if (typeof value === "boolean") return `n.${key} = ${value}`;
        return "";
      })
      .filter(Boolean) // Removes any empty strings
      .join(" AND ");

    console.log("where conditions:", conditions);
    if (conditions) query += ` WHERE ${conditions}`;
  }

  query += " RETURN n";
  console.log("Query:", query);

  return await runQuery(query);
};

export const getEdgesOfNode = async (
  label,
  where,
  edgeLabel,
  edgeWhere = {}
) => {
  let query = `MATCH (n:${label})`;
  if (where && Object.keys(where).length > 0) {
    const nodeConditions = Object.entries(where)
      .map(([key, value]) => `n.${key} = $${key}`)
      .join(" AND ");
    query += ` WHERE ${nodeConditions}`;
  }
  query += `- [e:${edgeLabel}] -> (m) RETURN n, e, m`;
  return await runQuery(query, { ...where, ...edgeWhere });
};

export const getAdjacentNode = async (
  label,
  where,
  edgeLabel,
  edgeWhere = {},
  adjacentNodeLabel,
  adjWhere = {}
) => {
  let query = `MATCH (n:${label})`;
  if (where && Object.keys(where).length > 0) {
    query +=
      ` WHERE ` +
      Object.entries(where)
        .map(([k, v]) => `n.${k} = $${k}`)
        .join(" AND ");
  }
  query += `- [e:${edgeLabel}] -> (m:${adjacentNodeLabel})`;
  if (adjWhere && Object.keys(adjWhere).length > 0) {
    query +=
      ` WHERE ` +
      Object.entries(adjWhere)
        .map(([k, v]) => `m.${k} = $${k}`)
        .join(" AND ");
  }
  query += " RETURN n, e, m";
  return await runQuery(query, { ...where, ...edgeWhere, ...adjWhere });
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
