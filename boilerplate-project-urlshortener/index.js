require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const { parse } = require('path');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for URLs
let urlDatabase = [];
let idCounter = 1;

// POST endpoint to create a short URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL format
  try {
    const url = new URL(originalUrl);
    const hostname = url.hostname;
    dns.lookup(hostname, (err) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid URL' });
      } else {
        // Save and return short URL
        const shortUrl = idCounter++;
        urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
        res.json({ original_url: originalUrl, short_url: shortUrl });
      }
      
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL' });
  }
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:id', (req, res) => {
  const shortUrl = parseInt(req.params.id);
  const entry = urlDatabase.find(item => item.short_url === shortUrl);
  if (entry) {
    if (/^https?:\/\//i.test(entry.original_url)) {
      res.redirect(entry.original_url);
    } else {
      res.status(400).json({ error: 'invalid url' });
    }
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
