import {
    useEffect,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    getPeerConnection,
} from "../services/peerConnection";


function Hero() {

    const [connectionState, setConnectionState] =
        useState("new");


    /*
     * ========================================
     * CHECK REAL WEBRTC CONNECTION
     * ========================================
     */

    useEffect(() => {

        const checkConnection =
            () => {

                const peerConnection =
                    getPeerConnection();


                if (!peerConnection) {

                    setConnectionState(
                        "new"
                    );

                    return;

                }


                setConnectionState(
                    peerConnection.connectionState
                );

            };


        checkConnection();


        const interval =
            setInterval(
                checkConnection,
                500
            );


        return () => {

            clearInterval(
                interval
            );

        };

    }, []);


    /*
     * ========================================
     * CONNECTION STATE
     * ========================================
     */

    const isConnected =
        connectionState ===
        "connected";


    const isConnecting =
        connectionState === "connecting" ||
        connectionState === "checking";


    /*
     * ========================================
     * NETWORK STATUS
     * ========================================
     */

    const networkStatus =
        isConnected
            ? "Connected"
            : isConnecting
                ? "Connecting"
                : "Available";


    /*
     * ========================================
     * NEARBY DEVICES
     * ========================================
     */

    const nearbyDevices =
        isConnected
            ? 1
            : 0;


    /*
     * ========================================
     * PANEL TITLE
     * ========================================
     */

    const statusTitle =
        isConnected
            ? "Connected"
            : isConnecting
                ? "Connecting"
                : "Ready";


    return (

        <section
            id="home"
            className="hero-section"
        >

            <div className="container">

                <div className="row align-items-center g-5">


                    {/* ================================
                        HERO CONTENT
                    ================================= */}

                    <div className="col-12 col-lg-7">

                        <div className="hero-content">


                            {/* HERO BADGE */}

                            <span className="hero-badge">

                                <span className="status-dot">
                                </span>

                                Emergency Communication Network

                            </span>


                            {/* HERO TITLE */}

                            <h1>

                                Stay connected

                                <br />

                                when networks fail.

                            </h1>


                            {/* HERO DESCRIPTION */}

                            <p>

                                SafeLink helps people exchange
                                critical emergency information
                                when conventional internet and
                                cellular networks become unavailable.

                            </p>


                            {/* HERO ACTIONS */}

                            <div className="hero-actions">


                                {/* EMERGENCY */}

                                <Link
                                    to="/emergency"
                                    className="primary-btn"
                                >

                                    <span>
                                        ⚠
                                    </span>

                                    Send Emergency Alert

                                </Link>


                                {/* HOW IT WORKS */}

                                <a
                                    href="/#how-it-works"
                                    className="secondary-btn"
                                >

                                    How It Works

                                </a>

                            </div>

                        </div>

                    </div>


                    {/* ================================
                        NETWORK STATUS
                    ================================= */}

                    <div className="col-12 col-lg-5">


                        {/* ENTIRE CARD IS CLICKABLE */}

                        <Link
                            to="/offline-test"
                            className="network-panel network-panel-link"
                        >


                            {/* NETWORK HEADER */}

                            <div className="network-panel-header">

                                <div>

                                    <span className="panel-label">
                                        NETWORK STATUS
                                    </span>


                                    <h2>
                                        {statusTitle}
                                    </h2>

                                </div>


                                <span
                                    className={`online-indicator ${
                                        isConnected
                                            ? "connected"
                                            : ""
                                    }`}
                                />

                            </div>


                            {/* NETWORK VISUAL */}

                            <div className="network-visual">


                                {/* RINGS */}

                                <div className="network-ring ring-one">
                                </div>

                                <div className="network-ring ring-two">
                                </div>

                                <div className="network-ring ring-three">
                                </div>


                                {/* CENTER */}

                                <div className="network-center">

                                    <span>
                                        📡
                                    </span>

                                </div>


                                {/* REAL P2P DEVICES */}

                                {isConnected && (

                                    <>

                                        <div className="device device-one">
                                            ●
                                        </div>


                                        <div className="device device-two">
                                            ●
                                        </div>


                                        <div className="device device-three">
                                            ●
                                        </div>


                                        <div className="device device-four">
                                            ●
                                        </div>

                                    </>

                                )}

                            </div>


                            {/* NETWORK INFORMATION */}

                            <div className="network-info">


                                {/* NEARBY DEVICES */}

                                <div>

                                    <span>
                                        Nearby devices
                                    </span>


                                    <strong>
                                        {String(
                                            nearbyDevices
                                        ).padStart(2, "0")}
                                    </strong>

                                </div>


                                {/* NETWORK */}

                                <div>

                                    <span>
                                        Network
                                    </span>


                                    <strong>
                                        {networkStatus}
                                    </strong>

                                </div>

                            </div>


                        </Link>

                    </div>

                </div>

            </div>

        </section>

    );

}


export default Hero;