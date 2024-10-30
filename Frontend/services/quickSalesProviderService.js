// SalesProvideService 
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import indexDBDexi from '../utils/dexiIndexDB';
import API from '../utils/api';
import { useOffline } from '../context/offlineContext';
import useCurrentShopState from '../stores/currentShop';
import { addData, getAllData, openIndexedDB, clearData } from '../utils/indexDBUtils'

const SalesContext = createContext();


export default function SalesProvider({ children }) {
  const [sales, setSales] = useState([]);
  const [doneSales, setDoneSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOffline();
  const { currentShop } = useCurrentShopState()

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError('');
  
      console.log('Fetching all products from server to salesModule...');
  
      // Fetch products from the API
      const result = await API.get(`shops/${currentShop._id}/products`);
      console.log('Server response received:', result.data);
  
      const productsData = result.data.data;
  
      const db = await openIndexedDB('localdb', 1, [
        { name: 'products', keyPath: 'id', autoIncrement: false },
      ]);
  
      console.log('IndexedDB initialized');
  
      await clearData(db, 'products');
  
      for (const product of productsData) {
        await addData(db, 'products', product);
      }
  
      console.log('Products cached in IndexedDB', productsData);
  
      setProducts(productsData);
      setLoading(false);
  
    } catch (err) {
  
      try {
        const db = await openIndexedDB('localdb', 1, [
          { name: 'products', keyPath: 'id', autoIncrement: false },
        ]);
        const cachedProducts = await getAllData(db, 'products');
        if (cachedProducts.length > 0) {
          setProducts(cachedProducts);
        }
      } catch (fallbackError) {
        console.error('Error fetching products from IndexedDB:', fallbackError);
      }
    }
  }
  
  
  const syncSales = async () => {
    try {
      const allItems = await indexDBDexi.sales.toArray();
      if (allItems.length > 0) {
        console.log('Syncing offline sales to server:', allItems);
        await API.post('sales/bulkSale', allItems);
        await indexDBDexi.sales.clear();
        console.log('Offline sales synced and cleared from IndexedDB');

        // Refetch and recache products after syncing sales
        await fetchProducts();
      }
    } catch (err) {
      console.error('Error syncing sales:', err);
    }
  };

  const syncDoneSales = async () => {
    const shopId = currentShop._id;

    let data = [];

    if (!shopId) {
      console.error('No shop ID found');
      return data;
    }

    try {
      if (!isOnline) {
        data = await indexDBDexi.doneSales.toArray();
        if (data.length > 0) {
          console.log('Reading doneSale data offline:', data);
        }
      } else {
        const serverSales = await API.get(`shops/${shopId}/sales`);
        data = serverSales.data.data;
        console.log('Fetched done sales from server:', data);
      }
    } catch (err) {
      console.error('Error syncing done sales:', err);
    }

    return data;
  };


  const addSale = async (sale,) => {

    sale.done = false;
    sale.shopId = currentShop._id;
    const shopId = currentShop._id;

    const formattedSale = {
      products: sale.products.map(item => ({
        category: item.category || [""],
        _id: item._id,
        productName: item.productName,
        formulation: item.formulation,
        strength: item.strength,
        packSize: item.packSize,
        genericName: item.genericName,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        unit: item.unit,
        vat: item.vat || null,
        quantity: item.quantity,
        totalProductPrice: item.quantity * item.sellingPrice * (item?.discount?.value ? (100 - item.discount.value) / 100 : 1),
        totalProductCost: item.quantity * item.costPrice
      })),
      shopId,
      shop: sale.shopId,
      salesPrice: sale.products.reduce((total, item) => total + item.totalProductPrice, 0),
      totalCostPrice: sale.products.reduce((total, item) => total + item.totalProductCost, 0),
      patientId: sale.patientId || null,
      saleType: sale.saleType,
      discount: sale.discount || { value: 0, type: "Amount" },
      bill: sale.bill || { received: 0, change: 0, paymentMethod: "", totalCost: 0 },
      patientName: sale.patientName || "",
      source: sale.source || "Walk in",
      profit: sale.products.reduce((total, item) => total + (item.quantity * (item.sellingPrice - item.costPrice)), 0) - (sale.discount?.value || 0),
      staffId: sale.staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!isOnline) {
      try {
        await indexDBDexi.sales.add(formattedSale);
        await indexDBDexi.doneSales.add(formattedSale);
        setSales((prev) => [...prev, formattedSale]);
        console.log('Added sale offline:', formattedSale);
      } catch (err) {
        console.error('Error adding sale offline:', err);
      }
    } else {
      try {
        const response = await API.post('sales', formattedSale);
        setSales((prev) => [...prev, response.data]);
        console.log('Added sale online:', response.data);
      } catch (err) {
        console.error('Error adding sale online:', err.response ? err.response.data : err.message);
      }
    }
  };





  const deleteSale = async (saleId) => {
    if (!isOnline) {
      try {
        await indexDBDexi.doneSales.add({ _id: saleId });
        setDoneSales((prev) => [...prev, { _id: saleId }]);
        console.log('Marked sale for deletion offline:', saleId);
      } catch (err) {
        console.error('Error marking sale for deletion offline:', err);
      }
    } else {
      try {
        await API.delete(`sales/${saleId}`);
        setSales((prev) => prev.filter(sale => sale.id !== saleId));
        console.log('Deleted sale online:', saleId);
      } catch (err) {
        console.error('Error deleting sale online:', err);
      }
    }
  };

  useEffect(() => {
    const fetchSales = async () => {
      try {
        if (!isOnline) {
          const allItems = await indexDBDexi.doneSales.toArray();
          setSales(allItems);
          console.log('Fetched sales from DoneSales IndexedDB:', allItems);
        } else {
          const response = await API.get('sales');
          setSales(response.data.data);
          console.log('Fetched sales from server:', response.data.data);
        }
      } catch (err) {
        console.error('Error fetching sales:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && currentShop?._id) {
      syncSales();
      syncDoneSales();
      fetchProducts();
    }
  }, [isOnline, currentShop]);


  const value = useMemo(() => ({
    sales, addSale, deleteSale, loading, syncDoneSales
  }), [sales, loading]);

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
}

export const useSales = () => useContext(SalesContext);