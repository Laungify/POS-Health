/* eslint-disable no-underscore-dangle */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react'
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
  Modal,
  Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper

} from '@material-ui/core'
import AddBoxIcon from '@material-ui/icons/AddBox'
import ExpandMoreIcon from '@material-ui/icons/AddBox';
import StorageIcon from '@material-ui/icons/Storage';

import { Alert, Autocomplete } from '@material-ui/lab'
import PropTypes from 'prop-types'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import API from '../../utils/api'
import useCurrentShopState from '../../stores/currentShop'
import useAuthState from '../../stores/auth'
import { formatDate } from '../../utils/helpers'
import { addData, deleteData, getAllData, openIndexedDB, clearData } from '../../utils/indexDBUtils'

import { useSales } from '../../services/quickSalesProviderService'
import fetchCachedData from '../../utils/fetchCachedData'
import { usePatient } from '../../context/selectedPatientContext'
import { useOffline } from '../../context/offlineContext'
import indexDBDexi from '../../utils/dexiIndexDB'

function formatNumber(number) {
  const formattedNumber = number?.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

  return formattedNumber
}

function PatientForm({ patient, newPatient }) {
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [firstName, setFirstName] = React.useState(patient?.firstName || '')
  const [lastName, setLastName] = React.useState(patient?.lastName || '')
  const [email, setEmail] = React.useState(patient?.email || '')
  const [phoneNumber, setPhoneNumber] = React.useState(
    patient?.phoneNumber || '',
  )
  const [gender, setGender] = React.useState(patient?.gender || '')
  const [dob, setDob] = React.useState(patient?.dob || '')
  const [allergies, setAllergies] = React.useState(patient?.allergies || [])
  const [county, setCounty] = React.useState(
    patient?.physicalAddress?.county || '',
  )
  const [street, setStreet] = React.useState(
    patient?.physicalAddress?.street || '',
  )

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const genders = ['male', 'female']

  const [actionType, setActionType] = React.useState('select')

  const changeActionType = newAction => {
    setActionType(newAction)
  }

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
      saleType: "new sale",
    }
    setError('')

    if (!firstName || !lastName || !email || !phoneNumber) {
      setError('Missing required fields')
    } else {
      try {
        setLoading(true)
        const response = await API.post(`shops/${shopId}/patients`, {
          ...data,
        })
        setLoading(false)
        const newPatientData = response.data;
        //console.log('new patient', newPatientData);
        newPatient(newPatientData)
        setActionType('list')
      } catch (err) {
        setLoading(false)
        const { message } = err.response.data
        setError(message)
      }
    }
  }


  const removePatient = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhoneNumber('')
    setGender('')
    setCounty('')
    setStreet('')
    setDob('')
    setAllergies('')

    newPatient({})
    setActionType('select')
  }

  const [staffPatients, setStaffPatients] = React.useState([])

  // const fetchStaffPatients = async () => {
  //   try {
  //     const results = await API.get(`shops/${shopId}/patients`)

  //     // const patients = results.data.data.map(item => {
  //     //   const patient = item.patient
  //     //   return {
  //     //     ...patient,
  //     //   }
  //     // })
  //     const patients = results.data.data;


  //     setStaffPatients(patients)
  //   } catch (err) {
  //     const { message } = err.response.data
  //     setError(message)
  //   }
  // }

  const fetchStaffPatients = async () => {
    try {
      const results = await API.get(`shops/${shopId}/patients`);

      const patients = results.data.data;

      const flatPatients = Array.isArray(patients[0]) ? patients.flat() : patients;

      await indexDBDexi.patients.clear();
      await indexDBDexi.patients.add(flatPatients);

      setStaffPatients(flatPatients);

    } catch (apiError) {

      try {
        let cachedPatients = await indexDBDexi.patients.toArray();

        if (Array.isArray(cachedPatients) && cachedPatients.length > 0 && Array.isArray(cachedPatients[0])) {
          cachedPatients = cachedPatients.flat();
        }

        if (cachedPatients.length > 0) {
          setStaffPatients(cachedPatients);
        } else {
          setError('No patients found in cache');
        }
      } catch (fallbackError) {
        console.error('Error fetching patients from IndexedDB:', fallbackError);
        setError('Failed to fetch patients from server and cache');
      }
    }
  };


  const onChangePatient = async (item) => {
    newPatient(item)

    setFirstName(item.firstName)
    setLastName(item.lastName)
    setEmail(item.email)
    setPhoneNumber(item.phoneNumber)

    setCounty(item?.physicalAddress?.county || '')
    setStreet(item?.physicalAddress?.street || '')
    setGender(item?.gender || '')
    setDob(item?.dob || '')
    setAllergies(item?.allergies || [])
    changeActionType('list')
  }

  const otherPatient = () => {
    newPatient({})
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhoneNumber('')

    setCounty('')
    setStreet('')
    setGender('')
    setDob('')
    setAllergies([])

    changeActionType('add')
  }

  React.useEffect(() => {
    fetchStaffPatients()
  }, [])

  React.useEffect(() => { console.log('patient😂', staffPatients) }, [staffPatients])

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
                  getOptionLabel={option =>
                    option?.firstName
                      ? `${option.firstName} ${option.lastName} ${option.phoneNumber}`
                      : ''
                  }
                  onOpen={async () => {
                    // Trigger fetch from cache when dropdown is clicked
                    await fetchStaffPatients();
                  }}
                  onChange={async (event, newValue) => {
                    await onChangePatient(newValue)
                  }}
                  renderInput={params => (
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
                  onChange={e => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  label="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  required
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Gender"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  select
                >
                  {genders.map(option => (
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
                  onChange={e => setDob(e.target.value)}
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
                    onChange={e => setCounty(e.target.value)}
                  />
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Street"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
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
                  onChange={e => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
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
            <h2>Patient:</h2>
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
                {/* <p>DOB: {formatDate(new Date(dob)) || 'N/A'}</p> */}
                DOB: {dob && <span>{formatDate(new Date(dob))}</span> || 'N/A'}
              </Grid>

              <Grid item xs={12}>
                <h4>Physical Address: </h4>
                <p>County: {county || 'N/A'}</p>
                <p>Street: {street || 'N/A'}</p>
              </Grid>

              {allergies.length > 0 && (
                <Grid item xs={12}>
                  <h4>Allergies: </h4>
                  {allergies.map(allergy => (
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
  )
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
              onChange={e => setDiagnosis(e.target.value)}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
export function DiscountForm({ discount, setDiscount, saleProducts }) {
  const [actionType, setActionType] = useState('list')

  const [discountValue, setDiscountValue] = useState(discount?.value || 0)
  const [discountType, setDiscountType] = useState(discount?.type || '')

  const [discountAmount, setDiscountAmount] = useState(0)

  const hasDiscount = !!discountValue

  const types = ['Amount', 'Percentage', 'Price Override']

  const [discountAmountLabel, setDiscountAmountLabel] =
    useState('Discount Value')

  const discountText = `- ${formatNumber(discountAmount)} Ksh`

  const handleChangeDiscountType = event => {
    setDiscountType(event.target.value)
    setDiscountValue(0)

    if (event.target.value === 'Percentage') {
      setDiscountAmountLabel('Discount Value (%)')
    }

    if (event.target.value === 'Price Override') {
      setDiscountAmountLabel('New Price')
    }

    if (event.target.value === 'Amount') {
      setDiscountAmountLabel('Discount Value')
    }
  }

  const total = saleProducts
    .map(item =>
      item?.discount?.value
        ? parseFloat(
          Math.round(item.sellingPrice * ((100 - item.discount.value) / 100)),
          10,
        ) * parseFloat(item.quantity)
        : item.sellingPrice * parseFloat(item.quantity)
    )
    .reduce((a, b) => a + b);

  useEffect(() => {
    if (discount.value) {
      if (discountType === 'Percentage') {
        const newDiscountAmount = total * (parseFloat(discountValue) / 100)
        setDiscountAmount(() => newDiscountAmount)
      }

      if (discountType === 'Amount') {
        const newDiscountAmount = parseInt(discountValue, 10)
        setDiscountAmount(() => newDiscountAmount)
      }

      if (discountType === 'Price Override') {
        const newDiscountAmount = total - parseInt(discountValue, 10)
        setDiscountAmount(() => newDiscountAmount)
      }
    } else {
      setDiscountAmount(() => 0)
    }
  }, [discount])

  const addDiscount = () => {
    if (discountType === 'Percentage') {
      const newDiscountAmount = total * (parseFloat(discountValue) / 100)
      setDiscountAmount(() => newDiscountAmount)
    }

    if (discountType === 'Amount') {
      const newDiscountAmount = parseInt(discountValue, 10)
      setDiscountAmount(() => newDiscountAmount)
    }

    if (discountType === 'Price Override') {
      const newDiscountAmount = parseInt(discountValue, 10)
      setDiscountAmount(() => newDiscountAmount)
    }

    const data = {
      value: discountValue,
      type: discountType,
    }

    setDiscount(data)
    setActionType('list')
  }

  return (
    <>
      {actionType === 'add' && (
        <Card>
          <CardContent>
            <h2>Add Discount</h2>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <h3>Total = {formatNumber(total)}</h3>
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
                  onChange={event => handleChangeDiscountType(event)}
                  select
                >
                  {types.map(option => (
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
                  onChange={e => setDiscountValue(e.target.value)}
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
                  onChange={event => handleChangeDiscountType(event)}
                  select
                >
                  {types.map(option => (
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
                  onChange={e => setDiscountValue(e.target.value)}
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
              <h3>Total = {`${formatNumber(total)} Ksh`}</h3>
            </Grid>
            <h2 style={{ color: 'green' }}>
              {discountType === 'Price Override'
                ? `${total - discountAmount} Ksh`
                : discountText}
            </h2>
          </CardContent>
          <CardActions>
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    setDiscount({})
                    setDiscountType('')
                    setDiscountValue(0)
                  }}
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
    </>
  )
}

export function BillingForm({ bill, setBill, saleProducts, discount }) {
  const [received, setReceived] = React.useState(bill?.received || '')
  const [change, setChange] = React.useState(bill?.change || '')
  const [paymentMethod, setPaymentMethod] = React.useState(
    bill?.paymentMethod || '',
  )

  const [actionType, setActionType] = React.useState('list')

  // const total = saleProducts
  //   .map(item =>
  //     item?.discount?.value
  //       ? parseInt(
  //         Math.round(item.sellingPrice * ((100 - item.discount.value) / 100)),
  //         10,
  //       ) * parseInt(item.quantity, 10)
  //       : parseInt(item.sellingPrice, 10) * parseInt(item.quantity, 10),
  //   )
  //   .reduce((a, b) => a + b)

  const total = saleProducts
    .map(item =>
      item?.discount?.value
        ? parseFloat(
          Math.round(item.sellingPrice * ((100 - item.discount.value) / 100)),
          10,
        ) * parseFloat(item.quantity)
        : item.sellingPrice * parseFloat(item.quantity)
    )
    .reduce((a, b) => a + b);

  // const discountAmount = discount?.value || 0

  // const totalCost =
  //   discount?.type === 'Price Override'
  //     ? discountAmount
  //     : total - discountAmount

  const discountAmount = discount?.type === 'Price Override' ? (total - discount?.value)
    : discount?.type === 'Percentage' ? (total * (parseFloat(discount?.value, 10) / 100))
      : discount?.value || 0

  const totalCost = total - discountAmount

  const addBill = () => {
    let data = { received, change, paymentMethod, totalCost }

    if (paymentMethod === 'Cash') {
      data = {
        received,
        change,
        paymentMethod,
        totalCost,
      }
    }

    if (paymentMethod !== 'Cash') {
      data = {
        received: totalCost,
        change: 0,
        paymentMethod,
        totalCost,
      }
    }

    setBill(data)
    setActionType('list')
  }

  const removeBill = () => {
    setReceived('')
    setChange('')
    const data = {}
    setBill(data)
  }

  const hasBill = Object.keys(bill).length > 0

  const paymentMethods = ['Mpesa', 'Cash', 'Insurance', 'Credit Card', 'Credit']

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
                  onChange={e => setPaymentMethod(e.target.value)}
                  select
                >
                  {paymentMethods.map(method => (
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
                      onChange={e => setReceived(e.target.value)}
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
                  // disabled={paymentMethod === 'Cash' && (!received || !change)}
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
  )
}

function ConfirmForm({ saleProducts, patient, discount, bill, diagnosis, source, setSource, onValidation }) {
  const hasPatient = Object.keys(patient).length > 0
  const hasDiscount = Object.keys(discount).length > 0
  const hasBill = Object.keys(bill).length > 0
  const sourceOpt = ['Walk in', 'Online']
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!source) newErrors.source = 'Source is required';
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    // console.log('Validation Status:', isValid);
    onValidation(isValid);
    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [source]);

  const handleSourceChange = (event) => {
    setSource(event.target.value);
  };

  const total = saleProducts
    .map(item =>
      item?.discount?.value
        ? parseFloat(
          Math.round(item.sellingPrice * ((100 - item.discount.value) / 100)),
          10,
        ) * parseFloat(item.quantity)
        : item.sellingPrice * parseFloat(item.quantity)
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
            {saleProducts.map(product => (
              <Accordion key={product._id}>
                <AccordionSummary
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <h3>{product.customBrandName}</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    <Grid item xs={12}>
                      <p>Route: {product.route}</p>
                      <p>Dosage: {product.dosage}</p>
                      <p>Frequency: {product.frequency}</p>
                      <p>Duration: {product.duration}</p>
                      <p>Quantity: {product.quantity}</p>
                      <p>Comment: {product.comment}</p>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}

            <h4>Additional Info:</h4>
            <Accordion>
              <AccordionSummary aria-controls="panel1a-content">
                <h3>Patient:  <p>Name: {`${patient.firstName} ${patient.lastName}`}</p></h3>
              </AccordionSummary>
              <AccordionDetails>
                {hasPatient ? (
                  <Grid container spacing={1} justifyContent="center">
                    {/* <Grid item xs={12}>
                      <p>Name: {`${patient.firstName} ${patient.lastName}`}</p>
                    </Grid> */}
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
                ) : (
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
                {hasDiscount ? (
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <p>Discount Type: {discount.type}</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <p>Discount Value: {discountAmount}</p>
                    </Grid>
                  </Grid>
                ) : (
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
                {hasBill ? (
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
                ) : (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p>No Bill</p>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
            <CardContent>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                label="Source"
                value={source}
                onChange={e => setSource(e.target.value)}
                select
              >
                {sourceOpt.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}




function GenericNameModal({ open, onClose, genericName }) {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id



  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await API.get(`shops/${shopId}/products?genericName=${genericName}`);
      setProductData(response.data.data);
    } catch (err) {
      setError('Failed to fetch product data');
      console.error('Error fetching product data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (genericName) {
      fetchProductData();
    }
  }, [genericName]);

  useEffect(() => { console.log('fetched prod by generic name 👇👇', productData) }, [genericName])



  const renderContent = () => {
    if (loading) {
      return <Typography>Loading...</Typography>;
    }

    if (error) {
      return <Typography color="error">{error}</Typography>;
    }

    if (productData && productData.length > 0) {
      return (
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {productData.map((product, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <Typography variant="h5" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                {product.name}
              </Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                    Product Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Generic Name:</TableCell>
                          <TableCell>{product.genericName}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>ATC Code:</TableCell>
                          <TableCell>{product.properties["ATC code"]}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Indications and Dose - Adult:</TableCell>
                          <TableCell>{product.properties["Indications and dose"]?.Adult}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Indications and Dose - Paediatric:</TableCell>
                          <TableCell>{product.properties["Indications and dose"]?.Paediatric}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Contraindications:</TableCell>
                          <TableCell>{product.properties.Contraindications}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Precautions:</TableCell>
                          <TableCell>{product.properties.Precautions}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Hepatic Impairment:</TableCell>
                          <TableCell>{product.properties["Hepatic impairment"]}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Pregnancy:</TableCell>
                          <TableCell>{product.properties.Pregnancy}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Breastfeeding:</TableCell>
                          <TableCell>{product.properties.Breastfeeding}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Adverse Effects:</TableCell>
                          <TableCell>{product.properties["Adverse effects"]}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Interactions with Other Medicines:</TableCell>
                          <TableCell>{product.properties["Interactions with other medicines"]}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
        </div>
      );
    }
    return <Typography>No data available</Typography>;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          margin: '50px auto',
          maxWidth: '600px',
          borderRadius: '8px',
        }}
      >
        <Typography variant="h6">Product Information</Typography>
        {renderContent()}
      </div>
    </Modal>
  );
}
export default function CreateSale({ setFormState }) {
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { getUserId } = useAuthState()

  const [loading, setLoading] = React.useState(false)
  const [isloading, setIsloading] = useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = useState('')

  const [formStep, setFormStep] = React.useState(1)

  const [patient, setPatient] = React.useState({})

  const [source, setSource] = useState('')


  const newPatient = data => {
    setPatient(data)
  }

  const [discount, setDiscount] = React.useState({})

  const [bill, setBill] = React.useState({})

  React.useEffect(() => {
    setBill({})
  }, [discount])

  React.useEffect(() => {
    setBill(bill)
  }, [])

  const [diagnosis, setDiagnosis] = React.useState('')

  const [saleProducts, setSaleProducts] = React.useState([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty, isSubmitting, },
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      products: [
        {
          _id: '',
          genericName: '',
          productName: '',
          formulation: '',
          strength: '',
          category: '',
          tags: '',
          unit: '',
          packSize: '',
          dosage: '',
          route: '',
          frequency: '',
          duration: '',
          comment: '',
          quantity: '',
          sellingPrice: '',
          customBrandName: '',
        },
      ],
    },
  })

  const {
    fields: products,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: 'products',
  })

  const [shopProducts, setShopProducts] = useState([])

  const [availableGenericNames, setAvailableGenericNames] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])
  const isOnline = useOffline()

  async function fetchProducts() {
    setLoading(true);
    setError('');
    const db = await openIndexedDB('localdb', 1, [
      { name: 'products', keyPath: 'id', autoIncrement: false }
    ]);

    try {
      const cachedProducts = await getAllData(db, 'products');
      if (cachedProducts.length > 0) {
        setShopProducts(cachedProducts);
        setAvailableProducts(cachedProducts);
        setAvailableGenericNames(cachedProducts.map(product => product.genericName));
      } else {
        const message = 'No cached products found';
        setError(message);
      }
    } catch (errorMsg) {
      const message = errorMsg.response?.data?.message || 'Failed to fetch products';
      setError(message);
    }
  }



  // async function fetchProducts() {
  //   try {
  //     setLoading(true);
  //     setError('');
  //     setSuccess('');

  //     console.log('Fetching all products from server...');

  //     // Fetch products from the API
  //     const result = await API.get(`shops/${shopId}/products`);
  //     console.log('Server response received:', result.data);

  //     const productsData = result.data.data;

  //     // Initialize IndexedDB
  //     const db = await openIndexedDB('localdb', 1, [
  //       { name: 'products', keyPath: 'id', autoIncrement: false },
  //     ]);

  //     console.log('IndexedDB initialized');

  //     await clearData(db, 'products');

  //     // Cache products in IndexedDB
  //     for (const product of productsData) {
  //       await addData(db, 'products', product);
  //     }

  //     console.log('Products cached in IndexedDB', productsData);

  //     // Update state with the fetched products
  //     setShopProducts(productsData);
  //     setAvailableProducts(productsData);
  //     setAvailableGenericNames(productsData.map(product => product.genericName));
  //     setLoading(false);

  //   } catch (err) {
  //     const message = err.response?.data?.message || 'Failed to fetch products';
  //     console.error('Error fetching products:', message);

  //     // Fallback to IndexedDB if API fetch fails
  //     try {
  //       const db = await openIndexedDB('localdb', 1, [
  //         { name: 'products', keyPath: 'id', autoIncrement: false },
  //       ]);

  //       const cachedProducts = await getAllData(db, 'products');
  //       if (cachedProducts.length > 0) {
  //         setShopProducts(cachedProducts);
  //         setAvailableProducts(cachedProducts);
  //         setAvailableGenericNames(cachedProducts.map(product => product.genericName));
  //         setSuccess('Loaded products from cache');
  //       } else {
  //         setError('No products found in cache');
  //       }
  //     } catch (fallbackError) {
  //       console.error('Error fetching products from IndexedDB:', fallbackError);
  //       setError('Failed to fetch products from server and cache');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // }

  useEffect(() => { console.log(shopProducts) }, [shopProducts])
  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
  }, [shopId]);


  const filterGenericNames = () => {
    const filteredArray = shopProducts.filter(
      mainObj =>
        !getValues(`products`).some(
          filterObj => filterObj.genericName === mainObj.genericName,
        ),
    )
    const genericNames = filteredArray.map(product => product.genericName)
    setAvailableGenericNames(genericNames)
  }

  const filterProducts = () => {
    const filteredArray = shopProducts.filter(
      mainObj =>
        !getValues(`products`).some(filterObj => filterObj._id === mainObj._id),
    )
    setAvailableProducts(filteredArray)
  }


  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGenericName, setSelectedGenericName] = useState('');

  const handleTooltipClick = (genericName) => {
    setSelectedGenericName(genericName);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };


  const handleGenericNameChange = (event, value, index, oldValue = '') => {
    if (value) {
      setValue(`products.${index}.genericName`, value)


      setSelectedGenericName(value);
      const genericNamesArray = [...availableGenericNames]

      const indexToDelete = genericNamesArray.findIndex(
        element => element === value,
      )

      const newGenericNamesArray = genericNamesArray.filter(
        (_, i) => i !== indexToDelete,
      )

      setAvailableGenericNames(newGenericNamesArray)

      if (oldValue) {
        const updatedOldValue = [...newGenericNamesArray, oldValue]
        setAvailableGenericNames(updatedOldValue)
      }
    } else {
      setValue(`products.${index}.genericName`, '')
    }
    setValue(`products.${index}.productName`, '')
    setValue(`products.${index}.customBrandName`, '')
    //filterProducts()
  }

  const showProductInfo = () => {
    setModalOpen(true);
  }

  const submitSaleProducts = async data => {
    setSaleProducts(data.products)
    setFormStep(formStep + 1)
  }

  const { addSale } = useSales();

  const createSale = async () => {
    const patientName = patient.fullName
    const saletype = "New Sale"

    const soldProducts = getValues('products').map(item => ({
      ...item,
      quantity: item.quantity,
      totalProductPrice: item.quantity * item.sellingPrice * (item?.discount?.value ? (100 - item.discount.value) / 100 : 1),
      totalProductCost: item.quantity * item.costPrice
    }));

    const sale = {
      shopId,
      products: soldProducts,
      staffId: getUserId(),
      patientId: patient._id,
      saleType: saletype,
      patientName,
      diagnosis,

    };

    if (Object.keys(discount).length) {
      sale.discount = discount;
    }
    if (Object.keys(bill).length) {
      sale.bill = bill;
    }
    if (source.length) {
      sale.source = source;
    }

    try {
      setIsloading(true);
      await addSale(sale);
      await fetchProducts();
      setIsloading(false);
      setFormState('list');
    } catch (err) {
      setIsloading(false);
      const { message } = err;
      setError(message);
    }
  };

  const [isValidTrue, setIsValid] = useState(false);


  const handleValidation = (valid) => {
    setIsValid(valid);
  };

  const watchedProduct = watch('products')
  // console.log("saleProducts", saleProducts)
  // console.log("shopProducts", shopProducts)
  // console.log("products", products)




  // const handleSale = async () => {
  //   try {
  //     setIsloading(true);
  //     await useSyncSales();
  //     setIsloading(false);
  //   } catch (err) {
  //     setIsloading(false);
  //     setError(err.message);
  //   }
  // };

  // useSyncSales();



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

          <Grid container justifyContent="center" spacing={2} direction="row">
            <Grid item container justifyContent="center" spacing={2}>
              <PatientForm patient={patient} newPatient={newPatient} />
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
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" variant="outlined">
              {success}
            </Alert>
          )}
          <form noValidate onSubmit={handleSubmit(submitSaleProducts)}>
            {products.map((field, index) => (
              <Card
                key={field.id}
                body="true"
                style={{ padding: '10px', margin: '10px' }}
              >
                <Grid container item spacing={2}>
                  {/* {loading && <p style={{ color: 'blue' }}>Loading...</p>} */}
                  <Grid item xs={12} sm={6}>
                    <Grid container spacing={2} alignItems="center">

                      {/* Grid for Generic Name */}
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`products.${index}.genericName`}
                          control={control}
                          rules={{
                            required: 'This field is required',
                          }}
                          defaultValue=""
                          render={({ field }) => (
                            <Autocomplete
                              disableClearable
                              options={[...new Set(availableGenericNames)]}
                              value={getValues(`products.${index}.genericName`)}
                              onChange={(_, newValue) =>
                                handleGenericNameChange(
                                  _,
                                  newValue,
                                  index,
                                  getValues(`products.${index}.genericName`),
                                )
                              }
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  autoFocus
                                  label="Generic Name"
                                  variant="outlined"
                                  fullWidth
                                  error={
                                    !!errors.products?.[index]?.genericName?.message
                                  }
                                  helperText={
                                    errors.products?.[index]?.genericName?.message || ''
                                  }
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>

                      {/* Grid for Show Product Data */}
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="Show Products Info"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Show Product Data"
                              variant="outlined"
                              fullWidth
                              disabled
                              InputProps={{
                                endAdornment: (
                                  <IconButton aria-label="info" onClick={() => showProductInfo()}>
                                    <StorageIcon />
                                  </IconButton>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* Grid for Product Name */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name={`products.${index}.productName`}
                      control={control}
                      rules={{
                        required: 'This field is required',
                      }}
                      defaultValue=""
                      render={({ field }) => (
                        <Autocomplete
                          disableClearable
                          options={
                            getValues(`products.${index}.genericName`)
                              ? availableProducts.filter(
                                item =>
                                  item.genericName ===
                                  getValues(`products.${index}.genericName`),
                              )
                              : availableProducts
                          }
                          getOptionLabel={option => option.customBrandName || option}
                          getOptionSelected={(option, value) =>
                            option.customBrandName === value
                          }
                          value={getValues(`products.${index}.customBrandName`)}
                          onChange={(event, value) => {
                            setValue(`products.${index}`, value);
                            const filteredArray = shopProducts.filter(mainObj =>
                              getValues(`products`).some(
                                filterObj => filterObj._id === mainObj._id,
                              ),
                            );
                            setAvailableProducts(filteredArray);
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label="Product Name"
                              variant="outlined"
                              error={
                                !!errors.products?.[index]?.productName?.message
                              }
                              helperText={
                                errors.products?.[index]?.productName?.message || ''
                              }
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      error={!!errors.products?.[index]?.route?.message}
                      helperText={errors.products?.[index]?.route?.message || ''}
                      style={{ width: '100%', resize: 'vertical' }}
                      {...register(`products.${index}.route`, {
                        // required: 'This field is required',
                      })}
                      label="Route"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      error={!!errors.products?.[index]?.dosage?.message}
                      helperText={errors.products?.[index]?.dosage?.message || ''}
                      style={{ width: '100%', resize: 'vertical' }}
                      {...register(`products.${index}.dosage`, {
                        //required: 'This field is required',
                      })}
                      label="Dosage"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      error={!!errors.products?.[index]?.frequency?.message}
                      helperText={errors.products?.[index]?.frequency?.message || ''}
                      style={{ width: '100%', resize: 'vertical' }}
                      {...register(`products.${index}.frequency`, {
                        //required: 'This field is required',
                      })}
                      label="Frequency"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      error={!!errors.products?.[index]?.duration?.message}
                      helperText={errors.products?.[index]?.duration?.message || ''}
                      style={{ width: '100%', resize: 'vertical' }}
                      {...register(`products.${index}.duration`, {
                        //required: 'This field is required',
                      })}
                      label="Duration"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <p>Available Quantity: {getValues(`products.${index}.storeQuantity`)}</p>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      error={!!errors.products?.[index]?.quantity?.message}
                      helperText={errors.products?.[index]?.quantity?.message || ''}
                      style={{ width: '100%', resize: 'vertical' }}
                      {...register(`products.${index}.quantity`, {
                        required: 'This field is required',
                        min: { value: 1, message: 'Quantity must be greater than 0' },
                        max: { value: getValues(`products.${index}.storeQuantity`), message: `Quantity must be less than the available quantity of ${getValues(`products.${index}.storeQuantity`)}` }
                      })}
                      label="Quantity"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      error={!!errors.products?.[index]?.comment?.message}
                      helperText={errors.products?.[index]?.comment?.message || ''}
                      style={{ width: '100%', resize: 'vertical' }}
                      {...register(`products.${index}.comment`)}
                      label="How to take the drug"
                      multiline
                      rows={4}
                    />
                  </Grid>
                  {getValues(`products.${index}.quantity`) && (
                    <Grid item xs={12} style={{ textAlign: 'right' }}>
                      <h5>{`Selling Price: KSH ${formatNumber(
                        getValues(`products.${index}.sellingPrice`),
                      )} `}</h5>

                      <h5>{`Unit: ${getValues(`products.${index}.unit`)} `}</h5>

                      <h5>
                        Subtotal:
                        {` KSH ${formatNumber(
                          watchedProduct[index].quantity *
                          watchedProduct[index].sellingPrice,
                        )}`}
                      </h5>
                    </Grid>
                  )}
                </Grid>
                <Grid item xs={12} container justifyContent="space-between">
                  <p>
                    {index + 1} of {getValues(`products`).length}
                  </p>

                  {getValues(`products`).length > 1 && (
                    <Grid container justifyContent="flex-end" spacing={2}>
                      <Grid item>
                        <Button
                          variant="contained"
                          style={{ color: 'white', backgroundColor: '#f44336' }}
                          disableElevation
                          onClick={() => {
                            removeProduct(index)
                            filterGenericNames()
                            filterProducts()
                          }}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Card>
            ))}

            <br />
            <Grid container justifyContent="center">
              {isValid && (
                <IconButton
                  onClick={() => {
                    appendProduct('')
                    filterProducts()
                  }}
                >
                  <AddBoxIcon fontSize="large" style={{ color: 'green' }} />
                </IconButton>
              )}
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
                  disabled={getValues(`products`).length === 0}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          </form>
          <GenericNameModal open={modalOpen} onClose={closeModal} genericName={selectedGenericName} />

        </>
      )}

      {formStep === 4 && (
        <>
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" variant="outlined">
              {success}
            </Alert>
          )}
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
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" variant="outlined">
              {success}
            </Alert>
          )}
          <h3>Confirm Sale</h3>
          <ConfirmForm
            saleProducts={saleProducts}
            patient={patient}
            discount={discount}
            diagnosis={diagnosis}
            bill={bill}
            source={source}
            setSource={setSource}
            onValidation={handleValidation}

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
                variant="contained"
                type="submit"
                color="primary"
                disableElevation
                disabled={!isValidTrue}
              // onClick={createSale}
                onClick={createSale}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </div>
  )
}

CreateSale.propTypes = {
  setFormState: PropTypes.func.isRequired,
}

BillingForm.propTypes = {
  bill: PropTypes.object,
  setBill: PropTypes.func.isRequired,
  discount: PropTypes.object,
  saleProducts: PropTypes.array.isRequired,
}

BillingForm.defaultProps = {
  bill: {},
  discount: {},
}

PatientForm.propTypes = {
  patient: PropTypes.object.isRequired,
  newPatient: PropTypes.func.isRequired,
}

DiscountForm.propTypes = {
  discount: PropTypes.object,
  setDiscount: PropTypes.func.isRequired,
  saleProducts: PropTypes.array.isRequired,
}

DiscountForm.defaultProps = {
  discount: {},
}

ConfirmForm.propTypes = {
  saleProducts: PropTypes.array.isRequired,
  patient: PropTypes.object.isRequired,
  diagnosis: PropTypes.string.isRequired,
  discount: PropTypes.object,
  bill: PropTypes.object,
}

ConfirmForm.defaultProps = {
  discount: {},
  bill: {},
}

DiagnosisForm.propTypes = {
  diagnosis: PropTypes.string,
  setDiagnosis: PropTypes.func.isRequired,
}

DiagnosisForm.defaultProps = {
  diagnosis: '',
}
