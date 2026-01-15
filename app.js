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

app.use(morgan("tiny"));
app.use(express.json({ limit: "25mb", extended: true }));
app.use(bodyParser.json({ limit: "25mb" }));
app.use(express.static("public"));

const corsOriginRaw = process.env.CORS_ORIGIN || "";
const allowedOrigins = corsOriginRaw
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.options("*", cors());

const apiPrefix = process.env.API_PREFIX || "/api";

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

app.get(`${apiPrefix}/health`, (_req, res) => {
  const mongoose = require("mongoose");
  res.json({ ok: true, db: mongoose.connection?.name || null });
});

app.get(`${apiPrefix}/`, (_req, res) => res.send("UMiSF API Started"));
app.get("/", (_req, res) => res.send("UMiSF API Started"));

module.exports = app;

