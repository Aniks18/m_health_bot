const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

app.use(express.json());

// Serve the React app
app.use(express.static(path.join(__dirname, 'build')));

// API endpoint to save chats
app.post('/saveChats', (req, res) => {
  const chats = req.body;
  fs.writeFile('chatHistory.json', JSON.stringify(chats, null, 2), (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error saving chats' });
    } else {
      res.json({ message: 'Chats saved successfully' });
    }
  });
});

// Serve chat history
app.get('/chatHistory.json', (req, res) => {
  fs.readFile('chatHistory.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error reading chat history' });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});