/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  IconButton,
  CardContent,
  Card,
  CardActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  TextareaAutosize,
} from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { Alert } from '@material-ui/lab';
import { formatDateTime, calculateAge } from '../../utils/helpers'
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useAuthState from '../../stores/auth';
import useSnackbarState from '../../stores/snackbar'

import CreateSaleProductRow from './CreateSaleProductRow';

function DiagnosisForm({ diagnosis, setDiagnosis }) {
  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item>
        <Card>
          <CardContent>
            <h3>Enter diagnosis </h3>

            <TextareaAutosize
              minRows={5}
              placeholder="Diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
function LogForm({ prescription }) {
  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item>
        <div><b>Date Ordered: </b>{formatDateTime(prescription.createdAt)}</div>

        {prescription.quoteTime && (<div><b>Date Quoted: </b>{formatDateTime(prescription.quoteTime)}</div>)}

        {prescription.confirmTime && (<div><b>Date Confirmed: </b>{formatDateTime(prescription.confirmTime)}</div>)}

        {prescription.cancellationTime && (<div><b>Date Cancelled: </b>{formatDateTime(prescription.cancellationTime)}</div>)}

        {prescription.endSaleTime && (<div><b>Date Sold: </b>{formatDateTime(prescription.endSaleTime)}</div>)}

        {prescription.receiveTime && (<div><b>Date Received: </b>{formatDateTime(prescription.receiveTime)}</div>)}

      </Grid>
    </Grid>
  );
}

