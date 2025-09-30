const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Use Railway's port or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend running on port ${PORT}`));
