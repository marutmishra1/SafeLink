function Footer() {
    return (
        <footer className="app-footer">
            <div className="container">

                <div className="footer-content">

                    {/* Brand */}
                    <div className="footer-brand">

                        <a href="#home" className="brand">
                            <span className="brand-icon">S</span>
                            <span className="brand-name">SafeLink</span>
                        </a>

                        <p>
                            Emergency communication beyond conventional networks.
                        </p>

                    </div>

                    {/* Navigation */}
                    <div className="footer-links">

                        <a href="#home">
                            Home
                        </a>

                        <a href="#how-it-works">
                            How It Works
                        </a>

                        <a href="#emergency">
                            Emergency Alert
                        </a>

                        <a href="#about">
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