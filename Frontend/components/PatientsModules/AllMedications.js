/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useContext } from 'react'
import {
  TextField,
  Button,
  Grid,
  Card,
  IconButton,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableHead,
  FormControlLabel,
  FormControl,
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
} from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import FilterList from '@material-ui/icons/FilterList'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { uuid } from 'uuidv4'
import { formatDate, capitalize } from '../../utils/helpers'
import API from '../../utils/api'
import { currentPatientContext } from '../../context/currentPatientContext'
import useCurrentShopState from '../../stores/currentShop'
import useSnackbarState from '../../stores/snackbar'

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

export default function AllMedications({ refresh }) {
  const classes = useStyles()
  const {
    currentPatient: patient,
    setCurrentMedications,
    currentEncounter,
  } = useContext(currentPatientContext)

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

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
    setCurrentMedications(filtered)
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
  }

  useEffect(() => {
    try {
      fetchAllData()
    } catch (err) {
      const { message } = err.response.data
      openSnackBar('error', message)
    }
  }, [refresh])

  useEffect(() => {
    applyFilters()
  }, [
    statusFilter,
    categoryFilter,
    startDateFilter,
    endDateFilter,
    allMedications,
  ])

  const handleOnEncounterSelect = async () => {
    const encounterId = currentEncounter._id
    if (Object.keys(currentEncounter).length !== 0) {
      // remove added medications and prescriptions

      const filteredArray1 = allMedications.filter(
        item => item.medicationEncounterId !== encounterId,
      )
      setAllMedications(filteredArray1)

      const { currentMedications } = currentEncounter

      // remove current medications
      const filteredArray2 = filteredArray1.filter(
        item => !currentMedications.includes(item._id),
      )

      setAllMedications(filteredArray2)

      // set all false
      const filteredArray3 = filteredArray2.map(item => ({
        ...item,
        medicationStatus: false,
      }))

      // add formatted current medications

      const filteredArray4 = currentMedications.map(item => ({
        ...item,
        medicationEncounterId: currentEncounter._id,
        medicationStatus: true,
      }))

      setAllMedications([...filteredArray3, ...filteredArray4])
    } else {
      fetchAllData()
    }
  }

  useEffect(() => {
    handleOnEncounterSelect()
  }, [currentEncounter])

  const updateField = (field, value, customId) => {
    const medicationIndex = allMedications.findIndex(
      item => item.customId === customId,
    )
    allMedications[medicationIndex][field] = value
    applyFilters()
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
                  Duration
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

AllMedications.propTypes = {
  refresh: PropTypes.bool,
}

AllMedications.defaultProps = {
  refresh: null,
}
