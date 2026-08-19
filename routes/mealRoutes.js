const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

const {
    createMeal,
    getMealsByUser,
    getMealById,
    updateMeal,
    deleteMeal
} = require("../models/mealModel");

const router = express.Router();

const mealValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Meal title is required.")
        .isLength({ max: 150 })
        .withMessage("Meal title cannot exceed 150 characters."),

    body("meal_day")
        .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
        .withMessage("Select a valid day."),

    body("time_of_day")
        .isIn(["Breakfast", "Lunch", "Dinner"])
        .withMessage("Select a valid time of day.")
];

//Get all meals belonging to logged-in user
router.get("/", requireAuth, async (req, res) => {
    try {
        
        const meals = await getMealsByUser(req.session.userId);

        res.render("dashboard", {
            title: "Dashboard",
            username: req.session.username,
            meals
        });
    }   catch (error) {
            console.error(error);
            res.status(500).send("Unable to load meals.");
    }
});

//Create a meal
router.post("/", requireAuth, mealValidation, async (req, res) => {
    try {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            title,
            meal_day,
            time_of_day
        } = req.body;

        await createMeal({
            userId: req.session.userId,
            title,
            mealDay: meal_day,
            timeOfDay: time_of_day
        });

        res.redirect("/meals");

    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to create meal.");

    }
});

//Get one meal
router.get("/:id", requireAuth, async (req, res) => {
    try{
        
        const meal = await getMealById(req.params.id, req.session.userId);

        if (!meal) {
            return res.status(404).send("Meal not found");
        }

        res.render("meals/show", {
            title: meal.title,
            meal
        });

    } catch (error) {
        console.error("Error loading meal:", error);
        res.status(500).send("Unable to load meal.");
    }
    
});

//GET edit page
router.get("/:id/edit", requireAuth, async (req, res) => {
    try{
        const meal = await getMealById( req.params.id, req.session.userId );

        if (!meal) {
            return res.status(404).send("Meal not found.");
        }

        res.render("meals/edit", {
            title: "Edit Meal",
            meal,
            errors: [],
            formData: {}
        });
    } catch (error) {
        console.error("Error loading edit page:", error);

        res.status(500).send("Unable to load meal.");
    }
});

//Update meal
router.post(
    "/:id/edit",
    requireAuth,
    mealValidation,
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render("meals/edit", {
                title: "Edit Meal",
                meal: {
                    meal_id: req.params.id
                },
                errors: errors.array(),
                formData: req.body
            });
    }

    try {
        const affectedRows = await updateMeal(
            req.params.id,
            req.session.userId,
            {
                title: req.body.title,
                mealDay: req.body.meal_day,
                timeOfDay: req.body.time_of_day

            }
        );

        if (affectedRows === 0) {
            return res
                .status(404)
                .send("Meal not found.");
        }

        res.redirect(`/meals/${req.params.id}`);
    } catch (error) {
        console.error("Error updating meal:", error);

        res.status(500).render("meals/edit", {
        title: "Edit Meal",
        meal: {
          meal_id: req.params.id
        },
        errors: [{ msg: "Meal update failed. Please try again." }],
        formData: req.body
      });
    }
    }
);

//Delete meal
router.post("/:id/delete", requireAuth, async (req, res) => {
  try {
    const affectedRows = await deleteMeal(
      req.params.id,
      req.session.userId
    );

    if (affectedRows === 0) {
      return res
        .status(404)
        .send("Meal not found or you do not have permission.");
    }

    res.redirect("/meals");
  } catch (error) {
    console.error("Error deleting meal:", error);
    res.status(500).send("Unable to delete the meal.");
  }
});

module.exports = router;