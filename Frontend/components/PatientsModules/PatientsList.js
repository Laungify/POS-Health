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
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'
import DeleteIcon from '@material-ui/icons/Delete'
import OpenInNew from '@material-ui/icons/OpenInNew'
import { Alert } from '@material-ui/lab'
import PropTypes from 'prop-types'
import SearchBar from 'material-ui-search-bar'
import Link from 'next/link'
import API from '../../utils/api'
import useConfirmationDialog from '../../hooks/useConfirmationDialog'
import ConfirmDialog from '../custom/ConfirmDialog'
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

export default function PatientsList({ edit, formState }) {
  const classes = useStyles()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { isDialogOpen, showConfirmationDialog, hideConfirmationDialog } =
    useConfirmationDialog()

  const [patients, setPatients] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [value, delay])

    return debouncedValue
  }

  const debouncedSearch = useDebounce(searchQuery, 500)

  async function fetchPatients() {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const result = await API.get(
        `shops/${shopId}/patients?page=${page}&search=${debouncedSearch}`,
      )

      const patientsData = result.data.data

      const { paging } = result.data

      setPatients(patientsData)
      setTotalPages(paging.pages)
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
      const result = await API.get(
        `shops/${shopId}/patients?page=${page}&search=${searchQuery}`,
      )

      const patientsData = result.data.data

      setPatients(patientsData)

      const { paging } = result.data

      setTotalPages(paging.pages)
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      setError(message)
      setLoading(false)
    }
  }

  const fetchPage = (event, value) => {
    setPage(value)
  }

  const [deleteItem, setDeleteItem] = useState(null)

  const deletePatient = async () => {
    try {
      setLoading(true)
      await API.delete(`shops/${shopId}/patients/${deleteItem}`)
      setLoading(false)
      setSuccess('Successfully deleted patient')
      fetchPatients()
      setDeleteItem(null)
    } catch (err) {
      setDeleteItem(null)
      setLoading(false)
      const { message } = err.response.data
      setError(message)
    }
  }

  const editPatient = patient => {
    edit(patient)
  }

  useEffect(() => {
    if (error) {
      setSuccess('')
    }
    if (success) {
      setSuccess('')
    }
  }, [error, success])

  useEffect(() => {
    if (debouncedSearch) fetchPatients()
    if (formState === 'list') {
      fetchPatients()
    }
  }, [shopId, formState, debouncedSearch, page])

  const handleDelete = patientId => {
    setDeleteItem(patientId)
    showConfirmationDialog()
  }

  return (
    <div>
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
      <ConfirmDialog
        open={isDialogOpen}
        onClose={hideConfirmationDialog}
        title="Are you sure you want to delete this patient?"
        onConfirm={deletePatient}
      />
      <SearchBar
        style={{ marginBottom: '10px' }}
        placeholder="Search by patient name"
        value={searchQuery}
        onChange={newValue => {
          setSearchQuery(newValue)
          //fetchProducts();
        }}
        //onRequestSearch={() => fetchProducts()}
        onCancelSearch={() => {
          setSearchQuery('')
          clearSearch()
        }}
      />

      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length > 0 ? (
              patients.map(patient => (
                <TableRow key={patient._id}>
                  {/* <TableCell>
                    <Link
                      href={`/shops/${shopId}/patients?patient=${patient._id}`}
                    >
                      {`${patient.firstName} ${patient.lastName}`}
                    </Link>
                  </TableCell> */}

                  <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell>{`${patient.email
                    ? patient.email
                    : patient?.phoneNumber || 'N/A'
                    }`}</TableCell>
                  <TableCell align="center">
                    <Button onClick={() => editPatient(patient)}>
                      <OpenInNew />
                    </Button>
                    <Button onClick={() => handleDelete(patient._id)}>
                      <DeleteIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {loading ? "loading..." : "No data found"}
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
    </div>
  )
}

PatientsList.propTypes = {
  edit: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
}