function DiscountForm({ discount, setDiscount, saleProducts }) {
  const [actionType, setActionType] = React.useState('list');

  const [discountValue, setDiscountValue] = React.useState(
    discount?.value || 0
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

  const hasDiscount = Object.keys(discount).length;

  const types = ['Amount', 'Percentage', 'Price Override'];

  const [discountAmountLabel, setDiscountAmountLabel] =
    useState('Discount Value')

  const handleChangeDiscountType = (event) => {
    setDiscountType(event.target.value);
    const data = {
      value: discountValue,
      type: discountType,
    };
    setDiscount(data);

    if (event.target.value === 'Percentage') {
      setDiscountAmountLabel('Discount Value (%)')
    }

    if (event.target.value === 'Price Override') {
      setDiscountAmountLabel('New Price')
    }

    if (event.target.value === 'Amount') {
      setDiscountAmountLabel('Discount Value')
    }
  };

  let discountAmount = 0;

  // const total = saleProducts.map(
  //   (item) =>
  //     parseInt(item.product.sellingPrice, 10) * parseInt(item.quantity, 10)
  // ).reduce((a, b) => a + b);

  const total = saleProducts
    .map((item) =>
      item.product.discount?.value
        ? parseFloat(
          Math.round(
            item.product.sellingPrice *
            ((100 - item.product.discount?.value) / 100)
          ),
          10
        ) * parseFloat(item.quantity)
        : parseFloat(item.product.sellingPrice) * parseFloat(item.quantity)
    )
    .reduce((a, b) => a + b);

  let discountText = '';
  if (discount?.type === 'Percentage') {
    discountAmount = total * (parseFloat(discount.value) / 100);
    discountText = `- ${discountAmount} Ksh`;
  }

  if (discount?.type === 'Amount') {
    discountAmount = parseFloat(discount.value);
    discountText = `- ${discountAmount} Ksh`;
  }

  if (discount?.type === 'Price Override') {
    discountAmount = total - parseFloat(discount.value);
    discountText = `- ${discountAmount} Ksh`;
  }

  return (
    <Grid item>
      {actionType === 'add' && (
        <Card>
          <CardContent>
            <h2>Add Discount</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <h3>Total = {total}</h3>
              </Grid>
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
                  label={discountAmountLabel}
                  value={discountValue}
                  type="number"
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
                  onClick={() => setActionType('list')}
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
                  label={discountAmountLabel}
                  value={discountValue}
                  type="number"
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
                  onClick={() => setActionType('list')}
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
            <Grid item xs={12}>
              <h3>Total = {total} Ksh</h3>
            </Grid>
            <h2 style={{ color: 'green' }}>{discountText}</h2>
            {/*  <h2>Discount</h2>
            <Grid container spacing={1} justifyContent="center">
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
                  onClick={() => setDiscount({})}
                >
                  Remove
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() => setActionType('edit')}
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
              <h2>No Overall Discount</h2>
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
                  onClick={() => setActionType('add')}
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
  const [paymentMethod, setPaymentMethod] = React.useState(
    bill?.paymentMethod || ''
  );

  const [actionType, setActionType] = React.useState('list');

  // const total = saleProducts.map(
  //   (item) =>
  //     parseInt(item.product.sellingPrice, 10) * parseInt(item.quantity, 10)
  // ).reduce((a, b) => a + b);

  const total = saleProducts
    .map((item) =>
      item.product.discount?.value
        ? parseFloat(
          Math.round(
            item.product.sellingPrice *
            ((100 - item.product.discount?.value) / 100)
          ),
          10
        ) * parseFloat(item.quantity)
        : parseFloat(item.product.sellingPrice) * parseFloat(item.quantity)
    )
    .reduce((a, b) => a + b);

  let discountAmount = 0;

  let totalCost = total;
  if (discount?.type === 'Percentage') {
    discountAmount = total * (parseFloat(discount.value, 10) / 100);
    totalCost = total - discountAmount;
  }

  if (discount?.type === 'Amount') {
    discountAmount = discount.value;
    totalCost = total - discountAmount;
  }

  if (discount?.type === 'Price Override') {
    discountAmount = discount.value;
    totalCost = discountAmount;
  }

  const addBill = () => {
    let data = { received, change, paymentMethod, totalCost };

    if (paymentMethod === 'Cash') {
      data = {
        received,
        change,
        paymentMethod,
        totalCost,
      };
    }

    if (paymentMethod !== 'Cash') {
      data = {
        received: totalCost,
        change: 0,
        paymentMethod,
        totalCost,
      };
    }

    setBill(data);
    setActionType('list');
  };

  const removeBill = () => {
    setReceived('');
    setChange('');
    const data = {};
    setBill(data);
  };

  const hasBill = Object.keys(bill).length;

  const paymentMethods = ['Mpesa', 'Cash', 'Insurance', 'Credit Card', 'Credit'];

  useEffect(() => {
    setChange(received - totalCost)
  }, [received])

  return (
    <Grid item>
      {(actionType === 'add' || actionType === 'edit') && (
        <Card style={{ maxWidth: '300px' }}>
          <CardContent>
            <h2>Billing</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <h3>Total = {totalCost}</h3>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  select
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {paymentMethod === 'Cash' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      autoFocus
                      label="Received"
                      value={received}
                      placeholder={totalCost.toString()}
                      type="number"
                      onChange={(e) => setReceived(e.target.value)}
                    />
                  </Grid>
                  {received > totalCost ? (
                    <Grid item xs={12}>
                      <p>
                        <strong>Change: </strong>
                        {(received - totalCost).toString()}
                      </p>
                    </Grid>
                  ) : null}
                </>
              )}
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  onClick={() => setActionType('list')}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={paymentMethod === 'Cash' && (!received)}
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
            <Grid container justifyContent="center">
              <Grid item xs={12}>
                <h3>Total = {totalCost}</h3>
              </Grid>
              <Grid item xs={12}>
                <h3>Payment method: {paymentMethod}</h3>
              </Grid>
              <Grid item xs={12}>
                <h3>
                  Received: {paymentMethod === 'Cash' ? received : totalCost}
                </h3>
              </Grid>
              <Grid item xs={12}>
                <h3>Change: {paymentMethod === 'Cash' ? change : 0}</h3>
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
                  onClick={() => setActionType('edit')}
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
                  onClick={() => setActionType('add')}
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

function ConfirmForm({ sale, patient, discount, bill, diagnosis }) {
  const hasPatient = Object.keys(patient).length > 0;
  const hasDiscount = Object.keys(discount).length > 0;
  const hasBill = Object.keys(bill).length > 0;

  const total = sale
    .map((item) =>
      item.product.discount?.value
        ? parseFloat(
          Math.round(
            item.product.sellingPrice *
            ((100 - item.product.discount?.value) / 100)
          ),
          10
        ) * parseFloat(item.quantity)
        : parseFloat(item.product.sellingPrice) * parseFloat(item.quantity)
    )
    .reduce((a, b) => a + b);

  const discountAmount = discount?.type === 'Price Override' ? (total - discount?.value).toFixed(2)
    : discount?.type === 'Percentage' ? (total * (parseFloat(discount?.value, 10) / 100)).toFixed(2)
      : discount?.value || 0

  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item>
        <Card>
          <CardContent>
            <h4>Diagnosis:</h4>
            <p>{diagnosis}</p>

            <h4>Products:</h4>
            {sale.map((item) => (
              <Accordion key={item.product.id}>
                <AccordionSummary
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <h3>{item.product.customBrandName}</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    <Grid item xs={12}>
                      <p>Route: {item.route}</p>
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
            {/* <Accordion>
              <AccordionSummary aria-controls="panel1a-content">
                <h3>Patient</h3>
              </AccordionSummary>
              <AccordionDetails>
                {hasPatient && (
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item xs={12}>
                      <p>Name: {`${patient.firstName} ${patient.lastName}`}</p>
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
                {!hasPatient && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p>No Patient</p>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion> */}

            <Accordion>
              <AccordionSummary aria-controls="panel1a-content">
                <h3>Discount</h3>
              </AccordionSummary>
              <AccordionDetails>
                {hasDiscount && (
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <p>Discount Type: {discount.type}</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <p>
                        Discount Value:{' '}
                        {discountAmount}
                      </p>
                    </Grid>
                  </Grid>
                )}
                {!hasDiscount && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p>No Discount</p>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary aria-controls="panel1a-content">
                <h3>Billing</h3>
              </AccordionSummary>
              <AccordionDetails>
                {hasBill && (
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <p>Payment type: {bill.paymentMethod}</p>
                    </Grid>
                    {bill.paymentMethod === 'Cash' ? (
                      <>
                        <Grid item xs={12} sm={6}>
                          <p>Total: {bill.totalCost}</p>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <p>Received: {bill.received}</p>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <p>Change: {bill.change}</p>
                        </Grid>
                      </>
                    ) : (
                      <Grid item xs={12} sm={6}>
                        <p>Received: {bill.received}</p>
                      </Grid>
                    )}
                  </Grid>
                )}
                {!hasBill && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p>No Bill</p>
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

export default function CreateSale({
  patient,
  shopId,
  prescriptionId,
  setFormState,
  prescription,
}) {
  const { accountType, company, staff } = useAuthState();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [allProducts, setAllProducts] = React.useState([]);
  const [saleProductOptions, setSaleProductOptions] = React.useState([]);
  const [saleProducts, setSaleProducts] = React.useState([
    {
      product: {},
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 0,
      comment: '',
    },
  ]);

  React.useEffect(() => {
    prescription.orderStatus !== 'prescription sent' &&
      allProducts &&
      setSaleProducts(
        prescription.product.map((item) => ({
          product: allProducts.find((saleItem) => saleItem.id === item._id),
          comment: item.comment,
          dosage: item.dosage,
          duration: item.duration,
          frequency: item.frequency,
          quantity: item.quantity,
          route: item.route,
        }))
      );
  }, [prescription, allProducts]);

  // console.log("saleproduct", saleProducts)

  const countOfProducts = saleProductOptions.length;

  const { getUserId } = useAuthState()

  const [discount, setDiscount] = React.useState(prescription.discount || {});

  const [bill, setBill] = React.useState(prescription.bill || {});

  React.useEffect(() => {
    setBill({});
  }, [discount]);

  React.useEffect(() => {
    setBill(bill);
  }, []);

  const [diagnosis, setDiagnosis] = React.useState(
    prescription.diagnosis || ''
  );

  const createSale = async () => {
    const products = saleProducts.map((sale) => ({
      _id: sale.product.id,
      productName: sale.product.productName,
      genericName: sale.product.genericName,
      formulation: sale.product.formulation,
      category: sale.product.category,
      tags: sale.product.tags,
      strength: sale.product.strength,
      packSize: sale.product.packSize,
      sellingPrice: sale.product.sellingPrice,
      costPrice: sale.product.costPrice,
      discount: sale.product.discount,
      dosage: sale.dosage,
      frequency: sale.frequency,
      duration: sale.duration,
      quantity: sale.quantity,
      comment: sale.comment,
      route: sale.route,
      totalProductPrice:
        sale.quantity *
        sale.product.sellingPrice *
        (sale.product.discount?.value
          ? (100 - sale.product.discount?.value) / 100
          : 1),
      totalProductCost:
        sale.quantity *
        sale.product.costPrice

    }));
    const saleStaff = accountType === 'staff' ? staff._id : company.owner;

    //console.log("saleStaff", saleStaff)
    const sale = {
      shopId,
      products,
      staffId: saleStaff,
      diagnosis,
      patientId: patient._id,
      prescriptionId,
      source: 'Online'
    };

    if (Object.keys(discount).length) {
      sale.discount = discount;
    }
    if (Object.keys(bill).length) {
      sale.bill = bill;
    }

    //console.log("sale", sale)

    try {
      setLoading(true);
      await API.post(`sales`, { ...sale });
      setLoading(false);
      setFormState('list');
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  const removeSaleProduct = (index) => {
    const newSaleProducts = [...saleProducts];
    newSaleProducts.splice(index, 1);
    setSaleProducts(newSaleProducts);
  };

  const filterAllProducts = () => {
    const productsList = [...allProducts];

    saleProducts.forEach((sale) => {
      const { product } = sale;
      const arrayIndex = productsList.findIndex(
        (item) => item.customBrandName === product.customBrandName
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
        quantity: data.quantity,
        product: data.product,
      };
      newSaleProducts.push(newSaleProduct);
      setSaleProducts(newSaleProducts);
    }
  };

  useEffect(() => {
    filterAllProducts();
  }, [saleProducts]);

  const addSaleProduct = () => {
    setSaleProducts([...saleProducts, { product: {}, quantity: 1 }]);
  };

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
    !saleProducts[saleProducts.length - 1].product?.productName;

  const [formStep, setFormStep] = React.useState(1);

  const updateOrderStatus = async () => {
    const staff = {
      staffId: getUserId(),
    }

    try {
      setLoading(true);
      await API.patch(`prescriptions/${prescriptionId}/processcancel/`, { ...staff });
      setLoading(false);
      setFormState('list');
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  const prescriptionQuote = async () => {
    const products = saleProducts.map((sale) => ({
      _id: sale.product.id,
      productName: sale.product.productName,
      genericName: sale.product.genericName,
      formulation: sale.product.formulation,
      category: sale.product.category,
      tags: sale.product.tags,
      strength: sale.product.strength,
      packSize: sale.product.packSize,
      sellingPrice: sale.product.sellingPrice,
      costPrice: sale.product.costPrice,
      discount: sale.product.discount,
      dosage: sale.dosage,
      frequency: sale.frequency,
      duration: sale.duration,
      quantity: sale.quantity,
      comment: sale.comment,
      route: sale.route,
      totalProductPrice:
        sale.quantity *
        sale.product.sellingPrice *
        (sale.product.discount?.value
          ? (100 - sale.product.discount?.value) / 100
          : 1),
      totalProductCost:
        sale.quantity *
        sale.product.costPrice
    }));
    const saleStaff = accountType === 'staff' ? staff._id : company.owner;
    const data = {
      shopId,
      products,
      staffId: saleStaff,
      diagnosis,
      patientId: patient._id,
      prescriptionId,
    };

    if (Object.keys(discount).length) {
      data.discount = discount;
    }
    if (Object.keys(bill).length) {
      data.bill = bill;
    }

    try {
      setLoading(true);
      await API.patch(`prescriptions/${prescriptionId}/process/`, { ...data });
      setLoading(false);
      setFormState('list');
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
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
        <>
          <DiagnosisForm diagnosis={diagnosis} setDiagnosis={setDiagnosis} />
          <LogForm prescription={prescription} />
          <Grid
            style={{ marginTop: '10px' }}
            item
            container
            justifyContent="center"
            spacing={2}
          >
            <Grid item>
              <Button
                style={{ margin: '3px', backgroundColor: 'red', }}
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={loading}
                onClick={() => updateOrderStatus()}
              >
                Cancel Order
              </Button>
              <Button
                style={{ margin: '3px' }}
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => setFormStep(formStep + 1)}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        </>
      )}

      {formStep === 2 && (
        <>
          <h3>Products</h3>
          {saleProducts.map((sale, index) => (
            <CreateSaleProductRow
              key={nanoid()}
              index={index}
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
                  color: `${countOfProducts === 0 || isLastSaleProductEmpty
                    ? 'grey'
                    : 'green'
                    }`,
                }}
              />
            </IconButton>
          </Grid>
          <Grid
            style={{ marginTop: '10px' }}
            item
            container
            justifyContent="center"
            spacing={2}
          >
            <Grid item>
              <Button
                variant="contained"
                disableElevation
                onClick={() => setFormStep(formStep - 1)}
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
                disabled={isLastSaleProductEmpty}
                onClick={() => setFormStep(formStep + 1)}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        </>
      )}

      {formStep === 3 && (
        <>
          <h3>Discount/Billing</h3>
          <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={12} sm={6}>
              <DiscountForm
                discount={discount}
                setDiscount={setDiscount}
                saleProducts={saleProducts}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <BillingForm
                bill={bill}
                setBill={setBill}
                discount={discount}
                saleProducts={saleProducts}
              />
            </Grid>
          </Grid>
          <Grid
            style={{ marginTop: '10px' }}
            item
            container
            justifyContent="center"
            spacing={2}
          >
            <Grid item>
              <Button
                variant="contained"
                disableElevation
                onClick={() => setFormStep(formStep - 1)}
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
                onClick={() => setFormStep(formStep + 1)}
              >
                Next
              </Button>
            </Grid>
          </Grid>
        </>
      )}

      {formStep === 4 && (
        <>
          <h3>Confirm Sale</h3>
          <ConfirmForm
            sale={saleProducts}
            patient={patient}
            discount={discount}
            diagnosis={diagnosis}
            bill={bill}
          />
          <Grid
            style={{ marginTop: '10px' }}
            item
            container
            justifyContent="center"
            spacing={2}
          >
            <Grid item>
              <Button
                variant="contained"
                disableElevation
                onClick={() => setFormStep(formStep - 1)}
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
                disabled={loading}
                onClick={() => createSale()}
              >
                Submit
              </Button>
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={loading}
                onClick={() => prescriptionQuote()}
              >
                Send Quote
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
}

CreateSale.propTypes = {
  patient: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  prescriptionId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
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
  diagnosis: PropTypes.string.isRequired,
  discount: PropTypes.object,
  bill: PropTypes.object,
};

ConfirmForm.defaultProps = {
  discount: {},
  bill: {},
};

DiagnosisForm.propTypes = {
  diagnosis: PropTypes.string,
  setDiagnosis: PropTypes.func.isRequired,
};

DiagnosisForm.defaultProps = {
  diagnosis: '',
};
