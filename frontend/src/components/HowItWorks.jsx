function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="how-section"
        >
            <div className="container">

                {/* Section Heading */}
                <div className="section-heading">

                    <span>How It Works</span>

                    <h2>
                        Communication beyond the network.
                    </h2>

                    <p>
                        Emergency information can move from device
                        to device until it reaches someone who can act.
                    </p>

                </div>

                {/* Steps */}
                <div className="row g-4">

                    {/* Step 01 */}
                    <div className="col-12 col-md-4">
                        <div className="feature-card">

                            <div className="feature-number">
                                01
                            </div>

                            <h3>
                                Create Alert
                            </h3>

                            <p>
                                Create an emergency message containing
                                the information people need.
                            </p>

                        </div>
                    </div>

                    {/* Step 02 */}
                    <div className="col-12 col-md-4">
                        <div className="feature-card">

                            <div className="feature-number">
                                02
                            </div>

                            <h3>
                                Nearby Devices
                            </h3>

                            <p>
                                Share emergency information with nearby
                                participating devices.
                            </p>

                        </div>
                    </div>

                    {/* Step 03 */}
                    <div className="col-12 col-md-4">
                        <div className="feature-card">

                            <div className="feature-number">
                                03
                            </div>

                            <h3>
                                Reach Help
                            </h3>

                            <p>
                                Information continues through the local
                                network until it reaches a responder.
                            </p>

                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}

export default HowItWorks;