const db = require("../config/database");

async function createMeal(mealData) {
    const{
        userId,
        title,
        mealDay,
        timeOfDay
    } = mealData;

    const [result] = await db.execute(
        `
        INSERT INTO meals (
            user_id,
            title,
            meal_day,
            time_of_day
            )
            VALUES (?, ?, ?, ?)
        `,
        [
            userId,
            title,
            mealDay,
            timeOfDay
        ]
    );

    return result.insertId;
}

async function getMealsByUser(userId) {
    const [rows] = await db.execute(
        `
            SELECT
                meals.*,
                users.username AS author_name
            FROM meals
            JOIN users ON meals.user_id = users.user_id
            WHERE meals.user_id = ?
        `,
        [userId]
    );

    return rows;
    
}

async function getMealById(mealId, userId){
    const [rows] = await db.execute(
        `
            SELECT
                meals. *,
                username AS author_name
            FROM meals
            JOIN users ON meals.user_id = users.user_id
            WHERE meals.meal_id = ? AND meals.user_id = ?
        `,
        [mealId, userId]
    );

    return rows[0];
}

async function updateMeal(mealId, userId, mealData) {
    const{
        title,
        mealDay,
        timeOfDay
    } = mealData;

    const [result] = await db.execute(
        `
        UPDATE meals 
        SET
            title = ?,
            meal_day = ?,
            time_of_day = ?
            WHERE meal_id = ? AND user_id = ?
        `,
        [
            title,
            mealDay,
            timeOfDay,
            mealId,
            userId
        ]
    );

    return result.affectedRows;
}

async function deleteMeal(mealId, userId) {
    const [result] = await db.execute(
        `
            DELETE FROM meals
            WHERE meal_id = ? AND user_id = ?
        `,
        [mealId, userId]
    );
    
    return result.affectedRows;
}

module.exports = {
    createMeal,
    getMealsByUser,
    getMealById,
    updateMeal,
    deleteMeal
};