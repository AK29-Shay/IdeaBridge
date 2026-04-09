// Using in-memory data for demonstration (no MongoDB required)
const sampleProjects = require('../data/sampleData');
const { FACULTY_COURSES } = require('../data/sampleData');
const { validateSearchQuery, sanitizeString } = require('../utils/validation');

// Simple in-memory database
let projects = [...sampleProjects];

// Helper function for keyword search (case-insensitive)
const searchByKeyword = (projects, keyword) => {
  if (!keyword || keyword.trim() === '') return projects;
  
  const searchTerm = keyword.toLowerCase().trim();
  return projects.filter(project => {
    return project.title.toLowerCase().includes(searchTerm) ||
           project.description.toLowerCase().includes(searchTerm) ||
           project.tags.some(tag => tag.toLowerCase().includes(searchTerm));
  });
};

// @desc    Search and filter project ideas
// @route   GET /api/search
// @access  Public
const searchProjects = async (req, res) => {
  try {
    // Validate and sanitize input
    const validation = validateSearchQuery(req.query);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const {
      keyword,
      faculty,
      course,
      category,
      difficulty,
      status,
      sortBy,
      order,
      page,
      limit
    } = validation.sanitized;

    // Start with all projects
    let filteredProjects = [...projects];

    // Keyword search (searches in title, description, and tags)
    if (keyword && keyword.trim() !== '') {
      filteredProjects = searchByKeyword(filteredProjects, keyword);
    }

    // Faculty filter (IT, SE, Data Science, Cyber, Network)
    if (faculty) {
      const faculties = faculty.split(',').map(f => f.trim());
      filteredProjects = filteredProjects.filter(p => faculties.includes(p.faculty));
    }

    // Course filter
    if (course) {
      const courses = course.split(',').map(c => c.trim());
      filteredProjects = filteredProjects.filter(p => courses.includes(p.course));
    }

    // Category filter (Web, Mobile, AI, etc.)
    if (category) {
      const categories = category.split(',').map(c => c.trim());
      filteredProjects = filteredProjects.filter(p => categories.includes(p.category));
    }

    // Difficulty filter (Easy, Medium, Hard)
    if (difficulty) {
      const difficulties = difficulty.split(',').map(d => d.trim());
      filteredProjects = filteredProjects.filter(p => difficulties.includes(p.difficulty));
    }

    // Status filter (New, Approved, Completed)
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      filteredProjects = filteredProjects.filter(p => statuses.includes(p.status));
    }

    // Sort results
    filteredProjects.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'difficulty') {
        const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty];
      } else if (sortBy === 'faculty') {
        comparison = a.faculty.localeCompare(b.faculty);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else {
        comparison = a[sortBy] > b[sortBy] ? 1 : -1;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });

    // Calculate pagination
    const total = filteredProjects.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    // Sanitize output data
    const sanitizedProjects = paginatedProjects.map(p => ({
      ...p,
      title: sanitizeString(p.title),
      description: sanitizeString(p.description),
      author: sanitizeString(p.author)
    }));

    res.status(200).json({
      success: true,
      count: sanitizedProjects.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: sanitizedProjects
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get filter options (faculties, courses, categories, difficulties, statuses)
// @route   GET /api/search/filters
// @access  Public
const getFilterOptions = async (req, res) => {
  try {
    // Get distinct values from in-memory data
    const faculties = [...new Set(projects.map(p => p.faculty))];
    const courses = [...new Set(projects.map(p => p.course))];
    const categories = [...new Set(projects.map(p => p.category))];
    const difficulties = [...new Set(projects.map(p => p.difficulty))];
    const statuses = [...new Set(projects.map(p => p.status))];

    // Get count for each faculty
    const facultyCounts = faculties.reduce((acc, faculty) => {
      acc[faculty] = projects.filter(p => p.faculty === faculty).length;
      return acc;
    }, {});

    // Get count for each course
    const courseCounts = courses.reduce((acc, course) => {
      acc[course] = projects.filter(p => p.course === course).length;
      return acc;
    }, {});

    // Get count for each category
    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = projects.filter(p => p.category === category).length;
      return acc;
    }, {});

    // Get count for each difficulty
    const difficultyCounts = difficulties.reduce((acc, difficulty) => {
      acc[difficulty] = projects.filter(p => p.difficulty === difficulty).length;
      return acc;
    }, {});

    // Group courses by faculty
    const coursesByFaculty = {};
    faculties.forEach(faculty => {
      coursesByFaculty[faculty] = [...new Set(
        projects.filter(p => p.faculty === faculty).map(p => p.course)
      )].sort();
    });

    res.status(200).json({
      success: true,
      data: {
        faculties: faculties.sort(),
        courses: courses.sort(),
        coursesByFaculty,
        facultyCourses: FACULTY_COURSES,
        categories: categories.sort(),
        difficulties: difficulties.sort(),
        statuses: statuses.sort(),
        counts: {
          byFaculty: facultyCounts,
          byCourse: courseCounts,
          byCategory: categoryCounts,
          byDifficulty: difficultyCounts
        }
      }
    });

  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting filter options',
      error: error.message
    });
  }
};

// @desc    Get all unique tags
// @route   GET /api/search/tags
// @access  Public
const getAllTags = async (req, res) => {
  try {
    const allTags = projects.flatMap(p => p.tags);
    const tags = [...new Set(allTags)];
    
    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags.sort()
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting tags',
      error: error.message
    });
  }
};

module.exports = {
  searchProjects,
  getFilterOptions,
  getAllTags
};
