import { getConnection, query } from "./databasePG.js"; // updated import
import { Result } from "../utils/Result.js";
import argon2 from "argon2";
import { TABLES } from "./dbTableNames.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Registers a new user with the provided details.
 */
export async function registerUser({username, displayName, email, password, role="user"}) {
  // Check if the email is already in use
  const emailCheckResult = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (emailCheckResult.isFailure()) return emailCheckResult;
  if (emailCheckResult.unwrap().length > 0) return Result.failure("Email is already in use.");

  // Check if the username is already taken
  const usernameCheckResult = await query("SELECT id FROM users WHERE username = $1", [username]);
  if (usernameCheckResult.isFailure()) return usernameCheckResult;
  if (usernameCheckResult.unwrap().length > 0) return Result.failure("Username is already taken.");

  // Hash the password before storing it
  const hashedPassword = await argon2.hash(password);

  // Insert new user into the database with RETURNING id
  const insertQuery = `
    INSERT INTO users (uuid, username, display_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  const insertResult = await query(insertQuery, [uuidv4(), username, displayName, email, hashedPassword, role]);

  if (insertResult.isFailure()) return insertResult;

  const insertedRows = insertResult.unwrap();
  return insertedRows.length > 0
    ? Result.success(insertedRows[0].id)
    : Result.failure("Failed to insert user");
}

/**
 * Fetches all users from the users table.
 */
export async function getAllUsers() {
  return await getAll(TABLES.USERS);
}

export async function getAll(table) {
  const queryResult = await query(`SELECT * FROM ${table}`);

  if (queryResult.isFailure()) return queryResult;

  return Result.success(queryResult.unwrap());
}

export async function deleteAll(table) {
  const queryResult = await query(`DELETE FROM ${table}`);

  if (queryResult.isFailure()) return queryResult;

  // In PostgreSQL, use rowCount to get affected rows
  return Result.success(`${queryResult.unwrap().rowCount} rows deleted`);
}

/**
 * Inserts a new lobby into the lobbies table.
 */
export async function insertLobby({ uuid = uuidv4(), name, owner_uuid, max_players = 4}) {
  const insertQuery = `
    INSERT INTO ${TABLES.LOBBIES} (uuid, name, owner_uuid, max_players)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  const insertResult = await query(insertQuery, [uuid, name, owner_uuid, max_players]);

  if (insertResult.isFailure()) return insertResult;

  const insertedRows = insertResult.unwrap();
  return insertedRows.length > 0
    ? Result.success(insertedRows[0].id)
    : Result.failure("Failed to insert lobby");
}

/**
 * Select a lobby by uuid.
 */
export async function selectLobby(uuid) {
  const selectQuery = `
    SELECT * FROM ${TABLES.LOBBIES} WHERE uuid = $1
  `;

  const selectResult = await query(selectQuery, [uuid]);

  if (selectResult.isFailure()) return selectResult;

  return Result.success(selectResult.unwrap());
}

/**
 * Delete lobbies older than timestamp.
 */
export async function deleteOldLobbies(timestamp) {
  const deleteQuery = `DELETE FROM ${TABLES.LOBBIES} WHERE created_at < $1`;

  const deleteResult = await query(deleteQuery, [timestamp]);

  if (deleteResult.isFailure()) return deleteResult;

  return Result.success(`Deleted ${deleteResult.unwrap().rowCount} lobbies.`);
}

/**
 * Format timestamp to PostgreSQL timestamp string (ISO 8601)
 */
export function getPostgresDate(timestamp = Date.now()) {
  // PostgreSQL accepts ISO 8601 without modification
  return new Date(timestamp).toISOString();
}
