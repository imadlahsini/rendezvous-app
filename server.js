require('dotenv').config();
const { Pool } = require('pg');
const express = require('express');
const app = express();

app.use(express.json()); // For parsing JSON requests

// Connect to PostgreSQL using the DATABASE_URL from your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Important for SSL connection on Railway
  }
});

// Function to query the database
const query = (text, params) => pool.query(text, params);

// Route to add a new appointment
app.post('/api/appointments', async (req, res) => {
  const { name, phone, date, timeSlot } = req.body;
  try {
    const result = await query(
      `INSERT INTO appointments (name, phone, date, time_slot, status) 
       VALUES ($1, $2, $3, $4, 'Draft') RETURNING *`,
      [name, phone, date, timeSlot]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding appointment:', err);
    res.status(500).json({ error: 'Failed to add appointment' });
  }
});

// Route to fetch all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await query('SELECT * FROM appointments ORDER BY date, time_slot');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
