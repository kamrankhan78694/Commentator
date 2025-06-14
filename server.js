// Commentator Development Server
// Simple server to serve the web interface during development

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for future comment storage
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Commentator server is running',
        version: '1.0.0'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🗨️  Commentator development server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('📖 Open your browser and navigate to the URL above');
    console.log('🔄 The server will restart when you make changes');
});

module.exports = app;