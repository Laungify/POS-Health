/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';

function SelectDrug({ setProduct, product, setFormStep, setFormState }) {
  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  const onChangeProduct = (product) => {
    setProduct(product);
    setFormStep(3);
  };

  async function fetchShopProducts() {
    try {
      setLoading(true);
      const result = await API.get(`shops/${shopId}/products`);

      const products = result.data.data;

      setProducts(products);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  }

  useEffect(() => {
    fetchShopProducts();
  }, []);

  const otherProduct = () => {
    setProduct('');
    setFormStep(2);
  };

  return (
    <div>
      <Card style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                disableClearable
                value={product}
                options={products}
                getOptionLabel={(option) =>
                  option?.customBrandName?.toLowerCase() || ''
                }
                onChange={(event, newValue) => {
                  onChangeProduct(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select product"
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              style={{ margin: 'auto', textAlign: 'center' }}
            >
              <Button
                m="2"
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => otherProduct()}
              >
                New Product
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      <Grid container justifyContent="flex-end" style={{ marginTop: '10px' }}>
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
      </Grid>
    </div>
  );
}

function AddPurchaseOrder({ product, setFormState, setFormStep }) {
  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [storeQuantity, setStoreQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createPurchaseOrder = async () => {
    try {
      setLoading(true);
      const purchaseOrder = {
        productId: product._id,
        price,
        storeQuantity,
        shopId,
        supplier: {
          name: supplierName,
          email: supplierEmail,
        },
      };
      await API.post(`purchase_orders`, {
        ...purchaseOrder,
      });
      setLoading(false);
      setFormState('list');
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  const goBack = () => {
    /* setDrug(""); */
    setFormStep(1);
  };

  return (
    <div>
      <p style={{ color: 'red' }}>{error}</p>
      <Card body="true" style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Product"
                disabled
                value={product.customBrandName}
              />
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
            onClick={() => goBack()}
            disabled={loading}
          >
            Back
          </Button>
        </Grid>
        <Grid item>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => createPurchaseOrder()}
          >
            Create
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

function AddProduct({ setFormStep, setProduct }) {
  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [productName, setProductName] = React.useState();
  const [formulation, setFormulation] = React.useState();
  const [strength, setStrength] = React.useState();
  const [packSize, setPackSize] = React.useState('');
  const [genericName, setGenericName] = React.useState();
  const [costPrice, setCostPrice] = React.useState('');
  const [sellingPrice, setSellingPrice] = React.useState('');
  const [supplier, setSupplier] = React.useState();
  const [expiry, setExpiry] = React.useState('');
  const [batchNumber, setBatchNumber] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [salesChannel, setSalesChannel] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const salesChannels = ['POS', 'Online Store'];

  const handleChangeSalesChannel = (event) => {
    setSalesChannel(event.target.value);
  };

  const newProduct = async () => {
    setError('');
    const product = {
      productName,
      formulation,
      strength,
      packSize,
      genericName,
      costPrice,
      sellingPrice,
      supplier,
      expiry,
      batchNumber,
      unit,
      category,
      tags,
      salesChannel,
      reorderLevel: 0,
      shopId,
      storeQuantity: 0,
    };
    if (
      !productName ||
      !formulation ||
      !strength ||
      !packSize ||
      !genericName ||
      !costPrice ||
      !sellingPrice ||
      //!supplier ||
      !expiry ||
      //!batchNumber ||
      !unit ||
      //!category ||
      !salesChannel ||
      !shopId
    ) {
      setError('All fields are required');
    } else {
      try {
        setLoading(true);
        const result = await API.post(`products`, {
          ...product,
        });
        setProduct(result.data);
        setLoading(false);
        setFormStep(3);
      } catch (err) {
        setLoading(false);
        const { message } = err.response.data;
        setError(message);
      }
    }
  };

  const goBack = () => {
    /* setDrug(""); */
    setFormStep(1);
  };

  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <h3>New purchase order</h3>
      <Card style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Product Name"
                autoFocus
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Formulation"
                value={formulation}
                onChange={(e) => setFormulation(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Strength"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Pack Size"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Generic Name"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Cost Price"
                value={costPrice}
                type="number"
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Selling Price"
                value={sellingPrice}
                type="number"
                onChange={(e) => setSellingPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
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
                variant="outlined"
                margin="normal"
                required
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
                required
                fullWidth
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Sales Channel"
                value={salesChannel}
                onChange={handleChangeSalesChannel}
                select
              >
                {salesChannels.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
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
            onClick={() => goBack()}
            disabled={loading}
          >
            Back
          </Button>
        </Grid>
        <Grid item>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => newProduct()}
            disabled={loading}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default function CreatePurchaseOrder({ setFormState }) {
  const [product, setProduct] = useState('');
  const [formStep, setFormStep] = useState(1);

  return (
    <div>
      <h2>Create Purchase Order</h2>
      {formStep === 1 && (
        <SelectDrug
          setProduct={setProduct}
          product={product}
          setFormStep={setFormStep}
          setFormState={setFormState}
        />
      )}
      {formStep === 2 && (
        <AddProduct setProduct={setProduct} setFormStep={setFormStep} />
      )}
      {formStep === 3 && (
        <AddPurchaseOrder
          product={product}
          setFormState={setFormState}
          setFormStep={setFormStep}
        />
      )}
    </div>
  );
}

CreatePurchaseOrder.propTypes = {
  setFormState: PropTypes.func.isRequired,
};

SelectDrug.propTypes = {
  setProduct: PropTypes.func.isRequired,
  product: PropTypes.string.isRequired,
  setFormStep: PropTypes.func.isRequired,
  setFormState: PropTypes.func.isRequired,
};

AddProduct.propTypes = {
  setFormStep: PropTypes.func.isRequired,
  setProduct: PropTypes.func.isRequired,
};
AddPurchaseOrder.propTypes = {
  product: PropTypes.string.isRequired,
  setFormStep: PropTypes.func.isRequired,
  setFormState: PropTypes.func.isRequired,
};
