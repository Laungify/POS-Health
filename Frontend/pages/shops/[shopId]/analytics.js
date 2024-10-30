import React, { useEffect, useState } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useRouter } from 'next/router';
import Layout from '../../../templates/layout';
import Modal from '../../../components/modal';
import Analytics from '../../../components/Analytics';
import useCurrentShopState from '../../../stores/currentShop';
import indexDBDexi from '../../../utils/dexiIndexDB';
import useFetchShopData from '../../../hooks/fetchShowShop';


export default function AnalyticsPage() {
  const { currentShop } = useCurrentShopState();
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
 



  return (
    <Layout>
      <Modal showShop={showShop} />
      <h1>{currentShop.name}</h1>

      <Tabs
        value={currentTab}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="on"
      >
        <Tab label="Analytics" key="analytics" />
      </Tabs>

      <div style={{ textAlign: 'center' }}>
        <h3>Overview</h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: "center",
            width: "100%",
            height: "100%",
            overflow: "auto",
            //margin: "1em",
          }}
        >
          <div
            style={{
              margin: "0 1em 1em 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="150px"
              width="200px"
              chartId="6316014b-5381-4610-8ed3-5f38f45078db"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "0 1em 1em 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="150px"
              width="200px"
              chartId="bc234048-9935-4704-b8b1-4cb1bc5cc187"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "0 1em 1em 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="150px"
              width="200px"
              chartId="6bfa81e2-80a9-4dba-ae2e-7e6eeee3d06b"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "0 1em 1em 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="150px"
              width="200px"
              chartId="f7a31269-d54f-4cc6-a831-b00e62875cac"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "0 1em 1em 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="150px"
              width="200px"
              chartId="9ba12543-fe5f-467d-b198-bc5f62628457"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="500px"
              width="700px"
              chartId="6315c324-5a97-488a-882c-b631633ef3b6"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "1em 1em 0 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="500px"
              width="700px"
              chartId="064ffbfb-a3b2-4812-aff8-9941e9e76108"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "1em 1em 0 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="500px"
              width="700px"
              chartId="ef516261-954c-41cc-8954-f382d00768e8"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "1em 1em 0 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="500px"
              width="700px"
              chartId="94975619-df56-4f46-a865-0ef3a5da36a8"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
          <div
            style={{
              margin: "1em 1em 0 0",
              border: "1px solid #fff",
              borderRadius: "15px",
              padding: "5px",
              background: "#fff"
            }}>
            <Analytics
              height="600px"
              width="750px"
              chartId="006aed67-b693-4d2e-b3b2-fd220ee60047"
              filter={{
                'shop': { $oid: shopId }
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
