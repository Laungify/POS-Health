import API from "./api";
import { openIndexedDB, getDataById, addData, getAllData } from './indexDBUtils'


async function fetchDataAndCache(apiEndpoint, dbName, storeName, searchParams = {}, setState, setError, setLoading, setTotalPages) {
    try {
      setLoading(true);
      setError('');
  
      const query = new URLSearchParams(searchParams).toString();
      const result = await API.get(`${apiEndpoint}?${query}`);
  
      const data = result.data.data;
      const { paging } = result.data;
  
      const db = await openIndexedDB(dbName, 1, [
        { name: storeName, keyPath: 'id', autoIncrement: false }
      ]);
  
      for (const item of data) {
        const existingItem = await getDataById(db, storeName, item.id);
        if (!existingItem) {
          await addData(db, storeName, item);
        }
      }
  
      const cachedData = await getAllData(db, storeName);
      if (cachedData.length > 0) {
        setState(cachedData);
      } else {
        setError('Failed to fetch and cache data');
      }
  
      setTotalPages(paging.pages);
      setLoading(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch data';
      setError(message);
      setLoading(false);
    }
  }
  
  export default fetchDataAndCache;