import { getConnection, query } from "./database.js";
import { Result, tryCatch } from "../utils/Result.js";
import argon2 from "argon2";

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
export async function registerUser(username, displayName, email, password, role = "user") {
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
  // Query to fetch all users
  const queryResult = await query("SELECT * FROM users");

  // Return the query result (either success or failure)
  if (queryResult.isFailure()) {
    return queryResult;  // Return failure if the query failed
  }

  const users = queryResult.unwrap();  // Get the users data
  return Result.success(users);  // Return the users list as a success result
}
