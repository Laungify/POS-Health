/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useContext } from 'react'
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
  Typography
  ,
  Collapse,
  Box,
  IconButton,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import AddBoxIcon from '@material-ui/icons/AddBox'
import Alert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import useSnackbarState from '../../stores/snackbar'
import useAuthState from '../../stores/auth'
import { formatDate } from '../../utils/helpers'
import API from '../../utils/api'
import { currentPatientContext } from '../../context/currentPatientContext'

const useStyles = makeStyles(() => ({
  table: {
    minWidth: 650,
  },
  toggleBtn: {
    backgroundColor: '#9e9e9e !important',
    color: 'black !important',
  },
  toggleBtnSelected: {
    backgroundColor: '#4caf50 !important',
  },
}))

function CreatePrescription({
  setFormState,
  shopId,
  setPrescriptions,
  prescriptions,
}) {
  const { currentPatient } = useContext(currentPatientContext)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const { staff, company, accountType } = useAuthState()

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
      addToCart: false,
      complaint: '',
      treatmentPlan: '',
      products: [
        {
          _id: '',
          genericName: '',
          productName: '',
          dosage: '',
          route: '',
          frequency: '',
          duration: '',
          comment: '',
          formulation: '',
          quantity: '',
          strength: '',
          packSize: '',
          sellingPrice: '',
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

  const addToCartValue = watch('addToCart')

  const onSubmit = async (data) => {
    const patientId = currentPatient._id
    const saleStaff = accountType === 'staff' ? staff : company.admin
    const prescription = {
      ...data,
      // staffId: saleStaff._id,
      patientId,
      shopId,
    }

    console.log('Form Data:', data);
    console.log('Prescription:', prescription);

    setPrescriptions([...prescriptions, prescription])
    setFormState('list')
  }

  const [shopProducts, setShopProducts] = useState([])

  const [availableGenericNames, setAvailableGenericNames] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])

  async function fetchShopProducts() {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
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

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card body="true" style={{ padding: '10px', margin: '10px' }}>
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
        <h3>New Clinical Notes</h3>
        <h4>Complaint/ Treatment plan</h4>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.complaint?.message}
              helperText={errors.complaint?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('complaint')}
              label="Complaint"
              rows={5}
              multiline
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.treatmentPlan?.message}
              helperText={errors.treatmentPlan?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('treatmentPlan')}
              label="Treatment Plan"
              rows={5}
              multiline
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              label="Send to patient"
              control={
                <Checkbox {...register('addToCart')} checked={addToCartValue} />
              }
            />
          </Grid>

          <Grid item xs={12}>
            <h3>Products</h3>
          </Grid>
          {products.map((field, index) => (
            <Card
              key={field.id}
              body="true"
              style={{ padding: '10px', margin: '10px' }}
            >
              <Grid container item spacing={2}>
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
                            label="Generic Name"
                            variant="outlined"
                            error={
                              !!errors.products?.[index]?.genericName?.message
                            }
                            helperText={
                              errors.products?.[index]?.genericName?.message ||
                              ''
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
                        options={availableProducts.filter(
                          item =>
                            item.genericName ===
                            getValues(`products.${index}.genericName`),
                        )}
                        getOptionLabel={option => option.productName || option}
                        getOptionSelected={(option, value) =>
                          option.productName === value
                        }
                        value={getValues(`products.${index}.productName`)}
                        onChange={(event, value) => {
                          setValue(
                            `products.${index}.productName`,
                            value.productName,
                          )
                          setValue(`products.${index}._id`, value._id)
                          setValue(`products.${index}.strength`, value.strength)
                          setValue(`products.${index}.packSize`, value.packSize)
                          setValue(
                            `products.${index}.sellingPrice`,
                            value.sellingPrice,
                          )
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
                              errors.products?.[index]?.productName?.message ||
                              ''
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
                      required: 'This field is required',
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
                      required: 'This field is required',
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
                      required: 'This field is required',
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
                      required: 'This field is required',
                    })}
                    label="Duration"
                    type="number"
                  />
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
              <Grid item xs={12} container justifyContent="space-between">
                <p>1 of 1</p>

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
              </Grid>
            </Card>
          ))}
        </Grid>

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
      </Card>
      <Grid container justifyContent="flex-end">
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            setFormState('list')
          }}
        >
          Cancel
        </Button>

        <Button
          style={{ marginLeft: '10px' }}
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          disabled={loading || !isDirty || isSubmitting || !isValid}
        >
          Add
        </Button>
      </Grid>
    </form>
  )
}

