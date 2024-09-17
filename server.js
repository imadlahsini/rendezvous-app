const express = require('express');
const path = require('path');
const app = express();

// Serve the static HTML file from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the port provided by Railway, or default to 3000 for local development
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
