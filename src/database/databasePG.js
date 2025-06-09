import pkg from "pg";
const { Pool } = pkg;
import { Result } from "../utils/Result.js"; // Your Result class

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: "postgresql://multiplayer_yahtzee_db_user:UF5cNKZmgqtZdix76uEyUma0Nzb8utM2@dpg-d131gobe5dus73cst24g-a.frankfurt-postgres.render.com/multiplayer_yahtzee_db",
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // sometimes needed for managed DBs
  },
  max: 10
});

// Get a client connection wrapped in Result
export async function getConnection() {
  try {
    const client = await pool.connect();
    return Result.success(client);
  } catch (err) {
    console.error("Database connection error:", err.message);
    return Result.failure(err.message);
  }
}

// Test connection by acquiring and releasing a client
export async function testConnection() {
  try {
    const client = await pool.connect();
    client.release();
    return Result.success(true);
  } catch (err) {
    console.error("Database connection error:", err.message);
    return Result.failure(err.message);
  }
}

// Run a query and return Result
export async function query(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return Result.success(res);
  } catch (err) {
    console.error("Database query error:", err.message);
    return Result.failure(err.message);
  }
}

// Disconnect the pool
export async function disconnect() {
  try {
    await pool.end();
    console.log("Database connection closed.");
    return Result.success(true);
  } catch (err) {
    console.error("Error closing PostgreSQL connection:", err.message);
    return Result.failure(err.message);
  }
}

// Export pool for direct access if needed
export default pool;
