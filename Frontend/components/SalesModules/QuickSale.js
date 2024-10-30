/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'

import {
  TextField,
  Button,
  Grid,
  Card,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableHead,
  Checkbox,
  FormControlLabel,
  Typography,
  Collapse,
  Box,
  IconButton,
  Stepper,
  StepLabel,
  MenuItem,
  CardActions,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import ReactToPrint from 'react-to-print';
import html2canvas from 'html2canvas';
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import AddBoxIcon from '@material-ui/icons/AddBox'
import Alert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import PrintQuotation from './PrintQuotation'


import useAuthState from '../../stores/auth'
import { formatDate } from '../../utils/helpers'
import API from '../../utils/api'
import useCurrentShopState from '../../stores/currentShop'
import useQuickSaleState from '../../stores/quickSale'


// indexDBProvider 
import { useSales } from '../../services/quickSalesProviderService'

import fetchCachedData from '../../utils/fetchCachedData'
import { useOffline } from '../../context/offlineContext'

import { addData, deleteData, getAllData, openIndexedDB, clearData } from '../../utils/indexDBUtils'


function formatNumber(number) {
  const formattedNumber = number?.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

  return formattedNumber
}
function DiscountForm({ discount, setDiscount, saleProducts }) {
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
                  // label={
                  //   discountType === 'Percentage'
                  //     ? 'Discount Value (%)'
                  //     : 'Discount Value'
                  // }
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
                  disabled={paymentMethod === 'Cash' && !received}
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

function ConfirmForm({ discount, bill, products, patientName, setPatientName, source, setSource, onValidation }) {
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

  const total = products
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
            <h4>Products:</h4>
            {products.map(item => (
              <Accordion key={item.id}>
                <AccordionSummary
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <h3>{item.customBrandName}</h3>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    <Grid item xs={12}>
                      <p>Quantity: {item?.quantity}</p>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}

            <Accordion>
              <AccordionSummary aria-controls="panel1a-content">
                <h3>Discount</h3>
              </AccordionSummary>
              <AccordionDetails>
                {discount && (
                  <Grid container spacing={1} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <p>Discount Type: {discount.type}</p>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <p>Discount Value: {discountAmount}</p>
                    </Grid>
                  </Grid>
                )}
                {!discount && (
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
                {bill && (
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
                {!bill && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <p>No Bill</p>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>

            <CardContent>
              <Typography variant="h6">Patient Name</Typography>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Patient Name"
                placeholder="patientName"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
              />

              <Typography variant="h6">Source</Typography>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                label="Source"
                value={source}
                onChange={handleSourceChange}
                select
                error={Boolean(errors.source)}
                helperText={errors.source}
              >
                {['Walk in', 'Online'].map(option => (
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
  );
}



function QuickSale({ setFormState }) {
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { quickSale, setQuickSale } = useQuickSaleState()

  const [loading, setLoading] = useState(false)
  const [isloading, setIsloading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const { getUserId } = useAuthState()

  const [quickSaleProducts, setQuickSaleProducts] = useState([])




  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    watch,
    setValue,
    getValues,
    resetField,
  } = useForm({
    defaultValues: {
      products: [quickSale],
    },
    mode: "onChange"
  })

  const {
    fields: products,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: 'products',
  })


  const [formStep, setFormStep] = useState(0)

  const onSubmit = async data => {
    setQuickSaleProducts([...data.products])
    setFormStep(1)
  }

  const [shopProducts, setShopProducts] = useState([])

  const [availableGenericNames, setAvailableGenericNames] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])

  const [isValidTrue, setIsValid] = useState(false);


  const handleValidation = (valid) => {
    setIsValid(valid);
  };

  // original fetch 
  // async function fetchShopProducts() {
  //   try {
  //     setLoading(true)
  //     setError('')
  //     setSuccess('')
  //     const result = await API.get(`shops/${shopId}/products`)

  //     const productsData = result.data.data

  //     setShopProducts(productsData)
  //     setAvailableProducts(productsData)
  //     setAvailableGenericNames(productsData.map(product => product.genericName))
  //     setLoading(false)
  //   } catch (err) {
  //     const { message } = err.response.data
  //     setError(message)
  //     setLoading(false)
  //   }
  // }

  async function fetchShopProducts() {
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
        setLoading(false);
      } else {
        const message = 'No cached products found';
        setError(message);
      }
    } catch (errorMsg) {
      const message = errorMsg.response?.data?.message || 'Failed to fetch products';
      setError(message);
    }
  }

  useEffect(() => {
    fetchShopProducts()
  }, [])

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

  const handleGenericNameChange = (event, value, index, oldValue = '') => {
    setValue(`products.${index}.genericName`, value)

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

    setValue(`products.${index}.productName`, null)
  }

  const [discount, setDiscount] = useState({})

  const [bill, setBill] = useState({})

  const [patientName, setPatientName] = useState('')
  const [source, setSource] = useState('')

  // const createSale = async () => {
  //   const saleProducts = getValues(`products`).map(item => ({
  //     ...item,
  //     quantity: item.quantity,
  //     totalProductPrice:
  //       item.quantity *
  //       item.sellingPrice *
  //       (item?.discount?.value ? (100 - item.discount.value) / 100 : 1),
  //     totalProductCost:
  //       item.quantity *
  //       item.costPrice
  //   }))
  //   //console.log("saleProducts", saleProducts)
  //   const sale = {
  //     shopId,
  //     products: saleProducts,
  //     staffId: getUserId(),
  //   }

  //   if (Object.keys(discount).length) {
  //     sale.discount = discount
  //   }
  //   if (Object.keys(bill).length) {
  //     sale.bill = bill
  //   }
  //   if (patientName.length) {
  //     sale.patientName = patientName
  //   }
  //   if (source.length) {
  //     sale.source = source
  //   }

  //   //console.log("sales", sale)

  //   try {
  //     setIsloading(true)
  //     await API.post(`sales`, { ...sale })
  //     setIsloading(false)
  //     setFormState('list')
  //     setQuickSale(null)
  //   } catch (err) {
  //     setIsloading(false)
  //     const { message } = err.response.data
  //     setError(message)
  //   }
  // }

  const { addSale } = useSales();

  const createSale = async () => {
    const saleProducts = getValues('products').map(item => ({
      ...item,
      quantity: item.quantity,
      totalProductPrice: item.quantity * item.sellingPrice * (item?.discount?.value ? (100 - item.discount.value) / 100 : 1),
      totalProductCost: item.quantity * item.costPrice
    }));

    const sale = {

      shopId,
      products: saleProducts,
      staffId: getUserId(),
      discount: Object.keys(discount).length ? discount : undefined,
      bill: Object.keys(bill).length ? bill : undefined,
      patientName: patientName.length ? patientName : undefined,
      source: source.length ? source : undefined,
      saleType: "Quick Sale",
    };

    try {
      setIsloading(true);
      await addSale(sale);
      setIsloading(false);
      setFormState('list');
      setQuickSale(null);
    } catch (err) {
      setIsloading(false);
      setError(err.message);
    }
  };

  function formatNumber(number) {
    return number?.toLocaleString()
  }

  const handleAppendProduct = () => {
    // Persist the current form data
    const currentFormValues = getValues('products');
    appendProduct({});
    // Set the form values back to include the newly appended product
    setValue('products', [...currentFormValues, {}]);
    // Filter products to reflect only the available ones
    filterProducts();
  };


  const watchedProduct = watch('products')


  const quotationRef = useRef(null);

  const handleDownload = (elementRef, fileName) => {
    console.log('😂😂😂😂,', watchedProduct)
    // Make the element temporary visible for screenshot
    elementRef.current.style.visibility = 'visible';
    elementRef.current.style.position = 'static';

    html2canvas(elementRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${fileName}.png`;
      link.click();

      // Hide the quote after screenshot is taken
      elementRef.current.style.visibility = 'hidden';
      elementRef.current.style.position = 'absolute';
    });

  };

  return (
    <span>
      {formStep === 0 && (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Card style={{ padding: '10px', margin: '10px' }}>
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
            <h3>Quick Sale</h3>

            <Grid container spacing={2} direction="column">
              <Grid item xs={12}>
                <h3>Products</h3>
              </Grid>
              {products.map((field, index) => (
                <Grid item key={field.id}>

                  <Card style={{ padding: '10px', margin: '10px' }}>
                    <Grid container item spacing={2}>
                      {loading && <p style={{ color: 'blue' }}>Loading...</p>}
                      <Grid item xs={12}>
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
                              // options={getValues(`products.${index}.customBrandName`) ? [...new Set(availableGenericNames)].filter(
                              //   item =>
                              //     item ===
                              //     getValues(`products.${index}.genericName`),
                              // ) : [...new Set(availableGenericNames)]}

                              // getOptionLabel={option =>
                              //   option.genericName || option
                              // }
                              // getOptionSelected={(option, value) =>
                              //   option.genericName === value
                              // }
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
                                  error={
                                    !!errors.products?.[index]?.genericName
                                      ?.message
                                  }
                                  helperText={
                                    errors.products?.[index]?.genericName
                                      ?.message || ''
                                  }
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
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
                              // options={availableProducts.filter(
                              //   item =>
                              //     item.genericName ===
                              //     getValues(`products.${index}.genericName`),
                              // )}
                              options={getValues(`products.${index}.genericName`) ? availableProducts.filter(
                                item =>
                                  item.genericName ===
                                  getValues(`products.${index}.genericName`),
                              ) : availableProducts}
                              getOptionLabel={option =>
                                option.customBrandName || option
                              }
                              getOptionSelected={(option, value) =>
                                option.customBrandName === value
                              }
                              value={getValues(`products.${index}.customBrandName`)}
                              onChange={(event, value) => {
                                setValue(`products.${index}`, value)
                                const filteredArray = shopProducts.filter(
                                  mainObj =>
                                    getValues(`products`).some(
                                      filterObj =>
                                        filterObj._id === mainObj._id,
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
                                    !!errors.products?.[index]?.productName
                                      ?.message
                                  }
                                  helperText={
                                    errors.products?.[index]?.productName
                                      ?.message || ''
                                  }
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <p>Available Quantity: {getValues(`products.${index}.storeQuantity`)}</p>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          error={!!errors.products?.[index]?.quantity}
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
                      {getValues(`products.${index}.quantity`) && (
                        <Grid item xs={12} style={{ textAlign: 'right' }}>
                          <h5>{`Selling Price: KSH ${formatNumber(
                            getValues(`products.${index}.sellingPrice`),
                          )} `}</h5>

                          <h5>{`Unit: ${getValues(
                            `products.${index}.unit`,
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
                        {index + 1} of {getValues(`products`).length}
                      </p>
                      <Grid container justifyContent="flex-end" spacing={2}>
                        <Grid item>
                          {getValues(`products`).length !== 1 && (
                            <Button
                              variant="contained"
                              style={{
                                color: 'white',
                                backgroundColor: '#f44336',
                              }}
                              disableElevation
                              onClick={() => {
                                removeProduct(index)
                                filterGenericNames()
                                filterProducts()
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

              ))}
            </Grid>

            <br />
            <Grid container justifyContent="center">
              {isValid && (
                <IconButton
                  // onClick={() => {
                  //   appendProduct('')
                  //   filterProducts()
                  //   // setFormState('')
                  // }}

                  onClick={handleAppendProduct}
                >
                  <AddBoxIcon fontSize="large" style={{ color: 'green' }} />
                </IconButton>
              )}
            </Grid>
            {/* <div
              ref={quotationRef}
              style={{ visibility: 'hidden', position: 'absolute', top: 0, left: 0 }}
            > */}

            <PrintQuotation products={products} watchedProduct={watchedProduct} index='' ref={quotationRef} />

            {/* </div> */}
          </Card>
          <Grid container justifyContent="flex-end" spacing={2}>

            <Grid item>
              <Button
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => handleDownload(quotationRef, 'Quote')}
              >
                Download Quote
              </Button>
            </Grid>
            <Grid item>

              <Button
                variant="contained"
                disableElevation
                onClick={() => {
                  setFormState('list')
                }}
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
                //disabled={loading || !isDirty || isSubmitting || !isValid}
                disabled={!isDirty || isSubmitting || !isValid}
              >
                Next
              </Button>
            </Grid>
          </Grid>

        </form>
      )}
      {formStep === 1 && (
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
                saleProducts={quickSaleProducts}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <BillingForm
                bill={bill}
                setBill={setBill}
                discount={discount}
                saleProducts={quickSaleProducts}
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
      {formStep === 2 && (
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
            products={quickSaleProducts}
            discount={discount}
            bill={bill}
            patientName={patientName}
            setPatientName={setPatientName}
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
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={!isValidTrue}
                // disabled={isloading || loading|| !isValid}
                onClick={createSale}
              >
                Create Sale
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </span>
  )
}

QuickSale.propTypes = {
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

DiscountForm.propTypes = {
  discount: PropTypes.object,
  setDiscount: PropTypes.func.isRequired,
  saleProducts: PropTypes.array.isRequired,
}

DiscountForm.defaultProps = {
  discount: {},
}

ConfirmForm.propTypes = {
  products: PropTypes.array.isRequired,
  discount: PropTypes.object,
  bill: PropTypes.object,
}

ConfirmForm.defaultProps = {
  discount: {},
  bill: {},
}

export default QuickSale
