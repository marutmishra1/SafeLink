const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  createAlert,
  getAlerts,
  getAlertById,
  updateAlertStatus,
} = require("../controllers/alertController");

const router = express.Router();


// Create emergency alert with optional attachment
router.post("/", upload.single("attachment"), createAlert);


// Get all emergency alerts
router.get("/", getAlerts);


// Get single emergency alert
router.get("/:id", getAlertById);


// Update emergency alert status
router.patch("/:id/status", updateAlertStatus);


module.exports = router;