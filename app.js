const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const db = require('./config/database');
const bcrypt = require('bcrypt');
const userModel = require('./models/userModel');
const session = require('express-session');
const mealRoutes = require("./routes/mealRoutes");
const { requireAuth } = require('./middleware/authMiddleware');
const profileRoutes = require("./routes/profileRoutes");




// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'mealie-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));


app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('home', { title: 'Mealie - Your Meal Planner' });
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.redirect("/meals")
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', async(req, res) => {
    const { username, password } = req.body;

    try{
        const user = await userModel.findUserByUsername(username);

        if (!user) {
            return res.status(400).send("Invalid username or password");
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(400).send("Invalid username or password");
        }

        req.session.userId = user.user_id;
        req.session.username = user.username;

        res.redirect("/dashboard");

    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).render("login", {
        title: "Login",
        errors: [
          {
            msg: "Logout failed. Please try again."
          }
        ],
        formData: {}
      });
    }

    res.redirect("/login");
  });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Handle form submission for registration
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Password Validation
    const hasMinimumLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

    if ( !hasMinimumLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialCharacter 
    ) { return res.status(400).send("Weak Password!")}

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        //Check database first
        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(400).send("Email already registered");
        }

        //Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        //Save new user
        await userModel.createUser(username, email, passwordHash);
        res.redirect('/login');
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
    // Process registration logic here
});

app.use("/meals", mealRoutes);
app.use("/", profileRoutes);

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}/`);
});
