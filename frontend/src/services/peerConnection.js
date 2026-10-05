let peerConnection = null;
let dataChannel = null;


const ICE_SERVERS = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
};


/*
 * Wait until ICE gathering is complete.
 */
const waitForIceGathering =
    (connection) => {

        return new Promise((resolve) => {

            if (
                connection.iceGatheringState ===
                "complete"
            ) {

                resolve();

                return;
            }


            const handleIceGathering =
                () => {

                    if (
                        connection.iceGatheringState ===
                        "complete"
                    ) {

                        connection.removeEventListener(
                            "icegatheringstatechange",
                            handleIceGathering
                        );

                        resolve();
                    }
                };


            connection.addEventListener(
                "icegatheringstatechange",
                handleIceGathering
            );

        });

    };


/*
 * Create a WebRTC peer connection.
 */
export const createPeerConnection =
    () => {

        if (peerConnection) {

            return peerConnection;

        }


        peerConnection =
            new RTCPeerConnection(
                ICE_SERVERS
            );


        return peerConnection;

    };


/*
 * Create DataChannel.
 *
 * Used by Device A.
 */
export const createDataChannel =
    (
        onMessage,
        onOpen,
        onClose
    ) => {

        if (!peerConnection) {

            createPeerConnection();

        }


        if (dataChannel) {

            dataChannel.close();

        }


        dataChannel =
            peerConnection.createDataChannel(
                "safelink"
            );


        dataChannel.onopen =
            () => {

                if (onOpen) {

                    onOpen();

                }

            };


        dataChannel.onmessage =
            (event) => {

                try {

                    const parsedMessage =
                        JSON.parse(
                            event.data
                        );


                    if (onMessage) {

                        onMessage(
                            parsedMessage
                        );

                    }

                } catch {

                    if (onMessage) {

                        onMessage({
                            type: "message",
                            text:
                                event.data,
                            sender:
                                "SafeLink Device",
                        });

                    }

                }

            };


        dataChannel.onclose =
            () => {

                if (onClose) {

                    onClose();

                }

            };


        dataChannel.onerror =
            () => {

                if (onClose) {

                    onClose();

                }

            };


        return dataChannel;

    };


/*
 * Handle DataChannel created
 * by the remote device.
 *
 * Used by Device B.
 */
export const handleIncomingChannel =
    (
        onMessage,
        onOpen,
        onClose
    ) => {

        if (!peerConnection) {

            createPeerConnection();

        }


        peerConnection.ondatachannel =
            (event) => {

                dataChannel =
                    event.channel;


                dataChannel.onopen =
                    () => {

                        if (onOpen) {

                            onOpen();

                        }

                    };


                dataChannel.onmessage =
                    (messageEvent) => {

                        try {

                            const parsedMessage =
                                JSON.parse(
                                    messageEvent.data
                                );


                            if (onMessage) {

                                onMessage(
                                    parsedMessage
                                );

                            }

                        } catch {

                            if (onMessage) {

                                onMessage({
                                    type: "message",
                                    text:
                                        messageEvent.data,
                                    sender:
                                        "SafeLink Device",
                                });

                            }

                        }

                    };


                dataChannel.onclose =
                    () => {

                        if (onClose) {

                            onClose();

                        }

                    };


                dataChannel.onerror =
                    () => {

                        if (onClose) {

                            onClose();

                        }

                    };

            };

    };


/*
 * Create WebRTC Offer.
 */
export const createOffer =
    async () => {

        if (!peerConnection) {

            createPeerConnection();

        }


        const offer =
            await peerConnection.createOffer();


        await peerConnection.setLocalDescription(
            offer
        );


        await waitForIceGathering(
            peerConnection
        );


        return peerConnection.localDescription;

    };


/*
 * Accept Offer and create Answer.
 */
export const acceptOffer =
    async (offer) => {

        if (!peerConnection) {

            createPeerConnection();

        }


        await peerConnection.setRemoteDescription(
            offer
        );


        const answer =
            await peerConnection.createAnswer();


        await peerConnection.setLocalDescription(
            answer
        );


        await waitForIceGathering(
            peerConnection
        );


        return peerConnection.localDescription;

    };


/*
 * Accept remote Answer.
 */
export const acceptAnswer =
    async (answer) => {

        if (!peerConnection) {

            throw new Error(
                "Peer connection does not exist."
            );

        }


        await peerConnection.setRemoteDescription(
            answer
        );

    };


/*
 * Send a message through
 * the P2P DataChannel.
 */
export const sendPeerMessage =
    (message) => {

        if (!dataChannel) {

            throw new Error(
                "P2P channel does not exist."
            );

        }


        if (
            dataChannel.readyState !==
            "open"
        ) {

            throw new Error(
                "P2P channel is not open."
            );

        }


        dataChannel.send(
            JSON.stringify(
                message
            )
        );

    };


/*
 * Get current PeerConnection.
 */
export const getPeerConnection =
    () => {

        return peerConnection;

    };


/*
 * Get current DataChannel.
 */
export const getDataChannel =
    () => {

        return dataChannel;

    };


/*
 * Close WebRTC connection.
 */
export const closePeerConnection =
    () => {

        if (dataChannel) {

            dataChannel.onopen =
                null;

            dataChannel.onmessage =
                null;

            dataChannel.onclose =
                null;

            dataChannel.onerror =
                null;

            dataChannel.close();

        }


        if (peerConnection) {

            peerConnection.ondatachannel =
                null;

            peerConnection.close();

        }


        dataChannel = null;

        peerConnection = null;

    };