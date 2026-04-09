// Validation utilities for Search & Filtering API

// Valid filter values
const VALID_FACULTIES = ['IT', 'SE', 'Data Science', 'Cyber', 'Network'];
const VALID_COURSES = [
  // IT Courses
  'Programming Fundamentals', 'Database Systems', 'Web Development', 'Software Engineering', 
  'Computer Networks', 'Operating Systems', 'Cyber Security Basics', 'Object Oriented Programming',
  'Java Programming', 'Python Programming', 'Data Structures & Algorithms', 'Mobile Application Development',
  'Human Computer Interaction', 'Information Security', 'IT Project Management', 'Enterprise Architecture',
  // SE Courses
  'Software Design', 'Agile Development', 'System Architecture', 'Quality Assurance', 
  'DevOps', 'Cloud Computing', 'Mobile App Development', 'Requirements Engineering',
  'Software Testing', 'Design Patterns', 'Microservices Architecture', 'Full Stack Development',
  'API Development', 'Continuous Integration', 'Software Metrics', 'Formal Methods',
  // Data Science Courses
  'Data Analytics', 'Machine Learning', 'Deep Learning', 'Big Data', 
  'Statistical Analysis', 'Data Visualization', 'Python for Data Science', 'Natural Language Processing',
  'Computer Vision', 'Reinforcement Learning', 'Time Series Analysis', 'Data Mining',
  'Business Intelligence', 'Predictive Analytics', 'Neural Networks', 'Data Engineering',
  // Cyber Courses
  'Network Security', 'Ethical Hacking', 'Digital Forensics', 'Cryptography', 
  'Security Auditing', 'Malware Analysis', 'Incident Response', 'Penetration Testing',
  'Web Application Security', 'Cloud Security', 'IoT Security', 'Blockchain Security',
  'Risk Management', 'Compliance & Governance', 'Threat Intelligence', 'Security Operations',
  // Network Courses
  'Network Administration', 'Cisco CCNA', 'Cloud Infrastructure', 'Wireless Networks', 
  'Network Protocols', 'SDN', 'Network Troubleshooting', 'Network Design',
  'VoIP Technologies', 'Network Virtualization', '5G Networks', 'Fiber Optics',
  'Data Center Management', 'Load Balancing', 'Network Automation', 'IPv6 Implementation'
];
const VALID_CATEGORIES = ['Web', 'Mobile', 'AI', 'IoT', 'Data Science', 'Cyber Security', 'Networking', 'Cloud', 'Other'];
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const VALID_STATUSES = ['New', 'Approved', 'Completed'];
const VALID_SORT_FIELDS = ['title', 'createdAt', 'difficulty', 'faculty', 'category'];
const VALID_ORDERS = ['asc', 'desc'];

// Maximum limits
const MAX_KEYWORD_LENGTH = 100;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_NUMBER = 1000;

/**
 * Validate search query parameters
 * @param {Object} query - Query parameters from request
 * @returns {Object} - { isValid: boolean, errors: string[], sanitized: Object }
 */
