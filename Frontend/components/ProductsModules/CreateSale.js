/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React, { useEffect } from 'react';
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
import { Alert, Autocomplete } from '@material-ui/lab';
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useAuthState from '../../stores/auth';
import CreateSaleProductRow from './CreateSaleProductRow';
import useCurrentShopState from '../../stores/currentShop';
import {useSales} from '../../services/quickSalesProviderService';

function PatientForm({ patient, newPatient, shopId }) {
  const [firstName, setFirstName] = React.useState(patient?.firstName || '');
  const [lastName, setLastName] = React.useState(patient?.lastName || '');
  const [email, setEmail] = React.useState(patient?.email || '');
  const [phoneNumber, setPhoneNumber] = React.useState(
    patient?.phoneNumber || ''
  );
  const [gender, setGender] = React.useState(patient?.gender || '');
  const [dob, setDob] = React.useState(patient?.dob || '');
  const [allergies, setAllergies] = React.useState(patient?.allergies || []);
  const [county, setCounty] = React.useState(
    patient?.physicalAddress?.county || ''
  );
  const [street, setStreet] = React.useState(
    patient?.physicalAddress?.street || ''
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const genders = ['male', 'female'];

  const [actionType, setActionType] = React.useState('select');

  
  const changeActionType = (newAction) => {
    setActionType(newAction);
  };

  const addPatient = async () => {
    const data = {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      dob,
      physicalAddress: {
        county,
        street,
      },
    };
    setError('');

    if (!firstName || !lastName || !email || !phoneNumber) {
      setError('Missing required fields');
    } else {
      try {
        setLoading(true);
        await API.post(`shops/${shopId}/patients`, {
          ...data,
        });
        setLoading(false);
        newPatient(data);
        setActionType('list');
      } catch (err) {
        setLoading(false);
        const { message } = err.response.data;
        setError(message);
      }
    }
  };

  const removePatient = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setGender('');
    setCounty('');
    setStreet('');
    setDob('');
    setAllergies('');

    newPatient({});
    setActionType('select');
  };

  const [staffPatients, setStaffPatients] = React.useState([]);

  const fetchStaffPatients = async () => {
    try {
      const results = await API.get(`shops/${shopId}/patients`);

      const patients = results.data.data;

      setStaffPatients(patients);
    } catch (err) {
      const { message } = err.response.data;
      setError(message);
    }
  };

  const onChangePatient = (item) => {
    newPatient(item);

    setFirstName(item.firstName);
    setLastName(item.lastName);
    setEmail(item.email);
    setPhoneNumber(item.phoneNumber);

    setCounty(item?.physicalAddress?.county || '');
    setStreet(item?.physicalAddress?.street || '');
    setGender(item?.gender || '');
    setDob(item?.dob || '');
    setAllergies(item?.allergies || []);
    changeActionType('list');
  };

  const otherPatient = () => {
    newPatient({});
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');

    setCounty('');
    setStreet('');
    setGender('');
    setDob('');
    setAllergies([]);

    changeActionType('add');
  };

  React.useEffect(() => {
    fetchStaffPatients();
  }, []);

  return (
    <Grid item>
      {actionType === 'select' && (
        <Card>
          <CardContent>
            <h2>Enter Patient</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Autocomplete
                  disableClearable
                  value={patient}
                  options={staffPatients}
                  getOptionLabel={(option) =>
                    option?.firstName
                      ? `${option.firstName} ${option.lastName} ${option.phoneNumber}`
                      : ''
                  }
                  onChange={(event, newValue) => {
                    onChangePatient(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select patient"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  m="2"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => otherPatient()}
                >
                  New Patient
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {actionType === 'add' && (
        <Card style={{ maxWidth: '500px' }}>
          <CardContent>
            <h2>Add Patient</h2>
            <p style={{ color: 'red' }}>{error}</p>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  autoFocus
                  required
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  select
                >
                  {genders.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="DOB"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <h4>Physical Address</h4>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="County"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              {/*       <Grid item>
                <Button
                  variant="contained"
                  color="default"
                  disableElevation
                  onClick={() => changeActionType("list")}
                >
                  Cancel
                </Button>
              </Grid> */}
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={
                    !firstName || !lastName || !email || !phoneNumber || loading
                  }
                  onClick={() => addPatient()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'edit' && (
        <Card style={{ maxWidth: '500px' }}>
          <CardContent>
            <h2>Edit Patient</h2>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                  disabled={!firstName || !lastName}
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
                  disabled={!email && !phoneNumber}
                  onClick={() => addPatient()}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      )}

      {actionType === 'list' && (
        <Card style={{ maxWidth: '500px' }}>
          <CardContent>
            <h2>Patient</h2>
            <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12}>
                <p>Name: {`${firstName} ${lastName}`}</p>
              </Grid>
              <Grid item xs={12}>
                <p>Email: {email}</p>
              </Grid>

              <Grid item xs={12}>
                <p>Phone Number: {phoneNumber}</p>
              </Grid>

              <Grid item xs={12}>
                <p>Gender: {gender || 'N/A'}</p>
              </Grid>

              <Grid item xs={12}>
                <p>DOB: {dob || 'N/A'}</p>
              </Grid>

              <Grid item xs={12}>
                <h4>Physical Address: </h4>
                <p>County: {county || 'N/A'}</p>
                <p>Street: {street || 'N/A'}</p>
              </Grid>

              {allergies.length > 0 && (
                <Grid item xs={12}>
                  <h4>Allergies: </h4>
                  {allergies.map((allergy) => (
                    <p key={allergy}>{allergy}</p>
                  ))}
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
                  onClick={() => removePatient()}
                >
                  Remove
                </Button>
              </Grid>
              {/* <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() => changeActionType('edit')}
                >
                  Edit
                </Button>
              </Grid> */}
            </Grid>
          </CardActions>
        </Card>
      )}
    </Grid>
  );
}
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
function DiscountForm({ discount, setDiscount, saleProducts }) {
  const [actionType, setActionType] = React.useState('list');

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

  const hasDiscount = Object.keys(discount).length;

  const types = ['Amount', 'Percentage', 'Price Override'];

  const handleChangeDiscountType = (event) => {
    setDiscountType(event.target.value);
    const data = {
      value: discountValue,
      type: discountType,
    };
    setDiscount(data);
  };

  let discountAmount = 0;

  const total = saleProducts.map(
    (item) =>
      parseInt(item.product.sellingPrice, 10) * parseInt(item.quantity, 10)
  );

  let discountText = '';
  if (discount?.type === 'Percentage') {
    discountAmount = total * (parseInt(discount.value, 10) / 100);
    discountText = `- ${discountAmount}`;
  }

  if (discount?.type === 'Amount') {
    discountAmount = parseInt(discount.value, 10);
    discountText = `- ${discountAmount}`;
  }

  if (discount?.type === 'Price Override') {
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
                  label={
                    discountType === 'Percentage'
                      ? 'Discount Value (%)'
                      : 'Discount Value'
                  }
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

  const total = saleProducts.map(
    (item) =>
      parseInt(item.product.sellingPrice, 10) * parseInt(item.quantity, 10)
  )[0];

  let discountAmount = 0;

  let totalCost = total;
  if (discount?.type === 'Percentage') {
    discountAmount = total * (parseInt(discount.value, 10) / 100);
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
    let data = { received, change, paymentMethod };

    if (paymentMethod === 'Cash') {
      data = {
        received,
        change,
        paymentMethod,
      };
    }

    if (paymentMethod !== 'Cash') {
      data = {
        received: totalCost,
        change: 0,
        paymentMethod,
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
                  disabled={paymentMethod === 'Cash' && (!received || !change)}
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
  const hasPatient = Object.keys(patient).length;
  const hasDiscount = Object.keys(discount).length;
  const hasBill = Object.keys(bill).length;
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
            <Accordion>
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
            </Accordion>

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
                      <p>Discount Value: {discount.value}</p>
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

export default function CreateSale({ shopId, setFormState }) {
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

  const countOfProducts = saleProductOptions.length;

  const [patient, setPatient] = React.useState({});

  const newPatient = (data) => {
    setPatient(data);
  };

  const [discount, setDiscount] = React.useState({});

  const [bill, setBill] = React.useState({});

  React.useEffect(() => {
    setBill({});
  }, [discount]);

  const [diagnosis, setDiagnosis] = React.useState('');

  const { accountType, company, staff } = useAuthState();
  const { addSale } = useSales();


  const createSale = async () => {
    const products = saleProducts.map((sale) => ({
      _id: sale.product.id,
      productName: sale.product.productName,
      formulation: sale.product.formulation,
      strength: sale.product.strength,
      packSize: sale.product.packSize,
      sellingPrice: sale.product.sellingPrice,
      dosage: sale.dosage,
      frequency: sale.frequency,
      duration: sale.duration,
      quantity: sale.quantity,
      comment: sale.comment,
      route: sale.route,
    }));
    const saleStaff = accountType === 'staff' ? staff : company.admin;
    const sale = {
      shopId,
      products,
      staffId: saleStaff._id,
      diagnosis,
    };

    if (Object.keys(patient).length) {
      sale.patientId = patient._id;
    }
    if (Object.keys(discount).length) {
      sale.discount = discount;
    }
    if (Object.keys(bill).length) {
      sale.bill = bill;
    }

    try {
      setLoading(true);
      await addSale(sale);
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

  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <h2>New Sale</h2>
      {formStep === 1 && (
        <>
          <h3>Patient</h3>

          <Grid justifyContent="center" spacing={2} direction="row">
            <Grid item container justifyContent="center" spacing={2}>
              <PatientForm
                patient={patient}
                newPatient={newPatient}
                shopId={shopId}
              />
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
                  onClick={() => setFormState('list')}
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
                  disabled={Object.keys(patient).length === 0}
                  onClick={() => setFormStep(formStep + 1)}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}

      {formStep === 2 && (
        <>
          <DiagnosisForm diagnosis={diagnosis} setDiagnosis={setDiagnosis} />
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

      {formStep === 3 && (
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
                disabled={countOfProducts === 0 || isLastSaleProductEmpty}
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

      {formStep === 5 && (
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
                onClick={ createSale}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  );
}

CreateSale.propTypes = {
  shopId: PropTypes.string.isRequired,
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

PatientForm.propTypes = {
  patient: PropTypes.object.isRequired,
  newPatient: PropTypes.func.isRequired,
  shopId: PropTypes.string.isRequired,
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
