const express = require("express");
const path = require("path");

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");

const apiKeyAuth = require("./middleware/apiKeyAuth");
const logger = require("./middleware/logger");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);
app.use("/api", apiKeyAuth, logger, apiRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "public-docs.html"));
});

module.exports = app;
