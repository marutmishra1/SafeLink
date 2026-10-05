const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        alertType: {
            type: String,
            required: true,
            enum: [
                "Medical",
                "Trapped",
                "Fire",
                "Flood",
                "Accident",
                "Other",
            ],
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },

        priority: {
            type: String,
            enum: [
                "low",
                "important",
                "critical",
            ],
            default: "important",
        },

        locationEnabled: {
            type: Boolean,
            default: false,
        },

        location: {
            latitude: {
                type: Number,
                default: null,
            },

            longitude: {
                type: Number,
                default: null,
            },
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

        status: {
            type: String,
            enum: [
                "pending",
                "sent",
                "delivered",
                "resolved",
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Alert = mongoose.model(
    "Alert",
    alertSchema
);

module.exports = Alert;