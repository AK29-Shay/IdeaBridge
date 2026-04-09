const express = require('express');
const router = express.Router();
const {
  searchProjects,
  getFilterOptions,
  getAllTags
} = require('../Controlers/searchController');

// @route   GET /api/search
// @desc    Search and filter project ideas
// @access  Public
// Query params:
//   - keyword: Search text (searches title, description, tags)
//   - faculty: Filter by faculty (IT, SE, Data Science, Cyber, Network)
//   - category: Filter by category (Web, Mobile, AI, etc.)
//   - difficulty: Filter by difficulty (Easy, Medium, Hard)
//   - status: Filter by status (New, Approved, Completed)
//   - sortBy: Field to sort by (default: createdAt)
//   - order: Sort order - asc or desc (default: desc)
//   - page: Page number (default: 1)
//   - limit: Items per page (default: 10)
router.get('/', searchProjects);

// @route   GET /api/search/filters
// @desc    Get all available filter options with counts
// @access  Public
router.get('/filters', getFilterOptions);

// @route   GET /api/search/tags
// @desc    Get all unique tags
// @access  Public
router.get('/tags', getAllTags);

module.exports = router;
