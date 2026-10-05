const Alert = require("../models/Alert");
const {
    analyzePriority,
} = require("../services/priorityService");

const createAlert = async (req, res) => {
    try {
        console.log("CREATE ALERT REQUEST RECEIVED");
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

        const {
            alertType,
            message,
            locationEnabled,
            location,
        } = req.body;

        // Basic validation
        if (!alertType) {
            return res.status(400).json({
                success: false,
                message: "Alert type is required.",
            });
        }

        if (!message || !String(message).trim()) {
            return res.status(400).json({
                success: false,
                message: "Emergency message is required.",
            });
        }

        // Parse location safely
        let parsedLocation = {
            latitude: null,
            longitude: null,
        };

        if (location) {
            try {
                const locationData =
                    typeof location === "string"
                        ? JSON.parse(location)
                        : location;

                if (
                    locationData &&
                    typeof locationData === "object"
                ) {
                    parsedLocation = {
                        latitude:
                            Number(
                                locationData.latitude
                            ),
                        longitude:
                            Number(
                                locationData.longitude
                            ),
                    };

                    if (
                        Number.isNaN(
                            parsedLocation.latitude
                        ) ||
                        Number.isNaN(
                            parsedLocation.longitude
                        )
                    ) {
                        parsedLocation = {
                            latitude: null,
                            longitude: null,
                        };
                    }
                }
            } catch (error) {
                console.log(
                    "Location parsing failed, continuing without location."
                );

                parsedLocation = {
                    latitude: null,
                    longitude: null,
                };
            }
        }

        // AI priority
        let priority = "important";

        try {
            priority =
                await analyzePriority(
                    String(message).trim()
                );
        } catch (error) {
            console.error(
                "Priority analysis failed:",
                error.message
            );

            priority = "important";
        }

        // Attachment
        let attachment = {
            fileName: null,
            fileType: null,
            fileUrl: null,
        };

        if (req.file) {
            attachment = {
                fileName:
                    req.file.originalname,
                fileType:
                    req.file.mimetype,
                fileUrl:
                    `/uploads/${req.file.filename}`,
            };
        }

        // Create alert
        const alert = await Alert.create({
            alertType:
                String(alertType).trim(),

            message:
                String(message).trim(),

            priority,

            locationEnabled:
                locationEnabled === true ||
                locationEnabled === "true",

            location: parsedLocation,

            attachment,

            status: "pending",
        });

        console.log(
            "ALERT CREATED:",
            alert._id
        );

        return res.status(201).json({
            success: true,
            message:
                "Emergency alert created successfully.",
            alert,
        });

    } catch (error) {
        console.error(
            "CREATE ALERT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create emergency alert.",
            error: error.message,
        });
    }
};


const getAlerts = async (req, res) => {
    try {
        const alerts =
            await Alert.find()
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            count: alerts.length,
            alerts,
        });

    } catch (error) {
        console.error(
            "GET ALERTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch emergency alerts.",
            error: error.message,
        });
    }
};


const getAlertById = async (req, res) => {
    try {
        const alert =
            await Alert.findById(
                req.params.id
            );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message:
                    "Alert not found.",
            });
        }

        return res.status(200).json({
            success: true,
            alert,
        });

    } catch (error) {
        console.error(
            "GET ALERT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch emergency alert.",
            error: error.message,
        });
    }
};


const updateAlertStatus = async (
    req,
    res
) => {
    try {
        const {
            status,
        } = req.body;

        const allowedStatuses = [
            "pending",
            "sent",
            "delivered",
            "resolved",
        ];

        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid alert status.",
            });
        }

        const alert =
            await Alert.findByIdAndUpdate(
                req.params.id,
                {
                    status,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message:
                    "Alert not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Alert status updated successfully.",
            alert,
        });

    } catch (error) {
        console.error(
            "UPDATE ALERT STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update alert status.",
            error: error.message,
        });
    }
};


module.exports = {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlertStatus,
};