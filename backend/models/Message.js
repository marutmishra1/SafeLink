const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    priority: {
      type: String,
      enum: [
        "low",
        "important",
        "critical",
      ],
      default: "low",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "received",
        "done",
      ],
      default: "pending",
    },

    received: {
      type: Boolean,
      default: false,
    },

    attachment: {
      fileName: {
        type: String,
        default: null,
      },

      fileType: {
        type: String,
        default: null,
      },

      fileUrl: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);