import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config() ;

const dbconnect = async () => {
  try {
    await mongoose.connect(
      process.env.DB_URL ,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Unable to connect to MongoDB Atlas!");
    console.error(error);
  }
};

export default dbconnect;
