import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/itp-dashboard';

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

export default connectDB;
