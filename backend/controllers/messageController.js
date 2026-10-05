const Message = require("../models/Message");
const {
    analyzePriority,
} = require("../services/priorityService");


// ========================================
// CREATE MESSAGE
// ========================================

const createMessage = async (
    req,
    res
) => {

    try {

        const {
            sender,
            text,
            status,
            received,
        } = req.body;


        // -------------------------------
        // BASIC VALIDATION
        // -------------------------------

        if (
            typeof sender !== "string" ||
            !sender.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Sender is required.",
            });

        }


        if (
            typeof text !== "string" ||
            !text.trim()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Message text is required.",
            });

        }


        if (
            text.trim().length > 2000
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Message cannot exceed 2000 characters.",
            });

        }


        if (
            sender.trim().length > 100
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Sender name cannot exceed 100 characters.",
            });

        }


        // -------------------------------
        // STATUS VALIDATION
        // -------------------------------

        const allowedStatuses = [
            "pending",
            "received",
            "done",
        ];


        if (
            status &&
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid message status.",
            });

        }


        // -------------------------------
        // AI PRIORITY
        // -------------------------------

        const detectedPriority =
            await analyzePriority(
                text.trim()
            );


        // -------------------------------
        // ATTACHMENT
        // -------------------------------

        const attachment =
            req.file
                ? {
                    fileName:
                        req.file.originalname,

                    fileType:
                        req.file.mimetype,

                    fileUrl:
                        `/uploads/${req.file.filename}`,
                }
                : {};


        // -------------------------------
        // CREATE MESSAGE
        // -------------------------------

        const message =
            await Message.create({

                sender:
                    sender.trim(),

                text:
                    text.trim(),

                priority:
                    detectedPriority,

                status:
                    status ||
                    "pending",

                received:
                    received === "true" ||
                    received === true,

                attachment,

            });


        return res.status(201).json({

            success: true,

            message:
                "Message created successfully.",

            data:
                message,

        });


    } catch (error) {

        console.error(
            "Create message error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create message.",

            error:
                error.message,

        });

    }

};


// ========================================
// GET ALL MESSAGES
// ========================================

const getMessages = async (
    req,
    res
) => {

    try {

        const messages =
            await Message.find()
                .sort({
                    createdAt: 1,
                });


        return res.status(200).json({

            success: true,

            count:
                messages.length,

            messages,

        });


    } catch (error) {

        console.error(
            "Get messages error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch messages.",

            error:
                error.message,

        });

    }

};


// ========================================
// GET MESSAGE BY ID
// ========================================

const getMessageById = async (
    req,
    res
) => {

    try {

        const message =
            await Message.findById(
                req.params.id
            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found.",

            });

        }


        return res.status(200).json({

            success: true,

            message,

        });


    } catch (error) {

        console.error(
            "Get message error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch message.",

            error:
                error.message,

        });

    }

};


// ========================================
// UPDATE MESSAGE
// ========================================

const updateMessage = async (
    req,
    res
) => {

    try {

        const {
            text,
            priority,
            status,
            received,
        } = req.body;


        const updateData = {};


        // -------------------------------
        // TEXT VALIDATION
        // -------------------------------

        if (
            text !== undefined
        ) {

            if (
                typeof text !== "string" ||
                !text.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message text cannot be empty.",

                });

            }


            if (
                text.trim().length > 2000
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message cannot exceed 2000 characters.",

                });

            }


            updateData.text =
                text.trim();

        }


        // -------------------------------
        // PRIORITY VALIDATION
        // -------------------------------

        const allowedPriorities = [
            "low",
            "important",
            "critical",
        ];


        if (
            priority !== undefined
        ) {

            if (
                !allowedPriorities.includes(
                    priority
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid message priority.",

                });

            }


            updateData.priority =
                priority;

        }


        // -------------------------------
        // STATUS VALIDATION
        // -------------------------------

        const allowedStatuses = [
            "pending",
            "received",
            "done",
        ];


        if (
            status !== undefined
        ) {

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid message status.",

                });

            }


            updateData.status =
                status;

        }


        // -------------------------------
        // RECEIVED VALIDATION
        // -------------------------------

        if (
            received !== undefined
        ) {

            updateData.received =
                received === "true" ||
                received === true;

        }


        // -------------------------------
        // ATTACHMENT
        // -------------------------------

        if (req.file) {

            updateData.attachment = {

                fileName:
                    req.file.originalname,

                fileType:
                    req.file.mimetype,

                fileUrl:
                    `/uploads/${req.file.filename}`,

            };

        }


        // -------------------------------
        // UPDATE DATABASE
        // -------------------------------

        const message =
            await Message.findByIdAndUpdate(

                req.params.id,

                updateData,

                {
                    new: true,
                    runValidators: true,
                }

            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Message updated successfully.",

            data:
                message,

        });


    } catch (error) {

        console.error(
            "Update message error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update message.",

            error:
                error.message,

        });

    }

};


// ========================================
// UPDATE MESSAGE STATUS
// ========================================

const updateMessageStatus = async (
    req,
    res
) => {

    try {

        const {
            status,
        } = req.body;


        const allowedStatuses = [
            "pending",
            "received",
            "done",
        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid message status.",

            });

        }


        const message =
            await Message.findByIdAndUpdate(

                req.params.id,

                {
                    status,
                },

                {
                    new: true,
                    runValidators: true,
                }

            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                `Message marked as ${status}.`,

            data:
                message,

        });


    } catch (error) {

        console.error(
            "Update message status error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update message status.",

        });

    }

};


// ========================================
// DELETE MESSAGE
// ========================================

const deleteMessage = async (
    req,
    res
) => {

    try {

        const message =
            await Message.findByIdAndDelete(
                req.params.id
            );


        if (!message) {

            return res.status(404).json({

                success: false,

                message:
                    "Message not found.",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Message permanently deleted.",

        });


    } catch (error) {

        console.error(
            "Delete message error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete message.",

        });

    }

};


module.exports = {

    createMessage,

    getMessages,

    getMessageById,

    updateMessage,

    updateMessageStatus,

    deleteMessage,

};