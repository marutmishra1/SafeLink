import {
    useContext,
    useRef,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { ThemeContext } from "../context/ThemeContext";

import Footer from "../components/Footer";

import {
    saveOfflineMessage,
} from "../utils/offlineQueue";

import useNetworkStatus from "../hooks/useNetworkStatus";


const API_URL =
    import.meta.env.VITE_API_URL;

function Emergency() {

    const { theme, changeTheme } =
        useContext(ThemeContext);


    const navigate =
        useNavigate();


    const isOnline =
        useNetworkStatus();


    const fileInputRef =
        useRef(null);


    const [alertType, setAlertType] =
        useState("Medical");


    const [message, setMessage] =
        useState("");


    const [locationEnabled, setLocationEnabled] =
        useState(false);


    const [attachment, setAttachment] =
        useState(null);


    const [attachmentPreview, setAttachmentPreview] =
        useState(null);


    const [sent, setSent] =
        useState(false);


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    // --------------------------------
    // ATTACHMENT SELECT
    // --------------------------------

    const handleAttachmentSelect =
        (event) => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            setAttachment(file);


            if (
                file.type.startsWith(
                    "image/"
                )
            ) {

                const previewUrl =
                    URL.createObjectURL(
                        file
                    );


                setAttachmentPreview(
                    previewUrl
                );

            } else {

                setAttachmentPreview(
                    null
                );

            }

        };


    // --------------------------------
    // REMOVE ATTACHMENT
    // --------------------------------

    const handleRemoveAttachment =
        () => {

            if (attachmentPreview) {

                URL.revokeObjectURL(
                    attachmentPreview
                );

            }


            setAttachment(null);

            setAttachmentPreview(
                null
            );


            if (
                fileInputRef.current
            ) {

                fileInputRef.current.value =
                    "";

            }

        };


    // --------------------------------
    // SEND ALERT
    // --------------------------------

    const handleSendAlert =
        async () => {

            if (!message.trim()) {

                return;

            }


            setLoading(true);

            setError("");


            const messageText =
                message.trim();


            try {

                const formData =
                    new FormData();


                formData.append(
                    "alertType",
                    alertType
                );


                formData.append(
                    "message",
                    messageText
                );


                formData.append(
                    "locationEnabled",
                    locationEnabled
                );


                if (locationEnabled) {

                    formData.append(
                        "location",
                        JSON.stringify({
                            latitude: null,
                            longitude: null,
                        })
                    );

                }


                if (attachment) {

                    formData.append(
                        "attachment",
                        attachment
                    );

                }


                // --------------------------------
                // OFFLINE
                // --------------------------------

                if (!isOnline) {

                    await saveOfflineMessage({

                        type: "alert",

                        alertType:
                            alertType,

                        text:
                            messageText,

                        locationEnabled:
                            locationEnabled,

                        location:
                            locationEnabled
                                ? {
                                    latitude: null,
                                    longitude: null,
                                }
                                : null,

                        attachment:
                            attachment || null,

                    });


                    


                    setLoading(false);

                    setSent(true);

                    /*
                     * IMPORTANT:
                     *
                     * DO NOT navigate to Messages.
                     *
                     * This alert has not been
                     * delivered yet.
                     */

                    return;

                }


                // --------------------------------
                // ONLINE
                // --------------------------------

                const response =
                    await fetch(
                        `${API_URL}/alerts`,
                        {
                            method: "POST",
                            body: formData,
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to create emergency alert."
                    );

                }


               


                setLoading(false);


                /*
                 * It actually reached
                 * the backend.
                 *
                 * NOW show it in Messages.
                 */

                navigate(
                    "/messages"
                );


            } catch (error) {

                console.error(
                    "Send emergency alert error:",
                    error
                );


                // --------------------------------
                // NETWORK FAILURE
                // --------------------------------

                try {

                    await saveOfflineMessage({

                        type: "alert",

                        alertType:
                            alertType,

                        text:
                            messageText,

                        locationEnabled:
                            locationEnabled,

                        location:
                            locationEnabled
                                ? {
                                    latitude: null,
                                    longitude: null,
                                }
                                : null,

                        attachment:
                            attachment || null,

                    });


                    


                    setError(
                        "Network unavailable. Your emergency alert has been saved to the Outbox and will be sent automatically when the connection returns."
                    );


                    setLoading(false);

                    setSent(true);


                    /*
                     * DO NOT navigate.
                     *
                     * It hasn't reached the
                     * backend yet.
                     */

                } catch (
                    storageError
                ) {

                    console.error(
                        "Offline storage error:",
                        storageError
                    );


                    setError(
                        error.message ||
                        "Failed to create emergency alert."
                    );


                    setLoading(false);

                }

            }

        };


    // --------------------------------
    // CREATE ANOTHER
    // --------------------------------

    const handleCreateAnother =
        () => {

            setSent(false);

            setMessage("");

            setAlertType(
                "Medical"
            );

            setLocationEnabled(
                false
            );

            handleRemoveAttachment();

            setError("");

        };


    return (

        <div className="app">

            <main className="emergency-page">

                <div className="container">

                    {/* TOP BAR */}

                    <div className="emergency-page-topbar">

                        <div className="emergency-page-brand">

                            <span className="brand-icon">
                                S
                            </span>

                            <span className="brand-name">
                                SafeLink
                            </span>

                        </div>


                        <select
                            className="theme-selector"
                            value={theme}
                            onChange={(event) =>
                                changeTheme(
                                    event.target.value
                                )
                            }
                            aria-label="Change theme"
                        >

                            <option value="light">
                                Light
                            </option>

                            <option value="dark">
                                Dark
                            </option>

                            <option value="amoled">
                                AMOLED
                            </option>

                        </select>

                    </div>


                    {/* HEADING */}

                    <div className="page-heading">

                        <span className="page-eyebrow">
                            Emergency Response
                        </span>


                        <h1>
                            Send an emergency alert
                        </h1>


                        <p>
                            Share critical information with nearby
                            devices when conventional connectivity
                            is unavailable.
                        </p>

                    </div>


                    {/* MAIN CARD */}

                    <div className="emergency-page-card">

                        {/* LEFT */}

                        <div className="emergency-page-info">

                            <div className="emergency-icon-large">
                                ⚠
                            </div>


                            <span className="emergency-label">
                                EMERGENCY NETWORK
                            </span>


                            <h2>
                                Need immediate assistance?
                            </h2>


                            <p>
                                Create an emergency alert with the
                                information responders and nearby
                                users need.
                            </p>


                            <div className="emergency-network-status">

                                <span className="status-dot">
                                </span>


                                <span>
                                    {isOnline
                                        ? "Network ready"
                                        : "Offline • Alert will be queued"}
                                </span>

                            </div>

                        </div>


                        {/* RIGHT */}

                        {!sent ? (

                            <div className="emergency-page-form">

                                {/* TYPE */}

                                <div className="form-group">

                                    <label htmlFor="emergency-type">
                                        Emergency type
                                    </label>


                                    <select
                                        id="emergency-type"
                                        value={alertType}
                                        onChange={(event) =>
                                            setAlertType(
                                                event.target.value
                                            )
                                        }
                                        className="form-control-custom"
                                    >

                                        <option value="Medical">
                                            Medical
                                        </option>

                                        <option value="Trapped">
                                            Trapped / Need Rescue
                                        </option>

                                        <option value="Fire">
                                            Fire
                                        </option>

                                        <option value="Flood">
                                            Flood
                                        </option>

                                        <option value="Accident">
                                            Accident
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                {/* MESSAGE */}

                                <div className="form-group">

                                    <label htmlFor="emergency-message">
                                        Emergency message
                                    </label>


                                    <textarea
                                        id="emergency-message"
                                        value={message}
                                        onChange={(event) =>
                                            setMessage(
                                                event.target.value
                                            )
                                        }
                                        className="form-control-custom"
                                        placeholder="Describe what is happening..."
                                        rows="6"
                                        maxLength="300"
                                    />


                                    <div className="character-count">
                                        {message.length}/300
                                    </div>

                                </div>


                                {/* ATTACHMENT */}

                                <div className="emergency-attachment">

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                        onChange={
                                            handleAttachmentSelect
                                        }
                                        hidden
                                    />


                                    {!attachment ? (

                                        <button
                                            type="button"
                                            className="attachment-upload-btn"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >

                                            <span className="attachment-icon">
                                                📎
                                            </span>


                                            <span>
                                                Attach image or file
                                            </span>

                                        </button>

                                    ) : (

                                        <div className="attachment-preview">

                                            <div className="attachment-preview-content">

                                                {attachmentPreview ? (

                                                    <img
                                                        src={
                                                            attachmentPreview
                                                        }
                                                        alt="Emergency attachment preview"
                                                        className="emergency-image-preview"
                                                    />

                                                ) : (

                                                    <div className="attachment-file-icon">
                                                        📎
                                                    </div>

                                                )}


                                                <div className="attachment-file-info">

                                                    <strong>
                                                        {
                                                            attachment.name
                                                        }
                                                    </strong>


                                                    <span>

                                                        {
                                                            (
                                                                attachment.size /
                                                                1024
                                                            ).toFixed(1)
                                                        }{" "}
                                                        KB

                                                    </span>

                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                className="remove-attachment-btn"
                                                onClick={
                                                    handleRemoveAttachment
                                                }
                                                aria-label="Remove attachment"
                                            >
                                                ×
                                            </button>

                                        </div>

                                    )}

                                </div>


                                {/* LOCATION */}

                                <label className="location-option">

                                    <input
                                        type="checkbox"
                                        checked={
                                            locationEnabled
                                        }
                                        onChange={(event) =>
                                            setLocationEnabled(
                                                event.target.checked
                                            )
                                        }
                                    />


                                    <span className="custom-checkbox">
                                    </span>


                                    <span>
                                        Share my location with this alert
                                    </span>

                                </label>


                                {/* ERROR */}

                                {error && (

                                    <div className="alert alert-danger mt-3">

                                        {error}

                                    </div>

                                )}


                                {/* SEND */}

                                <button
                                    type="button"
                                    className="send-alert-btn emergency-page-send"
                                    onClick={
                                        handleSendAlert
                                    }
                                    disabled={
                                        !message.trim() ||
                                        loading
                                    }
                                >

                                    <span>
                                        ⚠
                                    </span>


                                    {loading
                                        ? "Sending..."
                                        : isOnline
                                            ? "Send Emergency Alert"
                                            : "Save Emergency Alert"}

                                </button>

                            </div>

                        ) : (

                            <div className="emergency-page-success">

                                <div className="success-icon">
                                    ✓
                                </div>


                                <h2>

                                    {isOnline
                                        ? "Alert created successfully"
                                        : "Alert saved to Outbox"}

                                </h2>


                                <p>

                                    {isOnline

                                        ? "Your emergency alert has been transmitted through the SafeLink network."

                                        : "Your emergency alert is waiting in the Outbox. It will be transmitted automatically when the connection returns."}

                                </p>


                                <div className="alert-summary">

                                    <div>

                                        <span>
                                            Emergency type
                                        </span>

                                        <strong>
                                            {alertType}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Location sharing
                                        </span>

                                        <strong>

                                            {
                                                locationEnabled
                                                    ? "Enabled"
                                                    : "Disabled"
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Attachment
                                        </span>

                                        <strong>

                                            {
                                                attachment
                                                    ? "Attached"
                                                    : "None"
                                            }

                                        </strong>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={
                                        handleCreateAnother
                                    }
                                >
                                    Create Another Alert
                                </button>

                            </div>

                        )}

                    </div>

                </div>

            </main>


            <Footer />

        </div>

    );

}


export default Emergency;