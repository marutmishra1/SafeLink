import {
    useContext,
    useEffect,
    useState,
} from "react";

import {
    NavLink,
    Link,
} from "react-router-dom";

import {
    ThemeContext,
} from "../context/ThemeContext.jsx";


function Header() {

    const {
        theme,
        changeTheme,
    } = useContext(ThemeContext);


    const [isOnline, setIsOnline] =
        useState(navigator.onLine);


    /*
     * ========================================
     * NETWORK STATUS
     * ========================================
     */

    useEffect(() => {

        const handleOnline = () => {

            setIsOnline(true);

        };


        const handleOffline = () => {

            setIsOnline(false);

        };


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


    return (

        <header className="app-header">

            <div className="container">

                <div className="header-inner">


                    {/* =========================
                        BRAND
                    ========================= */}

                    <Link
                        to="/"
                        className="brand"
                    >

                        <span className="brand-icon">
                            S
                        </span>

                        <span className="brand-name">
                            SafeLink
                        </span>

                    </Link>


                    {/* =========================
                        NAVIGATION
                    ========================= */}

                    <nav className="desktop-nav">

                        <NavLink
                            to="/"
                            end
                        >
                            Home
                        </NavLink>


                        <NavLink
                            to="/messages"
                        >
                            Messages
                        </NavLink>


                        <NavLink
                            to="/offline-test"
                        >

                            <span className="header-offline-indicator">

                                <span
                                    className={`header-network-dot ${
                                        isOnline
                                            ? "online"
                                            : "offline"
                                    }`}
                                />

                                Offline

                            </span>

                        </NavLink>


                        <a
                            href="/#how-it-works"
                        >
                            How It Works
                        </a>


                        <a
                            href="/#about"
                        >
                            About
                        </a>

                    </nav>


                    {/* =========================
                        ACTIONS
                    ========================= */}

                    <div className="header-actions">


                        {/* NETWORK */}

                        <NavLink
                            to="/offline-test"
                            className="header-network-status"
                            title="Open SafeLink network"
                        >

                            <span
                                className={`header-network-dot ${
                                    isOnline
                                        ? "online"
                                        : "offline"
                                }`}
                            />

                            {isOnline
                                ? "Online"
                                : "Offline"}

                        </NavLink>


                        {/* THEME */}

                        <select
                            value={theme}
                            onChange={(event) =>
                                changeTheme(
                                    event.target.value
                                )
                            }
                            className="theme-selector"
                            aria-label="Select theme"
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


                        {/* EMERGENCY */}

                        <Link
                            to="/emergency"
                            className="emergency-btn"
                        >
                            🚨 Emergency
                        </Link>

                    </div>

                </div>

            </div>

        </header>

    );

}


export default Header;