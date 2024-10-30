/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CreateSale from './SalesModules/CreateSale';
import SalesList from './SalesModules/SalesList';
import EditSale from './SalesModules/EditSale';
import PrintSale from './SalesModules/PrintSale';
import QuickSale from './SalesModules/QuickSale';
import API from '../utils/api';
import useCurrentShopState from '../stores/currentShop';
import useQuickSaleState from '../stores/quickSale';

// import { getAllData, openIndexedDB } from '../utils/indexDBUtils';
import OfflineProvider from '../context/offlineContext';
import SalesProvider from '../services/quickSalesProviderService';
import PrintQuote from './SalesModules/PrintQuote';
import PrintQuotation from './SalesModules/PrintQuotation';

import { addData, getAllData, openIndexedDB, clearData } from '../utils/indexDBUtils'
import indexDBDexi from '../utils/dexiIndexDB';
// import OfflineProvider from '../context/offlineContext';
// import PatientProvider from '../context/currentPatientContext';
// import SalesProvider from '../services/quickSalesProviderService';


export default function SalesModule() {
  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const { quickSale, setQuickSale } = useQuickSaleState();

  const [allProducts, setAllProducts] = React.useState([]);
  const [currentSale, setCurrentSale] = React.useState({});

  const [availableGenericNames, setAvailableGenericNames] = React.useState([])
  const [availableProducts, setAvailableProducts] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  const [formState, setFormState] = React.useState('list');


  const edit = (sale) => {
    const newSales = sale.products.map((item) => {
      const product = allProducts.find((saleItem) => saleItem._id === item._id);
      const data = {
        comment: item.comment,
        dosage: item.dosage,
        duration: item.duration,
        frequency: item.frequency,
        quantity: item.quantity,
        route: item.route,
        product,
      };

      return data;
    });
    sale.products = newSales;

    setCurrentSale(sale);
    setFormState('edit');
  };

  const print = (sale) => {
    setCurrentSale(sale);
    setFormState('print');
  };


  const [error, setError] = React.useState('');


  useEffect(() => {
    let isMounted = true; 

    const fetchData = async () => {
      try {
        // Initiate IndexedDB
        const db = await openIndexedDB('localdb', 1, [
          { name: 'products', keyPath: 'id', autoIncrement: false }
        ]);

        // Check if data exists in IndexedDB
        const cachedProducts = await getAllData(db, 'products');
        if (isMounted) {
          if (cachedProducts.length > 0) {
            setAllProducts(cachedProducts);
          }
        }
      } catch (err) {
        if (isMounted) { 
          const message = err.response?.data?.message || 'Failed to fetch products';
          setError(message);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchCachedProducts = async () => {

     // initiating indexDb
     const db = await openIndexedDB ('localdb', 1, [
      { name: 'products', keyPath: 'id', autoIncrement: false }
    ]);


    try {
      // Check if data exists in IndexedDB
      const cachedProducts = await getAllData(db, 'products');
      if (cachedProducts.length > 0) {
        setAllProducts(cachedProducts);
      }
    } catch (err) {
      const  message  = err.response?.data?.message || 'Failed to fetch products';
      setError(message);
    }

  }

  async function fetchProducts() {
    try {
      setLoading(true);
      setError('');
  
      console.log('Fetching all products from server to salesModule...');
  
      // Fetch products from the API
      const result = await API.get(`shops/${shopId}/products`);
      console.log('Server response received:', result.data);
  
      const productsData = result.data.data;
      
      // Initialize IndexedDB
      const db = await openIndexedDB('localdb', 1, [
        { name: 'products', keyPath: 'id', autoIncrement: false },
      ]);
  
      console.log('IndexedDB initialized');
  
      await clearData(db, 'products');
  
      for (const product of productsData) {
        await addData(db, 'products', product);
      }
  
      console.log('Products cached in IndexedDB', productsData);
  
      setAllProducts(productsData);
      // setTotalPages(result.data.paging.pages);
      setLoading(false);
  
    } catch (err) {
      try {
        const db = await openIndexedDB('localdb', 1, [
          { name: 'products', keyPath: 'id', autoIncrement: false },
        ]);
        const cachedProducts = await getAllData(db, 'products');
        if (cachedProducts.length > 0) {
          setAllProducts(cachedProducts);
        }
      } catch (fallbackError) {
        console.error('Error fetching products from IndexedDB:', fallbackError);
      }
    }
  }


  const [staffPatients, setStaffPatients] = React.useState([])

  const fetchStaffPatients = async () => {
    try {
      const results = await API.get(`shops/${shopId}/patients`);
      const patients = results.data.data;
      await indexDBDexi.patients.clear();
      await indexDBDexi.patients.add(patients);
      setStaffPatients(patients);
      setLoading(false);

    } catch (err) {
      try {
        const cachedPatients = await indexDBDexi.patients.toArray();
        if (cachedPatients.length > 0) {
          setStaffPatients(cachedPatients);
        } else {
          setError('No patients found in cache');
        }
      } catch (fallbackError) {
        console.error('Error fetching patients from IndexedDB:', fallbackError);
        setError('Failed to fetch patients from server and cache');
      } finally {
        setLoading(false);
      }
    }
  };


  const [sales, setSales] = React.useState([])
  async function fetchSales() {
    try {
      setLoading(true)
      setError('')
      const result = await API.get(
        `shops/${shopId}/sales`,
      )

      const saleData = result.data.data
      await indexDBDexi.doneSales.clear();
      await indexDBDexi.doneSales.add(saleData);

      setSales(saleData)
      setLoading(false)
    } catch (err) {
      try {
        const cachedSales = await indexDBDexi.doneSales.toArray();
        if (cachedSales.length > 0) {
          setSales(cachedSales);
        } else {
          setError('No sales found in cache');
        }
      } catch (fallbackError) {
        console.error('Error fetching sales from IndexedDB:', fallbackError);
        setError('Failed to fetch sales from server and cache');
      } finally {
        setLoading(false);
      }
    }
  }
  useEffect(() => {
    if (shopId) {
      // fetchCachedProducts();
      fetchProducts();
    }
  }, [shopId, formState]);

  useEffect(() => {
  console.log('fetched and cached products 🚀🚀🚀🚀', allProducts)
  console.log('fetched and cached sales ☹️☹️☹️☹️☹️', sales)

  }, [allProducts]);
  React.useEffect(() => {
    if (quickSale) {
      setFormState('quickSale');
    }

    return () => {
      setQuickSale(null);
    };
  }, [quickSale]);

  useEffect(() => {
    fetchStaffPatients();
    fetchSales();
  }, [])
  useEffect(() => {console.log('pateints fetch and cache 🔥🔥', staffPatients)}, [staffPatients]);

  return (
    <div>
      <Grid container justifyContent="flex-end">
        <Box my={1}>
          {formState === 'list' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setQuickSale(null);
                setFormState('create');
                fetchProducts();
              }}
            >
              New Sale
            </Button>
          )}
        </Box>
      </Grid>

      {formState === 'quickSale' && <QuickSale setFormState={setFormState} />}

      {formState === 'create' && <CreateSale setFormState={setFormState} />}

      {formState === 'edit' && (
        <EditSale sale={currentSale} setFormState={setFormState} />
      )}

      {formState === 'print' && (
        <PrintSale sale={currentSale} setFormState={setFormState} />
      )}


      {/* {formState === 'downloadQuote' && (
        <PrintQuotation product={allProducts} setFormState={setFormState} />
      )} */}

      {formState === 'list' && (
        <SalesList edit={edit} print={print} formState={formState} />
      )}
    </div>
  );
}
