import "dotenv/config";
import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.js";
import newsRouter from "./routes/news.js";

const app = express();
app.use(cors());
app.use(express.json());

// Root route (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("🚀 GenZ Backend is running. Use /api or /api/news");
});

// API routes
app.use("/api", aiRouter);          // POST /api/generate
app.use("/api/news", newsRouter);   // GET /api/news

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
