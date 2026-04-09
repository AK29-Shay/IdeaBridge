const express = require('express');
const router = express.Router();
const { searchProjects } = require('../controller/searchController');

// GET /api/projects/search?q=...&category=...&difficulty=...&department=...&status=...
router.get('/search', searchProjects);

module.exports = router;
