/* eslint-disable no-underscore-dangle */
import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';
import useAuthState from '../../stores/auth';

export default function CreateTransfer({ setFormState }) {
  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const { company, staff, accountType } = useAuthState();

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [noOfShops, setNoOfShops] = useState(0);

  const [product, setProduct] = useState('');
  const [storeQuantity, setStoreQuantity] = useState(0);
  const [shop, setShop] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createTransfer = async () => {
    if (!product || !storeQuantity) {
      setError('All fields are required');
    } else {
      try {
        setLoading(true);
        const data = {
          storeQuantity: parseFloat(storeQuantity),
          from: shopId,
          to: shop,
          productId: product,
        };
        await API.post(`transfers`, {
          ...data,
        });
        setLoading(false);
        setFormState('list');
      } catch (err) {
        setLoading(false);
        const { message } = err.response.data;
        setError(message);
      }
    }
  };

  const fetchShops = async () => {
    if (accountType === 'company') {
      setLoading(true);
      const result = await API.get(`companies/${company._id}/shops`);
      const items = result.data.filter((item) => item._id !== shopId);
      setLoading(false);
      setShops(items);
      setNoOfShops(items.length);
    }

    if (accountType === 'staff') {
      setLoading(true);
      const result = await API.get(`staff/${staff._id}/shops`);
      const items = result.data.data.filter((item) => item._id !== shopId);
      setLoading(false);
      setShops(items);
      setNoOfShops(items.length);
    }
  };

  const fetchShopProducts = async () => {
    const result = await API.get(`shops/${shopId}/products`);
    const items = result.data.data;
    setProducts(items);
  };

  React.useEffect(() => {
    fetchShops().then(() => {
      if (noOfShops === 0) {
        setError('Add another shop to transfer stocks');
      } else {
        setError('');
      }
    });
    fetchShopProducts();
  }, []);

  return (
    <div>
      {error && loading && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <h3>New Transfer</h3>
      <Card style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                select
              >
                {products.map((option) => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.customBrandName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Quantity"
                value={storeQuantity}
                type="number"
                onChange={(e) => setStoreQuantity(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Transfer to"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                select
                disabled={noOfShops === 0}
              >
                {shops.map((option) => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </form>
      </Card>
      <Grid
        container
        justifyContent="flex-end"
        spacing={2}
        style={{ marginTop: '10px' }}
      >
        <Grid item>
          <Button
            m="2"
            variant="contained"
            disableElevation
            onClick={() => setFormState('list')}
            disabled={loading}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => createTransfer()}
            disabled={loading || noOfShops === 0}
          >
            Transfer
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

CreateTransfer.propTypes = {
  setFormState: PropTypes.func.isRequired,
};
