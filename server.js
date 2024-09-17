
const express = require('express');
const path = require('path');
const app = express();

// Serve the static HTML file from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
