/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { TextField, Button, Grid, TextareaAutosize } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PropTypes from 'prop-types';

export default function SaleProductRow({
  prescription,
  options,
  index,
  updatePrescription,
  removePrescription,
  countOfPrescriptions,
  removeSaleProduct,
}) {
  const genericNames = options.map((product) => product.genericName);
  const otherSaleProductInfo = options.find(
    (option) => option._id === prescription._id
  );
  const [filteredProducts, setFilteredProducts] = React.useState(options);
  const [product, setProduct] = React.useState(
    otherSaleProductInfo
      ? otherSaleProductInfo || {}
      : prescription?.product || {}
  );
  const [dosage, setDosage] = React.useState(prescription?.dosage || '');
  const [frequency, setFrequency] = React.useState(
    prescription?.frequency || ''
  );
  const [duration, setDuration] = React.useState(prescription?.duration || '');
  const [quantity, setQuantity] = React.useState(prescription?.quantity || 0);
  const [comment, setComment] = React.useState(prescription?.comment || '');
  const [route, setRoute] = React.useState(prescription?.route || '');

  const [genericName, setGenericName] = React.useState(
    otherSaleProductInfo?.genericName
      ? otherSaleProductInfo?.genericName || ''
      : prescription?.product?.genericName || ''
  );

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
    setQuantity(updatedTotal);
  }, [dosage, frequency, duration]);

  const [isSaved, setIsSaved] = React.useState(true);

  React.useEffect(() => {
    if (
      (product.genericName !== prescription.product.genericName ||
        product.productName !== prescription.product.productName ||
        dosage !== prescription.dosage ||
        frequency !== prescription.frequency ||
        route !== prescription.route ||
        duration !== prescription.duration ||
        quantity !== prescription.quantity ||
        comment !== prescription.comment) &&
      product &&
      dosage &&
      frequency &&
      route &&
      duration &&
      quantity
    ) {
      setIsSaved(false);
    } else {
      setIsSaved(true);
    }
  }, [product, dosage, frequency, route, duration, quantity, comment]);

  const onProductChange = (event, values) => {
    setProduct(values);
  };

  const onGenericNameChange = (event, values) => {
    setGenericName(values);
    const filtered = options.filter((item) => item.genericName === values);

    setFilteredProducts(filtered);
    setProduct('');
  };

  const savePrescription = () => {
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
    updatePrescription(data);
  };

  return (
    <Grid container spacing={2}>
      <Grid container item spacing={2}>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            autoFocus
            autoSelect
            disableClearable
            value={genericName}
            options={genericNames}
            onChange={onGenericNameChange}
            renderInput={(params) => (
              <TextField {...params} label="Generic name" variant="outlined" />
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
            getOptionLabel={(option) => option?.productName || ''}
            onChange={onProductChange}
            renderInput={(params) => (
              <TextField {...params} label="Product" variant="outlined" />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            variant="outlined"
            value={route}
            fullWidth
            label="Route"
            onChange={(e) => setRoute(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            variant="outlined"
            value={dosage}
            fullWidth
            label="Dosage"
            onChange={(e) => setDosage(e.target.value)}
            type="number"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            variant="outlined"
            value={frequency}
            fullWidth
            label="Frequency"
            onChange={(e) => setFrequency(e.target.value)}
            type="number"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            variant="outlined"
            value={duration}
            fullWidth
            label="Duration"
            onChange={(e) => setDuration(e.target.value)}
            type="number"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            variant="outlined"
            value={quantity}
            label="Quantity"
            placeholder={total}
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
            style={{ width: '100%', resize: 'vertical' }}
          />
        </Grid>
      </Grid>

      <Grid item xs={12} container justifyContent="space-between">
        <p>
          {index + 1} of {countOfPrescriptions}
        </p>

        {isSaved === false && (
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => savePrescription()}
          >
            Save
          </Button>
        )}

        {countOfPrescriptions > 1 && (
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
  );
}

SaleProductRow.propTypes = {
  prescription: PropTypes.object,
  options: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  updatePrescription: PropTypes.func.isRequired,
  removeSaleProduct: PropTypes.func.isRequired,
  countOfPrescriptions: PropTypes.number.isRequired,
  removePrescription: PropTypes.func.isRequired,
};

SaleProductRow.defaultProps = {
  prescription: {},
};
