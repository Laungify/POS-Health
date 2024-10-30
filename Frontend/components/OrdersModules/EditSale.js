/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import { Alert } from '@material-ui/lab';
import React, { useEffect } from 'react';
import AddBoxIcon from '@material-ui/icons/AddBox';
import IconButton from '@material-ui/core/IconButton';
import { nanoid } from 'nanoid';
import {
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Grid,
  MenuItem,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import EditSaleProductRow from './EditSaleProductRow';
import API from '../../utils/api';

function ConfirmForm({ sale, patient, discount }) {
  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item>
        <Card>
          <CardContent>
            <h4>Products:</h4>
            {sale.map((item) => (
              <Accordion key={item._id}>
                <AccordionSummary
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <h3>{`${item.productName} ${item.formulation} ${item.strength} ${item.packSize}`}</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    <Grid item xs={12}>
                      <p>Dosage: {item.dosage}</p>
                      <p>Frequency: {item.frequency}</p>
                      <p>Duration: {item.duration}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Comment: {item.comment}</p>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}

            <h4>Additional Info:</h4>
            <Accordion>
              <AccordionSummary
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <h3>Customer</h3>
              </AccordionSummary>
              <AccordionDetails>
                {patient.name && (
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item xs={12}>
                      <p>Name: {patient.name}</p>
                    </Grid>
                    {patient.email && (
                      <Grid item xs={12}>
                        <p>Email: {patient.email}</p>
                      </Grid>
                    )}

                    {patient.phoneNumber && (
                      <Grid item xs={12}>
                        <p>Phone Number: {patient.phoneNumber}</p>
                      </Grid>
                    )}
                  </Grid>
                )}
                {!patient.name && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p>No Patient</p>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <h3>Discount</h3>
              </AccordionSummary>
              <AccordionDetails>
                {discount.type && (
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <p>Discount Type: {discount.type}</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <p>Discount Value: {discount.value}</p>
                    </Grid>
                  </Grid>
                )}
                {!discount.type && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p>No Discount</p>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function CustomerForm({ customer, setCustomer }) {
  const [name, setName] = React.useState(customer?.name || '');
  const [email, setEmail] = React.useState(customer?.email || '');
  const [phoneNumber, setPhoneNumber] = React.useState(
    customer?.phoneNumber || ''
  );

  const [actionType, setActionType] = React.useState(
    customer?.name ? 'list' : 'list'
  );

  const changeActionType = (newAction) => {
    setActionType(newAction);
  };

  const addCustomer = () => {
    const data = {
      name,
      email,
      phoneNumber,
    };
    setCustomer(data);
    setActionType('list');
  };

  const removeCustomer = () => {
    setName('');
    setEmail('');
    setPhoneNumber('');
    const data = {};
    setCustomer(data);
  };

  const hasCustomer = !!Object.keys(customer).length;

  return (
    <Grid item>
      {actionType === 'add' && (
        <Card>
          <CardContent>
            <h2>Add Customer</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  autoFocus
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  onClick={() => changeActionType('list')}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!name || (!email && !phoneNumber)}
                  onClick={() => addCustomer()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'edit' && (
        <Card>
          <CardContent>
            <h2>Edit Customer</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  disabled={!name || (!email && !phoneNumber)}
                  onClick={() => changeActionType('list')}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!name || (!email && !phoneNumber)}
                  onClick={() => addCustomer()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'list' && hasCustomer && (
        <Card>
          <CardContent>
            <h2>Customer</h2>
            <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12}>
                <p>Name: {name}</p>
              </Grid>
              {email && (
                <Grid item xs={12}>
                  <p>Email: {email}</p>
                </Grid>
              )}

              {phoneNumber && (
                <Grid item xs={12}>
                  <p>Phone Number: {phoneNumber}</p>
                </Grid>
              )}
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => removeCustomer()}
                >
                  Remove
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() => changeActionType('edit')}
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'list' && !hasCustomer && (
        <Card>
          <CardContent>
            <Grid container spacing={1} justifyContent="center">
              <h2>No Customer</h2>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  fullWidth
                  onClick={() => changeActionType('add')}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}
    </Grid>
  );
}

function DiscountForm({ discount, setDiscount, saleProducts }) {
  const [actionType, setActionType] = React.useState(
    discount?.value ? 'list' : 'list'
  );

  const changeActionType = (newAction) => {
    setActionType(newAction);
  };

  const [discountValue, setDiscountValue] = React.useState(
    discount?.value || ''
  );
  const [discountType, setDiscountType] = React.useState(discount?.type || '');

  const addDiscount = () => {
    const data = {
      value: discountValue,
      type: discountType,
    };
    setDiscount(data);
    setActionType('list');
  };

  const removeDiscount = () => {
    setDiscountValue('');
    setDiscountType('');
    const data = {};
    setDiscount(data);
  };

  const hasDiscount = !!Object.keys(discount).length;

  const types = ['Amount', 'Percentage', 'Price Override'];

  const handleChangeDiscountType = (event) => {
    setDiscountType(event.target.value);
  };

  let discountAmount = 0;

  const total = saleProducts.map(
    (item) => parseInt(item.sellingPrice, 10) * parseInt(item.quantity, 10)
  );

  let discountText = '';
  if (discount.type === 'Percentage') {
    discountAmount = total * (parseInt(discount.value, 10) / 100);
    discountText = `- ${discountAmount}`;
  }

  if (discount.type === 'Amount') {
    discountAmount = parseInt(discount.value, 10);
    discountText = `- ${discountAmount}`;
  }

  if (discount.type === 'Price Override') {
    discountAmount = total - parseInt(discount.value, 10);
    discountText = `- ${discountAmount}`;
  }

  return (
    <Grid item>
      {actionType === 'add' && (
        <Card>
          <CardContent>
            <h2>Add Discount</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  autoFocus
                  required
                  fullWidth
                  label="Discount Type"
                  value={discountType}
                  onChange={handleChangeDiscountType}
                  select
                >
                  {types.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Discount Value"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  onClick={() => changeActionType('list')}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!discountType || !discountValue}
                  onClick={() => addDiscount()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'edit' && (
        <Card>
          <CardContent>
            <h2>Edit Discount</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  autoFocus
                  required
                  fullWidth
                  label="Discount Type"
                  value={discountType}
                  onChange={handleChangeDiscountType}
                  select
                >
                  {types.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Discount Value"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  onClick={() => changeActionType('list')}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!discountType || !discountValue}
                  onClick={() => addDiscount()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'list' && hasDiscount && (
        <Card>
          <CardContent>
            <h2>Discount</h2>
            <h2 style={{ color: 'green' }}>{discountText}</h2>
            {/* <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12}>
                <p>Discount Type: {discountType}</p>
              </Grid>
              <Grid item xs={12}>
                <p>Discount Value: {discountValue}</p>
              </Grid>
            </Grid> */}
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => removeDiscount()}
                >
                  Remove
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() => changeActionType('edit')}
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'list' && !hasDiscount && (
        <Card>
          <CardContent>
            <Grid container spacing={1} justifyContent="center">
              <h2>No Discount</h2>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  fullWidth
                  onClick={() => changeActionType('add')}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}
    </Grid>
  );
}

function BillingForm({ bill, setBill, saleProducts, discount }) {
  const [received, setReceived] = React.useState(bill?.received || '');
  const [change, setChange] = React.useState(bill?.change || '');

  const [actionType, setActionType] = React.useState('list');

  const changeActionType = (newAction) => {
    setActionType(newAction);
  };

  const addBill = () => {
    const data = {
      received,
      change,
    };
    setBill(data);
    setActionType('list');
  };

  const removeBill = () => {
    setReceived('');
    setChange('');
    const data = {};
    setBill(data);
  };

  const hasBill = !!Object.keys(bill).length;

  let discountAmount = 0;

  const total = saleProducts.map(
    (item) => parseInt(item.sellingPrice, 10) * parseInt(item.quantity, 10)
  );

  let totalCost = total;

  if (discount.type === 'Percentage') {
    discountAmount = total * (parseInt(discount.value, 10) / 100);
    totalCost = total - discountAmount;
  }

  if (discount.type === 'Amount') {
    discountAmount = parseInt(discount.value, 10);
    totalCost = total - parseInt(discount.value, 10);
  }

  if (discount.type === 'Price Override') {
    discountAmount = total - parseInt(discount.value, 10);
    totalCost = parseInt(discount.value, 10);
  }

  return (
    <Grid item>
      {actionType === 'add' && (
        <Card>
          <CardContent>
            <h2>Bill</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <h3>Total = {totalCost}</h3>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  autoFocus
                  label="Received"
                  value={received}
                  placeholder={totalCost}
                  type="number"
                  onChange={(e) => setReceived(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Change"
                  value={change}
                  placeholder={received - totalCost}
                  type="number"
                  onChange={(e) => setChange(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  onClick={() => changeActionType('list')}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!received || !change}
                  onClick={() => addBill()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'edit' && (
        <Card>
          <CardContent>
            <h2>Edit Bill</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Received"
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Change"
                  value={change}
                  onChange={(e) => setChange(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  onClick={() => changeActionType('list')}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!received || !change}
                  onClick={() => addBill()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'list' && hasBill && (
        <Card>
          <CardContent>
            <h2>Billing</h2>
            <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12}>
                <h3 style={{ color: 'green' }}>Received: {received}</h3>
              </Grid>
              <Grid item xs={12}>
                <h3 style={{ color: 'red' }}>Change: {change}</h3>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => removeBill()}
                >
                  Remove
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() => changeActionType('edit')}
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'list' && !hasBill && (
        <Card>
          <CardContent>
            <Grid container spacing={1} justifyContent="center">
              <h2>No Billing</h2>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  fullWidth
                  onClick={() => changeActionType('add')}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}
    </Grid>
  );
}

export default function EditSale({ sale, setFormState, shopId }) {
  const { products } = sale;
  const saleId = sale._id;

  const newSaleProducts = products;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const [allProducts, setAllProducts] = React.useState([]);
  const [saleProductOptions, setSaleProductOptions] = React.useState([]);
  const [saleProducts, setSaleProducts] = React.useState(newSaleProducts);
  const countOfProducts = saleProductOptions.length;

  const filterAllProducts = () => {
    const productsList = [...allProducts];

    saleProducts.forEach((data) => {
      const product = data;
      const arrayIndex = productsList.findIndex(
        (item) => item._id === product._id
      );
      if (arrayIndex !== -1) {
        productsList.splice(arrayIndex, 1);
      }
    });
    setSaleProductOptions(productsList);
  };

  const updateSale = (data) => {
    const saleProduct = saleProducts[data.index];
    if (saleProduct) {
      const saleProductIndex = data.index;
      const newSaleProducts = [...saleProducts];
      let newSaleProduct = { ...saleProducts[saleProductIndex] };
      newSaleProduct = { ...data };
      newSaleProducts[saleProductIndex] = newSaleProduct;
      setSaleProducts(newSaleProducts);
    } else {
      const newSaleProducts = saleProducts;
      const newSaleProduct = {
        ...data,
      };
      newSaleProducts.push(newSaleProduct);
      setSaleProducts(newSaleProducts);
    }
  };

  const removeSaleProduct = (index) => {
    const newSaleProducts = [...saleProducts];
    newSaleProducts.splice(index, 1);
    setSaleProducts(newSaleProducts);

    if (saleProducts.length === 1) {
      setSaleProducts([{ product: {}, quantity: 1 }]);
    }
  };

  const addSaleProduct = () => {
    setSaleProducts([...saleProducts, { product: {}, quantity: 1 }]);
  };

  const editSale = async () => {
    let salesPrice = 0;
    const products = saleProducts.map((sale) => {
      salesPrice += sale.sellingPrice * sale.quantity;
      return {
        ...sale,
      };
    });
    const data = {
      shopId,
      salesPrice,
      products,
      customer,
      discount,
      orderId: sale.orderId,
    };

    try {
      setLoading(true);
      await API.post(`sales`, { ...data });
      setLoading(false);
      setFormState('list');
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  useEffect(() => {
    filterAllProducts();
  }, [saleProducts]);

  useEffect(() => {
    API.get(`shops/${shopId}/products`)
      .then((result) => {
        const items = result.data.data;
        setAllProducts(items);
        setSaleProductOptions(items);
      })
      .catch((err) => {
        const { message } = err.response.data;
        setError(message);
      });
  }, [shopId]);

  const isLastSaleProductEmpty =
    !saleProducts[saleProducts.length - 1].productName;

  const [formStep, setFormStep] = React.useState(1);

  React.useEffect(() => {
    if (formStep === 4) {
      editSale();
    }
  }, [formStep]);

  const [customer, setCustomer] = React.useState(sale?.customer || {});

  const newCustomer = (data) => {
    setCustomer(data);
  };

  const [discount, setDiscount] = React.useState(sale?.discount || {});

  const newDiscount = (data) => {
    setDiscount(data);
  };

  const [bill, setBill] = React.useState(sale?.bill || {});

  const newBill = (data) => {
    setBill(data);
  };

  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <h2>Create Sale</h2>
      {formStep === 1 && (
        <span>
          <h3>Products</h3>

          {saleProducts.map((sale, index) => (
            <EditSaleProductRow
              index={index}
              key={nanoid()}
              sale={sale}
              options={saleProductOptions}
              updateSale={updateSale}
              removeSaleProduct={removeSaleProduct}
              countOfSaleProducts={saleProducts.length}
            />
          ))}

          <br />

          <Grid container justifyContent="center">
            <IconButton
              onClick={addSaleProduct}
              disabled={countOfProducts === 0 || isLastSaleProductEmpty}
            >
              <AddBoxIcon
                fontSize="large"
                style={{
                  color: `${
                    countOfProducts === 0 || isLastSaleProductEmpty
                      ? 'grey'
                      : 'green'
                  }`,
                }}
              />
            </IconButton>
          </Grid>
        </span>
      )}

      {formStep === 2 && (
        <span>
          <h3>Customer/Discount</h3>
          <Grid container justifyContent="center" spacing={2}>
            <CustomerForm customer={customer} newCustomer={newCustomer} />
            <DiscountForm
              discount={discount}
              newDiscount={newDiscount}
              saleProducts={saleProducts}
            />
            <BillingForm
              bill={bill}
              saleProducts={saleProducts}
              discount={discount}
              newBill={newBill}
            />
          </Grid>
        </span>
      )}

      {formStep === 3 && (
        <span>
          <h3>Confirm Sale</h3>
          <ConfirmForm
            sale={saleProducts}
            customer={customer}
            discount={discount}
          />
        </span>
      )}

      <Grid
        container
        justifyContent="center"
        spacing={2}
        style={{ marginTop: '20px' }}
      >
        <Grid item>
          <Button
            m="2"
            variant="contained"
            disableElevation
            onClick={() => setFormState('list')}
          >
            Cancel
          </Button>
        </Grid>

        {formStep > 1 && (
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => setFormStep(formStep - 1)}
            >
              Back
            </Button>
          </Grid>
        )}

        <Grid item>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
            disabled={isLastSaleProductEmpty}
            onClick={() => setFormStep(formStep + 1)}
          >
            {formStep === 3 ? 'Confirm' : 'Next'}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

EditSale.propTypes = {
  sale: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
};

CustomerForm.propTypes = {
  customer: PropTypes.object.isRequired,
  setCustomer: PropTypes.func.isRequired,
};

BillingForm.propTypes = {
  bill: PropTypes.object,
  setBill: PropTypes.func.isRequired,
  discount: PropTypes.object,
  saleProducts: PropTypes.array.isRequired,
};

BillingForm.defaultProps = {
  bill: {},
  discount: {},
};

DiscountForm.propTypes = {
  discount: PropTypes.object,
  setDiscount: PropTypes.func.isRequired,
  saleProducts: PropTypes.array.isRequired,
};

DiscountForm.defaultProps = {
  discount: {},
};

ConfirmForm.propTypes = {
  sale: PropTypes.object.isRequired,
  patient: PropTypes.object.isRequired,
  discount: PropTypes.object,
};

ConfirmForm.defaultProps = {
  discount: {},
};
