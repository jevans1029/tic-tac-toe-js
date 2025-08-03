const express = require('express');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./passport-config');
const db = require('./db');
const bcrypt = require('bcrypt');

const app = express();

initializePassport(passport);

app.use(express.json());

app.use(session({
  secret: 'replace-this-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Create the table if it doesn't exist
async function initDb() {
  try {
    // Create games table
    await db.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        winner VARCHAR(1) NULL,
        moves INTEGER DEFAULT 0
      )
    `);

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    throw err; // Re-throw to handle it in the server startup
  }
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.query('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashed]);
    res.status(201).json({ status: 'registered' });
  } catch (e) {
    res.status(500).json({ error: 'User creation failed' });
  }
});

app.post('/login',
  passport.authenticate('local'),
  (req, res) => {
    res.json({ status: 'logged in' });
  }
);

app.get('/protected', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: 'You are authenticated!' });
  } else {
    res.status(401).json({ message: 'Not authorized' });
  }
});

initDb().then(() => {
  app.listen(8000, () => {
    console.log('🚀 Server running on http://localhost:8000');
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
