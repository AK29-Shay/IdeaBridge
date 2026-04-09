import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/
    },
    value: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
