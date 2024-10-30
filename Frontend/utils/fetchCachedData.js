import API from "./api";
import { openIndexedDB, getAllData } from './indexDBUtils'



  async function fetchCachedData(dbName, storeName, searchParams = {}, setState, setError, setLoading, setTotalPages) {
    try {
      const db = await openIndexedDB(dbName, 1, [{ name: storeName, keyPath: 'id', autoIncrement: false }]);
      const cachedData = await getAllData(db, storeName);
      return cachedData;
    } catch (error) {
      console.error('Error fetching cached data:', error);
      return [];
    }
  };
  
  
  export default fetchCachedData;