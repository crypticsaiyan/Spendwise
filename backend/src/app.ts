import express from "express";
import router from "./routes/router";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET || "fallback-secret"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use("/api/v1/users", router);

export default app;
