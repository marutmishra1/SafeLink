const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();


const connectDB = require("./config/db");

const alertRoutes = require("./routes/alertRoutes");
const messageRoutes = require("./routes/messageRoutes");


const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5000",
        ],

        connectSrc: [
          "'self'",
          "http://localhost:5000",
        ],
      },
    },
  })
);

const PORT =
  process.env.PORT || 5000;


/* ================= DATABASE ================= */




/* ================= MIDDLEWARE ================= */

const allowedOrigins = [
  "http://localhost:5173",
];


app.use(
  cors({
    origin: allowedOrigins,

    methods: [
      "GET",
      "POST",
      "PATCH",
      "DELETE",
    ],
  })
);


app.use(
  express.json()
);


/* ================= STATIC FILES ================= */

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


/* ================= BASIC ROUTE ================= */

app.get(
  "/",
  (req, res) => {

    res.status(200).json({
      success: true,
      message:
        "SafeLink backend is running",
    });

  }
);


/* ================= HEALTH CHECK ================= */

app.get(
  "/health",
  (req, res) => {

    res.status(200).json({
      success: true,
      service:
        "SafeLink Backend",
      status:
        "healthy",
    });

  }
);


/* ================= API ROUTES ================= */

app.use(
  "/api/alerts",
  alertRoutes
);


app.use(
  "/api/messages",
  messageRoutes
);


/* ================= 404 HANDLER ================= */

app.use(
  (req, res) => {

    res.status(404).json({
      success: false,
      message:
        "Route not found.",
    });

  }
);


/* ================= ERROR HANDLER ================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Server error:",
      error
    );


    res.status(
      error.status || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error.",
    });

  }
);


/* ================= SERVER ================= */

/* ================= SERVER STARTUP ================= */

const startServer = async () => {

  const databaseConnected =
    await connectDB();


  if (!databaseConnected) {

    process.exit(1);

  }


  const server =
    app.listen(
      PORT
    );


  const shutdownServer =
    async () => {

      server.close(
        async () => {

          await mongoose.disconnect();

          process.exit(0);

        }
      );

    };


  process.on(
    "SIGINT",
    shutdownServer
  );


  process.on(
    "SIGTERM",
    shutdownServer
  );

};


startServer();

