const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('home', { title: 'Mealie - Your Meal Planner' });
});
app.listen(3000, () => {
    console.log('Express server running at http://localhost:3000/');
});
