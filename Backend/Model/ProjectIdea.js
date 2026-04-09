const mongoose = require('mongoose');

const projectIdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    index: true
  },
  faculty: {
    type: String,
    required: true,
    enum: ['IT', 'SE', 'Data Science', 'Cyber', 'Network'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Web', 'Mobile', 'AI', 'IoT', 'Data Science', 'Cyber Security', 'Networking', 'Cloud', 'Other'],
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  status: {
    type: String,
    enum: ['New', 'Approved', 'Completed'],
    default: 'New',
    index: true
  },
  author: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for keyword search across title, description, and tags
projectIdeaSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text' 
});

// Compound index for common filter combinations
projectIdeaSchema.index({ faculty: 1, category: 1, difficulty: 1 });
projectIdeaSchema.index({ faculty: 1, status: 1 });

const ProjectIdea = mongoose.model('ProjectIdea', projectIdeaSchema);

module.exports = ProjectIdea;
