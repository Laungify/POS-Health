/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card } from '@material-ui/core';
import ReceiptModule from '../../../components/ReceiptModule';
import StockAdjustmentModule from '../../../components/StockAdjustmentModule';
import TransferProductModule from '../../../components/TransferProductModule';
import PurchaseOrderModule from '../../../components/PurchaseOrderModule';
import ProductsModule from '../../../components/ProductsModule';
import Layout from '../../../templates/layout';
import Modal from '../../../components/modal';
import useCurrentShopState from '../../../stores/currentShop';
import useFetchShopData from '../../../hooks/fetchShowShop';

export default function InventoryPage() {
  const router = useRouter();

  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [currentTab, setCurrentTab] = useState(0);

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const {showShop, error} = useFetchShopData(shopId)


  useEffect(() => {
    setCurrentTab(0);
  }, [shopId]);


  return (
    <Layout>
      <Modal showShop={showShop} />
      <h1>{currentShop.name}</h1>

      {router.isReady ? (
        <>
          <Tabs
            value={currentTab}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="on"
          >
            <Tab label="Products" key="products" />
            <Tab label="Purchase Order" key="purchaseOrder" />
            <Tab label="Transfer" key="transfer" />
            <Tab label="Receipt" key="receipt" />
            <Tab label="Adjust Stocks" key="adjustStock" />
            <Tab label="Order Stock" key="order stock" />
          </Tabs>
          {currentTab === 0 && <ProductsModule page="inventory" />}
          {currentTab === 1 && <PurchaseOrderModule />}
          {currentTab === 2 && <TransferProductModule />}
          {currentTab === 3 && <ReceiptModule />}
          {currentTab === 4 && <StockAdjustmentModule />}
          {currentTab === 5 && (
            <Grid container justifyContent="center" spacing={2}>
              <Grid item style={{ marginTop: '10px' }}>
                <Card
                  body="true"
                  style={{
                    padding: '150px 0',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  Get suitable deals on medication from{' '}
                  <Link href="https://patameds.com/" passHref>
                    <a
                      target="_blank"
                      style={{
                        color: 'white',
                        width: '14rem',
                        height: '4rem',
                        background: 'green',
                        borderRadius: '10px',
                        marginRight: 'auto',
                        marginLeft: 'auto',
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      Patameds
                    </a>
                  </Link>
                  <div
                    style={{
                      marginTop: '1.5rem',
                      fontSize: '1.25rem',
                      width: '50%',
                      marginRight: 'auto',
                      marginLeft: 'auto',
                    }}
                  >
                    Discover and connect directly to pharmaceutical suppliers
                  </div>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </Layout>
  );
}
