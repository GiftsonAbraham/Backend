const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'your-rds-endpoint',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to RDS database');
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
    if (err) throw err;
    res.status(201).send('User registered');
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, result) => {
    if (err) throw err;
    if (result.length === 0) return res.status(400).send('User not found');
    const user = result[0];
    if (await bcrypt.compare(password, user.password)) {
      res.send('Login successful');
    } else {
      res.status(400).send('Invalid credentials');
    }
  });
});

app.listen(3000, () => {
  console.log('Backend API running on port 3000');
});
