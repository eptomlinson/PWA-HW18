let db;
const request = window.indexedDB.open("Budget", 1);

request.onupgradeneeded = event => {
    db = event.target.result;
    const pendingStore = db.createObjectStore("pending", { autoIncrement: true });
    pendingStore.createIndex("statusIndex", "status");
};

request.onsuccess = event => {
    db = event.target.result;
  
    if (navigator.onLine) {
      checkDatabase();
    }
};

request.onerror = event => {console.log(event)};

function saveRecord(record) {
    db = request.result;
    const transaction = db.transaction(["pending"], "readwrite");
    const transpending = transaction.objectStore("pending");
  
    transpending.add(record);
}

function checkDatabase() {
    const checkTransaction = db.transaction(["pending"], "readwrite");
    const checking = checkTransaction.objectStore("pending");
    const getAll = checking.getAll();
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
            const succTransaction = db.transaction(["pending"], "readwrite");
            const success = succTransaction.objectStore("pending");
            success.clear();
        });
      }
    };
}

window.addEventListener("online", checkDatabase);