function EditPrescription({
  setFormState,
  shopId,
  currentPrescription,
  prescriptionIndex,
  setPrescriptions,
  prescriptions,
}) {
  const { currentPatient } = useContext(currentPatientContext)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // const { staff, company, accountType } = useAuthState()

  const auth = useAuthState()
  const { staff, company, accountType } = auth;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      addToCart: currentPrescription?.addToCart || false,
      complaint: currentPrescription?.complaint || '',
      treatmentPlan: currentPrescription?.treatmentPlan || '',
      products: currentPrescription?.products || [],
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

  const addToCartValue = watch('addToCart')

  const onSubmit = async data => {
    const patientId = currentPatient._id

    // Determine the correct staffId based on account type
    const saleStaffId = accountType === 'staff' ? staff._id : company.owner;
    //  console.log('👍👍👍👍👍👍', auth)
    const prescription = {
      ...data,
      staffId: saleStaffId,
      patientId,
      shopId,
    }

    console.log('Submitting Prescription:', prescription);


    const newPrescriptions = [...prescriptions]

    newPrescriptions[prescriptionIndex] = prescription

    setPrescriptions(newPrescriptions)
    setFormState('list')
  }

  const [shopProducts, setShopProducts] = useState([])

  const [availableGenericNames, setAvailableGenericNames] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])

  async function fetchShopProducts() {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
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

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card body="true" style={{ padding: '10px', margin: '10px' }}>
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
        <h3>New Prescription</h3>
        <h4>Complaint/ Treatment plan</h4>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.complaint?.message}
              helperText={errors.complaint?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('complaint')}
              label="Complaint"
              rows={5}
              multiline
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.treatmentPlan?.message}
              helperText={errors.treatmentPlan?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('treatmentPlan')}
              label="Treatment Plan"
              rows={5}
              multiline
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              label="Send to patient"
              control={
                <Checkbox {...register('addToCart')} checked={addToCartValue} />
              }
            />
          </Grid>

          <Grid item xs={12}>
            <h3>Products</h3>
          </Grid>
          {products.map((field, index) => (
            <Card
              key={field.id}
              body="true"
              style={{ padding: '10px', margin: '10px' }}
            >
              <Grid container item spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`products.${index}.genericName`}
                    control={control}
                    rules={{
                      required: 'This field is required',
                    }}
                    defaultValue={getValues(`products.${index}.genericName`)}
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
                            label="Generic Name"
                            variant="outlined"
                            error={
                              !!errors.products?.[index]?.genericName?.message
                            }
                            helperText={
                              errors.products?.[index]?.genericName?.message ||
                              ''
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
                    defaultValue={getValues(`products.${index}.productName`)}
                    render={({ field }) => (
                      <Autocomplete
                        disableClearable
                        options={availableProducts.filter(
                          item =>
                            item.genericName ===
                            getValues(`products.${index}.genericName`),
                        )}
                        getOptionLabel={option => option.productName || option}
                        getOptionSelected={(option, value) =>
                          option.productName === value
                        }
                        value={getValues(`products.${index}.productName`)}
                        onChange={(event, value) => {
                          setValue(
                            `products.${index}.productName`,
                            value.productName,
                          )
                          setValue(`products.${index}._id`, value._id)
                          setValue(`products.${index}.strength`, value.strength)
                          setValue(`products.${index}.packSize`, value.packSize)
                          setValue(
                            `products.${index}.sellingPrice`,
                            value.sellingPrice,
                          )
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
                              errors.products?.[index]?.productName?.message ||
                              ''
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
                    style={{ width: '100%', resize: 'vertical' }}
                    {...register(`products.${index}.route`, {
                      required: 'This field is required',
                    })}
                    label="Route"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    style={{ width: '100%', resize: 'vertical' }}
                    {...register(`products.${index}.dosage`, {
                      required: 'This field is required',
                    })}
                    label="Dosage"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    style={{ width: '100%', resize: 'vertical' }}
                    {...register(`products.${index}.frequency`, {
                      required: 'This field is required',
                    })}
                    label="Frequency"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    style={{ width: '100%', resize: 'vertical' }}
                    {...register(`products.${index}.duration`, {
                      required: 'This field is required',
                    })}
                    label="Duration"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    style={{ width: '100%', resize: 'vertical' }}
                    {...register(`products.${index}.quantity`, {
                      required: 'This field is required',
                    })}
                    label="Quantity"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    style={{ width: '100%', resize: 'vertical' }}
                    {...register(`products.${index}.comment`)}
                    label="How to take the drug"
                    multiline
                    rows={4}
                  />
                </Grid>

              </Grid>
              <Grid item xs={12} container justifyContent="space-between">
                <p>1 of 1</p>

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
              </Grid>
            </Card>
          ))}
        </Grid>

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
      </Card>
      <Grid container justifyContent="flex-end">
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            setFormState('list')
          }}
        >
          Cancel
        </Button>

        <Button
          style={{ marginLeft: '10px' }}
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          disabled={loading || isSubmitting || !isValid}
        >
          Update
        </Button>
      </Grid>
    </form>
  )
}

