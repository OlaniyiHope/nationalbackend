
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import session from "express-session";
// import MongoStore from "connect-mongo";
// import connectDB from "./config/db2.js";
// // Routes
// import DbpostRoute from "./routes/DbpostRoute.js";

// import DbcatRoute from "./routes/DbcatRoute.js";
// import DbauthRoute from "./routes/DbauthRoute.js";
// import DbcartRoute from "./routes/DbcartRoute.js";

// dotenv.config();

// const app = express();
// connectDB();


// /* -------------------- BODY PARSERS -------------------- */
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /* -------------------- CORS -------------------- */
// const allowedOrigins = [
//   "https://admin.rayofaa.com",
//   "http://localhost:3000",
//   "http://localhost:5173",
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(null, false);
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

// /* -------------------- NO CACHE -------------------- */
// app.use((req, res, next) => {
//   res.setHeader("Cache-Control", "no-store");
//   next();
// });

// /* -------------------- SESSION -------------------- */
// app.use(
//   session({
//     name: "rayofaa.sid",
//     secret: process.env.GOOGLE_CLIENT_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "none",
//     },
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGODB_URI,
//       ttl: 14 * 24 * 60 * 60,
//     }),
//   })
// );

// /* -------------------- ROUTES -------------------- */

// app.use("/api/db", DbauthRoute);

// app.use("/api/db", DbpostRoute);

// app.use("/api/db", DbcatRoute);
// app.use("/api/db", DbcartRoute);

// /* -------------------- ERROR HANDLER -------------------- */
// app.use((err, req, res, next) => {
//   console.error("🔥 SERVER ERROR:", err);
//   res.status(500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// /* -------------------- START -------------------- */
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () =>
//   console.log(`🚀 Server running on port ${PORT}`)
// );

import "dotenv/config";  // ← must be the very first line, before all other imports
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./config/db2.js";
import DbpostRoute from "./routes/DbpostRoute.js";
import DbcatRoute from "./routes/DbcatRoute.js";
import DbauthRoute from "./routes/DbauthRoute.js";
import DbcartRoute from "./routes/DbcartRoute.js";

// remove the old `import dotenv from "dotenv";` and `dotenv.config();` lines below — no longer needed

const app = express();
connectDB();

/* -------------------- BODY PARSERS -------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* -------------------- CORS -------------------- */
const allowedOrigins = [
  "https://admin.rayofaa.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* -------------------- NO CACHE -------------------- */
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

/* -------------------- SESSION -------------------- */
app.use(
  session({
    name: "rayofaa.sid",
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60,
    }),
  })
);

/* -------------------- ROUTES -------------------- */
app.use("/api/db", DbauthRoute);
app.use("/api/db", DbpostRoute);
app.use("/api/db", DbcatRoute);
app.use("/api/db", DbcartRoute);

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -------------------- START -------------------- */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);