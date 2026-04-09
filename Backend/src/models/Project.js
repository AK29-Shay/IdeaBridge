import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    createdDate: {
      type: Date,
      required: true
    },
    contributions: {
      type: Number,
      required: true,
      min: 0
    },
    likes: {
      type: Number,
      required: true,
      min: 0
    },
    views: {
      type: Number,
      required: true,
      min: 0
    },
    responses: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
