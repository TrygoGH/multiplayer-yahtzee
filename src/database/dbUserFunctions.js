import { getConnection, query } from "./database.js";
import { Result, tryCatch } from "../utils/Result.js";
import argon2 from "argon2";
import { TABLES } from "./dbTableNames.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Registers a new user with the provided details.
 *
 * @param {string} username - The user's chosen username.
 * @param {string} displayName - The user's display name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's plain-text password.
 * @param {string} [role='user'] - The user's role (defaults to 'user').
 * @returns {Promise<Result>} - A Result object indicating success or failure.
 */
export async function registerUser({username, displayName, email, password, role="user"}) {
  // Check if the email is already in use
  const emailCheckResult = await query("SELECT id FROM users WHERE email = ?", [email]);
  if (emailCheckResult.isFailure()) return emailCheckResult; // Return the failure Result
  if (emailCheckResult.unwrap().length > 0) return Result.failure("Email is already in use.");

  // Check if the username is already taken
  const usernameCheckResult = await query("SELECT id FROM users WHERE username = ?", [username]);
  if (usernameCheckResult.isFailure()) return usernameCheckResult;
  if (usernameCheckResult.unwrap().length > 0) return Result.failure("Username is already taken.");

  // Hash the password before storing it
  const hashedPassword = await argon2.hash(password);

  // Insert new user into the database
  const insertQuery = `
    INSERT INTO users (uuid, username, display_name, email, password_hash, role)
    VALUES (UUID(), ?, ?, ?, ?, ?)
  `;
  const insertResult = await query(insertQuery, [username, displayName, email, hashedPassword, role]);

  return insertResult.isFailure()
    ? insertResult
    : Result.success(insertResult.unwrap().insertId); // Return the inserted user ID
}

/**
 * Fetches all users from the users table.
 *
 * @returns {Promise<Result>} - A Result object containing the list of users or an error.
 */
export async function getAllUsers() {
  return await getAll(TABLES.USERS);
}

/**
 * Fetches all users from the users table.
 *
 * @returns {Promise<Result>} - A Result object containing the list of users or an error.
 */
export async function getAll(table) {
  const queryResult = await query(`SELECT * FROM ${table}`);

  // Return the query result (either success or failure)
  if (queryResult.isFailure()) {
    return queryResult;  // Return failure if the query failed
  }

  const tableData = queryResult.unwrap();  // Get the users data
  return Result.success(tableData);  // Return the users list as a success result
}

export async function deleteAll(table) {
  const queryResult = await query(`DELETE FROM ${table}`);
  if (queryResult.isFailure()) return queryResult;  

  const tableData = queryResult.unwrap();  
  return Result.success(tableData); 
}

/**
 * Inserts a new lobby into the lobbies table.
 *
 * @param {Object} lobby - The lobby object containing the required properties.
 * @param {string} lobby.uuid - The unique identifier for the lobby.
 * @param {string} lobby.name - The name of the lobby.
 * @param {string} lobby.owner_uuid - The UUID of the lobby owner.
 * @param {number} lobby.max_players - The maximum number of players allowed in the lobby.
 * @returns {Promise<Result>} - A Result object indicating success or failure.
 */
export async function insertLobby({ uuid = uuidv4(), name, owner_uuid, max_players = 4}) {
  const insertQuery = `
    INSERT INTO ${TABLES.LOBBIES} (uuid, name, owner_uuid, max_players)
    VALUES (?, ?, ?, ?)
  `;

  const insertResult = await query(insertQuery, [
    uuid,
    name,
    owner_uuid,
    max_players,
  ]);

  return insertResult.isFailure()
    ? insertResult
    : Result.success(insertResult.unwrap().insertId);
}

/**
 * Inserts a new lobby into the lobbies table.
 *
 * @param {Object} lobby - The lobby object containing the required properties.
 * @param {string} lobby.uuid - The unique identifier for the lobby.
 * @param {string} lobby.name - The name of the lobby.
 * @param {string} lobby.owner_uuid - The UUID of the lobby owner.
 * @param {number} lobby.max_players - The maximum number of players allowed in the lobby.
 * @returns {Promise<Result>} - A Result object indicating success or failure.
 */
export async function selectLobby(uuid) {
  const selectQuery = `
    SELECT * FROM ${TABLES.LOBBIES} WHERE uuid = ?
  `;

  const selectResult = await query(selectQuery, [
    uuid,
  ]);

  return selectResult.isFailure()
    ? selectResult
    : Result.success(selectResult.unwrap());
}

export async function deleteOldLobbies(timestamp) {
  const deleteQuery = `DELETE FROM ${TABLES.LOBBIES} WHERE created_at < ?`;
  
  const deleteResult = await query(deleteQuery, [timestamp]);

  return deleteResult.isFailure()
      ? deleteResult
      : Result.success(`Deleted ${deleteResult.unwrap().affectedRows} lobbies.`);
}

export function getMySQLDate(timestamp = Date.now()) {
  const offset = 2 * 60 * 60 * 1000;
  return new Date(timestamp+offset).toISOString().slice(0, 19).replace("T", " ");
}
