// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.js";     // <-- path must match disk, include .js
import newsRouter from "./routes/news.js";        // or "./routes/news.js" if that’s the real path

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", aiRouter);          // exposes POST /api/generate
app.use("/api/news", newsRouter);   // exposes GET /api/news

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
