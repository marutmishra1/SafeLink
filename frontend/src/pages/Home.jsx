import Header from "../components/Header";
import Hero from "../components/Hero";
import EmergencyAlert from "../components/EmergencyAlert";
import HowItWorks from "../components/HowItWorks";
import About from "../components/About";
import Footer from "../components/Footer";

function Home() {
    return (
        <div className="app">

            {/* ================= HEADER ================= */}

            <Header />

            <main>

                {/* ================= HERO ================= */}

                <Hero />

                {/* ================= EMERGENCY ALERT ================= */}

                <EmergencyAlert />

                {/* ================= HOW IT WORKS ================= */}

                <HowItWorks />

                {/* ================= ABOUT ================= */}

                <About />

            </main>

            {/* ================= FOOTER ================= */}

            <Footer />

        </div>
    );
}

export default Home;