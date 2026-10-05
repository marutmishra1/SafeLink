const DB_NAME = "SafeLinkDB";
const STORE_NAME = "outbox";
const DB_VERSION = 2;


// --------------------------------
// OPEN DATABASE
// --------------------------------

const openDB = () => {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );


        request.onupgradeneeded = () => {

            const db = request.result;


            if (
                !db.objectStoreNames.contains(
                    STORE_NAME
                )
            ) {

                db.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id",
                        autoIncrement: true,
                    }
                );

            }

        };


        request.onsuccess = () => {

            resolve(
                request.result
            );

        };


        request.onerror = () => {

            reject(
                request.error
            );

        };

    });

};


// --------------------------------
// SAVE TO OUTBOX
// --------------------------------

export const saveOfflineMessage =
    async (item) => {

        const db =
            await openDB();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        STORE_NAME,
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );


                store.add({

                    ...item,

                    queuedAt:
                        new Date().toISOString(),

                });


                transaction.oncomplete =
                    () => {

                        resolve();

                    };


                transaction.onerror =
                    () => {

                        reject(
                            transaction.error
                        );

                    };

            }
        );

    };


// --------------------------------
// GET OUTBOX
// --------------------------------

export const getOfflineMessages =
    async () => {

        const db =
            await openDB();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        STORE_NAME,
                        "readonly"
                    );


                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );


                const request =
                    store.getAll();


                request.onsuccess =
                    () => {

                        resolve(
                            request.result
                        );

                    };


                request.onerror =
                    () => {

                        reject(
                            request.error
                        );

                    };

            }
        );

    };


// --------------------------------
// DELETE FROM OUTBOX
// --------------------------------

export const deleteOfflineMessage =
    async (id) => {

        const db =
            await openDB();


        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        STORE_NAME,
                        "readwrite"
                    );


                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );


                store.delete(id);


                transaction.oncomplete =
                    () => {

                        resolve();

                    };


                transaction.onerror =
                    () => {

                        reject(
                            transaction.error
                        );

                    };

            }
        );

    };