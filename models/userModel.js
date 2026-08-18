const db = require("../config/database");

async function findUserByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];

}

async function findUserByUsername(username) {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0];

}

async function createUser(username, email, passwordHash) {
    const [result] = await db.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, passwordHash]);
    return result.insertId;
}

module.exports = {
    findUserByEmail,
    findUserByUsername,
    createUser
};