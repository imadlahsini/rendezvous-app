const express = require('express');
const path = require('path');
const app = express();

// Store appointments in memory for simplicity
let appointments = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint to get available hours
app.get('/available-hours', (req, res) => {
    const { day } = req.query;
    const availableHours = generateAvailableHours(day);
    res.json(availableHours);
});

// Endpoint to submit an appointment (as draft)
app.post('/submit', (req, res) => {
    const { name, phone, email, day, hour } = req.body;
    const appointment = { name, phone, email, day, hour, status: 'draft' };
    appointments.push(appointment);
    res.json({ message: 'Rendez-vous soumis en tant que brouillon.' });
});

// Endpoint to get all appointments for the dashboard
app.get('/appointments', (req, res) => {
    res.json(appointments);
});

// Endpoint to confirm an appointment
app.post('/confirm', (req, res) => {
    const { index } = req.body;
    appointments[index].status = 'confirmed';
    res.json({ message: 'Rendez-vous confirmé.' });
});

// Helper function to generate available hours
function generateAvailableHours(day) {
    const hours = [];
    for (let i = 7; i < 19; i++) {
        ['00', '15', '30', '45'].forEach(minute => {
            const time = `${i}:${minute}`;
            if (!appointments.some(a => a.day === day && a.hour === time && a.status === 'confirmed')) {
                hours.push(time);
            }
        });
    }
    return hours;
}

// Use the port provided by Railway or default to 3000 for local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
