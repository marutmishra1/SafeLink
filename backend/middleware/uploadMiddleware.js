const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            "uploads/"
        );

    },


    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1e9
            ) +
            path.extname(
                file.originalname
            );

        cb(
            null,
            uniqueName
        );

    },

});


const allowedMimeTypes = [

    // Images
    "image/jpeg",
    "image/png",
    "image/webp",

    // PDF
    "application/pdf",

    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/webm",

];


const fileFilter = (
    req,
    file,
    cb
) => {

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        cb(
            null,
            true
        );

    } else {

        cb(
            new Error(
                "Unsupported file type."
            ),
            false
        );

    }

};


const upload = multer({

    storage,

    limits: {

        fileSize:
            10 * 1024 * 1024,

    },

    fileFilter,

});


module.exports = upload;