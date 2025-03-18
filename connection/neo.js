const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = 3000;

const URI = "bolt://localhost:7687";
const USER = "neo4j";
const PASSWORD = "Ajitesh9877";

let driver;
(async () => {
  try {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    const serverInfo = await driver.getServerInfo();
    console.log("Connection established to Neo4j");
    console.log(serverInfo);
  } catch (err) {
    console.error(`Connection error\n${err}\nCause: ${err.cause}`);
    process.exit(1);
  }
})();

app.get("/query", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (n) RETURN n");
    const records = result.records.map((record) => record.get("n"));
    console.log("Query Result:", records);
    res.json(records);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
