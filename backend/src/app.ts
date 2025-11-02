import express from "express";
import router from "./routes/router";
import cookieParser from "cookie-parser";

const app = express();

// Body parsers first
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || "fallback-secret"));

// Static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1", router);

export default app;
