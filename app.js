const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;



app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('home', { title: 'Mealie - Your Meal Planner' });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}/`);
});
