/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import {
  Card,
  CardContent,
  TextareaAutosize,
  TextField,
  Button,
  Grid,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PropTypes from 'prop-types';

export default function EditSaleProductRow({
  product,
  options,
  index,
  updatePrescription,
  removePrescriptionRow,
  countOfPrescriptionProducts,
}) {
  const genericNames = options.map((item) => item.genericName);
  const [filteredProducts, setFilteredProducts] = React.useState(options);

  const [prescriptionProduct, setPrescriptionProduct] = React.useState(
    product?.product || {}
  );
  const [dosage, setDosage] = React.useState(product?.dosage || '');
  const [frequency, setFrequency] = React.useState(product?.frequency || '');
  const [duration, setDuration] = React.useState(product?.duration || '');
  const [quantity, setQuantity] = React.useState(product?.quantity || 0);
  const [comment, setComment] = React.useState(product?.comment || '');
  const [route, setRoute] = React.useState(product?.route || '');
  const [genericName, setGenericName] = React.useState(
    product?.product?.genericName || ''
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
      (prescriptionProduct !== product.product ||
        dosage !== product.dosage ||
        frequency !== product.frequency ||
        duration !== product.duration ||
        quantity !== product.quantity ||
        comment !== product.comment) &&
      prescriptionProduct &&
      dosage &&
      frequency &&
      duration &&
      quantity
    ) {
      setIsSaved(false);
    } else {
      setIsSaved(true);
    }
  }, [prescriptionProduct, dosage, frequency, duration, quantity, comment]);

  const onProductChange = (event, values) => {
    setPrescriptionProduct(values);
  };

  const onGenericNameChange = (event, values) => {
    setGenericName(values);
    const filtered = options.filter((item) => item.genericName === values);

    setFilteredProducts(filtered);
    setPrescriptionProduct('');
  };

  const saveSaleProduct = () => {
    const data = {
      index,
      product: prescriptionProduct,
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
    <span>
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
                value={prescriptionProduct}
                options={filteredProducts}
                getOptionLabel={(option) => option?.customBrandName || ''}
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
                fullWidth
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
                style={{ maxWidth: '100%' }}
              />
            </Grid>
            <Grid item xs={12} container justifyContent="space-between">
              <p>
                {index + 1} of {countOfPrescriptionProducts}
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

              {countOfPrescriptionProducts > 1 && (
                <Button
                  variant="contained"
                  style={{ color: 'white', backgroundColor: '#f44336' }}
                  disableElevation
                  onClick={() => {
                    removePrescriptionRow(index);
                  }}
                >
                  Delete
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </span>
  );
}

EditSaleProductRow.propTypes = {
  product: PropTypes.object,
  options: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  updatePrescription: PropTypes.func.isRequired,
  removePrescriptionRow: PropTypes.func.isRequired,
  countOfPrescriptionProducts: PropTypes.number.isRequired,
};

EditSaleProductRow.defaultProps = {
  product: {},
};
