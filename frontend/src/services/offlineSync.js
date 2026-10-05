import {
    getOfflineMessages,
    deleteOfflineMessage,
} from "../utils/offlineQueue";


const API_URL =
    import.meta.env.VITE_API_URL;


export const syncOfflineMessages =
    async () => {

        if (!navigator.onLine) {
           

            return;
        }

        try {

            const queuedItems =
                await getOfflineMessages();

            if (
                !queuedItems ||
                queuedItems.length === 0
            ) {
                

                return;
            }

           


            for (
                const item of queuedItems
            ) {

                try {

                    /* =========================
                       NORMAL MESSAGE
                    ========================= */

                    if (
                        item.type ===
                        "message"
                    ) {

                        const response =
                            await fetch(
                                `${API_URL}/messages`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",
                                    },

                                    body:
                                        JSON.stringify({
                                            sender:
                                                item.sender,
                                            text:
                                                item.text,
                                        }),
                                }
                            );


                        if (
                            !response.ok
                        ) {
                            throw new Error(
                                `Message sync failed: ${response.status}`
                            );
                        }


                        await deleteOfflineMessage(
                            item.id
                        );

                       
                    }


                    /* =========================
                       EMERGENCY ALERT
                    ========================= */

                    if (
                        item.type ===
                        "alert"
                    ) {

                        const formData =
                            new FormData();


                        formData.append(
                            "alertType",
                            item.alertType
                        );

                        formData.append(
                            "message",
                            item.text
                        );

                        formData.append(
                            "locationEnabled",
                            item.locationEnabled
                        );


                        if (
                            item.locationEnabled &&
                            item.location
                        ) {

                            formData.append(
                                "location",
                                JSON.stringify(
                                    item.location
                                )
                            );
                        }


                        /*
                         * Attachment support will be
                         * handled separately.
                         *
                         * For now we sync the alert
                         * itself reliably.
                         */

                        const response =
                            await fetch(
                                `${API_URL}/alerts`,
                                {
                                    method: "POST",
                                    body: formData,
                                }
                            );


                        if (
                            !response.ok
                        ) {
                            throw new Error(
                                `Alert sync failed: ${response.status}`
                            );
                        }


                        const data =
                            await response.json();


                        
                            data.alert
                       


                        await deleteOfflineMessage(
                            item.id
                        );


                       
                    }

                } catch (itemError) {

                    console.error(
                        "Failed to sync Outbox item:",
                        item.id,
                        itemError
                    );

                    /*
                     * IMPORTANT:
                     * Do NOT delete the item.
                     *
                     * It remains in Outbox and can
                     * be retried later.
                     */
                }
            }

        } catch (error) {

            console.error(
                "Outbox synchronization error:",
                error
            );
        }
    };