import mysql from "mysql2";
import { Result } from "../utils/Result.js"; // Import your Result class

// Create a connection pool for efficient queries
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "mp_yahtzee",
    waitForConnections: true,
    connectionLimit: 10, // Limit number of connections
    queueLimit: 0
});

// Function to get a database connection using Result
export async function getConnection() {
    return new Promise((resolve) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("Database connection error:", err.message);
                return resolve(Result.failure(err.message));
            }
            resolve(Result.success(connection));
        });
    });
}   

export async function testConnection() {
    return new Promise((resolve) => {
        pool.getConnection((err, connection) => {
            connection.release();
            if (err) {
                console.error("Database connection error:", err.message);
                return resolve(Result.failure(err.message));
            }
            resolve(Result.success(true));
        });
    });
}

// Function to run a query using Result
export async function query(sql, params = []) {
    return new Promise((resolve) => {
        pool.query(sql, params, (err, results) => {
            if (err) {
                console.error("Database query error:", err.message);
                return resolve(Result.failure(err.message));
            }
            resolve(Result.success(results));
        });
    });
}

// Function to disconnect the pool (not usually needed, but useful for cleanup)
export async function disconnect() {
    return new Promise((resolve) => {
        pool.end((err) => {
            if (err) {
                console.error("Error closing MySQL connection:", err.message);
                return resolve(Result.failure(err.message));
            }
            console.log("Database connection closed.");
            resolve(Result.success(true));
        });
    });
}

// Export the pool for direct access (if necessary)
export default pool;
