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
} from '@material-ui/core'
import AddBoxIcon from '@material-ui/icons/AddBox'
import { Alert, Autocomplete } from '@material-ui/lab'
import PropTypes from 'prop-types'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import API from '../../utils/api'
import useCurrentShopState from '../../stores/currentShop'
import useAuthState from '../../stores/auth'
import PatientsDetailsCard from '../PatientsModules/PatientDetailsCard'
import useSnackbarState from '../../stores/snackbar'

function formatNumber(number) {
  const formattedNumber = number?.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

  return formattedNumber
}
function DiagnosisForm({ diagnosis, setDiagnosis }) {
  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item>
        <Card>
          <CardContent>
            <h3>Enter diagnosis </h3>

            <TextareaAutosize
              autoFocus
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
        : parseFloat(item.sellingPrice) * parseFloat(item.quantity)
    )
    .reduce((a, b) => a + b);

  useEffect(() => {
    if (discount.value) {
      if (discountType === 'Percentage') {
        const newDiscountAmount = total * (parseFloat(discountValue) / 100)
        setDiscountAmount(() => newDiscountAmount)
      }

      if (discountType === 'Amount') {
        const newDiscountAmount = parseFloat(discountValue)
        setDiscountAmount(() => newDiscountAmount)
      }

      if (discountType === 'Price Override') {
        const newDiscountAmount = total - parseFloat(discountValue)
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
      const newDiscountAmount = parseFloat(discountValue)
      setDiscountAmount(() => newDiscountAmount)
    }

    if (discountType === 'Price Override') {
      const newDiscountAmount = parseFloat(discountValue)
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
        : parseFloat(item.sellingPrice) * parseFloat(item.quantity)
    )
    .reduce((a, b) => a + b);

  //const discountAmount = discount?.value || 0

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

function ConfirmForm({ saleProducts, patient, discount, bill, diagnosis }) {
  const hasPatient = Object.keys(patient).length > 0
  const hasDiscount = Object.keys(discount).length > 0
  const hasBill = Object.keys(bill).length > 0

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
                  <h3>{`${product.productName}- ${product.formulation} ${product.strength} ${product.packSize}`}</h3>
                  {/* <h3>{product.customBrandName}</h3> */}
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
            {/* <Accordion>
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
                ) : (
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
                ) : (
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
  )
}

export default function CreateSale({ setFormState, orderSale, order }) {

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { getUserId } = useAuthState()

  const { open } = useSnackbarState()

  const [loading, setLoading] = React.useState(false)
  const [isloading, setIsloading] = useState(false)
  const [formStep, setFormStep] = React.useState(1)

  const patient = orderSale.patient[0]

  const [discount, setDiscount] = React.useState(order.discount || {})

  const [bill, setBill] = React.useState(order.bill || {})

  React.useEffect(() => {
    setBill({})
  }, [discount])

  React.useEffect(() => {
    setBill(bill)
  }, [])

  const [diagnosis, setDiagnosis] = React.useState(order.diagnosis || '')

  const [saleProducts, setSaleProducts] = React.useState([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
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

  async function fetchShopProducts() {
    try {
      setLoading(true)
      const result = await API.get(`shops/${shopId}/products`)

      const productsData = result.data.data

      setShopProducts(productsData)
      setAvailableProducts(productsData)
      setAvailableGenericNames(productsData.map(product => product.genericName))
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      open('error', message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShopProducts()
    if (orderSale) {
      setValue(`products`, orderSale.products)
    }
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
    if (value) {
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
    } else {
      setValue(`products.${index}.genericName`, '')
    }
    setValue(`products.${index}.productName`, '')
  }

  const submitSaleProducts = async data => {
    setSaleProducts(data.products)
    setFormStep(formStep + 1)
  }

  const createSale = async () => {
    const soldProducts = getValues(`products`).map(item => ({
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

    const sale = {
      shopId,
      products: soldProducts,
      staffId: getUserId(),
      patientId: patient._id,
      diagnosis,
      orderId: orderSale.orderId,
      source: 'Online'
    }

    if (Object.keys(discount).length) {
      sale.discount = discount
    }
    if (Object.keys(bill).length) {
      sale.bill = bill
    }

    try {
      setIsloading(true)
      await API.post(`sales`, { ...sale })
      setIsloading(false)
      setFormState('list')
    } catch (err) {
      setIsloading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  const updateOrderStatus = async () => {
    const soldProducts = getValues(`products`).map(item => ({
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

    const sale = {
      shopId,
      products: soldProducts,
      staffId: getUserId(),
      patientId: patient._id,
      diagnosis,
      orderId: orderSale.orderId,
      source: 'Online'
    }

    if (Object.keys(discount).length) {
      sale.discount = discount
    }
    if (Object.keys(bill).length) {
      sale.bill = bill
    }

    try {
      setIsloading(true)
      await API.patch(`orders/${sale.orderId}/process/`, { ...sale });
      setIsloading(false)
      setFormState('list')
    } catch (err) {
      setIsloading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  const watchedProduct = watch('products')
  console.log("saleProducts", saleProducts)
  console.log("shopProducts", shopProducts)
  console.log("watchedProduct", watchedProduct)
  // console.log("store quantity", shopProducts?.filter(item => item._id === orderSale.products[0]._id)[0]?.storeQuantity)
  const store_quantity = shopProducts?.filter(item => item._id === orderSale.products[0]._id)[0]?.storeQuantity

  return (
    <div>
      <h2>New Sale</h2>

      <PatientsDetailsCard patient={patient} />

      {formStep === 1 && (
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
          <form noValidate onSubmit={handleSubmit(submitSaleProducts)}>
            {products.map((field, index) => (
              <Card
                key={field.id}
                body="true"
                style={{ padding: '10px', margin: '10px' }}
              >
                <Grid container item spacing={2}>
                  {loading && <p style={{ color: 'blue' }}>Loading...</p>}
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
                              error={
                                !!errors.products?.[index]?.genericName?.message
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
                            const filteredArray = shopProducts.filter(mainObj =>
                              getValues(`products`).some(
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
                                !!errors.products?.[index]?.productName?.message
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      error={!!errors.products?.[index]?.route?.message}
                      helperText={errors.products?.[index]?.route?.message || ''}
                      style={{ width: '100%', resize: 'vertical' }}
                      {...register(`products.${index}.route`, {
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
                      label="Duration in days"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {/* <p>Available Quantity: {getValues(`products.${index}.storeQuantity`)}</p> */}
                    <p>Available Quantity: {store_quantity}</p>
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
                        // max: { value: getValues(`products.${index}.storeQuantity`), message: `Quantity must be less than the available quantity of ${getValues(`products.${index}.storeQuantity`)}` }
                        max: { value: (store_quantity && store_quantity), message: `Quantity must be less than the available quantity of ${store_quantity}` }
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
                <Grid item xs={12} container justifyContent="space-between">
                  <p>1 of {getValues(`products`).length}</p>

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
              {/* {isValid && (
                <IconButton
                  onClick={() => {
                    appendProduct('')
                    filterProducts()
                  }}
                >
                  <AddBoxIcon fontSize="large" style={{ color: 'green' }} />
                </IconButton>
              )} */}
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
            saleProducts={saleProducts}
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
                variant="contained"
                color="primary"
                disableElevation
                disabled={isloading}
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
                disabled={isloading}
                onClick={() => updateOrderStatus()}
              >
                Send Quote
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
  orderSale: PropTypes.object.isRequired,
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
