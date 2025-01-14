import database from "infra/database.js";
import { InternalServerError } from "infra/errors.js";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const serverVersionQueryResult = await database.query(
      "SHOW server_version;",
    );
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
  } catch (err) {
    const publicErrorObject = new InternalServerError({
      cause: err,
    });

    console.log("\nErro dentro do catch do controller:");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;
