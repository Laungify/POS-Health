/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Table,
  TableHead,
  Button,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  Box,
  Grid,
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import OpenInNew from '@material-ui/icons/OpenInNew'
import VideoCallIcon from '@material-ui/icons/VideoCall'
import SearchBar from 'material-ui-search-bar'
import { Alert } from '@material-ui/lab'
import PropTypes from 'prop-types'
import Link from 'next/link'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useDebounce from '../../hooks/useDebounce'
import useCountdownTimer from '../../hooks/useCountdownTimer'
import useSnackbarState from '../../stores/snackbar'
import useCurrentShopState from '../../stores/currentShop'

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650,
  },
  divMargin: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}))

function CancelDialog({ dialog, closeCancelDialog, cancelAppointment }) {
  const [reason, setReason] = useState('')
  return (
    <Dialog open={dialog} onClose={() => closeCancelDialog()}>
      <DialogTitle>Reason</DialogTitle>
      <DialogContent>
        <DialogContentText>Include a reason for cancelling.</DialogContentText>
        <TextField
          autoFocus
          variant="outlined"
          id="reason"
          label="Reason"
          type="text"
          fullWidth
          multiline
          rows={5}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => cancelAppointment(reason)} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function AppointmentItem({
  appointment,
  viewAppointment,
  openCancelDialog,
  shopId,
}) {
  const { remainingTime, formattedRemainingTime } = useCountdownTimer(
    new Date(appointment.date),
  )

  return (
    <TableRow key={appointment._id}>
      <TableCell>{formattedRemainingTime}</TableCell>
      <TableCell>
        <Link
          href={`/shops/${shopId}/patients?patient=${appointment.user._id}`}
        >
          {appointment.user.fullName}
        </Link>
      </TableCell>
      <TableCell>{appointment.type}</TableCell>
      <TableCell>{appointment.status}</TableCell>
      {appointment.status === 'active' && (
        <TableCell align="center">
          {appointment.type === 'online' ? (<>
            <Button onClick={() => viewAppointment(appointment, 'videoCall')}>
              <VideoCallIcon />
            </Button>
            <Button onClick={() => viewAppointment(appointment, 'view')}>
              <OpenInNew />
            </Button>
          </>) : (
            <Button onClick={() => viewAppointment(appointment, 'view')}>
              <OpenInNew />
            </Button>
          )}

          <Button
            onClick={() => openCancelDialog(appointment._id)}
            style={{
              backgroundColor: 'orange',
            }}
          >
            Cancel
          </Button>
        </TableCell>
      )}
    </TableRow>
  )
}

export default function AppointmentsList({ view, formState }) {
  const classes = useStyles()

  const { getUserId } = useAuthState()

  const { open } = useSnackbarState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [appointments, setAppointments] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [searchQuery, setSearchQuery] = useState('')

  const debouncedSearch = useDebounce(searchQuery, 500)

  async function fetchAppointments() {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const result = await API.get(
        `shops/${shopId}/appointments?page=${page}&search=${searchQuery}`,
      )

      const appointmentsData = result.data.data
      const { paging } = result.data

      setAppointments(appointmentsData)
      setTotalPages(paging.pages)
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      setError(message)
    }
  }

  async function clearSearch() {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const result = await API.get(`doctors/${getUserId()}/appointments`)

      const appointmentsData = result.data.data
      const { paging } = result.data

      setAppointments(appointmentsData)
      setTotalPages(paging.pages)
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      setError(message)
    }
  }

  const fetchPage = (event, value) => {
    setPage(value)
  }

  const [dialog, setDialog] = useState(false)

  const [cancelId, setCancelId] = useState(null)

  const openCancelDialog = id => {
    setDialog(true)
    setCancelId(id)
  }

  const closeCancelDialog = () => {
    setDialog(false)
    setCancelId(null)
  }

  const cancelAppointment = async reason => {
    try {
      setLoading(true)
      closeCancelDialog()

      await API.patch(`appointments/${cancelId}/cancel`, {
        reason,
        doctor: getUserId(),
      })
      setLoading(false)
      open('success', 'appointment cancelled')

      fetchAppointments()
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  useEffect(() => {
    if (debouncedSearch !== null && debouncedSearch !== undefined)
      fetchAppointments()
  }, [debouncedSearch, page, formState])

  return (
    <div>
      {!loading && (
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

          <SearchBar
            autoFocus
            style={{ marginBottom: '10px' }}
            placeholder="Search by patient name..."
            value={searchQuery}
            onChange={newValue => {
              setSearchQuery(newValue)
            }}
            onCancelSearch={() => {
              setSearchQuery('')
              clearSearch()
            }}
          />
          {dialog && (
            <CancelDialog
              dialog={dialog}
              closeCancelDialog={closeCancelDialog}
              cancelAppointment={cancelAppointment}
            />
          )}

          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length > 0 ? (
                  appointments.map(appointment => (
                    <AppointmentItem
                      shopId={shopId}
                      key={appointment._id}
                      appointment={appointment}
                      viewAppointment={view}
                      openCancelDialog={openCancelDialog}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No Appointments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                margin: '10px',
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={fetchPage}
                color="primary"
                shape="rounded"
              />
            </div>
          </TableContainer>
        </>
      )}
    </div>
  )
}

AppointmentsList.propTypes = {
  view: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
}

AppointmentItem.propTypes = {
  appointment: PropTypes.object.isRequired,
  openCancelDialog: PropTypes.func.isRequired,
  viewAppointment: PropTypes.func.isRequired,
  shopId: PropTypes.string.isRequired,
}

CancelDialog.propTypes = {
  dialog: PropTypes.bool.isRequired,
  closeCancelDialog: PropTypes.func.isRequired,
  cancelAppointment: PropTypes.func.isRequired,
}
