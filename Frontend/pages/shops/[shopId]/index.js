import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@mui/material/Badge';
import Layout from '../../../templates/layout';
import ProductsModule from '../../../components/ProductsModule';
import SalesModule from '../../../components/SalesModule';
import PrescriptionModule from '../../../components/PrescriptionModule';
import Modal from '../../../components/modal';
import OrdersModule from '../../../components/OrdersModule';
import API from '../../../utils/api';
import useCurrentShopState from '../../../stores/currentShop';
import useQuickSaleState from '../../../stores/quickSale';
import OfflineProvider from '../../../context/offlineContext';
import SalesProvider from '../../../services/quickSalesProviderService';
import indexDBDexi from '../../../utils/dexiIndexDB';
import PatientProvider from '../../../context/selectedPatientContext'

export default function ShopInfo() {
  const { currentShop } = useCurrentShopState();
  const router = useRouter();
  const { shopId } = router.query;

  const { quickSale } = useQuickSaleState();

  const [currentTab, setCurrentTab] = useState(0);

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [shopObj, setShopObj] = useState(null); 
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  async function fetchOrders() {
    if (shopId) {
      try {
        const result = await API.get(`shops/${shopId}/orders`);

        const items = result.data.data;

        setOrders(items);
      } catch (err) {
        const { message } = err.response.data;
        setError(message);
      }
    }
  }

  async function fetchPres() {
    if (shopId) {
      try {
        const result2 = await API.get(`shops/${shopId}/prescriptions`);

        const items2 = result2.data.data;

        setPrescriptions(items2);
      } catch (err) {
        const { message } = err.response.data;
        setError(message);
      }
    }
  }

  async function fetchSales() {
    if (shopId) {
      try {
        const result2 = await API.get(`shops/${shopId}/sales`);

        const items2 = result2.data.data;

        setSales(items2);
      } catch (err) {
        const { message } = err.response.data;
        setError(message);
      }
    }
  }



  async function fetchShop() {
    if (shopId) {
      try {
        const result2 = await API.get(`shops/${shopId}`);
        const shopData = result2.data;
        
        const showShopData = await indexDBDexi.showShop.get(shopId);

        setShopObj({ ...shopData, showShop: showShopData.showShop });
      } catch (err) {
        const { message } = err;
        setError(message);
      }
    }
  }

  const shopID = currentShop._id
   const updateShowShopInIndexedDB = async (_shopId) => {
    try {
      const result = await API.get(`shops/${_shopId}`);
      const showShopValue = result.data.showShop;

      // Update IndexedDB with the fetched showShop value
      await indexDBDexi.showShop.put({ id: shopId, showShop: showShopValue });

      console.log('IndexedDB updated with showShop:', showShopValue);
    } catch (err) {
      console.error('Failed to update showShop in IndexedDB:', err);
    }
  };

  useEffect(() => {
    if (router.query.shopId) {
      updateShowShopInIndexedDB(router.query.shopId);
    }
  }, [router.query.shopId]);

  const orderCount = orders.filter(
    (item) =>
      (item.processed === false && item.orderStatus === 'order sent') ||
      item.orderStatus === 'confirmed'
  ).length;
  const presCount = prescriptions.filter(
    (item) =>
      (item.processed === false && item.orderStatus === 'prescription sent') ||
      item.orderStatus === 'confirmed'
  ).length;
  const saleCount = sales.filter((item) => !item.bill).length;

  useEffect(() => {
    const initializeShopData = async () => {
      if (shopId) {
        const showShopData = await indexDBDexi.showShop.get(shopId);

        if (showShopData?.showShop === undefined) {
          // If the value is not in IndexedDB, fetch from API and update IndexedDB
          await updateShowShopInIndexedDB(shopId);
          await fetchShop();
        } else {
          setShopObj({ showShop: showShopData.showShop });
          fetchOrders();
          fetchPres();
          fetchSales();
        }
      }
    };
    
    initializeShopData();
  }, [router.query.shopId]);

  useEffect(() => {
    setCurrentTab(0);
  }, [shopId]);

  useEffect(() => {
    if (quickSale) {
      setCurrentTab(1);
    }
  }, [quickSale]);



  if (shopObj === null) {
    return <div>Loading...</div>;
  }
  return (

    <OfflineProvider>
    <SalesProvider>
      <Layout>
        {shopObj.showShop ? (
          <>
            <h1>{currentShop.name}</h1>
            <Tabs
              value={currentTab}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
            >
              <Tab label="Products" key="products" />
              <Tab
                label={
                  <Badge badgeContent={saleCount} color="primary">
                    Sales
                  </Badge>
                }
                key="sales"
              />
              <Tab
                label={
                  <Badge badgeContent={orderCount} color="primary">
                    Orders
                  </Badge>
                }
                key="orders"
              />
              <Tab
                label={
                  <Badge badgeContent={presCount} color="primary">
                    Prescriptions
                  </Badge>
                }
                key="prescription"
              />
            </Tabs>

            {currentTab === 0 && <ProductsModule page="index" />}
            {currentTab === 1 && <SalesModule />}
            {currentTab === 2 && <OrdersModule />}
            {currentTab === 3 && <PrescriptionModule />}
          </>
        ) : (
          <Modal />
        )}
      </Layout>
    </SalesProvider>
  </OfflineProvider>
);
}