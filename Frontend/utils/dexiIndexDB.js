// db.js
import Dexie from 'dexie';

const indexDBDexi = new Dexie('SalesDatabase');
indexDBDexi.version(1).stores({
  sales: '++id,shopId,products,staffId,done',
  doneSales: '++id, name, amount',
  showShop: 'id, showShop',
  patients: '++id'
});

export default indexDBDexi;
