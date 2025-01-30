import { resolve } from "node:path";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrationRunner from "node-pg-migrate";
import database from "infra/database.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);
let dbClient;

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  dbClient = await database.getNewClient();

  const pendingMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dbClient,
  });

  await dbClient.end();

  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  dbClient = await database.getNewClient();

  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dbClient,
    dryRun: false,
  });

  await dbClient.end();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}
