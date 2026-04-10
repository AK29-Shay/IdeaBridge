import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'answered', 'completed', 'in-review']
    },
    requestedAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