function validateSearchQuery(query) {
  const errors = [];
  const sanitized = {};

  // Validate keyword
  if (query.keyword !== undefined) {
    const keyword = String(query.keyword).trim();
    if (keyword.length > MAX_KEYWORD_LENGTH) {
      errors.push(`Keyword must be less than ${MAX_KEYWORD_LENGTH} characters`);
    } else if (keyword.length > 0) {
      // Sanitize keyword - remove special characters that could cause issues
      sanitized.keyword = keyword.replace(/[<>\"']/g, '');
    }
  }

  // Validate faculty
  if (query.faculty !== undefined && query.faculty !== '') {
    const faculties = query.faculty.split(',').map(f => f.trim()).filter(f => f);
    const invalidFaculties = faculties.filter(f => !VALID_FACULTIES.includes(f));
    if (invalidFaculties.length > 0) {
      errors.push(`Invalid faculty: ${invalidFaculties.join(', ')}. Valid options: ${VALID_FACULTIES.join(', ')}`);
    } else {
      sanitized.faculty = faculties.join(',');
    }
  }
  
  // Validate course
  if (query.course !== undefined && query.course !== '') {
    const courses = query.course.split(',').map(c => c.trim()).filter(c => c);
    const invalidCourses = courses.filter(c => !VALID_COURSES.includes(c));
    if (invalidCourses.length > 0) {
      errors.push(`Invalid course: ${invalidCourses.join(', ')}`);
    } else {
      sanitized.course = courses.join(',');
    }
  }

  // Validate category
  if (query.category !== undefined && query.category !== '') {
    const categories = query.category.split(',').map(c => c.trim()).filter(c => c);
    const invalidCategories = categories.filter(c => !VALID_CATEGORIES.includes(c));
    if (invalidCategories.length > 0) {
      errors.push(`Invalid category: ${invalidCategories.join(', ')}. Valid options: ${VALID_CATEGORIES.join(', ')}`);
    } else {
      sanitized.category = categories.join(',');
    }
  }

  // Validate difficulty
  if (query.difficulty !== undefined && query.difficulty !== '') {
    const difficulties = query.difficulty.split(',').map(d => d.trim()).filter(d => d);
    const invalidDifficulties = difficulties.filter(d => !VALID_DIFFICULTIES.includes(d));
    if (invalidDifficulties.length > 0) {
      errors.push(`Invalid difficulty: ${invalidDifficulties.join(', ')}. Valid options: ${VALID_DIFFICULTIES.join(', ')}`);
    } else {
      sanitized.difficulty = difficulties.join(',');
    }
  }

  // Validate status
  if (query.status !== undefined && query.status !== '') {
    const statuses = query.status.split(',').map(s => s.trim()).filter(s => s);
    const invalidStatuses = statuses.filter(s => !VALID_STATUSES.includes(s));
    if (invalidStatuses.length > 0) {
      errors.push(`Invalid status: ${invalidStatuses.join(', ')}. Valid options: ${VALID_STATUSES.join(', ')}`);
    } else {
      sanitized.status = statuses.join(',');
    }
  }

  // Validate page number
  if (query.page !== undefined) {
    const pageNum = parseInt(query.page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive number');
      sanitized.page = 1;
    } else if (pageNum > MAX_PAGE_NUMBER) {
      errors.push(`Page number cannot exceed ${MAX_PAGE_NUMBER}`);
      sanitized.page = MAX_PAGE_NUMBER;
    } else {
      sanitized.page = pageNum;
    }
  } else {
    sanitized.page = 1;
  }

  // Validate limit (page size)
  if (query.limit !== undefined) {
    const limitNum = parseInt(query.limit, 10);
    if (isNaN(limitNum) || limitNum < MIN_PAGE_SIZE) {
      errors.push(`Limit must be at least ${MIN_PAGE_SIZE}`);
      sanitized.limit = MIN_PAGE_SIZE;
    } else if (limitNum > MAX_PAGE_SIZE) {
      errors.push(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
      sanitized.limit = MAX_PAGE_SIZE;
    } else {
      sanitized.limit = limitNum;
    }
  } else {
    sanitized.limit = 10;
  }

  // Validate sortBy
  if (query.sortBy !== undefined) {
    if (!VALID_SORT_FIELDS.includes(query.sortBy)) {
      errors.push(`Invalid sort field: ${query.sortBy}. Valid options: ${VALID_SORT_FIELDS.join(', ')}`);
      sanitized.sortBy = 'createdAt';
    } else {
      sanitized.sortBy = query.sortBy;
    }
  } else {
    sanitized.sortBy = 'createdAt';
  }

  // Validate order
  if (query.order !== undefined) {
    if (!VALID_ORDERS.includes(query.order.toLowerCase())) {
      errors.push(`Invalid order: ${query.order}. Valid options: ${VALID_ORDERS.join(', ')}`);
      sanitized.order = 'desc';
    } else {
      sanitized.order = query.order.toLowerCase();
    }
  } else {
    sanitized.order = 'desc';
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Validate project idea data for creation/update
 * @param {Object} data - Project data
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateProjectIdea(data) {
  const errors = [];

  // Validate title
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required');
  } else {
    const title = data.title.trim();
    if (title.length === 0) {
      errors.push('Title cannot be empty');
    } else if (title.length < 3) {
      errors.push('Title must be at least 3 characters');
    } else if (title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
  }

  // Validate description
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  } else {
    const desc = data.description.trim();
    if (desc.length === 0) {
      errors.push('Description cannot be empty');
    } else if (desc.length < 10) {
      errors.push('Description must be at least 10 characters');
    } else if (desc.length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }
  }

  // Validate faculty
  if (!data.faculty) {
    errors.push('Faculty is required');
  } else if (!VALID_FACULTIES.includes(data.faculty)) {
    errors.push(`Invalid faculty. Valid options: ${VALID_FACULTIES.join(', ')}`);
  }

  // Validate category
  if (!data.category) {
    errors.push('Category is required');
  } else if (!VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Invalid category. Valid options: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate difficulty
  if (!data.difficulty) {
    errors.push('Difficulty is required');
  } else if (!VALID_DIFFICULTIES.includes(data.difficulty)) {
    errors.push(`Invalid difficulty. Valid options: ${VALID_DIFFICULTIES.join(', ')}`);
  }

  // Validate status (optional, defaults to 'New')
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Invalid status. Valid options: ${VALID_STATUSES.join(', ')}`);
  }

  // Validate tags
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    } else {
      if (data.tags.length > 20) {
        errors.push('Cannot have more than 20 tags');
      }
      data.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        } else if (tag.length > 50) {
          errors.push(`Tag at index ${index} must be less than 50 characters`);
        }
      });
    }
  }

  // Validate author
  if (!data.author || typeof data.author !== 'string') {
    errors.push('Author is required');
  } else if (data.author.trim().length === 0) {
    errors.push('Author cannot be empty');
  } else if (data.author.length > 100) {
    errors.push('Author must be less than 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Rate limiting check (simple in-memory implementation)
 */
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60000; // 1 minute in milliseconds

function checkRateLimit(clientId) {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW;
  
  // Clean old entries
  for (const [key, data] of requestCounts) {
    if (data.timestamp < windowStart) {
      requestCounts.delete(key);
    }
  }

  // Check current client
  const clientData = requestCounts.get(clientId);
  if (!clientData) {
    requestCounts.set(clientId, { count: 1, timestamp: now });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (clientData.timestamp < windowStart) {
    // Reset window
    requestCounts.set(clientId, { count: 1, timestamp: now });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (clientData.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: clientData.timestamp + RATE_WINDOW };
  }

  clientData.count++;
  return { allowed: true, remaining: RATE_LIMIT - clientData.count };
}

module.exports = {
  validateSearchQuery,
  validateProjectIdea,
  sanitizeString,
  checkRateLimit,
  VALID_FACULTIES,
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  VALID_STATUSES,
  MAX_KEYWORD_LENGTH,
  MAX_PAGE_SIZE
};
