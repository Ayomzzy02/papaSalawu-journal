const express = require("express");
const cors = require("cors");

const AdminRoute = require("./routes/adminRoutes")
const authRoute = require("./routes/authRoute")
const journalRoute = require("./routes/journalRoute")
const chiefRoute = require("./routes/chiefRoute")
const globalErrorMiddleware = require("./controllers/errorControllers");
const AppError = require("./utils/appError");

const app = express();

// Configuring CORS

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
// Enabling CORS Pre-Flight
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Middlewares

// - Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res, next) => {
  return res.status(200).json({
    status: "success",
    message: "Welcome to Jornal API.",
  });
});

app.use(`${process.env.API_BASE_URL}/admin`, AdminRoute);
app.use(`${process.env.API_BASE_URL}/auth`, authRoute);
app.use(`${process.env.API_BASE_URL}/journal`, journalRoute);
app.use(`${process.env.API_BASE_URL}/chief-editor`, chiefRoute);

// Any request that makes it to this part has lost it's way
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: "failed",
    message: `Can't find ${req.originalUrl} on this server!`
  });
});



// Global Error Handling middleware
app.use(globalErrorMiddleware);

module.exports = app;