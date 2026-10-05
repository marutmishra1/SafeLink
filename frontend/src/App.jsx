import { useEffect } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
} from "react-router-dom";

import ThemeProvider from "./context/ThemeProvider.jsx";

import Home from "./pages/Home.jsx";
import Emergency from "./pages/Emergency.jsx";
import Messages from "./pages/Messages.jsx";
import OfflineTest from "./pages/OfflineTest.jsx";

import {
    syncOfflineMessages,
} from "./services/offlineSync.js";


function ScrollToTop() {

    const { pathname } =
        useLocation();

    useEffect(() => {

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

    }, [pathname]);

    return null;
}


function App() {

    useEffect(() => {

        const handleOnline = () => {

           

            syncOfflineMessages();

        };


        window.addEventListener(
            "online",
            handleOnline
        );


        

        syncOfflineMessages();


        const retryInterval =
            setInterval(() => {

                if (navigator.onLine) {

                    

                    syncOfflineMessages();

                }

            }, 5000);


        return () => {

            window.removeEventListener(
                "online",
                handleOnline
            );

            clearInterval(
                retryInterval
            );

        };

    }, []);


    return (

        <BrowserRouter>

            <ThemeProvider>

                <ScrollToTop />

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/emergency"
                        element={<Emergency />}
                    />

                    <Route
                        path="/messages"
                        element={<Messages />}
                    />

                    <Route
                        path="/offline-test"
                        element={<OfflineTest />}
                    />

                </Routes>

            </ThemeProvider>

        </BrowserRouter>

    );
}


export default App;