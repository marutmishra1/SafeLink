import {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { ThemeContext } from "../context/ThemeContext";
import Footer from "../components/Footer";

import {
    saveOfflineMessage,
} from "../utils/offlineQueue";

import useNetworkStatus from "../hooks/useNetworkStatus";


const API_URL =
    import.meta.env.VITE_API_URL;

const BACKEND_URL =
    API_URL.replace(/\/api$/, "");


function Messages() {

    const { theme, changeTheme } =
        useContext(ThemeContext);

    const isOnline =
        useNetworkStatus();

    const fileInputRef =
        useRef(null);


    const [message, setMessage] =
        useState("");

    const [attachment, setAttachment] =
        useState(null);

    const [attachmentPreview, setAttachmentPreview] =
        useState(null);

    const [activeFilter, setActiveFilter] =
        useState("all");

    const [messages, setMessages] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // --------------------------------
    // FORMAT NORMAL MESSAGE
    // --------------------------------

    const formatMessage = (item) => {

        let formattedAttachment = null;

        if (
            item.attachment &&
            item.attachment.fileName
        ) {

            formattedAttachment = {

                name:
                    item.attachment.fileName,

                type:
                    item.attachment.fileType || "",

                url:
                    item.attachment.fileUrl
                        ? `${BACKEND_URL}${item.attachment.fileUrl}`
                        : null,

            };

        }


        return {

            id:
                item._id || item.id,

            _id:
                item._id,

            sender:
                item.sender,

            text:
                item.text,

            attachment:
                formattedAttachment,

            priority:
                item.priority || "important",

            received:
                item.received ??
                item.sender !== "You",

            status:
                item.status || "pending",

            time:
                item.createdAt
                    ? new Date(
                        item.createdAt
                    ).toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )
                    : "Now",

            createdAt:
                item.createdAt,

            isAlert:
                false,

        };

    };


    // --------------------------------
    // FORMAT EMERGENCY ALERT
    // --------------------------------

    const formatAlert = (alert) => {

        let formattedAttachment = null;

        if (
            alert.attachment &&
            alert.attachment.fileName
        ) {

            formattedAttachment = {

                name:
                    alert.attachment.fileName,

                type:
                    alert.attachment.fileType || "",

                url:
                    alert.attachment.fileUrl
                        ? `${BACKEND_URL}${alert.attachment.fileUrl}`
                        : null,

            };

        }


        return {

            id:
                `alert-${alert._id}`,

            _id:
                alert._id,

            sender:
                "Emergency Alert",

            text:
                alert.message,

            attachment:
                formattedAttachment,

            priority:
                alert.priority || "important",

            received:
                true,

            status:
                alert.status || "pending",

            time:
                alert.createdAt
                    ? new Date(
                        alert.createdAt
                    ).toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )
                    : "Now",

            createdAt:
                alert.createdAt,

            isAlert:
                true,

            alertType:
                alert.alertType,

            locationEnabled:
                alert.locationEnabled,

            location:
                alert.location,

        };

    };


    // --------------------------------
    // FETCH MESSAGES + ALERTS
    // --------------------------------

    useEffect(() => {

        const fetchMessages = async () => {

            try {

                const [
                    messagesResponse,
                    alertsResponse,
                ] = await Promise.all([

                    fetch(
                        `${API_URL}/messages`
                    ),

                    fetch(
                        `${API_URL}/alerts`
                    ),

                ]);


                const messagesData =
                    await messagesResponse.json();

                const alertsData =
                    await alertsResponse.json();


                if (!messagesResponse.ok) {

                    throw new Error(
                        messagesData.message ||
                        "Failed to fetch messages."
                    );

                }


                if (!alertsResponse.ok) {

                    throw new Error(
                        alertsData.message ||
                        "Failed to fetch emergency alerts."
                    );

                }


                const normalMessages =
                    Array.isArray(
                        messagesData.messages
                    )
                        ? messagesData.messages.map(
                            formatMessage
                        )
                        : [];


                const emergencyAlerts =
                    Array.isArray(
                        alertsData.alerts
                    )
                        ? alertsData.alerts
                            .filter(
                                (alert) =>
                                    alert.status !==
                                    "resolved"
                            )
                            .map(
                                formatAlert
                            )
                        : [];


                const allMessages = [

                    ...normalMessages,

                    ...emergencyAlerts,

                ].sort(

                    (a, b) =>

                        new Date(
                            b.createdAt
                        ) -

                        new Date(
                            a.createdAt
                        )

                );


                setMessages(
                    allMessages
                );


            } catch (error) {

                console.error(
                    "Fetch messages error:",
                    error
                );


            } finally {

                setLoading(false);

            }

        };


        fetchMessages();


        const intervalId =
            setInterval(
                fetchMessages,
                5000
            );


        return () => {

            clearInterval(
                intervalId
            );

        };

    }, []);


    // --------------------------------
    // ATTACHMENT SELECT
    // --------------------------------

    const handleAttachmentSelect = (
        event
    ) => {

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

    const handleRemoveAttachment = () => {

        if (attachmentPreview) {

            URL.revokeObjectURL(
                attachmentPreview
            );

        }


        setAttachment(null);

        setAttachmentPreview(null);


        if (fileInputRef.current) {

            fileInputRef.current.value =
                "";

        }

    };


    // --------------------------------
    // SEND NORMAL MESSAGE
    // --------------------------------

    const handleSendMessage = async () => {

        if (
            !message.trim() &&
            !attachment
        ) {

            return;

        }


        const messageText =
            message.trim() ||
            "Attachment sent";


        try {

            const formData =
                new FormData();


            formData.append(
                "sender",
                "You"
            );


            formData.append(
                "text",
                messageText
            );


            if (attachment) {

                formData.append(
                    "attachment",
                    attachment
                );

            }


            // OFFLINE

            if (!isOnline) {

                await saveOfflineMessage({

                    type:
                        "message",

                    sender:
                        "You",

                    text:
                        messageText,

                });


                setMessage("");

                handleRemoveAttachment();


                alert(
                    "You are offline. Message saved and will be sent when the connection returns."
                );


                return;

            }


            // ONLINE

            const response =
                await fetch(
                    `${API_URL}/messages`,
                    {
                        method:
                            "POST",

                        body:
                            formData,
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to send message."
                );

            }


            const newMessage =
                formatMessage(
                    data.data
                );


            setMessages(
                (previousMessages) => [

                    ...previousMessages,

                    newMessage,

                ]
            );


            setMessage("");

            handleRemoveAttachment();


        } catch (error) {

            console.error(
                "Send message error:",
                error
            );


            try {

                await saveOfflineMessage({

                    type:
                        "message",

                    sender:
                        "You",

                    text:
                        messageText,

                });


                setMessage("");

                handleRemoveAttachment();


                alert(
                    "Connection failed. Message saved locally and will be sent when the connection returns."
                );


            } catch (
            storageError
            ) {

                console.error(
                    "Offline storage error:",
                    storageError
                );


                alert(
                    error.message ||
                    "Failed to send message."
                );

            }

        }

    };


    // --------------------------------
    // DONE / RESOLVE
    // --------------------------------

    const handleMarkDone = async (
        messageId
    ) => {

        try {

            const currentMessage =
                messages.find(
                    (item) =>
                        item.id ===
                        messageId
                );


            if (!currentMessage) {

                return;

            }


            let response;


            if (
                currentMessage.isAlert
            ) {

                response =
                    await fetch(
                        `${API_URL}/alerts/${currentMessage._id}/status`,
                        {
                            method:
                                "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    status:
                                        "resolved",
                                }),

                        }
                    );


            } else {

                response =
                    await fetch(
                        `${API_URL}/messages/${currentMessage._id}/status`,
                        {
                            method:
                                "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    status:
                                        "done",
                                }),

                        }
                    );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update message."
                );

            }


            setMessages(
                (previousMessages) =>

                    previousMessages.map(
                        (item) =>

                            item.id ===
                                messageId

                                ? {
                                    ...item,

                                    status:
                                        currentMessage.isAlert
                                            ? "resolved"
                                            : "done",
                                }

                                : item
                    )
            );


        } catch (error) {

            console.error(
                "Update message error:",
                error
            );


            alert(
                error.message ||
                "Failed to update message."
            );

        }

    };


    // --------------------------------
    // ENTER KEY
    // --------------------------------

    const handleKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSendMessage();

        }

    };


    // --------------------------------
    // FILTER
    // --------------------------------

    const filteredMessages =

        activeFilter === "all"

            ? messages.filter(
                (item) =>
                    item.status !==
                    "done" &&
                    item.status !==
                    "resolved"
            )

            : messages.filter(
                (item) =>
                    item.priority ===
                    activeFilter &&
                    item.status !==
                    "done" &&
                    item.status !==
                    "resolved"
            );


    return (

        <div className="app">

            <main className="message-page">

                <div className="container">

                    {/* TOP BAR */}

                    <div className="message-page-topbar">

                        <div className="message-page-brand">

                            <span className="brand-icon">
                                S
                            </span>

                            <span className="brand-name">
                                SafeLink
                            </span>

                        </div>


                        <div
                            style={{
                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                gap:
                                    "12px",
                            }}
                        >

                            {/* NETWORK STATUS */}

                            <div className="network-status">

                                <span
                                    className={
                                        isOnline
                                            ? "network-dot online"
                                            : "network-dot offline"
                                    }
                                />

                                <span>

                                    {isOnline
                                        ? "Online"
                                        : "Offline • Messages will be queued"}

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

                    </div>


                    {/* HEADING */}

                    <div className="page-heading">

                        <span className="page-eyebrow">
                            SafeLink Communication
                        </span>

                        <h1>
                            Messages
                        </h1>

                        <p>
                            Exchange information with nearby
                            devices through the SafeLink network.
                        </p>

                    </div>


                    {/* MESSAGE CARD */}

                    <div className="message-card">

                        <div className="message-card-header">

                            <div className="message-user">

                                <div className="device-avatar">
                                    N
                                </div>

                                <div>

                                    <h2>
                                        Nearby Device
                                    </h2>

                                    <div className="device-status">

                                        <span className="status-dot">
                                        </span>

                                        <span>

                                            {isOnline
                                                ? "Connected"
                                                : "Offline"}

                                        </span>

                                    </div>

                                </div>

                            </div>


                            <div className="connection-info">

                                {isOnline
                                    ? "Local Network"
                                    : "Offline Mode"}

                            </div>

                        </div>


                        {/* FILTERS */}

                        <div className="message-filters">

                            <button
                                type="button"
                                className={
                                    activeFilter === "all"
                                        ? "filter-btn active"
                                        : "filter-btn"
                                }
                                onClick={() =>
                                    setActiveFilter(
                                        "all"
                                    )
                                }
                            >
                                All
                            </button>


                            <button
                                type="button"
                                className={
                                    activeFilter ===
                                        "critical"
                                        ? "filter-btn active critical"
                                        : "filter-btn critical"
                                }
                                onClick={() =>
                                    setActiveFilter(
                                        "critical"
                                    )
                                }
                            >
                                🔴 Critical
                            </button>


                            <button
                                type="button"
                                className={
                                    activeFilter ===
                                        "important"
                                        ? "filter-btn active important"
                                        : "filter-btn important"
                                }
                                onClick={() =>
                                    setActiveFilter(
                                        "important"
                                    )
                                }
                            >
                                🟠 Important
                            </button>


                            <button
                                type="button"
                                className={
                                    activeFilter === "low"
                                        ? "filter-btn active low"
                                        : "filter-btn low"
                                }
                                onClick={() =>
                                    setActiveFilter(
                                        "low"
                                    )
                                }
                            >
                                🟢 Low
                            </button>

                        </div>


                        {/* MESSAGES */}

                        <div className="messages-container">

                            {loading ? (

                                <div className="no-messages">

                                    <span>
                                        ⏳
                                    </span>

                                    <p>
                                        Loading messages...
                                    </p>

                                </div>

                            ) : filteredMessages.length === 0 ? (

                                <div className="no-messages">

                                    <span>
                                        📭
                                    </span>

                                    <p>
                                        No active messages in this category.
                                    </p>

                                </div>

                            ) : (

                                filteredMessages.map(
                                    (item) => (

                                        <div
                                            key={item.id}
                                            className={
                                                `message-row ${item.received
                                                    ? "received"
                                                    : "sent"
                                                }`
                                            }
                                        >

                                            <div className="message-bubble">

                                                {/* ALERT LABEL */}

                                                {item.isAlert && (

                                                    <div className="emergency-message-label">

                                                        🚨 Emergency Alert

                                                        {item.alertType &&
                                                            ` • ${item.alertType}`}

                                                    </div>

                                                )}


                                                {/* PRIORITY */}

                                                <div
                                                    className={
                                                        `message-priority ${item.priority}`
                                                    }
                                                >

                                                    {item.priority ===
                                                        "critical" &&
                                                        "🔴 Critical"}

                                                    {item.priority ===
                                                        "important" &&
                                                        "🟠 Important"}

                                                    {item.priority ===
                                                        "low" &&
                                                        "🟢 Low"}

                                                </div>


                                                {/* TEXT */}

                                                {item.text && (

                                                    <p>
                                                        {item.text}
                                                    </p>

                                                )}


                                                {/* LOCATION */}

                                                {item.isAlert &&
                                                    item.locationEnabled && (

                                                        <div className="message-location">

                                                            📍 Location shared

                                                        </div>

                                                    )}


                                                {/* ATTACHMENT */}

                                                {item.attachment && (

                                                    <div className="message-attachment">

                                                        {item.attachment.type?.startsWith(
                                                            "image/"
                                                        ) ? (

                                                            <img
                                                                src={
                                                                    item
                                                                        .attachment
                                                                        .url
                                                                }
                                                                alt={
                                                                    item
                                                                        .attachment
                                                                        .name
                                                                }
                                                                className="message-image"
                                                            />

                                                        ) : (

                                                            <div className="message-file">

                                                                <span>
                                                                    📎
                                                                </span>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            item
                                                                                .attachment
                                                                                .name
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        File attachment
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        )}

                                                    </div>

                                                )}


                                                {/* TIME */}

                                                <span className="message-time">

                                                    {item.time}

                                                </span>


                                                {/* DONE */}

                                                {item.status !==
                                                    "done" &&
                                                    item.status !==
                                                    "resolved" && (

                                                        <button
                                                            type="button"
                                                            className="message-done-btn"
                                                            onClick={() =>
                                                                handleMarkDone(
                                                                    item.id
                                                                )
                                                            }
                                                        >

                                                            ✓{" "}

                                                            {item.isAlert
                                                                ? "Resolve Alert"
                                                                : "Done"}

                                                        </button>

                                                    )}

                                            </div>

                                        </div>

                                    )

                                )

                            )}

                        </div>


                        {/* SELECTED FILE */}

                        {attachment && (

                            <div className="selected-file-preview">

                                <div className="selected-file-info">

                                    {attachmentPreview ? (

                                        <img
                                            src={
                                                attachmentPreview
                                            }
                                            alt="Selected attachment"
                                            className="selected-image-preview"
                                        />

                                    ) : (

                                        <div className="selected-file-icon">
                                            📎
                                        </div>

                                    )}


                                    <div>

                                        <strong>
                                            {attachment.name}
                                        </strong>

                                        <small>

                                            {
                                                (
                                                    attachment.size /
                                                    1024
                                                ).toFixed(1)
                                            }{" "}
                                            KB

                                        </small>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="remove-file-btn"
                                    onClick={
                                        handleRemoveAttachment
                                    }
                                    aria-label="Remove attachment"
                                >
                                    ×
                                </button>

                            </div>

                        )}


                        {/* INPUT */}

                        <div className="message-input-area">

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/wav,audio/ogg,audio/webm"
                                onChange={
                                    handleAttachmentSelect
                                }
                                hidden
                            />


                            <button
                                type="button"
                                className="attachment-btn"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                aria-label="Attach image or file"
                                title="Attach image or file"
                            >
                                📎
                            </button>


                            <textarea
                                value={message}
                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                placeholder="Write a message..."
                                rows="1"
                                maxLength="500"
                            />


                            <button
                                type="button"
                                className="message-send-btn"
                                onClick={
                                    handleSendMessage
                                }
                                disabled={
                                    !message.trim() &&
                                    !attachment
                                }
                                aria-label="Send message"
                            >
                                ➤
                            </button>

                        </div>

                    </div>

                </div>

            </main>


            <Footer />

        </div>

    );

}


export default Messages;