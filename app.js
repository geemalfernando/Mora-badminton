const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const doubleRouter = require("./router/doubleRouter");
const companyRouter = require("./router/companyRouter");
const playerRouter = require("./router/playerRouter");
const singleRouter = require("./router/singleRouter");
const universityRouter = require("./router/universityRouter");
const feedbackRouter = require("./router/feedbackRouter");
const userRouter = require("./router/userRouter");
const photoRouter = require("./router/photoRouter");
const imageUploadRouter = require("./router/imageUploadRouter");

const app = express();
app.disable("x-powered-by");

// CORS: allow any origin (Firebase umisf-4778c.web.app, Render frontend, etc.)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors());

app.use(morgan("tiny"));
app.use(express.json({ limit: "25mb", extended: true }));
app.use(bodyParser.json({ limit: "25mb" }));
app.use(express.static("public"));

const apiPrefix = process.env.API_PREFIX || "/api";

// Health check – register first so /api/health and /health always work (e.g. Render, client preflight)
const healthHandler = (_req, res) => {
  const mongoose = require("mongoose");
  res.json({ ok: true, db: mongoose.connection?.name || null });
};
app.get("/api/health", healthHandler);
app.get("/health", healthHandler);
app.get(`${apiPrefix}/health`, healthHandler);

// Mount both prefixed and unprefixed routes (for backwards compatibility).
function mountBoth(path, router) {
  app.use(path, router);
  app.use(`${apiPrefix}${path}`, router);
}

mountBoth("/double", doubleRouter);
mountBoth("/company", companyRouter);
mountBoth("/player", playerRouter);
mountBoth("/single", singleRouter);
mountBoth("/university", universityRouter);
mountBoth("/feedbacks", feedbackRouter);
mountBoth("/user", userRouter);
mountBoth("/photo", photoRouter);
mountBoth("/image", imageUploadRouter);

app.get(`${apiPrefix}/`, (_req, res) => res.send("UMiSF API Started"));
app.get("/", (_req, res) => res.send("UMiSF API Started"));

module.exports = app;
