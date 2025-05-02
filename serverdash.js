const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 👇 Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Set default route to Dashboard-Real-estate.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Dashboard-Real-estate.html'));
});

// DB Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // change this
  password: 'Nasser2002', // change this
  database: 'Esham-db'  // change this
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// ===== USER PROFILE & ROLE =====
app.get('/api/user/:id', (req, res) => {
  db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0] || {});
  });
});

app.post('/api/user/update', (req, res) => {
  const { id, name, email } = req.body;
  db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], err => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Profile updated successfully' });
  });
});

// ===== SETTINGS =====
app.get('/api/settings/:userId', (req, res) => {
  db.query('SELECT * FROM user_settings WHERE user_id = ?', [req.params.userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0] || {});
  });
});

app.post('/api/settings', (req, res) => {
    const { user_id, dark_mode } = req.body;
  
    const sql = `
      INSERT INTO user_settings (user_id, dark_mode)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE dark_mode = VALUES(dark_mode)
    `;
    db.query(sql, [user_id, dark_mode], err => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Settings saved' });
    });
  });
  

// ===== NOTIFICATIONS =====
app.get('/api/notifications/:userId', (req, res) => {
  db.query('SELECT * FROM notifications WHERE user_id = ?', [req.params.userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/api/notifications', (req, res) => {
  const { user_id, message } = req.body;
  db.query('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [user_id, message], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Notification added', id: result.insertId });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get('/api/revenue', (req, res) => {
    db.query('SELECT * FROM revenue', (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  });
  
  app.get('/api/proposals', (req, res) => {
    db.query('SELECT * FROM proposals', (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  });
  

// ===== PROJECT PROGRESSION =====

// Get all progress updates for a proposal
app.get('/api/progress/:proposalId', (req, res) => {
  const { proposalId } = req.params;
  db.query(
    'SELECT * FROM project_progress WHERE proposal_id = ? ORDER BY updated_at DESC',
    [proposalId],
    (err, results) => {
      if (err) {
        console.error('Error fetching progress:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results); // Will return [] if no data
    }
  );
});
// Add or update progress for a proposal
app.post('/api/progress', (req, res) => {
  const { proposal_id, stage, description, progress_percent } = req.body;
  const sql = `
    INSERT INTO project_progress (proposal_id, stage, description, progress_percent)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [proposal_id, stage, description, progress_percent], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Progress entry added', id: result.insertId });
  });
});