function PrescriptionsList({
  setFormState,
  setCurrentPrescription,
  setPrescriptionIndex,
  encounterId,
}){
  const classes = useStyles();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTableOpen, setSubTableOpen] = useState(null);
  const { open } = useSnackbarState();
  const { currentPatient } = useContext(currentPatientContext);

  const patientId = currentPatient._id;

  useEffect(() => {
    const fetchClinicalNote = async () => {
      try {
        setLoading(true);
        const result = await API.get(`/clinical_notes/${encounterId}`);
        const data = result.data;

        console.log('Fetched Clinical Note:', data);

        // Map the prescriptions data
        const patientPrescriptions = data.prescriptions.map(prescription => ({
          id: prescription._id,
          complaint: prescription.complaint,
          treatmentPlan: prescription.treatmentPlan,
          products: prescription.products || [],
        }));

        console.log('Patient Prescriptions:', patientPrescriptions);
        setPrescriptions(patientPrescriptions);
        setLoading(false);
      } catch (error) {
        open('Failed to load clinical note');
      }
    };

    fetchClinicalNote();
  }, [encounterId]);

  const editPrescription = (prescription, index) => {
    setFormState('edit')
    setCurrentPrescription(prescription)
    setPrescriptionIndex(index)
  }


  const deletePrescription = async (index) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions.splice(index, 1);
    setPrescriptions(newPrescriptions);
  };

  const checkIfSubTableOpen = (index) => index === subTableOpen;

  function getCustomBrandName(item) {
    return `${item.productName} ${item.formulation} ${item.strength}`;
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Complaint</TableCell>
            <TableCell>Treatment Plan</TableCell>
            <TableCell>Products</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prescriptions.length > 0 ? (
            prescriptions.map((item, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>
                    <Button
                      onClick={() => setSubTableOpen(prevIndex => (prevIndex === index ? null : index))}
                    >
                      {subTableOpen === index ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                    </Button>
                  </TableCell>
                  <TableCell>{item.complaint}</TableCell>
                  <TableCell>{item.treatmentPlan}</TableCell>
                  <TableCell>{item.products.length}</TableCell>
                  <TableCell align="center">
                    <Button onClick={() => editPrescription(item, index)}>
                      <EditIcon />
                    </Button>
                    <Button onClick={() => deletePrescription(index)}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5}>
                    <Collapse in={checkIfSubTableOpen(index)} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="h6" gutterBottom>
                          Products
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell align="right">Frequency</TableCell>
                              <TableCell align="right">Strength</TableCell>
                              <TableCell align="right">Dosage</TableCell>
                              <TableCell align="right">Duration</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {item.products.length ? (
                              item.products.map(product => (
                                <TableRow key={product._id}>
                                  <TableCell>{getCustomBrandName(product)}</TableCell>
                                  <TableCell align="right">{product.frequency}</TableCell>
                                  <TableCell align="right">{product.strength}</TableCell>
                                  <TableCell align="right">{product.dosage}</TableCell>
                                  <TableCell align="right">{product.duration}</TableCell>
                                  <TableCell align="right">{product.quantity}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  No products available
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function ClinicalModule({
  shopId,
  prescriptions,
  setPrescriptions,
  encounterId
}) {
  const [formState, setFormState] = useState('list');
  const [currentPrescription, setCurrentPrescription] = useState({});
  const [prescriptionIndex, setPrescriptionIndex] = useState(null);
  return (
    <>
      {formState === 'list' && (
        <Card body="true" style={{ padding: '10px' }}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <h3>Clinical Notes</h3>
            </Grid>
            <Grid item>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => setFormState('create')}
              >
                New
              </Button>
            </Grid>
          </Grid>

          <PrescriptionsList
            setFormState={setFormState}
            setCurrentPrescription={setCurrentPrescription}
            setPrescriptionIndex={setPrescriptionIndex}
            encounterId={encounterId}
          />
        </Card>
      )}

      {formState === 'create' && (
        <CreatePrescription
          setFormState={setFormState}
          shopId={shopId}
          setPrescriptions={setPrescriptions}
          prescriptions={prescriptions}
        />
      )}

      {formState === 'edit' && (
        <EditPrescription
          setFormState={setFormState}
          shopId={shopId}
          currentPrescription={currentPrescription}
          prescriptionIndex={prescriptionIndex}
          setPrescriptions={setPrescriptions}
          prescriptions={prescriptions}
        />
      )}
    </>
  );
}

ClinicalModule.propTypes = {
  shopId: PropTypes.string.isRequired,
  prescriptions: PropTypes.array.isRequired,
  setPrescriptions: PropTypes.func.isRequired,
  encounterId: PropTypes.string.isRequired,
}

CreatePrescription.propTypes = {
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
  setPrescriptions: PropTypes.func.isRequired,
  prescriptions: PropTypes.array.isRequired,
}
EditPrescription.propTypes = {
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
  currentPrescription: PropTypes.object.isRequired,
  prescriptionIndex: PropTypes.number.isRequired,
  setPrescriptions: PropTypes.func.isRequired,
  prescriptions: PropTypes.array.isRequired,
}

PrescriptionsList.propTypes = {
  setFormState: PropTypes.func.isRequired,
  setCurrentPrescription: PropTypes.func.isRequired,
  setPrescriptionIndex: PropTypes.func.isRequired,
  encounterId: PropTypes.string.isRequired,
}
