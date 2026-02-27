require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;

const session = require('express-session');
const passport = require('./auth');
const apiRoutes = require('./routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'uba-secreto',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', apiRoutes);

// Start Automated Scraper
const { startScraper } = require('./scraper');
startScraper();

// Export app for potential testing, or just run it

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
