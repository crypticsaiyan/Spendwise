import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}`
    );
    console.log("DB is connected: ", connectionInstance.connection.host);
  } catch (error) {
    console.log("Failed to connect to DB, error: ", error);
    process.exit(1);
  }
};

export default connectDB;
