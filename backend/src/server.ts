import dotenv from "dotenv";
import connectDB from "./db/db.index";
import app from "./app";

dotenv.config();

const port = process.env.PORT || 3000;

const connectServer = async () => {
  try {
    await connectDB();
    try {
      app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
      });
    } catch (error) {
      console.log("Runtime error occured: ", error);
    }
  } catch (error) {
    console.log("Error connecting to DB: ", error);
  }
};

connectServer();
