import React, { useEffect, useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useRouter } from 'next/router';
import Layout from '../../../templates/layout';
import FinancialModule from '../../../components/FinancialModule';
import Modal from '../../../components/modal';
import useCurrentShop from '../../../stores/currentShop';
import useFetchShopData from '../../../hooks/fetchShowShop';

export default function FinancialsPage() {
    const router = useRouter();
    const { shopId } = router.query;

    const [currentTab, setCurrentTab] = useState(0);

    const handleChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const {showShop, error} = useFetchShopData(shopId)

    useEffect(() => {
        setCurrentTab(0);
    }, [shopId]);

    const isBrowser = typeof window !== 'undefined';

    const { currentShop } = useCurrentShop();

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
                        <Tab label="Expenses" key="expenses" />
                    </Tabs>
                    {currentTab === 0 && <FinancialModule shopId={shopId} />}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </Layout>
    );
}
