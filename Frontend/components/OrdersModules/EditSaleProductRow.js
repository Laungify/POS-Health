import React from 'react';
import {
  Table,
  TableHead,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  Card,
  CardContent,
  TextareaAutosize,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Button, Grid, Box } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

export default function EditSaleProductRow({
  sale,
  options,
  index,
  updateSale,
  removeSaleProduct,
  countOfSaleProducts,
}) {
  const [product, setProduct] = React.useState(sale || '');
  const [dosage, setDosage] = React.useState(sale?.dosage || '');
  const [frequency, setFrequency] = React.useState(sale?.frequency || '');
  const [duration, setDuration] = React.useState(sale?.duration || '');
  const [quantity, setQuantity] = React.useState(sale?.quantity || 0);
  const [comment, setComment] = React.useState(sale?.comment || '');

  const newTotal =
    dosage && frequency && duration
      ? parseInt(dosage) * parseInt(frequency) * parseInt(duration)
      : 0;
  const [total, setTotal] = React.useState(newTotal);

  React.useEffect(() => {
    const newTotal =
      dosage && frequency && duration
        ? parseInt(dosage) * parseInt(frequency) * parseInt(duration)
        : 0;
    setTotal(newTotal);
    setQuantity(newTotal);
  }, [dosage, frequency, duration]);

  const [isSaved, setIsSaved] = React.useState(true);

  React.useEffect(() => {
    if (
      product.productName !== sale.productName ||
      dosage !== sale.dosage ||
      frequency !== sale.frequency ||
      duration !== sale.duration ||
      quantity !== sale.quantity ||
      comment !== sale.comment
    ) {
      setIsSaved(false);
    } else {
      setIsSaved(true);
    }
  }, [product, dosage, frequency, duration, quantity, comment]);

  const onProductChange = (event, values) => {
    setProduct(values);
  };

  const saveSaleProduct = () => {
    const data = {
      index,
      ...product,
      dosage,
      frequency,
      duration,
      quantity,
      comment,
    };
    updateSale(data);
  };

  const [currentTab, setCurrentTab] = React.useState(0);

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const [customer, setCustomer] = React.useState({});

  const newCustomer = (data) => {
    setCustomer(data);
  };

  return (
    <span>
      <Card style={{ margin: '10px' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                autoSelect={true}
                disableClearable={true}
                value={product}
                options={options}
                getOptionLabel={(option) => option?.productName || ''}
                onChange={onProductChange}
                renderInput={(params) => (
                  <TextField {...params} label="Product" variant="outlined" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                value={dosage}
                fullWidth
                label="Dosage"
                onChange={(e) => setDosage(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                value={frequency}
                fullWidth
                label="Frequency"
                onChange={(e) => setFrequency(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                value={duration}
                fullWidth
                label="Duration"
                onChange={(e) => setDuration(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                value={quantity}
                fullWidth
                label="Quantity"
                placeholder={total}
                onChange={(e) => setQuantity(e.target.value)}
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
            <Grid item xs={12} container justifyContent="space-between">
              <p>
                {index + 1} of {countOfSaleProducts}
              </p>
              {isSaved == false && (
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
    </span>
  );
}
