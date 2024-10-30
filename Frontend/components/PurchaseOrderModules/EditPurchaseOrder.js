/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';

export default function EditPurchaseOrder({ order, setFormState }) {
  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(order?.product?._id || {});
  const [storeQuantity, setStoreQuantity] = useState(order?.product?.storeQuantity || 0);
  const [price, setPrice] = useState(order?.product?.price || 0);

  const [supplierName, setSupplierName] = useState(order?.supplier?.name || '');
  const [supplierEmail, setSupplierEmail] = useState(
    order?.supplier?.email || ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const editPurchaseOrder = async () => {
    if (!product || !storeQuantity) {
      setError('All fields are required');
    } else {
      try {
        setLoading(true);
        const updates = {
          productId: product,
          storeQuantity,
          price,
          supplier: {
            name: supplierName,
            email: supplierEmail,
          },
        };
        await API.patch(`purchase_orders/${order._id}`, {
          ...updates,
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

  useEffect(() => {
    API.get(`shops/${shopId}/products`)
      .then((result) => {
        const items = result.data.data;
        setProducts(items);
      })
      .catch((err) => {
        const { message } = err.response.data;
        setError(message);
      });
  }, [shopId]);

  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <h3>Edit Purchase Order</h3>
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
                autoFocus
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Price"
                value={price}
                type="number"
                onChange={(e) => setPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Store Quantity"
                value={storeQuantity}
                type="number"
                onChange={(e) => setStoreQuantity(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Total"
                value={storeQuantity * price}
                type="number"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              Supplier:
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
              />
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
            onClick={() => editPurchaseOrder()}
            disabled={loading}
          >
            Edit
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

EditPurchaseOrder.propTypes = {
  order: PropTypes.object.isRequired,
  setFormState: PropTypes.func.isRequired,
};
