/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import { Alert, Autocomplete } from '@material-ui/lab'
import React, { useEffect, useState } from 'react'
import AddBoxIcon from '@material-ui/icons/AddBox'
import IconButton from '@material-ui/core/IconButton'
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
  TextareaAutosize,
} from '@material-ui/core'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import { formatDate } from '../../utils/helpers'
import useSnackbarState from '../../stores/snackbar'

function formatNumber(number) {
  const formattedNumber = number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

  return formattedNumber
}

function ConfirmForm({ sales, sale, patient, discount, bill, diagnosis, source, setSource }) {

  const hasPatient = Object.keys(patient).length
  const hasDiscount = Object.keys(discount).length
  const hasBill = Object.keys(bill).length
  const sourceOpt = ['Walk in', 'Online']

  const total = sale
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
            {sales.saleType !== "quick sale" &&
              (<>
                <h4>Diagnosis:</h4>
                <p>{diagnosis}</p>
              </>)
            }

            <h4>Products:</h4>
            {sale.map(item => (
              <Accordion key={item.product.id}>
                <AccordionSummary
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <h3>{item.product.customBrandName}</h3>
                </AccordionSummary>
                <AccordionDetails>
                  {sales.saleType === "quick sale" ?
                    <Grid container>
                      <Grid item xs={12}>
                        <p>Quantity: {item.quantity}</p>
                      </Grid>
                    </Grid>
                    : <Grid container>
                      <Grid item xs={12}>
                        <p>Route: {item.route}</p>
                        <p>Dosage: {item.dosage}</p>
                        <p>Frequency: {item.frequency}</p>
                        <p>Duration: {item.duration}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Comment: {item.comment}</p>
                      </Grid>
                    </Grid>}
                </AccordionDetails>
              </Accordion>
            ))}

            {/* <h4>Additional Info:</h4>
            <Accordion>
              <AccordionSummary aria-controls="panel1a-content">
                <h3>Patient</h3>
              </AccordionSummary>
              <AccordionDetails>
                {hasPatient ? (
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
                )
                  : sales?.patientName ? (
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <p>{sales.patientName}</p>
                      </Grid>
                    </Grid>
                  )
                    : (
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

function PatientForm({ patient, setPatient, shopId }) {
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
    }
    setError('')

    if (!firstName || !lastName || !email || !phoneNumber) {
      setError('Missing required fields')
    } else {
      try {
        setLoading(true)
        await API.post(`shops/${shopId}/patients`, {
          ...data,
        })
        setLoading(false)
        setPatient(data)
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

    setPatient({})
    setActionType('select')
  }

  const [staffPatients, setStaffPatients] = React.useState([])

  const fetchStaffPatients = async () => {
    try {
      const results = await API.get(`shops/${shopId}/patients`)

      const patients = results.data.data

      setStaffPatients(patients)
    } catch (err) {
      const { message } = err.response.data
      setError(message)
    }
  }

  const onChangePatient = item => {
    setPatient(item)

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
    setPatient({})
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

  return (
    <Grid item>
      {actionType === 'select' && (
        <Card>
          <CardContent>
            <h2>Edit Patient</h2>
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
                  onChange={(event, newValue) => {
                    onChangePatient(newValue)
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
function DiscountForm({ discount, setDiscount, saleProducts }) {
  const [actionType, setActionType] = useState('list')

  const [discountValue, setDiscountValue] = useState(discount?.value || 0)
  const [discountType, setDiscountType] = useState(discount?.type || '')

  const [discountAmount, setDiscountAmount] = useState(discount?.value || 0)

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
                ? total - discountAmount
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

function BillingForm({ bill, setBill, saleProducts, discount }) {
  const [received, setReceived] = React.useState(bill?.received || '')
  const [change, setChange] = React.useState(bill?.change || '')
  const [paymentMethod, setPaymentMethod] = React.useState(
    bill?.paymentMethod || '',
  )

  const [actionType, setActionType] = React.useState('list')

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

  const [discountAmount, setDiscountAmount] = useState(discount?.value || 0)

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
    if (discount.value) {
      if (discount.type === 'Percentage') {
        const newDiscountAmount = total * (parseFloat(discount.value) / 100)
        setDiscountAmount(() => newDiscountAmount)
      }

      if (discount.type === 'Amount') {
        const newDiscountAmount = parseInt(discount.value, 10)
        setDiscountAmount(() => newDiscountAmount)
      }

      if (discount.type === 'Price Override') {
        const newDiscountAmount = total - parseInt(discount.value, 10)
        setDiscountAmount(() => newDiscountAmount)
      }
    } else {
      setDiscountAmount(() => 0)
    }
  }, [discount])

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
function DiagnosisForm({ diagnosis, setDiagnosis }) {
  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item>
        <Card>
          <CardContent>
            <h3>Edit diagnosis </h3>

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

export default function EditSale({ sale, setFormState }) {
  const { products: saleItems } = sale

  const { open } = useSnackbarState()

  const products = saleItems.map(item => ({
    ...item.product,
    ...item,
  }))

  const { shop } = sale
  const shopId = shop._id
  const saleId = sale._id

  const { getUserId } = useAuthState()

  const [loading, setLoading] = React.useState(false)
  const [isloading, setIsloading] = useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = useState('')

  const [formStep, setFormStep] = React.useState(3)

  const [patient, setPatient] = React.useState(sale?.patient || {})

  const [discount, setDiscount] = React.useState(sale?.discount || {})

  const [bill, setBill] = React.useState(sale?.bill || {})

  const [diagnosis, setDiagnosis] = React.useState(sale?.diagnosis || '')

  const [saleProducts, setSaleProducts] = React.useState([])

  const [source, setSource] = useState(sale?.source || '')

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
      formProducts: products,
    },
  })

  const {
    fields: formProducts,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: 'formProducts',
  })

  const [shopProducts, setShopProducts] = useState([])

  const [availableGenericNames, setAvailableGenericNames] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])

  async function fetchShopProducts() {
    try {
      setLoading(true)
      setError('')
      const result = await API.get(`shops/${shopId}/products`)

      const productsData = result.data.data

      setShopProducts(productsData)
      setAvailableProducts(productsData)
      setAvailableGenericNames(productsData.map(product => product.genericName))
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      setError(message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShopProducts()
  }, [])

  const filterGenericNames = () => {
    const filteredArray = shopProducts.filter(
      mainObj =>
        !getValues(`formProducts`).some(
          filterObj => filterObj.genericName === mainObj.genericName,
        ),
    )
    const genericNames = filteredArray.map(product => product.genericName)
    setAvailableGenericNames(genericNames)
  }

  const filterProducts = () => {
    const filteredArray = shopProducts.filter(
      mainObj =>
        !getValues(`formProducts`).some(filterObj => filterObj._id === mainObj._id),
    )
    setAvailableProducts(filteredArray)
  }

  const handleGenericNameChange = (event, value, index, oldValue = '') => {
    if (value) {
      setValue(`formProducts.${index}.genericName`, value)

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
      setValue(`formProducts.${index}.genericName`, '')
    }
    setValue(`formProducts.${index}.productName`, '')
  }

  const submitSaleProducts = async data => {
    setSaleProducts(data.formProducts)
    setFormStep(formStep + 1)
  }

  const editSale = async () => {
    const soldProducts = getValues(`formProducts`).map(item => ({
      ...item,
      quantity: item.quantity,
      totalProductPrice:
        item.quantity *
        item.sellingPrice *
        (item?.discount?.value ? (100 - item.discount.value) / 100 : 1),
      totalProductCost:
        item.quantity *
        item.costPrice
    }))

    const editedSale = {
      shopId,
      products: soldProducts,
      staffId: getUserId(),
      patientId: patient._id,
      diagnosis,
      source
    }

    if (Object.keys(discount).length) {
      editedSale.discount = discount
    }
    if (Object.keys(bill).length) {
      editedSale.bill = bill
    }

    if (source.length) {
      sale.source = source
    }

    try {
      setIsloading(true)

      await API.patch(`sales/${saleId}`, { ...editedSale })
      setIsloading(false)
      setFormState('list')
    } catch (err) {
      setIsloading(false)
      const { message } = err.response.data
      setError(message)
    }
  }

  const cancelSale = async () => {

    const soldProducts = getValues(`formProducts`).map(item => ({
      ...item,
      quantity: item.quantity,
      totalProductPrice:
        item.quantity *
        item.sellingPrice *
        (item?.discount?.value ? (100 - item.discount.value) / 100 : 1),
      totalProductCost:
        item.quantity *
        item.costPrice
    }))

    const editedSale = {
      shopId,
      products: soldProducts,
      staffId: getUserId(),
      patientId: patient._id,

    }

    try {
      setIsloading(true)
      console.log("editedSale", editedSale)
      await API.patch(`sales/${saleId}/cancel/`, { ...editedSale })
      setIsloading(false)
      setFormState('list')
      open('success', 'sale cancelled')
    } catch (err) {
      setIsloading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  const watchedProduct = watch('formProducts')
  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <h2>Edit Sale</h2>
      {sale.patientName && (
        <CardContent style={{
          backgroundColor: 'white',
          borderRadius: 5,
          margin: 'auto',
          padding: '10px 20px',
          marginLeft: 20,
          marginRight: 20
        }}>
          <Grid container spacing={1} justifyContent="space-evenly">
            <h2 style={{ margin: 0 }}>{sale.patientName}</h2>
          </Grid>
        </CardContent>
      )}
      {sale.patient.firstName && (
        <CardContent style={{
          backgroundColor: 'white',
          borderRadius: 5,
          margin: 'auto',
          padding: '10px 20px',
          marginLeft: 20,
          marginRight: 20
        }}>
          <Grid container spacing={1} justifyContent="space-evenly">
            <h2 style={{ margin: 0 }}>Name: {`${sale.patient.firstName} ${sale.patient.lastName}`}</h2>
            <h2 style={{ margin: 0 }}>Phone Number: {patient.phoneNumber}</h2>
          </Grid>
        </CardContent>
      )}

      {/* {formStep === 1 && (
        <>
          <h3>Patient</h3>

          <Grid justifyContent="center" spacing={2} direction="row">
            <Grid item container justifyContent="center" spacing={2}>
              <PatientForm
                patient={patient}
                setPatient={setPatient}
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
      )} */}

      {/* {formStep === 2 && (
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
      )} */}

      {formStep === 3 && (
        <>
          <h3>Products</h3>
          {sale?.saleType === "quick sale" ?
            <form noValidate onSubmit={handleSubmit(submitSaleProducts)}>
              {formProducts.map((field, index) => (
                <Card
                  key={field.id}
                  body="true"
                  style={{ padding: '10px', margin: '10px' }}
                >
                  <Grid container item spacing={2}>
                    {loading && <p style={{ color: 'blue' }}>Loading...</p>}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name={`formProducts.${index}.genericName`}
                        control={control}
                        rules={{
                          required: 'This field is required',
                        }}
                        defaultValue=""
                        render={({ field }) => (
                          <Autocomplete
                            disableClearable
                            options={[...new Set(availableGenericNames)]}
                            value={getValues(`formProducts.${index}.genericName`)}
                            onChange={(_, newValue) =>
                              handleGenericNameChange(
                                _,
                                newValue,
                                index,
                                getValues(`formProducts.${index}.genericName`),
                              )
                            }
                            renderInput={params => (
                              <TextField
                                {...params}
                                autoFocus
                                label="Generic Name"
                                variant="outlined"
                                error={
                                  !!errors.formProducts?.[index]?.genericName
                                    ?.message
                                }
                                helperText={
                                  errors.formProducts?.[index]?.genericName
                                    ?.message || ''
                                }
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name={`formProducts.${index}.productName`}
                        control={control}
                        rules={{
                          required: 'This field is required',
                        }}
                        defaultValue=""
                        render={({ field }) => (
                          <Autocomplete
                            disableClearable
                            options={getValues(`formProducts.${index}.genericName`) ? availableProducts.filter(
                              item =>
                                item.genericName ===
                                getValues(`formProducts.${index}.genericName`),
                            ) : availableProducts}
                            getOptionLabel={option =>
                              option.customBrandName || option
                            }
                            getOptionSelected={(option, value) =>
                              option.customBrandName === value
                            }
                            value={getValues(`formProducts.${index}.customBrandName`)}
                            onChange={(event, value) => {
                              setValue(`formProducts.${index}`, value)
                              const filteredArray = shopProducts.filter(mainObj =>
                                getValues(`formProducts`).some(
                                  filterObj => filterObj._id === mainObj._id,
                                ),
                              )
                              setAvailableProducts(filteredArray)
                            }}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label="Product Name"
                                variant="outlined"
                                error={
                                  !!errors.formProducts?.[index]?.productName
                                    ?.message
                                }
                                helperText={
                                  errors.formProducts?.[index]?.productName
                                    ?.message || ''
                                }
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <p>Available  : {getValues(`formProducts.${index}.storeQuantity`)}</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        error={!!errors.products?.[index]?.quantity?.message}
                        helperText={errors.products?.[index]?.quantity?.message || ''}
                        value={getValues(`formProducts.${index}.quantity`)}
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`formProducts.${index}.quantity`, {
                          required: 'This field is required',
                          min: { value: 1, message: 'Quantity must be greater than 0' },
                          max: { value: getValues(`formProducts.${index}.storeQuantity`), message: `Quantity must be less than the available quantity of ${getValues(`formProducts.${index}.storeQuantity`)}` }
                        })}
                        label="Quantity"
                        type="number"
                      />
                    </Grid>

                    {getValues(`formProducts.${index}.quantity`) && (
                      <Grid item xs={12} style={{ textAlign: 'right' }}>
                        <h5>{`Selling Price: KSH ${formatNumber(
                          getValues(`formProducts.${index}.sellingPrice`),
                        )} `}</h5>

                        <h5>{`Unit: ${getValues(
                          `formProducts.${index}.unit`,
                        )} `}</h5>

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
                      {index + 1} of {getValues(`formProducts`).length}
                    </p>

                    {getValues(`formProducts`).length > 1 && (
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
                    <AddBoxIcon fontSize="large" />
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
                    onClick={() => setFormState('list')}
                  >
                    Back
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    style={{ backgroundColor: 'red', color: 'white' }}
                    //type="submit"
                    variant="contained"
                    disableElevation
                    onClick={() => {
                      cancelSale();

                    }}

                  >
                    Cancel Sale
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    disabled={isSubmitting || !isValid}
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            </form>
            :
            <form noValidate onSubmit={handleSubmit(submitSaleProducts)}>
              {formProducts.map((field, index) => (
                <Card
                  key={field.id}
                  body="true"
                  style={{ padding: '10px', margin: '10px' }}
                >
                  <Grid container item spacing={2}>
                    {loading && <p style={{ color: 'blue' }}>Loading...</p>}
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name={`formProducts.${index}.genericName`}
                        control={control}
                        rules={{
                          required: 'This field is required',
                        }}
                        defaultValue=""
                        render={({ field }) => (
                          <Autocomplete
                            disableClearable
                            options={[...new Set(availableGenericNames)]}
                            value={getValues(`formProducts.${index}.genericName`)}
                            onChange={(_, newValue) =>
                              handleGenericNameChange(
                                _,
                                newValue,
                                index,
                                getValues(`formProducts.${index}.genericName`),
                              )
                            }
                            renderInput={params => (
                              <TextField
                                {...params}
                                autoFocus
                                label="Generic Name"
                                variant="outlined"
                                error={
                                  !!errors.formProducts?.[index]?.genericName
                                    ?.message
                                }
                                helperText={
                                  errors.formProducts?.[index]?.genericName
                                    ?.message || ''
                                }
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name={`formProducts.${index}.productName`}
                        control={control}
                        rules={{
                          required: 'This field is required',
                        }}
                        defaultValue=""
                        render={({ field }) => (
                          <Autocomplete
                            disableClearable
                            options={getValues(`formProducts.${index}.genericName`) ? availableProducts.filter(
                              item =>
                                item.genericName ===
                                getValues(`formProducts.${index}.genericName`),
                            ) : availableProducts}
                            getOptionLabel={option =>
                              option.customBrandName || option
                            }
                            getOptionSelected={(option, value) =>
                              option.customBrandName === value
                            }
                            value={getValues(`formProducts.${index}.customBrandName`)}
                            onChange={(event, value) => {
                              setValue(`formProducts.${index}`, value)
                              const filteredArray = shopProducts.filter(mainObj =>
                                getValues(`formProducts`).some(
                                  filterObj => filterObj._id === mainObj._id,
                                ),
                              )
                              setAvailableProducts(filteredArray)
                            }}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label="Product Name"
                                variant="outlined"
                                error={
                                  !!errors.formProducts?.[index]?.productName
                                    ?.message
                                }
                                helperText={
                                  errors.formProducts?.[index]?.productName
                                    ?.message || ''
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
                        {...register(`formProducts.${index}.route`, {
                          //required: 'This field is required',
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
                        {...register(`formProducts.${index}.dosage`, {
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
                        {...register(`formProducts.${index}.frequency`, {
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
                        {...register(`formProducts.${index}.duration`, {
                          //required: 'This field is required',
                        })}
                        label="Duration"
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <p>Available Quantity: {getValues(`formProducts.${index}.storeQuantity`)}</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        error={!!errors.products?.[index]?.quantity?.message}
                        helperText={errors.products?.[index]?.quantity?.message || ''}
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`formProducts.${index}.quantity`, {
                          required: 'This field is required',
                          min: { value: 1, message: 'Quantity must be greater than 0' },
                          max: { value: getValues(`formProducts.${index}.storeQuantity`), message: `Quantity must be less than the available quantity of ${getValues(`formProducts.${index}.storeQuantity`)}` }
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
                        {...register(`formProducts.${index}.comment`)}
                        label="How to take the drug"
                        multiline
                        rows={4}
                      />
                    </Grid>
                    {getValues(`formProducts.${index}.quantity`) && (
                      <Grid item xs={12} style={{ textAlign: 'right' }}>
                        <h5>{`Selling Price: KSH ${formatNumber(
                          getValues(`formProducts.${index}.sellingPrice`),
                        )} `}</h5>

                        <h5>{`Unit: ${getValues(
                          `formProducts.${index}.unit`,
                        )} `}</h5>

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
                      {index + 1} of {getValues(`formProducts`).length}
                    </p>

                    {getValues(`formProducts`).length > 1 && (
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
                    <AddBoxIcon fontSize="large" />
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
                    onClick={() => setFormState('list')}
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
                    disabled={getValues(`formProducts`).length === 0}
                  >
                    Next
                  </Button>
                </Grid>
              </Grid>
            </form>}
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
            source={source}
            setSource={setSource}
            sales={sale}
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
                disabled={isloading}
                onClick={() => editSale()}
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

EditSale.propTypes = {
  sale: PropTypes.object.isRequired,
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
  setPatient: PropTypes.func.isRequired,
  shopId: PropTypes.string.isRequired,
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
  sale: PropTypes.object.isRequired,
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
