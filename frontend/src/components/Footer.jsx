import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="app-footer">
            <div className="container">

                <div className="footer-content">

                    {/* Brand */}
                    <div className="footer-brand">

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

                        <p>
                            Emergency communication beyond conventional networks.
                        </p>

                    </div>

                    {/* Navigation */}
                    <div className="footer-links">

                        <Link to="/">
                            Home
                        </Link>

                        <a href="/#how-it-works">
                            How It Works
                        </a>

                        <Link to="/emergency">
                            Emergency Alert
                        </Link>

                        <Link to="/messages">
                            Messages
                        </Link>

                        <a href="/#about">
                            About
                        </a>

                    </div>

                </div>

                {/* Bottom */}
                <div className="footer-bottom">

                    <span>
                        © 2026 SafeLink
                    </span>

                    <span>
                        Built for emergency communication
                    </span>

                </div>

            </div>
        </footer>
    );
}

export default Footer;