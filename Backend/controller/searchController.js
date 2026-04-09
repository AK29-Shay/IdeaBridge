const projects = require('../config/projects.json');

function parseList(val) {
  if (!val) return null;
  return String(val).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

exports.searchProjects = (req, res) => {
  const q = req.query.q ? req.query.q.toLowerCase() : null;
  const category = parseList(req.query.category);
  const difficulty = parseList(req.query.difficulty);
  const department = parseList(req.query.department);
  const status = parseList(req.query.status);

  const results = projects.filter(p => {
    if (q) {
      const hay = (p.title + ' ' + p.description + ' ' + (p.tags || []).join(' ')).toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      if (!terms.every(t => hay.includes(t))) return false;
    }

    if (category && category.length) {
      if (!p.category || !category.includes(p.category.toLowerCase())) return false;
    }
    if (difficulty && difficulty.length) {
      if (!p.difficulty || !difficulty.includes(p.difficulty.toLowerCase())) return false;
    }
    if (department && department.length) {
      if (!p.department || !department.includes(p.department.toLowerCase())) return false;
    }
    if (status && status.length) {
      if (!p.status || !status.includes(p.status.toLowerCase())) return false;
    }

    return true;
  });

  res.json({ count: results.length, results });
};
