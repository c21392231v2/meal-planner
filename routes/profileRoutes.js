const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  findUserById,
  findUserByEmail,
  updateUserProfile,
  updateUserPassword,
  deleteUserById
} = require("../models/userModel");

const router = express.Router();

// GET /profile - Render the user's profile
router.get("/profile", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.session.userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.render("profile/show", {
      title: "My Profile",
      user
    });
  } catch (error) {
    next(error);
  }
});

//profile/edit route to render the edit profile form
router.get("/profile/edit", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.session.userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.render("profile/edit", {
      title: "Edit Profile",
      errors: [],
      formData: {
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /profile/edit - Handle profile update
router.post(
  "/profile/edit",
  requireAuth,
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required.")
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters."),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email address.")
      .normalizeEmail()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    const { username, email } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render("profile/edit", {
        title: "Edit Profile",
        errors: errors.array(),
        formData: { username, email }
      });
    }

    try {
      const existingUser = await findUserByEmail(email);

      if (
        existingUser &&
        existingUser.user_id !== req.session.userId
      ) {
        return res.status(400).render("profile/edit", {
          title: "Edit Profile",
          errors: [
            {
              msg: "That email address is already in use."
            }
          ],
          formData: { username, email }
        });
      }

      await updateUserProfile(
        req.session.userId,
        username,
        email
      );

      req.session.username = username;


      req.session.save((error) => {
        if (error) {
          return next(error);
        }

        res.redirect("/profile");
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /profile/password - Render the change password form
router.get(
  "/profile/password",
  requireAuth,
  (req, res) => {
    res.render("profile/password", {
      title: "Change Password",
      errors: []
    });
  }
);

// POST /profile/password - Handle password change
router.post(
  "/profile/password",
  requireAuth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required."),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage(
        "New password must contain at least 8 characters."
      ),

    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("New passwords do not match.");
        }

        return true;
      })
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("profile/password", {
        title: "Change Password",
        errors: errors.array()
      });
    }

    try {
      const user = await findUserById(req.session.userId);

      if (!user) {
        return res.status(404).send("User not found.");
      }

      const currentPasswordMatches = await bcrypt.compare(
        req.body.currentPassword,
        user.password_hash
      );

      if (!currentPasswordMatches) {
        return res.status(400).render("profile/password", {
          title: "Change Password",
          errors: [
            {
              msg: "Your current password is incorrect."
            }
          ]
        });
      }

      const sameAsOldPassword = await bcrypt.compare(
        req.body.newPassword,
        user.password_hash
      );

      if (sameAsOldPassword) {
        return res.status(400).render("profile/password", {
          title: "Change Password",
          errors: [
            {
              msg: "Your new password must differ from the current password."
            }
          ]
        });
      }

      const passwordHash = await bcrypt.hash(
        req.body.newPassword,
        12
      );

      await updateUserPassword(
        req.session.userId,
        passwordHash
      );

      res.redirect("/profile");
    } catch (error) {
      next(error);
    }
  }
);

// POST /profile/delete - Handle account deletion
router.post(
  "/profile/delete",
  requireAuth,
  async (req, res, next) => {
    try {
      await deleteUserById(req.session.userId);

      req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        res.clearCookie("mealie.sid");
        res.redirect("/");
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;