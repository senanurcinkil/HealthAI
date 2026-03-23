const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple regex for email validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// GET /api/people
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM people ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/people/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM people WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/people
router.post('/', async (req, res) => {
  try {
    const { full_name, email } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Insert row
    const { rows } = await db.query(
      'INSERT INTO people (full_name, email) VALUES ($1, $2) RETURNING *',
      [full_name, email]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // 23505 is PostgreSQL unique violation error code
      return res.status(409).json({ error: 'EMAIL_ALREADY_EXISTS' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/people/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email } = req.body;

    // Optional validation logic if fields are provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if person exists
    const checkPerson = await db.query('SELECT * FROM people WHERE id = $1', [id]);
    if (checkPerson.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    const { rows } = await db.query(
      'UPDATE people SET full_name = COALESCE($1, full_name), email = COALESCE($2, email) WHERE id = $3 RETURNING *',
      [full_name, email, id]
    );

    res.status(200).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'EMAIL_ALREADY_EXISTS' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/people/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM people WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.status(200).json({ message: 'Person deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
