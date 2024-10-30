import API from "./api";

const fetchFromAPI = async ({ apiEndpoint, queryParams, setError, setTotalPages }) => {
    try {
      const query = new URLSearchParams(queryParams).toString();
      const result = await API.get(`${apiEndpoint}?${query}`);
  
      const data = result.data.data;
      const { paging } = result.data;
  
      if (setTotalPages) {
        setTotalPages(paging.pages);
      }
  
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch data';
      if (setError) {
        setError(message);
      }
      return [];
    }
  };
  
  export default fetchFromAPI;