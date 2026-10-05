import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    QRCodeCanvas,
} from "qrcode.react";

import {
    Html5Qrcode,
} from "html5-qrcode";

import {
    createPeerConnection,
    createDataChannel,
    handleIncomingChannel,
    createOffer,
    acceptOffer,
    acceptAnswer,
    sendPeerMessage,
    getPeerConnection,
    getDataChannel,
    closePeerConnection,
} from "../services/peerConnection";

import "./OfflineTest.css";


function OfflineTest() {

    const [isOnline, setIsOnline] =
        useState(navigator.onLine);

    const [role, setRole] =
        useState(null);

    const [offer, setOffer] =
        useState("");

    const [answer, setAnswer] =
        useState("");

    const [connectionState, setConnectionState] =
        useState("Ready");

    const [peerState, setPeerState] =
        useState("new");

    const [dataChannelState, setDataChannelState] =
        useState("closed");

    const [message, setMessage] =
        useState("");

    const [receivedMessages, setReceivedMessages] =
        useState([]);

    const [sentCount, setSentCount] =
        useState(0);

    const [scannerOpen, setScannerOpen] =
        useState(false);

    const [webrtcSupported] =
        useState(
            typeof RTCPeerConnection !==
            "undefined"
        );

    const scannerRef =
        useRef(null);


    /*
     * ========================================
     * STOP SCANNER
     * ========================================
     */

    async function stopScanner() {

        if (!scannerRef.current) {
            return;
        }


        try {

            if (
                scannerRef.current.isScanning
            ) {

                await scannerRef.current.stop();

            }


            await scannerRef.current.clear();

        } catch {
            /*
             * Scanner may already
             * be stopped.
             */
        }


        scannerRef.current =
            null;

    }


    /*
     * ========================================
     * NETWORK STATUS
     * ========================================
     */

    useEffect(() => {

        function handleOnline() {

            setIsOnline(true);

        }


        function handleOffline() {

            setIsOnline(false);

        }


        window.addEventListener(
            "online",
            handleOnline
        );

        window.addEventListener(
            "offline",
            handleOffline
        );


        return () => {

            window.removeEventListener(
                "online",
                handleOnline
            );

            window.removeEventListener(
                "offline",
                handleOffline
            );

        };

    }, []);


    /*
     * ========================================
     * CLEANUP
     * ========================================
     */

    useEffect(() => {

        return () => {

            closePeerConnection();

            stopScanner();

        };

    }, []);


    /*
     * ========================================
     * MONITOR REAL WEBRTC CONNECTION
     * ========================================
     */

    function monitorPeerConnection() {

        const peer =
            getPeerConnection();


        if (!peer) {
            return;
        }


        setPeerState(
            peer.connectionState
        );


        peer.onconnectionstatechange =
            () => {

                const state =
                    peer.connectionState;


                setPeerState(
                    state
                );


                if (
                    state === "connected"
                ) {

                    setConnectionState(
                        "Connected"
                    );

                }


                if (
                    state === "connecting"
                ) {

                    setConnectionState(
                        "Connecting..."
                    );

                }


                if (
                    state === "disconnected"
                ) {

                    setConnectionState(
                        "Disconnected"
                    );

                }


                if (
                    state === "failed"
                ) {

                    setConnectionState(
                        "Connection failed"
                    );

                }


                if (
                    state === "closed"
                ) {

                    setConnectionState(
                        "Disconnected"
                    );

                }

            };

    }


    /*
     * ========================================
     * CHECK DATA CHANNEL
     * ========================================
     */

    function refreshDataChannelState() {

        const channel =
            getDataChannel();


        if (!channel) {

            setDataChannelState(
                "closed"
            );

            return;

        }


        setDataChannelState(
            channel.readyState
        );

    }


    /*
     * ========================================
     * DEVICE A
     * ========================================
     */

    async function startDeviceA() {

        try {

            setRole("sender");

            setConnectionState(
                "Creating connection..."
            );


            createPeerConnection();


            monitorPeerConnection();


            createDataChannel(

                (incomingMessage) => {

                    setReceivedMessages(
                        (previousMessages) => [
                            ...previousMessages,
                            incomingMessage,
                        ]
                    );

                },


                () => {

                    setDataChannelState(
                        "open"
                    );

                    setConnectionState(
                        "Connected"
                    );

                },


                () => {

                    setDataChannelState(
                        "closed"
                    );

                    setConnectionState(
                        "Disconnected"
                    );

                }

            );


            const newOffer =
                await createOffer();


            setOffer(
                JSON.stringify(
                    newOffer
                )
            );


            setConnectionState(
                "Waiting for device"
            );


            refreshDataChannelState();

        } catch {

            setConnectionState(
                "Connection failed"
            );

        }

    }


    /*
     * ========================================
     * DEVICE B
     * ========================================
     */

    function startDeviceB() {

        setRole("receiver");

        setConnectionState(
            "Searching for device"
        );

        startScanner();

    }


    /*
     * ========================================
     * DEVICE B ACCEPTS OFFER
     * ========================================
     */

    async function handleScannedOffer(
        scannedValue
    ) {

        try {

            await stopScanner();

            setScannerOpen(false);


            setConnectionState(
                "Connecting..."
            );


            createPeerConnection();


            monitorPeerConnection();


            handleIncomingChannel(

                (incomingMessage) => {

                    setReceivedMessages(
                        (previousMessages) => [
                            ...previousMessages,
                            incomingMessage,
                        ]
                    );

                },


                () => {

                    setDataChannelState(
                        "open"
                    );

                    setConnectionState(
                        "Connected"
                    );

                },


                () => {

                    setDataChannelState(
                        "closed"
                    );

                    setConnectionState(
                        "Disconnected"
                    );

                }

            );


            const parsedOffer =
                JSON.parse(
                    scannedValue
                );


            const newAnswer =
                await acceptOffer(
                    parsedOffer
                );


            setAnswer(
                JSON.stringify(
                    newAnswer
                )
            );


            setConnectionState(
                "Waiting for confirmation"
            );


        } catch {

            setConnectionState(
                "Pairing failed"
            );

        }

    }


    /*
     * ========================================
     * DEVICE A SCANS ANSWER
     * ========================================
     */

    function startAnswerScanner() {

        setScannerOpen(true);

        setConnectionState(
            "Scanning connection"
        );


        setTimeout(() => {

            startScanner(
                handleScannedAnswer
            );

        }, 100);

    }


    /*
     * ========================================
     * ACCEPT ANSWER
     * ========================================
     */

    async function handleScannedAnswer(
        scannedValue
    ) {

        try {

            await stopScanner();

            setScannerOpen(false);


            const parsedAnswer =
                JSON.parse(
                    scannedValue
                );


            await acceptAnswer(
                parsedAnswer
            );


            setConnectionState(
                "Connecting..."
            );


            monitorPeerConnection();


            refreshDataChannelState();

        } catch {

            setConnectionState(
                "Pairing failed"
            );

        }

    }


    /*
     * ========================================
     * QR SCANNER
     * ========================================
     */

    function startScanner(
        callback = handleScannedOffer
    ) {

        setScannerOpen(true);


        setTimeout(
            async () => {

                try {

                    const scanner =
                        new Html5Qrcode(
                            "safelink-qr-reader"
                        );


                    scannerRef.current =
                        scanner;


                    await scanner.start(

                        {
                            facingMode:
                                "environment",
                        },


                        {
                            fps: 10,

                            qrbox: {
                                width: 250,
                                height: 250,
                            },

                        },


                        (
                            decodedText
                        ) => {

                            callback(
                                decodedText
                            );

                        },


                        () => {
                            /*
                             * Scanner continues
                             * silently.
                             */
                        }

                    );

                } catch {

                    scannerRef.current =
                        null;

                    setScannerOpen(
                        false
                    );

                    setConnectionState(
                        "Camera unavailable"
                    );

                }

            },
            100
        );

    }


    /*
     * ========================================
     * SEND MESSAGE
     * ========================================
     */

    function handleSend() {

        if (
            !message.trim()
        ) {

            return;

        }


        try {

            sendPeerMessage({

                type: "message",

                text:
                    message.trim(),

                sender:
                    "SafeLink Device",

                createdAt:
                    new Date().toISOString(),

            });


            setSentCount(
                (count) =>
                    count + 1
            );


            setMessage("");

        } catch {

            setConnectionState(
                "Connection unavailable"
            );

        }

    }


    /*
     * ========================================
     * ENTER KEY
     * ========================================
     */

    function handleMessageKeyDown(
        event
    ) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    }


    /*
     * ========================================
     * REAL ANALYSIS VALUES
     * ========================================
     */

    const isConnected =
        dataChannelState === "open";


    const nearbyDevices =
        isConnected
            ? 1
            : 0;


    const networkText =
        isOnline
            ? "Available"
            : "Offline";


    const peerText =
        isConnected
            ? "Connected"
            : "Waiting";


    const channelText =
        dataChannelState === "open"
            ? "Open"
            : dataChannelState === "connecting"
                ? "Connecting"
                : "Closed";


    return (

        <div className="offline-test-page">

            <div className="offline-test-container">


                {/* =================================
                    LIVE NETWORK DASHBOARD
                ================================= */}

                <section
                    className={`network-dashboard ${
                        isConnected
                            ? "network-connected"
                            : ""
                    }`}
                >

                    <div className="network-dashboard-header">

                        <div>

                            <span className="network-eyebrow">
                                NETWORK STATUS
                            </span>


                            <h1>
                                {connectionState}
                            </h1>

                        </div>


                        <span
                            className={`network-live-dot ${
                                isOnline
                                    ? "online"
                                    : "offline"
                            }`}
                        />

                    </div>


                    {/* =================================
                        LIVE RADAR
                    ================================= */}

                    <div className="network-radar">

                        <div className="radar-scan" />


                        <div className="radar-ring radar-ring-one" />

                        <div className="radar-ring radar-ring-two" />


                        {isConnected && (

                            <>

                                <div className="radar-device radar-device-top">
                                    <span />
                                </div>


                                <div className="radar-device radar-device-right">
                                    <span />
                                </div>


                                <div className="radar-device radar-device-bottom">
                                    <span />
                                </div>


                                <div className="radar-device radar-device-left">
                                    <span />
                                </div>

                            </>

                        )}


                        <div
                            className={`radar-center ${
                                isConnected
                                    ? "connected"
                                    : ""
                            }`}
                        >

                            <span>
                                📡
                            </span>

                        </div>

                    </div>


                    {/* =================================
                        LIVE ANALYSIS
                    ================================= */}

                    <div className="network-analysis">


                        <div className="network-analysis-item">

                            <span>
                                Nearby devices
                            </span>

                            <strong>
                                {String(
                                    nearbyDevices
                                ).padStart(2, "0")}
                            </strong>

                        </div>


                        <div className="network-analysis-item">

                            <span>
                                Network
                            </span>

                            <strong>
                                {networkText}
                            </strong>

                        </div>


                        <div className="network-analysis-item">

                            <span>
                                WebRTC
                            </span>

                            <strong>
                                {webrtcSupported
                                    ? "Supported"
                                    : "Unavailable"}
                            </strong>

                        </div>


                        <div className="network-analysis-item">

                            <span>
                                P2P
                            </span>

                            <strong>
                                {peerText}
                            </strong>

                        </div>


                        <div className="network-analysis-item">

                            <span>
                                DataChannel
                            </span>

                            <strong>
                                {channelText}
                            </strong>

                        </div>


                        <div className="network-analysis-item">

                            <span>
                                Sent
                            </span>

                            <strong>
                                {sentCount}
                            </strong>

                        </div>


                        <div className="network-analysis-item">

                            <span>
                                Received
                            </span>

                            <strong>
                                {receivedMessages.length}
                            </strong>

                        </div>


                        <div className="network-analysis-item">

                            <span>
                                Connection
                            </span>

                            <strong>
                                {peerState}
                            </strong>

                        </div>

                    </div>


                    {/* =================================
                        START ACTIONS
                    ================================= */}

                    {!role && (

                        <div className="network-actions">

                            <button
                                type="button"
                                className="p2p-btn"
                                onClick={
                                    startDeviceA
                                }
                            >
                                📱 Start Pairing
                            </button>


                            <button
                                type="button"
                                className="p2p-btn secondary"
                                onClick={
                                    startDeviceB
                                }
                            >
                                🔎 Find Device
                            </button>

                        </div>

                    )}

                </section>


                {/* =================================
                    DEVICE A
                ================================= */}

                {role === "sender" &&
                !isConnected && (

                    <section className="p2p-card">

                        <span className="network-eyebrow">
                            DEVICE CONNECTION
                        </span>


                        <h2>
                            Connect Nearby Device
                        </h2>


                        <p className="p2p-description">
                            Let the nearby SafeLink
                            device scan this QR code.
                        </p>


                        {offer && (

                            <div className="qr-pairing-area">

                                <div className="qr-code-box">

                                    <QRCodeCanvas
                                        value={offer}
                                        size={250}
                                        level="M"
                                    />

                                </div>


                                <p className="qr-help-text">
                                    Scan this code from
                                    Device B.
                                </p>

                            </div>

                        )}


                        <button
                            type="button"
                            className="p2p-btn"
                            onClick={
                                startAnswerScanner
                            }
                        >
                            Scan Connection QR
                        </button>


                        {scannerOpen && (

                            <div className="qr-scanner-area">

                                <div
                                    id="safelink-qr-reader"
                                />


                                <button
                                    type="button"
                                    className="p2p-btn secondary"
                                    onClick={() => {

                                        stopScanner();

                                        setScannerOpen(
                                            false
                                        );

                                    }}
                                >
                                    Cancel
                                </button>

                            </div>

                        )}

                    </section>

                )}


                {/* =================================
                    DEVICE B
                ================================= */}

                {role === "receiver" &&
                !isConnected && (

                    <section className="p2p-card">

                        <span className="network-eyebrow">
                            DEVICE DISCOVERY
                        </span>


                        <h2>
                            Find Nearby Device
                        </h2>


                        <p className="p2p-description">
                            Scan the QR code displayed
                            by the other SafeLink device.
                        </p>


                        {scannerOpen && (

                            <div className="qr-scanner-area">

                                <div
                                    id="safelink-qr-reader"
                                />


                                <button
                                    type="button"
                                    className="p2p-btn secondary"
                                    onClick={() => {

                                        stopScanner();

                                        setScannerOpen(
                                            false
                                        );

                                    }}
                                >
                                    Cancel
                                </button>

                            </div>

                        )}


                        {answer && (

                            <div className="qr-pairing-area">

                                <p className="p2p-description">
                                    Show this connection
                                    QR code to Device A.
                                </p>


                                <div className="qr-code-box">

                                    <QRCodeCanvas
                                        value={answer}
                                        size={250}
                                        level="M"
                                    />

                                </div>

                            </div>

                        )}

                    </section>

                )}


                {/* =================================
                    CONNECTED COMMUNICATION
                ================================= */}

                {isConnected && (

                    <section className="p2p-card">

                        <div className="connected-header">

                            <div>

                                <span className="network-eyebrow">
                                    P2P CONNECTION
                                </span>


                                <h2>
                                    Nearby Device Connected
                                </h2>

                            </div>


                            <span className="connected-badge">
                                ● Connected
                            </span>

                        </div>


                        <p className="p2p-description">
                            SafeLink is communicating
                            directly with the connected
                            device.
                        </p>


                        <div className="message-stat-grid">

                            <div>

                                <span>
                                    Messages Sent
                                </span>

                                <strong>
                                    {sentCount}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Messages Received
                                </span>

                                <strong>
                                    {receivedMessages.length}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Channel
                                </span>

                                <strong>
                                    OPEN
                                </strong>

                            </div>

                        </div>


                        <div className="p2p-message-row">

                            <input
                                className="p2p-message-input"
                                type="text"
                                value={message}
                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }
                                onKeyDown={
                                    handleMessageKeyDown
                                }
                                placeholder="Send a P2P message..."
                            />


                            <button
                                type="button"
                                className="p2p-btn"
                                onClick={
                                    handleSend
                                }
                            >
                                Send
                            </button>

                        </div>


                        <div className="p2p-divider" />


                        <h2>
                            Received Messages
                        </h2>


                        {receivedMessages.length ===
                        0 ? (

                            <div className="empty-p2p">
                                No messages received yet.
                            </div>

                        ) : (

                            receivedMessages.map(
                                (
                                    item,
                                    index
                                ) => (

                                    <div
                                        className="received-message"
                                        key={index}
                                    >

                                        <div className="received-message-sender">
                                            {item.sender}
                                        </div>


                                        <p className="received-message-text">
                                            {item.text}
                                        </p>

                                    </div>

                                )
                            )

                        )}

                    </section>

                )}

            </div>

        </div>

    );

}


export default OfflineTest;