/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import { TextField, Button, Grid, Card } from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';
import { format } from 'date-fns'

export default function EditReceipt({ receipt, setFormState }) {
  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(receipt?.product || {});
  const [storeQuantity, setStoreQuantity] = useState(receipt?.product?.storeQuantity || '');
  const [price, setPrice] = useState(receipt?.product.price || 0);
  const [batchNumber, setBatchNumber] = useState(receipt?.product.batchNumber || '');
  const [expiry, setExpiry] = useState(format(new Date(receipt?.product.expiry), 'yyyy-MM-dd') || '2026-10-03');
  const [comment, setComment] = useState(receipt?.comment || '');

  const [supplierName, setSupplierName] = useState(
    receipt?.supplier?.name || ''
  );
  const [supplierEmail, setSupplierEmail] = useState(
    receipt?.supplier?.email || ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const editReceipt = async () => {
    if (!product._id || !storeQuantity || !price) {
      setError('Missing required fields');
    } else {
      try {
        setLoading(true);
        const updates = {
          productId: product._id,
          storeQuantity: parseFloat(storeQuantity),
          price,
          batchNumber,
          expiry,
          comment,
          staffId: getUserId(),
          supplier: {
            name: supplierName,
            email: supplierEmail,
          },
        };
        await API.patch(`receipts/${receipt._id}`, {
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
      <h3>Edit Receipt</h3>
      <Card style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                disableClearable
                value={product}
                options={products}
                onChange={(event, newValue) => {
                  setProduct(newValue);
                }}
                getOptionLabel={(option) => option.customBrandName}
                getOptionSelected={(option, value) => option._id === value._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product"
                    variant="outlined"
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Cost Price per unit"
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
                label="Quantity received"
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
                label="Total Cost Price"
                value={storeQuantity * price}
                type="number"
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Batch Number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Expiry"
                value={expiry}
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                multiline
                rows={4}
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
              <h4>Unit: {product.unit}</h4>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
              />
            </Grid> */}
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
        {/* <Grid item>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => editReceipt()}
            disabled={loading}
          >
            Edit
          </Button>
        </Grid> */}
      </Grid>
    </div>
  );
}

EditReceipt.propTypes = {
  receipt: PropTypes.object.isRequired,
  setFormState: PropTypes.func.isRequired,
};
