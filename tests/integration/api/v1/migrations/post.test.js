import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
});

test("POST para /api/v1/migrations deve retornar 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response1.status).toBe(201);

  const response1Body = await response1.json();

  expect(Array.isArray(response1Body)).toBe(true);
  expect(response1Body.length).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response2.status).toBe(200);

  const response2Body = await response2.json();
  const query2 = await database.query({
    text: "SELECT COUNT(*)::int FROM pgmigrations",
  });

  expect(query2.rows[0].count).toBeGreaterThan(0);
  expect(response2Body.length).toBe(0);
  expect(Array.isArray(response2Body)).toBe(true);
});
