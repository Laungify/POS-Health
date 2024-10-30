/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  TextareaAutosize,
} from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';

import PropTypes from 'prop-types';

export default function SaleProductRow({
  sale,
  options,
  index,
  updateSale,
  removeSaleProduct,
  countOfSaleProducts,
}) {
  const genericNames = options.map((product) => product.genericName);
  const [filteredProducts, setFilteredProducts] = React.useState(options);
  const [product, setProduct] = React.useState(sale?.product || '');
  const [dosage, setDosage] = React.useState(sale?.dosage || 1);
  const [frequency, setFrequency] = React.useState(sale?.frequency || 1);
  const [duration, setDuration] = React.useState(sale?.duration || 1);
  const [quantity, setQuantity] = React.useState(sale?.quantity || 0);
  const [comment, setComment] = React.useState(sale?.comment || '');
  const [route, setRoute] = React.useState(sale?.route || '');
  const [storeQuantity] = React.useState(product?.storeQuantity);
  const [genericName, setGenericName] = React.useState(
    sale?.product?.genericName || ''
  );

  // console.log("sales", sale)
  // console.log("product", product)
  // console.log("sales quantity", product?.storeQuantity)

  const newTotal =
    dosage && frequency && duration
      ? parseInt(dosage, 10) * parseInt(frequency, 10) * parseInt(duration, 10)
      : 0;
  const [total, setTotal] = React.useState(newTotal);

  React.useEffect(() => {
    const updatedTotal =
      dosage && frequency && duration
        ? parseInt(dosage, 10) *
        parseInt(frequency, 10) *
        parseInt(duration, 10)
        : 0;
    setTotal(updatedTotal);
    if (!quantity) {
      setQuantity(updatedTotal);
    }
  }, [dosage, frequency, duration]);

  const [isSaved, setIsSaved] = React.useState(true);

  React.useEffect(() => {
    if (
      (product !== sale.product ||
        dosage !== sale.dosage ||
        frequency !== sale.frequency ||
        duration !== sale.duration ||
        quantity !== sale.quantity ||
        comment !== sale.comment) &&
      product &&
      dosage &&
      frequency &&
      duration &&
      quantity
    ) {
      setIsSaved(false);
    } else {
      setIsSaved(true);
    }
  }, [product, dosage, frequency, duration, quantity, comment]);

  const onProductChange = (event, values) => {
    setProduct(values);
  };

  const onGenericNameChange = (event, values) => {
    setGenericName(values);
    const filtered = options.filter((item) => item.genericName === values);

    setFilteredProducts(filtered);
    setProduct('');
  };

  const saveSaleProduct = () => {
    const data = {
      index,
      product,
      dosage,
      frequency,
      duration,
      quantity,
      route,
      comment,
    };
    updateSale(data);
  };

  return (
    <Card style={{ margin: '10px' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              autoFocus
              autoSelect
              disableClearable
              value={genericName}
              options={genericNames}
              onChange={onGenericNameChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Generic name"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              required
              autoSelect
              disableClearable
              value={product}
              options={filteredProducts}
              getOptionLabel={(option) => option?.customBrandName?.replace("not applicable", "").replace("not applicable", "") || ''}
              onChange={onProductChange}
              renderInput={(params) => (
                <TextField {...params} label="Product" variant="outlined" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              //required
              variant="outlined"
              value={route}
              fullWidth
              label="Route"
              onChange={(e) => setRoute(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              //required
              variant="outlined"
              value={dosage}
              fullWidth
              label="Dosage"
              onChange={(e) => setDosage(e.target.value)}
            //type="number"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              //required
              variant="outlined"
              value={frequency}
              fullWidth
              label="Frequency"
              onChange={(e) => setFrequency(e.target.value)}
            //type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              //required
              variant="outlined"
              value={duration}
              fullWidth
              label="Duration"
              onChange={(e) => setDuration(e.target.value)}
            //type="number"
            />
          </Grid>
          <Grid item xs={12}>
            <p>Available Quantity: {product?.storeQuantity}</p>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              variant="outlined"
              value={quantity}
              fullWidth
              label="Quantity"
              error={quantity < 0 || quantity > product?.storeQuantity}
              helperText={(quantity < 0 || quantity > product?.storeQuantity) && "Quantity should be between 0 and " + product?.storeQuantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextareaAutosize
              minRows={5}
              placeholder="How to take the drug"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Grid>
          {sale.product?.sellingPrice && <div style={{ margin: "0.5rem", fontWeight: "bold" }}>Product Price: {sale.product?.sellingPrice}</div>}
          {sale.product?.unit && <div style={{ margin: "0.5rem", fontWeight: "bold" }}>Unit: {sale.product?.unit}</div>}
          {sale.product?.discount?.value && <div style={{ margin: "0.5rem", fontWeight: "bold" }}>Product Discount: {sale.product?.discount?.value}%</div>}
          <Grid item xs={12} container justifyContent="space-between">
            {sale.product?.sellingPrice && <div style={{ fontWeight: "bold" }}>Product Total Cost: {sale.product?.sellingPrice * quantity *
              (sale.product.discount?.value ? ((100 - sale.product.discount?.value) / 100) : 1)}</div>}
            <p>
              {index + 1} of {countOfSaleProducts}
            </p>
            {isSaved === false && (
              <Button
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => saveSaleProduct()}
              >
                Save
              </Button>
            )}

            {countOfSaleProducts > 1 && (
              <Button
                variant="contained"
                style={{ color: 'white', backgroundColor: '#f44336' }}
                disableElevation
                onClick={() => removeSaleProduct(index)}
              >
                Delete
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

SaleProductRow.propTypes = {
  sale: PropTypes.object,
  options: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  updateSale: PropTypes.func.isRequired,
  removeSaleProduct: PropTypes.func.isRequired,
  countOfSaleProducts: PropTypes.number.isRequired,
};

SaleProductRow.defaultProps = {
  sale: {},
};
