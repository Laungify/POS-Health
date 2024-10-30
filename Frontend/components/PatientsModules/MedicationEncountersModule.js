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
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  TableSortLabel,
  DialogActions,
  ButtonGroup,
  Switch,
  Collapse,
  Box,
  IconButton,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import FilterList from '@material-ui/icons/FilterList'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import { makeStyles } from '@material-ui/core/styles'
import { useForm } from 'react-hook-form'
import Alert from '@material-ui/lab/Alert'
import { uuid } from 'uuidv4'
import { formatDate, capitalize, isEmptyObject } from '../../utils/helpers'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useSnackbarState from '../../stores/snackbar'
import PrescriptionsModule from './PrescriptionsModule'
import MedicationModule from './MedicationsModule'
import { currentPatientContext } from '../../context/currentPatientContext'
import useCurrentShopState from '../../stores/currentShop'

const { addDays } = require('date-fns')
/* import AllMedications from './AllMedications' */

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

function Referral({ shopId, referral, setReferral }) {
  const { open: openSnackbar } = useSnackbarState()
  const [open, setOpen] = React.useState(false)

  const [doctors, setDoctors] = useState([])

  const [doctor, setDoctor] = useState(referral?.doctor || {})
  const [comment, setComment] = useState(referral?.comment || '')

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  async function fetchDoctors() {
    try {
      const result = await API.get(`shops/${shopId}/staff`)

      const staffData = result.data.data

      const shopDoctors = staffData.filter(item =>
        item.shops.some(shop => shop.roles.includes('doctor')),
      )
      console.log(
        '🚀 ~ file: MedicationEncountersModule.js:104 ~ fetchDoctors ~ shopDoctors:',
        shopDoctors,
      )

      setDoctors(shopDoctors)
    } catch (err) {
      const { message } = err.response.data
      openSnackbar('error', message)
    }
  }

  useEffect(() => {
    setDoctor(referral?.doctor || {})
    setComment(referral?.comment || '')
  }, [referral])

  useEffect(() => {
    fetchDoctors()
  }, [])

  const onSubmit = async e => {
    e.preventDefault()
    setReferral({ doctor, comment })
    handleClose()
  }

  return (
    <div>
      {!isEmptyObject(referral.doctor) ? (
        <p>
          <strong>Referring: </strong>
          <Button variant="text" onClick={() => handleClickOpen()}>
            {`${referral.doctor.firstName} ${referral.doctor.lastName}`}
          </Button>

          <IconButton onClick={() => setReferral({ doctor: {}, comment: '' })}>
            <CloseIcon style={{ color: 'red' }} />
          </IconButton>
        </p>
      ) : (
        <Button color="primary" onClick={() => handleClickOpen()}>
          Refer Doctor
        </Button>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Referral</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  value={doctor}
                  onChange={(event, newValue) => setDoctor(newValue)}
                  options={doctors}
                  getOptionLabel={option =>
                    !isEmptyObject(option)
                      ? `${option.firstName} ${option.lastName}`
                      : ''
                  }
                  getOptionSelected={(option, value) =>
                    option._id === value._id
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Doctor"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  rows={5}
                  multiline
                  label="Comment"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disableElevation
              disabled={isEmptyObject(doctor)}
            >
              Refer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

function AllMedications({ setCurrentMedications, shopId }) {
  const classes = useStyles()
  const { currentPatient: patient, currentEncounter } = useContext(
    currentPatientContext,
  )

  const encounterId = currentEncounter._id

  const { open: openSnackBar } = useSnackbarState()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [orders, setOrders] = useState([])

  const medicationSchema = {
    _id: '',
    productName: '',
    category: '',
    dosage: '',
    route: '',
    frequency: '',
    duration: '',
    comment: '',
    regardsToMeal: '',
    reason: '',
    startDate: '',
    endDate: '',
    specialInstructions: '',
    medicationStatus: false,
    type: '',
    medicationEncounterId: '',
  }

  const mapMedication = (data, type) => {
    let mappedData = []

    if (type === 'medication') {
      mappedData = data.map(item => ({
        ...medicationSchema,
        ...item,
        type,
        customId: uuid(),
      }))
    }

    if (type === 'prescription') {
      const { medicationEncounterId } = data[0]
      mappedData = data.flatMap(item =>
        item.products.map(product => ({
          ...medicationSchema,
          ...product,
          type,
          customId: uuid(),
          medicationEncounterId,
        })),
      )
    }

    if (type === 'order') {
      mappedData = data.map(item => ({
        ...medicationSchema,
        ...item.product,
        type,
        customId: uuid(),
      }))
    }
    return mappedData
  }

  const [allMedications, setAllMedications] = useState([])
  const [filteredMedications, setFilteredMedications] = useState([])

  const [sortOrder, setSortOrder] = useState('desc')
  const [sortField, setSortField] = useState('startDate')

  const sortBy = fieldName => {
    if (sortField === fieldName) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(fieldName)
      setSortOrder('desc')
    }

    const sortedData = [...filteredMedications].sort((a, b) => {
      const valueA = a[fieldName]
      const valueB = b[fieldName]

      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1
      }
      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })

    setFilteredMedications(sortedData)
  }

  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const categories = [
    'All',
    'Antimicrobials',
    'Asthma',
    'Diabetics',
    'Herbal',
    'Hypertensives',
    'OTC',
    'Oncology',
    'Others',
  ]

  const [statusFilter, setStatusFilter] = useState('current')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  const applyFilters = () => {
    let filtered = allMedications.filter(medication => {
      // Apply status filter
      if (statusFilter === 'past') {
        return !medication.medicationStatus
      }
      if (statusFilter === 'current') {
        return medication.medicationStatus
      }
      // No status filter or 'all'
      return true
    })

    // Apply category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(
        medication => medication.category === categoryFilter,
      )
    }

    // Apply date filters
    if (startDateFilter) {
      const startDate = new Date(startDateFilter)
      filtered = filtered.filter(
        medication => new Date(medication.startDate) >= startDate,
      )
    }
    if (endDateFilter) {
      const endDate = new Date(endDateFilter)
      filtered = filtered.filter(
        medication => new Date(medication.endDate) <= endDate,
      )
    }

    setCurrentMedications(allMedications.filter(item => item.medicationStatus))
    setFilteredMedications(filtered)
  }

  const handleStatusFilterChange = e => {
    setStatusFilter(e.target.value)
  }

  const handleCategoryFilterChange = e => {
    setCategoryFilter(e.target.value)
  }

  const handleStartDateFilterChange = e => {
    setStartDateFilter(e.target.value)
  }

  const handleEndDateFilterChange = e => {
    setEndDateFilter(e.target.value)
  }

  const clearFilters = () => {
    setStatusFilter('current')
    setCategoryFilter('All')
    setStartDateFilter('')
    setEndDateFilter('')
    handleClose()
  }

  const fetchOrders = async () => {
    const result = await API.get(
      `shops/${shopId}/patients/${patient._id}/orders`,
    )

    const mappedData =
      result.data.length > 0 ? mapMedication(result.data, 'order') : []
    return mappedData
  }

  const fetchMedications = async () => {
    const result = await API.get(
      `shops/${shopId}/patients/${patient._id}/medications`,
    )

    const mappedData =
      result.data.length > 0 ? mapMedication(result.data, 'medication') : []
    return mappedData
  }

  const fetchPrescriptions = async () => {
    const result = await API.get(
      `shops/${shopId}/patients/${patient._id}/prescriptions`,
    )

    const mappedData =
      result.data.length > 0 ? mapMedication(result.data, 'prescription') : []
    return mappedData
  }

  const [subTableId, setSubTableId] = useState(null)

  const isOpenSubTable = rowId => rowId === subTableId

  const fetchAllData = async () => {
    const prescriptionsData = await fetchPrescriptions()
    const medicationsData = await fetchMedications()
    const ordersData = await fetchOrders()

    const allData = [...prescriptionsData, ...medicationsData, ...ordersData]

    const initialSort = (a, b) => {
      const valueA = a[sortField]
      const valueB = b[sortField]

      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1
      }
      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    }

    allData.sort(initialSort)

    setAllMedications(allData)

    if (encounterId) {
      const { currentMedications } = currentEncounter

      const excludeEncounterData = allData.filter(
        item =>
          item.medicationEncounterId.toString() !== encounterId.toString(),
      )

      // remove current medications
      const idsToRemove = currentMedications.map(item => item._id)

      const filteredArray1 = excludeEncounterData.filter(
        item => !idsToRemove.includes(item._id),
      )

      // add formatted current medications
      const filteredArray2 = currentMedications.map(item => ({
        ...item,
        medicationEncounterId: currentEncounter._id,
        medicationStatus: true,
      }))

      setAllMedications([...filteredArray1, ...filteredArray2])
    }
  }

  useEffect(() => {
    try {
      fetchAllData()
    } catch (err) {
      const { message } = err.response.data
      openSnackBar('error', message)
    }
  }, [])

  useEffect(() => {
    applyFilters()
  }, [
    statusFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter,
    allMedications,
  ])

  const updateField = (field, value, customId) => {
    const medicationIndex = allMedications.findIndex(
      item => item.customId === customId,
    )
    allMedications[medicationIndex][field] = value
    applyFilters()
  }

  function addDaysToDate(startDate, numberOfDays) {
    return addDays(new Date(startDate), numberOfDays)
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <Grid container justifyContent="space-between" spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Medication Status</FormLabel>
                <RadioGroup
                  name="status"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <FormControlLabel
                    key="all"
                    value="all"
                    control={<Radio />}
                    label="All"
                  />
                  <FormControlLabel
                    key="current"
                    value="current"
                    control={<Radio />}
                    label="Current"
                  />
                  <FormControlLabel
                    key="past"
                    value="past"
                    control={<Radio />}
                    label="Past"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Category</FormLabel>
                <RadioGroup
                  name="category"
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                >
                  {categories.map(category => (
                    <FormControlLabel
                      key={category}
                      value={category}
                      control={<Radio />}
                      label={category}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormLabel>Dates</FormLabel>
              <Grid container spacing={2}>
                <Grid item>
                  <p>Start Date</p>
                  <TextField
                    variant="outlined"
                    fullWidth
                    style={{ width: '100%', resize: 'vertical' }}
                    type="Date"
                    value={startDateFilter}
                    onChange={handleStartDateFilterChange}
                  />
                </Grid>
                <Grid item>
                  <p>End Date</p>
                  <TextField
                    variant="outlined"
                    fullWidth
                    style={{ width: '100%', resize: 'vertical' }}
                    type="Date"
                    value={endDateFilter}
                    onChange={handleEndDateFilterChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => clearFilters()}>Clear</Button>
        </DialogActions>
      </Dialog>
      <Card>
        <Grid container justifyContent="space-between">
          <Grid item style={{ margin: '20px' }}>
            <h3>{capitalize(statusFilter)} Medications</h3>
          </Grid>
          <Grid item style={{ margin: '20px' }}>
            <IconButton onClick={() => handleClickOpen()}>
              <FilterList />
            </IconButton>
            <ButtonGroup>
              <Button
                disableElevation
                color={statusFilter === 'current' ? 'primary' : 'default'}
                variant={statusFilter === 'current' ? 'contained' : 'outlined'}
                onClick={() => setStatusFilter('current')}
              >
                Current
              </Button>
              <Button
                disableElevation
                variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                color={statusFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>

        <TableContainer>
          <Table className={classes.table} stickyHeader>
            <TableHead style={{ whiteSpace: 'nowrap' }}>
              <TableRow>
                <TableCell />
                <TableCell>
                  Generic Name
                  <TableSortLabel
                    active={sortField === 'genericName'}
                    direction={sortOrder}
                    onClick={() => sortBy('genericName')}
                  />
                </TableCell>
                <TableCell>
                  Product Name
                  <TableSortLabel
                    active={sortField === 'productName'}
                    direction={sortOrder}
                    onClick={() => sortBy('productName')}
                  />
                </TableCell>
                <TableCell>
                  Category
                  <TableSortLabel
                    active={sortField === 'category'}
                    direction={sortOrder}
                    onClick={() => sortBy('category')}
                  />
                </TableCell>
                <TableCell>
                  Dosage
                  <TableSortLabel
                    active={sortField === 'dosage'}
                    direction={sortOrder}
                    onClick={() => sortBy('dosage')}
                  />
                </TableCell>
                <TableCell>
                  Route
                  <TableSortLabel
                    active={sortField === 'route'}
                    direction={sortOrder}
                    onClick={() => sortBy('route')}
                  />
                </TableCell>
                <TableCell>
                  Frequency
                  <TableSortLabel
                    active={sortField === 'frequency'}
                    direction={sortOrder}
                    onClick={() => sortBy('frequency')}
                  />
                </TableCell>
                <TableCell>
                  Duration in days
                  <TableSortLabel
                    active={sortField === 'duration'}
                    direction={sortOrder}
                    onClick={() => sortBy('duration')}
                  />
                </TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Regards to Meals</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>
                  Start Date
                  <TableSortLabel
                    active={sortField === 'startDate'}
                    direction={sortOrder}
                    onClick={() => sortBy('startDate')}
                  />
                </TableCell>
                <TableCell>
                  Stop Date
                  <TableSortLabel
                    active={sortField === 'endDate'}
                    direction={sortOrder}
                    onClick={() => sortBy('endDate')}
                  />
                </TableCell>
                <TableCell>Special Instructions</TableCell>
                <TableCell>Medication Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedications.length > 0 ? (
                filteredMedications.map((medication, index) => (
                  <React.Fragment key={medication.customId}>
                    <TableRow
                      hover
                      selected={isOpenSubTable(medication.customId)}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'whitesmoke' : '',
                      }}
                      onClick={() => {
                        if (isOpenSubTable(medication.customId)) {
                          setSubTableId(null)
                        } else {
                          setSubTableId(medication.customId)
                        }
                      }}
                    >
                      <TableCell>
                        {isOpenSubTable(medication.customId) ? (
                          <KeyboardArrowDownIcon />
                        ) : (
                          <KeyboardArrowUpIcon />
                        )}
                      </TableCell>
                      <TableCell>{medication.genericName}</TableCell>
                      <TableCell>{medication.productName}</TableCell>
                      <TableCell>{medication.category}</TableCell>
                      <TableCell>{medication.dosage}</TableCell>
                      <TableCell>{medication.route}</TableCell>
                      <TableCell>{medication.frequency}</TableCell>
                      <TableCell>{medication.duration}</TableCell>
                      <TableCell>{medication.comment}</TableCell>
                      <TableCell>{medication.regardsToMeal}</TableCell>
                      <TableCell>{medication.reason}</TableCell>
                      <TableCell>
                        {medication?.startDate
                          ? formatDate(new Date(medication.startDate))
                          : ''}
                      </TableCell>
                      <TableCell>
                        {medication?.endDate
                          ? formatDate(new Date(medication.endDate))
                          : ''}
                      </TableCell>
                      <TableCell>{medication.specialInstructions}</TableCell>
                      <TableCell align="center">
                        {medication.medicationStatus ? (
                          <IconButton
                            onClick={e => {
                              e.stopPropagation()
                              updateField(
                                'medicationStatus',
                                !medication.medicationStatus,
                                medication.customId,
                              )
                            }}
                          >
                            <CheckIcon style={{ color: 'green' }} />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={e => {
                              e.stopPropagation()
                              updateField(
                                'medicationStatus',
                                !medication.medicationStatus,
                                medication.customId,
                              )
                            }}
                          >
                            <CloseIcon style={{ color: 'red' }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={6}
                    >
                      <Collapse
                        in={isOpenSubTable(medication.customId)}
                        timeout="auto"
                        unmountOnExit
                        orientation="vertical"
                      >
                        <Box sx={{ margin: 1 }}>
                          {/* <Typography variant="h6" gutterBottom component="div">
                            Products
                          </Typography> */}
                          <form>
                            <Card
                              variant="outlined"
                              style={{ padding: '20px', margin: '20px' }}
                            >
                              <Grid
                                container
                                spacing={2}
                                justifyContent="space-around"
                              >
                                <Grid
                                  item
                                  xs={12}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <p>Medication Status:</p>
                                  <Switch
                                    checked={medication.medicationStatus}
                                    onClick={e =>
                                      updateField(
                                        'medicationStatus',
                                        e.target.checked,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <p>Start date:</p>
                                  <TextField
                                    fullWidth
                                    type="date"
                                    variant="outlined"
                                    value={
                                      medication?.startDate
                                        ? formatDate(medication.startDate)
                                        : new Date()
                                    }
                                    onChange={e =>
                                      updateField(
                                        'startDate',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <p>Stop date:</p>
                                  <TextField
                                    fullWidth
                                    type="date"
                                    variant="outlined"
                                    value={
                                      medication?.endDate
                                        ? formatDate(medication.endDate)
                                        : new Date()
                                    }
                                    onChange={e =>
                                      updateField(
                                        'endDate',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Dosage"
                                    value={medication.dosage}
                                    onChange={e =>
                                      updateField(
                                        'dosage',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Route"
                                    value={medication.route}
                                    onChange={e =>
                                      updateField(
                                        'route',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Frequency"
                                    value={medication.frequency}
                                    onChange={e =>
                                      updateField(
                                        'frequency',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <TextField
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    label="Duration in days"
                                    value={medication.duration}
                                    onChange={e => {
                                      updateField(
                                        'duration',
                                        e.target.value,
                                        medication.customId,
                                      )
                                      if (medication.startDate) {
                                        updateField(
                                          'endDate',
                                          addDaysToDate(
                                            medication.startDate,
                                            e.target.value,
                                          ),
                                          medication.customId,
                                        )
                                      }
                                    }}
                                    inputProps={{
                                      min: 0,
                                    }}
                                  />
                                </Grid>

                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    rows={5}
                                    multiline
                                    label="Comment"
                                    value={medication.comment}
                                    onChange={e =>
                                      updateField(
                                        'comment',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    rows={5}
                                    multiline
                                    label="Regards to Meal"
                                    value={medication.regardsToMeal}
                                    onChange={e =>
                                      updateField(
                                        'regardsToMeal',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={6}
                                  style={{ marginBottom: '10px' }}
                                >
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    rows={5}
                                    multiline
                                    label="Reason"
                                    value={medication.reason}
                                    onChange={e =>
                                      updateField(
                                        'reason',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    rows={5}
                                    multiline
                                    label="Special Instructions"
                                    value={medication.specialInstructions}
                                    onChange={e =>
                                      updateField(
                                        'specialInstructions',
                                        e.target.value,
                                        medication.customId,
                                      )
                                    }
                                  />
                                </Grid>
                              </Grid>
                            </Card>
                          </form>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  )
}

function CreateGoal({ setFormState, currentPatient, setGoals, goals }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isDirty, isSubmitting, isValid },
    watch,
  } = useForm({
    defaultValues: {
      description: '',
      timeline: '',
      currentReading: '',
      status: '',
    },
  })

  const statusValue = watch('status')

  const onSubmit = async data => {
    try {
      /*   setError('');
      setSuccess('');
      setLoading(true);
 */
      const patientId = currentPatient._id
      setGoals([...goals, data])

      /* await API.post(`shops/${shopId}/patients/${patientId}/medications`, {
        ...data,
      });
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setSuccess('Updated medical history');
      setLoading(false); */
      setFormState('list')
    } catch (err) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      setLoading(false)
      const { message } = err.response.data
      setError(message)
    }
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
        <h3>New Goal</h3>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.description?.message}
              helperText={errors.description?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('description', {
                required: 'This field is required',
              })}
              label="Description"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.timeline?.message}
              helperText={errors.timeline?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('timeline', {
                required: 'This field is required',
              })}
              label="Timeline"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              margin="auto"
              variant="outlined"
              fullWidth
              error={!!errors.currentReading?.message}
              helperText={errors.currentReading?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('currentReading', {
                required: 'This field is required',
              })}
              label="Current Reading"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.status?.message}
              helperText={errors.status?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('status', {
                required: 'This field is required',
              })}
              label="Status"
            />
          </Grid>

          {/* <Grid item xs={12} md={6}>
            <p>Status</p>
            <FormControlLabel
              label={statusValue ? 'Continued' : 'Stopped'}
              control={
                <Checkbox {...register('status')} checked={statusValue} />
              }
            />
          </Grid> */}
        </Grid>
        <Grid container spacing={2} justifyContent="flex-end">
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
              disabled={loading || !isDirty || isSubmitting || !isValid}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Card>
    </form>
  )
}

function EditGoal({ setFormState, currentGoal, setGoals, goalIndex, goals }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    watch,
  } = useForm({
    defaultValues: {
      description: currentGoal?.description || '',
      timeline: currentGoal?.timeline || '',
      currentReading: currentGoal?.currentReading || '',
      status: currentGoal?.status || false,
    },
  })

  const statusValue = watch('status')

  const onSubmit = async data => {
    try {
      /* setError('');
      setSuccess('');
      setLoading(true);

      const patientId = currentPatient._id;
      await API.patch(
        `shops/${shopId}/patients/${patientId}/medications/${currentMedication._id}`,
        {
          ...data,
        }
      );

      setSuccess('Updated medical history');
      setLoading(false);
      setFormState('list'); */

      const newGoals = [...goals]

      newGoals[goalIndex] = data

      setGoals(newGoals)
      setFormState('list')
    } catch (err) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      setLoading(false)
      const { message } = err.response.data
      setError(message)
    }
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
        <h3>Edit Goal</h3>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.description?.message}
              helperText={errors.description?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('description', {
                required: 'This field is required',
              })}
              label="Description"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.timeline?.message}
              helperText={errors.timeline?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('timeline', {
                required: 'This field is required',
              })}
              label="Timeline"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.currentReading?.message}
              helperText={errors.currentReading?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('currentReading', {
                required: 'This field is required',
              })}
              label="Current Reading"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.status?.message}
              helperText={errors.status?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('status', {
                required: 'This field is required',
              })}
              label="Status"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} justifyContent="flex-end">
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
              disabled={loading || !isDirty || isSubmitting || !isValid}
            >
              Edit
            </Button>
          </Grid>
        </Grid>
      </Card>
    </form>
  )
}

function GoalsList({
  setFormState,
  setCurrentGoal,
  goals,
  setGoalIndex,
  setGoals,
}) {
  const classes = useStyles()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const editGoal = (goal, index) => {
    setFormState('edit')
    setCurrentGoal(goal)
    setGoalIndex(index)
  }

  const deleteGoal = async index => {
    const newGoals = [...goals]
    newGoals.splice(index, 1)
    setGoals(newGoals)
  }

  return (
    <TableContainer>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Timeline</TableCell>
            <TableCell>Current Reading</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {goals.length > 0 ? (
            goals.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.timeline}</TableCell>
                <TableCell>{item.currentReading}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => {
                      editGoal(item, index)
                    }}
                  >
                    <EditIcon />
                  </Button>
                  <Button>
                    <DeleteIcon
                      onClick={() => {
                        deleteGoal(index)
                      }}
                    />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function GoalsModule({ goals, setGoals, shopId, currentPatient }) {
  const [formState, setFormState] = useState('list')

  const [currentGoal, setCurrentGoal] = useState({})

  const [goalIndex, setGoalIndex] = useState(null)

  return (
    <>
      {formState === 'list' && (
        <Card body="true" style={{ padding: '10px' }}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <h3>Goals</h3>
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
            <GoalsList
              setFormState={setFormState}
              formState={formState}
              setCurrentGoal={setCurrentGoal}
              shopId={shopId}
              currentPatient={currentPatient}
              goals={goals}
              setGoalIndex={setGoalIndex}
              setGoals={setGoals}
            />
          </Grid>
        </Card>
      )}
      {formState === 'create' && (
        <CreateGoal
          setFormState={setFormState}
          shopId={shopId}
          currentPatient={currentPatient}
          goals={goals}
          setGoals={setGoals}
        />
      )}
      {formState === 'edit' && (
        <EditGoal
          setFormState={setFormState}
          shopId={shopId}
          currentPatient={currentPatient}
          currentGoal={currentGoal}
          goals={goals}
          goalIndex={goalIndex}
          setGoals={setGoals}
        />
      )}
    </>
  )
}

function CreateEncounter({ setFormState }) {
  const { currentPatient } = useContext(currentPatientContext)
  const { open } = useSnackbarState()
  const { getUserId } = useAuthState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [loading, setLoading] = useState(false)

  const [prescriptions, setPrescriptions] = useState([])
  const [medications, setMedications] = useState([])
  const [goals, setGoals] = useState([])
  const [currentMedications, setCurrentMedications] = useState([])

  const [medicationUnderstanding, setMedicalUnderstanding] = useState('')

  const handleCheckbox = e => {
    setMedicalUnderstanding(e.target.name)
  }

  const isChecked = checkbox => checkbox === medicationUnderstanding

  const [intervention, setIntervention] = useState('')

  const handleInterventionCheckbox = e => {
    setIntervention(e.target.name)
  }

  const isInterventionChecked = checkbox => checkbox === intervention

  const [potentialDrugInteractions, setPotentialDrugInteractions] = useState('')
  const [potentialSideEffects, setPotentialSideEffects] = useState('')
  const [pharmacologicalInterventions, setPharmacologicalInterventions] =
    useState('')
  const [nonPharmacologicalInterventions, setNonPharmacologicalInterventions] =
    useState('')
  const [therapeuticAlternatives, setTherapeuticAlternatives] = useState('')
  const [otherExplanations, setOtherExplanations] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [recommendationToClinician, setRecommendationToClinician] = useState('')
  const [recommendationToPatient, setRecommendationToPatient] = useState('')
  const [referral, setReferral] = useState({ doctor: {}, comment: '' })

  const onSubmit = async () => {
    try {
      setLoading(true)

      const patientId = currentPatient._id

      const newMedicationEncounter = {
        shopId,
        reviewerId: getUserId(),
        userId: patientId,
        medications,
        prescriptions,
        medicationUnderstanding,
        potentialDrugInteractions,
        potentialSideEffects,
        therapeuticAlternatives,
        pharmacologicalInterventions,
        nonPharmacologicalInterventions,
        followUp,
        intervention: { details: intervention, otherExplanations },
        currentMedications,
        recommendationToPatient,
        recommendationToClinician,
        goals,
        referral,
      }
      // console.log(
      //   '🚀 ~ file: MedicationEncountersModule.js:1384 ~ onSubmit ~ newMedicationEncounter:',
      //   newMedicationEncounter,
      // )

      await API.post(`medication_encounters`, {
        ...newMedicationEncounter,
      })

      setLoading(false)
      setFormState('list')
      open('success', 'success')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <Grid
      container
      spacing={2}
      justifyContent="space-between"
      style={{ overflow: 'hidden' }}
      direction="column"
    >
      <Grid item xs={12}>
        <AllMedications
          currentMedications={currentMedications}
          setCurrentMedications={setCurrentMedications}
          shopId={shopId}
        />
      </Grid>
      <Grid item xs={12}>
        <PrescriptionsModule
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          shopId={shopId}
        />
      </Grid>
      <Grid item xs={12}>
        <MedicationModule
          medications={medications}
          setMedications={setMedications}
          shopId={shopId}
          currentPatient={currentPatient}
        />
      </Grid>

      <Grid item xs={12}>
        <GoalsModule
          goals={goals}
          setGoals={setGoals}
          shopId={shopId}
          currentPatient={currentPatient}
        />
      </Grid>
      <Grid item xs={12}>
        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Patient medication understanding</h3>
          <p>
            (Extent of interpretation on the use of the medicine by the patient)
          </p>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('0-25%')}
                  onChange={handleCheckbox}
                  name="0-25%"
                />
              }
              label="0-25%"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('25-50%')}
                  onChange={handleCheckbox}
                  name="25-50%"
                />
              }
              label="25-50%"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('50-75%')}
                  onChange={handleCheckbox}
                  name="50-75%"
                />
              }
              label="50-75%"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('75-100%')}
                  onChange={handleCheckbox}
                  name="75-100%"
                />
              }
              label="75-100%"
            />
          </FormGroup>
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Potential drug interactions</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Potential drug effects"
            value={potentialDrugInteractions}
            onChange={e => setPotentialDrugInteractions(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Potential side effects</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Potential side effects"
            value={potentialSideEffects}
            onChange={e => setPotentialSideEffects(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Therapeutic Alternatives</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Therapeutic Alternatives"
            value={therapeuticAlternatives}
            onChange={e => setTherapeuticAlternatives(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Pharmacological Interventions</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Pharmacological Interventions"
            value={pharmacologicalInterventions}
            onChange={e => setPharmacologicalInterventions(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Non Pharmacological Interventions</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Non Pharmacological Interventions"
            value={nonPharmacologicalInterventions}
            onChange={e => setNonPharmacologicalInterventions(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Intervention</h3>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInterventionChecked('Need for closer observation')}
                  onChange={handleInterventionCheckbox}
                  name="Need for closer observation"
                />
              }
              label="Need for closer observation"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInterventionChecked(
                    'Need for referral - specialist care',
                  )}
                  onChange={handleInterventionCheckbox}
                  name="Need for referral - specialist care"
                />
              }
              label="Need for referral - specialist care"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInterventionChecked(
                    'Need for referral - Patient care journey support',
                  )}
                  onChange={handleInterventionCheckbox}
                  name="Need for referral - Patient care journey support"
                />
              }
              label="Need for referral - Patient care journey support"
            />
          </FormGroup>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            label="Other explanation"
            placeholder="Other explanation"
            value={otherExplanations}
            onChange={e => setOtherExplanations(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Follow Up</h3>
          <p>
            clear communication to the patient/care giver what is expected
            before next visit
          </p>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Follow Up"
            value={followUp}
            onChange={e => setFollowUp(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Recommendation to clinician</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Recommendation"
            value={recommendationToClinician}
            onChange={e => setRecommendationToClinician(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Recommendation to patient</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Recommendation"
            value={recommendationToPatient}
            onChange={e => setRecommendationToPatient(e.target.value)}
          />
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Referral
          shopId={shopId}
          referral={referral}
          setReferral={setReferral}
        />
      </Grid>

      <Grid item xs={12}>
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
            disabled={loading}
            onClick={() => onSubmit()}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

function EditEncounter({ setFormState }) {
  const { currentPatient, currentEncounter, setCurrentEncounter } = useContext(
    currentPatientContext,
  )
  const { open } = useSnackbarState()
  const { getUserId } = useAuthState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [loading, setLoading] = useState(false)

  const [prescriptions, setPrescriptions] = useState(
    currentEncounter?.prescriptions || [],
  )
  const [medications, setMedications] = useState(
    currentEncounter?.medications || [],
  )
  const [goals, setGoals] = useState(currentEncounter?.goals || [])
  const [referral, setReferral] = useState({
    doctor: currentEncounter?.referral?.doctor || {},
    comment: currentEncounter?.referral?.comment || '',
  })

  const [currentMedications, setCurrentMedications] = useState(
    currentEncounter?.currentMedications || [],
  )

  const [medicationUnderstanding, setMedicalUnderstanding] = useState(
    currentEncounter?.medicationUnderstanding || '',
  )

  const handleCheckbox = e => {
    setMedicalUnderstanding(e.target.name)
  }

  const isChecked = checkbox => checkbox === medicationUnderstanding

  const [intervention, setIntervention] = useState(
    currentEncounter?.intervention?.details || '',
  )

  const handleInterventionCheckbox = e => {
    setIntervention(e.target.name)
  }

  const isInterventionChecked = checkbox => checkbox === intervention

  const [potentialDrugInteractions, setPotentialDrugInteractions] = useState(
    currentEncounter?.potentialDrugInteractions || '',
  )
  const [potentialSideEffects, setPotentialSideEffects] = useState(
    currentEncounter?.potentialSideEffects || '',
  )
  const [pharmacologicalInterventions, setPharmacologicalInterventions] =
    useState(currentEncounter?.pharmacologicalInterventions || '')
  const [nonPharmacologicalInterventions, setNonPharmacologicalInterventions] =
    useState(currentEncounter?.nonPharmacologicalInterventions || '')
  const [therapeuticAlternatives, setTherapeuticAlternatives] = useState(
    currentEncounter?.therapeuticAlternatives || '',
  )
  const [otherExplanations, setOtherExplanations] = useState(
    currentEncounter?.intervention?.otherExplanations || '',
  )
  const [followUp, setFollowUp] = useState(currentEncounter?.followUp || '')

  const [recommendationToClinician, setRecommendationToClinician] = useState(
    currentEncounter?.recommendationToClinician || '',
  )
  const [recommendationToPatient, setRecommendationToPatient] = useState(
    currentEncounter?.recommendationToPatient || '',
  )

  const onSubmit = async () => {
    try {
      setLoading(true)

      const patientId = currentPatient._id

      const newMedicationEncounter = {
        shopId,
        reviewerId: getUserId(),
        userId: patientId,
        medications,
        prescriptions,
        medicationUnderstanding,
        potentialDrugInteractions,
        potentialSideEffects,
        therapeuticAlternatives,
        pharmacologicalInterventions,
        nonPharmacologicalInterventions,
        followUp,
        intervention: { details: intervention, otherExplanations },
        recommendationToClinician,
        recommendationToPatient,
        currentMedications,
        goals,
        referral,
      }
      console.log(
        '🚀 ~ file: MedicationEncountersModule.js:1769 ~ onSubmit ~ newMedicationEncounter:',
        newMedicationEncounter,
      )

      // console.log('😂😂😂😂😂😂😂😂😂', currentEncounter._id)

      await API.patch(`medication_encounters/${currentEncounter._id}`, {
        ...newMedicationEncounter,
      })

      open('success', 'success')
      setLoading(false)
      setFormState('list')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <Grid
      container
      spacing={2}
      justifyContent="space-between"
      style={{ overflow: 'hidden' }}
      direction="column"
    >
      <Grid item xs={12}>
        <AllMedications
          currentMedications={currentMedications}
          setCurrentMedications={setCurrentMedications}
          shopId={shopId}
        />
      </Grid>
      <Grid item xs={12}>
        <PrescriptionsModule
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          shopId={shopId}
          currentPatient={currentPatient}
        />
      </Grid>
      <Grid item xs={12}>
        <MedicationModule
          medications={medications}
          setMedications={setMedications}
          shopId={shopId}
          currentPatient={currentPatient}
        />
      </Grid>
      <Grid item xs={12}>
        <GoalsModule
          goals={goals}
          setGoals={setGoals}
          shopId={shopId}
          currentPatient={currentPatient}
        />
      </Grid>
      <Grid item xs={12}>
        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Patient medication understanding</h3>
          <p>
            (Extent of interpretation on the use of the medicine by the patient)
          </p>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('0-25%')}
                  onChange={handleCheckbox}
                  name="0-25%"
                />
              }
              label="0-25%"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('25-50%')}
                  onChange={handleCheckbox}
                  name="25-50%"
                />
              }
              label="25-50%"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('50-75%')}
                  onChange={handleCheckbox}
                  name="50-75%"
                />
              }
              label="50-75%"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked('75-100%')}
                  onChange={handleCheckbox}
                  name="75-100%"
                />
              }
              label="75-100%"
            />
          </FormGroup>
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Potential drug interactions</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Potential drug effects"
            value={potentialDrugInteractions}
            onChange={e => setPotentialDrugInteractions(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Potential side effects</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Potential side effects"
            value={potentialSideEffects}
            onChange={e => setPotentialSideEffects(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Therapeutic Alternatives</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Therapeutic Alternatives"
            value={therapeuticAlternatives}
            onChange={e => setTherapeuticAlternatives(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Pharmacological Interventions</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Pharmacological Interventions"
            value={pharmacologicalInterventions}
            onChange={e => setPharmacologicalInterventions(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Non Pharmacological Interventions</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Non Pharmacological Interventions"
            value={nonPharmacologicalInterventions}
            onChange={e => setNonPharmacologicalInterventions(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Intervention</h3>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInterventionChecked('Need for closer observation')}
                  onChange={handleInterventionCheckbox}
                  name="Need for closer observation"
                />
              }
              label="Need for closer observation"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInterventionChecked(
                    'Need for referral - specialist care',
                  )}
                  onChange={handleInterventionCheckbox}
                  name="Need for referral - specialist care"
                />
              }
              label="Need for referral - specialist care"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInterventionChecked(
                    'Need for referral - Patient care journey support',
                  )}
                  onChange={handleInterventionCheckbox}
                  name="Need for referral - Patient care journey support"
                />
              }
              label="Need for referral - Patient care journey support"
            />
          </FormGroup>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            label="Other explanation"
            placeholder="Other explanation"
            value={otherExplanations}
            onChange={e => setOtherExplanations(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Follow Up</h3>
          <p>
            clear communication to the patient/care giver what is expected
            before next visit
          </p>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Follow Up"
            value={followUp}
            onChange={e => setFollowUp(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Recommendation to clinician</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Recommendation"
            value={recommendationToClinician}
            onChange={e => setRecommendationToClinician(e.target.value)}
          />
        </Card>

        <Card style={{ padding: '10px', margin: '10px' }}>
          <h3>Recommendation to patient</h3>
          <TextField
            variant="outlined"
            fullWidth
            rows={5}
            multiline
            placeholder="Recommendation"
            value={recommendationToPatient}
            onChange={e => setRecommendationToPatient(e.target.value)}
          />
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Referral
          shopId={shopId}
          referral={referral}
          setReferral={setReferral}
        />
      </Grid>

      <Grid item xs={12}>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              setCurrentEncounter({})
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
            disabled={loading}
            onClick={() => onSubmit()}
          >
            Edit
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

function EncountersList({ setFormState, formState, handleRefresh }) {
  const { currentPatient, setCurrentPatient, setCurrentEncounter } = useContext(
    currentPatientContext,
  )
  const patientId = currentPatient._id

  const classes = useStyles()
  const { open } = useSnackbarState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [loading, setLoading] = useState(false)

  const [encounters, setEncounters] = useState([])

  const editEncounter = encounter => {
    setFormState('edit')
    setCurrentEncounter(encounter)
  }

  async function fetchEncounters() {
    try {
      setLoading(true)
      const result = await API.get(`users/${patientId}/medication_encounters`)

      const encountersData = result.data.data
      const { paging } = result.data

      setEncounters(encountersData)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      console.log(
        '🚀 ~ file: MedicationEncountersModule.js:759 ~ fetchEncounters ~ message:',
        message,
      )
      open('error', message)
    }
     console.log('👇👇👇👇', encounters)

  }

  const deleteEncounter = async id => {
    try {
      setLoading(true)

      await API.delete(`medication_encounters/${id}`)

      fetchEncounters()
      /// force rerender

      handleRefresh()

      open('success', 'deleted')
      setLoading(false)
      setFormState('list')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  useEffect(() => {
    fetchEncounters()
  }, [formState])

  return (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Encounter Id</TableCell>
            <TableCell>Reviewer</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {encounters.length > 0 ? (
            encounters.map(encounter => (
              <TableRow key={encounter._id}>
                <TableCell>{formatDate(new Date(encounter.createdAt))}</TableCell>
                <TableCell>{encounter._id}</TableCell>
                <TableCell>{`${encounter?.reviewer?.firstName} ${encounter?.reviewer?.lastName}`}</TableCell>
                <TableCell align="center">
                  <Button onClick={() => editEncounter(encounter)}>
                    <EditIcon />
                  </Button>
                  <Button onClick={() => deleteEncounter(encounter._id)}>
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
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
  )
}

export default function EncounterModule({ setCurrentTab, handleRefresh }) {
  const [formState, setFormState] = useState('list')

  /*   React.useLayoutEffect(() => {
    if (currentEncounter) {
      setEncounterId(currentEncounter._id)
    } else {
      setEncounterId(null)
    }
  }, [currentEncounter]) */

  return (
    <>
      {formState === 'list' && (
        <>
          <Card style={{ padding: '20px' }}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <h3>Past Encounters</h3>
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

              <EncountersList
                setFormState={setFormState}
                handleRefresh={handleRefresh}
                formState={formState}
              />
            </Grid>
          </Card>
          <Grid
            container
            justifyContent="flex-end"
            spacing={2}
            style={{ marginTop: '10px' }}
          >
            <Grid item>
              <Button
                m="2"
                variant="contained"
                disableElevation
                onClick={() => {
                  setCurrentTab(0)
                }}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </>
      )}
      {formState === 'create' && (
        <CreateEncounter
          setFormState={setFormState}
          handleRefresh={handleRefresh}
        />
      )}
      {formState === 'edit' && (
        <EditEncounter
          setFormState={setFormState}
          handleRefresh={handleRefresh}
        />
      )}
    </>
  )
}

Referral.propTypes = {
  setReferral: PropTypes.func.isRequired,
  shopId: PropTypes.string.isRequired,
  referral: PropTypes.object.isRequired,
}
AllMedications.propTypes = {
  setCurrentMedications: PropTypes.func.isRequired,
  shopId: PropTypes.string.isRequired,
}

CreateGoal.propTypes = {
  setFormState: PropTypes.func.isRequired,
  currentPatient: PropTypes.string.isRequired,
  setGoals: PropTypes.func.isRequired,
  goals: PropTypes.array.isRequired,
}

EditGoal.propTypes = {
  setFormState: PropTypes.func.isRequired,
  currentGoal: PropTypes.array.isRequired,
  setGoals: PropTypes.func.isRequired,
  goals: PropTypes.array.isRequired,
  goalIndex: PropTypes.string.isRequired,
}

EncounterModule.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
}

GoalsModule.propTypes = {
  shopId: PropTypes.string.isRequired,
  currentPatient: PropTypes.object.isRequired,
  goals: PropTypes.array.isRequired,
  setGoals: PropTypes.func.isRequired,
}

CreateEncounter.propTypes = {
  setFormState: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
}
EditEncounter.propTypes = {
  setFormState: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
}

EncountersList.propTypes = {
  setFormState: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
  handleRefresh: PropTypes.func.isRequired,
}
