const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { Pool } = require('pg'); // PostgreSQL pool
const path = require('path'); // For resolving file paths

const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:FvTCKHYwvreJpqdjVyFYyejZPjMnhUzB@postgres.railway.internal:5432/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

// Use environment variables for Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Serve dashboard.html at "/dashboard"
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Create a draft appointment
app.post('/appointments/draft', async (req, res) => {
  const { name, phone, email, selected_time_slot } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO appointments (name, phone, email, selected_time_slot, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, phone, email, selected_time_slot, 'draft']
    );
    res.status(201).json({ message: 'Draft saved successfully', appointment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving draft' });
  }
});

// Get all draft appointments
app.get('/appointments/drafts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE status = $1', ['draft']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching drafts' });
  }
});

// Confirm an appointment
app.post('/appointments/confirm/:id', async (req, res) => {
  const appointmentId = req.params.id;
  const { exact_hour } = req.body;

  try {
    const result = await pool.query('UPDATE appointments SET status = $1, exact_hour = $2 WHERE id = $3 RETURNING *', ['confirmed', exact_hour, appointmentId]);
    const appointment = result.rows[0];

    // Send SMS via Twilio
    client.messages
      .create({
        body: `Your appointment is confirmed for ${appointment.exact_hour}`,
        from: process.env.TWILIO_PHONE_NUMBER,  // Use the Twilio phone number from environment variables
        to: appointment.phone
      })
      .then(message => console.log(message.sid))
      .catch(err => console.error(err));

    res.json({ message: 'Appointment confirmed and SMS sent', appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error confirming appointment' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
