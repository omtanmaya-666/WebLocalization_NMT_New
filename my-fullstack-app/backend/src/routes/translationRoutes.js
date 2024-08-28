// src/routes/translationRoutes.js

const express = require('express');
const router = express.Router();
const { extractText_and_Translate } = require('../controllers/translationController');

// Define the route
router.post('/localize', (req, res) => {
  const { url, language } = req.body;
  extractText_and_Translate(url, language, res);
});

module.exports = router;
