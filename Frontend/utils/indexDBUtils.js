// indexedDB.js
export function openIndexedDB(dbName, version, storeConfigs) {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(dbName, version);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            storeConfigs.forEach(config => {
                if (!db.objectStoreNames.contains(config.name)) {
                    db.createObjectStore(config.name, { keyPath: config.keyPath, autoIncrement: config.autoIncrement });
                }
            });
        };

        request.onsuccess = function (event) {
            console.log(`${dbName} opened successfully`);
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            console.error(`${dbName} failed to open`, event);
            reject(event);
        };
    });
}

// Add data to IndexedDB
export async function addData(db, storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  
// delete data from indexDB, once a successful syncDB  - likes sales happens 
// after network restore
export async function deleteData(db, storeName, id) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);
    return tx.complete;
  }
  
  export async function getDataById(db, storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

// Get all data from IndexedDB
export async function getAllData(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  export async function clearData(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  

// Mark data for sync
export async function markDataForSync(db, storeName, data) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    return tx.complete;
}