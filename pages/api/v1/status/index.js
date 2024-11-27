import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const serverVersionQueryResult = await database.query("SHOW server_version;");
  const dbVersion = serverVersionQueryResult.rows[0].server_version;

  const maxConnectionsQueryResult = await database.query(
    "SHOW max_connections;",
  );
  const maxConnections = maxConnectionsQueryResult.rows[0].max_connections;

  const dbName = process.env.POSTGRES_DB;
  const currentConnectionsQueryResult = await database.query({
    text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;`,
    values: [dbName],
  });
  const currentConnections = currentConnectionsQueryResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependecies: {
      database: {
        version: dbVersion,
        max_connections: parseInt(maxConnections),
        opened_connections: currentConnections,
      },
    },
  });
}

export default status;
