// db variable
let db;
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function  (e) {
    const db = e.target.result;
    db.createObjectStore("new_transaction", {
        autoIncrement: true
    });
}

request.onerror = function (e) {
    console.log(e.target.errorCode);
};

request.onsuccess = function (e) {
    db = e.target.result;

    if (navigator.onLine) {
        uploadTransactions();
    }
};

// when user is offline

function saveRecord(record) {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const store = transaction.objectStore("new_transaction");
    store.add(record);
};

// function for when user goes online, sends transactions stored in db to the server

function uploadTransactions() {
    const transaction = db.transaction(["new_transaction"], "readonly");
    const store = transaction.objectStore("new_transaction");
    const getAll = store.getAll();

    console.log("")

    getAll.onsuccess = function (e) {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then((response) => response.json())
                .then((serverRes) => {
                    if (serverRes.message) {
                        throw new Error(serverRes)
                    }
                    const transaction = db.transaction(["new_transaction"], "readwrite");
                    const store = transaction.objectStore(["new_transaction"]);
                    store.clear();

                    alert("All transaction successfully uploaded!");
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };
}

// event listener for app getting back online

window.addEventListener("online", uploadTransactions);