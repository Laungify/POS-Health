import { useState, useEffect } from 'react';
import indexDBDexi from '../utils/dexiIndexDB';

export default function useFetchShopData(shopId) {
  const [showShop, setShopObj] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShowShopData = async () => {
      if (shopId) {
        try {
          const showShopObj = await indexDBDexi.showShop.get(shopId);
          setShopObj(showShopObj ? showShopObj.showShop : false);
        } catch (err) {
          console.log('Failed to fetch from cached shop:', err);
          setError('Failed to fetch shop data');
        }
      }
    };

    fetchShowShopData();
  }, [shopId]);

  return { showShop, error };
};
