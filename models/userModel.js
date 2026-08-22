const db = require("../config/database");

async function findUserByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];

}

async function findUserByUsername(username) {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0];

}

async function findUserById(userId) {
    const [rows] = await db.execute(
        "SELECT user_id, username, email, password_hash FROM users WHERE user_id = ?",
        [userId]
    );

    return rows[0];
}

async function createUser(username, email, passwordHash) {
    const [result] = await db.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, passwordHash]);
    return result.insertId;
}

async function updateUserProfile(userId, username, email) {
    const [result] = await db.execute(
        `
            UPDATE users
            SET
                username = ?,
                email = ?
            WHERE user_id = ?
        `,
        [username, email, userId]
    );

    return result.affectedRows;
}

async function updateUserPassword(userId, passwordHash) {
    const [result] = await db.execute(
        `
            UPDATE users
            SET password_hash = ?
            WHERE user_id = ?
        `,
        [passwordHash, userId]
    );

    return result.affectedRows;
}

async function deleteUserById(userId) {
    const [result] = await db.execute(
        `
            DELETE FROM users
            WHERE user_id = ?
        `,
        [userId]
    );

    return result.affectedRows;
}

module.exports = {
    findUserByEmail,
    findUserByUsername,
    findUserById,
    createUser,
    updateUserProfile,
    updateUserPassword,
    deleteUserById
};