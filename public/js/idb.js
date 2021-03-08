const { application, response } = require("express");

const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

// db variable

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
    e.target.result.createObjectStore("pending", {
        keyPath: "id",
        autoIncrement: true
    });
}

request.onerror = (err) => {
    console.log(err.message);
};

request.onsuccess = (e) => {
    db = e.target.result;

    if (navigator.onLine) {
        checkDb();
    }
};

// when user is offline

function saveRecord(record) {
    const transaction = db.transaction("pending", "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

// function for when user goes online, sends transactions stored in db to the server

function checkDb() {
    const transaction = db.transaction("pending", "readonly");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
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
                .then(() => {
                    const transaction = db.transaction("pending", "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

// event listener for app getting back online

window.addEventListener("online", checkDb);