/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableHead,
  Button,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Paper,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import DeleteIcon from '@material-ui/icons/Delete';
import { Alert } from '@material-ui/lab';
import Image from 'next/image';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import OpenInNew from '@material-ui/icons/OpenInNew';
import PropTypes from 'prop-types';
import { formatDateTime } from '../../utils/helpers';
import API from '../../utils/api';
import SearchBar from 'material-ui-search-bar'
import useCurrentShopState from '../../stores/currentShop';
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
}));

export default function PrescriptionsList({ view }) {
  const classes = useStyles();

  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const { open } = useSnackbarState()
  const [searchQuery, setSearchQuery] = useState('')

  const [prescriptions, setPrescriptions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  async function clearSearch() {
    try {
      setLoading(true)
      const result = await API.get(`shops/${shopId}/prescriptions?page=${page}`)

      const items = result.data.data
      const { paging } = result.data

      setPrescriptions(items)
      setTotalPages(paging.pages)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  async function fetchPrescriptions() {
    try {
      setLoading(true);
      const result = await API.get(
        `shops/${shopId}/prescriptions?page=${page}&search=${debouncedSearch}`
      );

      const items = result.data.data;
      const { paging } = result.data;

      setPrescriptions(items);
      setTotalPages(paging.pages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      // setError(message);
      open('error', message)
    }
  }

  const fetchPage = (event, value) => {
    setPage(value);
  };

  const deletePrescription = async (prescriptionId) => {
    try {
      setLoading(true);
      await API.delete(`prescriptions/${prescriptionId}`);
      setLoading(false);
      setSuccess('Successfully deleted prescription');
      fetchPrescriptions();
    } catch (err) {
      setLoading(false);
      const { message } = error.response.data;
      setError(message);
    }
  };

  const viewPrescription = (prescription) => {
    view(prescription);
  };

  React.useEffect(() => {
    if (debouncedSearch) fetchPrescriptions()
    fetchPrescriptions();
  }, [debouncedSearch, shopId, page]);

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
      <SearchBar
        style={{ marginBottom: '10px' }}
        placeholder="Search by product or patient name..."
        value={searchQuery}
        onChange={newValue => {
          setSearchQuery(newValue)
        }}
        onCancelSearch={() => {
          setSearchQuery('')
          clearSearch()
        }}
      />
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell>Prescription</TableCell>
              <TableCell>Date Sent</TableCell>
              <TableCell align="center">Processed</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <TableRow key={prescription._id}>
                  <TableCell>
                    {`${prescription.patient.firstName} ${prescription.patient.lastName}`}
                  </TableCell>
                  <TableCell>
                    {/* <Image
                      src={prescription.url}
                      alt=""
                      width={100}
                      height={100}
                    /> */}
                    {prescription.url.endsWith('.pdf') ? (
                      <iframe
                        src={prescription.url}
                        width="100px"
                        height="100px"
                        title="PDF Viewer"
                      />
                    ) : (
                      <Image
                        src={prescription.url}
                        alt=""
                        width={100}
                        height={100}
                      />
                    )}

                  </TableCell>
                  <TableCell>
                    {formatDateTime(prescription.createdAt)}
                  </TableCell>
                  <TableCell align="center">
                    {prescription.processed ? (
                      <CheckIcon style={{ color: 'green' }} />
                    ) : (
                      <CloseIcon style={{ color: 'red' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {prescription.orderStatus == 'prescription sent' ? (
                      <div
                        style={{
                          background: '#556cd6',
                          padding: '0.5rem',
                          borderRadius: '10px',
                          color: 'white',
                        }}
                      >
                        New prescription
                      </div>
                    ) : prescription.orderStatus == 'receive' ? (
                      'dispatch'
                    ) : prescription.orderStatus == 'confirmed' ? (
                      <div
                        style={{
                          background: '#556cd6',
                          padding: '0.5rem',
                          borderRadius: '10px',
                          color: 'white',
                        }}
                      >
                        Confirmed
                      </div>
                    ) : (
                      prescription.orderStatus
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Button onClick={() => viewPrescription(prescription)}>
                      <OpenInNew />
                    </Button>
                    {/* <Button
                      onClick={() => deletePrescription(prescription._id)}
                    >
                      <DeleteIcon />
                    </Button> */}
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
  );
}

PrescriptionsList.propTypes = {
  view: PropTypes.func.isRequired,
};
