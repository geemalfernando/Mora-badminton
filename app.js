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

// Allow all origins so frontend (e.g. Render) can call the API
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
