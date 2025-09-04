import mongoose from 'mongoose'; 


const connectDB = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI;
      await mongoose.connect(`${mongoURI}/freelan`);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    }
  };


export default connectDB;
  