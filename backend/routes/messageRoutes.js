const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  updateMessageStatus,
  deleteMessage,
} = require("../controllers/messageController");

const router = express.Router();


// Create message with optional attachment
router.post(
  "/",
  upload.single("attachment"),
  createMessage
);


// Get all messages
router.get("/", getMessages);


// Get single message
router.get("/:id", getMessageById);


// Update message
router.patch(
  "/:id",
  upload.single("attachment"),
  updateMessage
);


// Update message status
router.patch(
  "/:id/status",
  updateMessageStatus
);


// Delete message
router.delete(
  "/:id",
  deleteMessage
);


module.exports = router;