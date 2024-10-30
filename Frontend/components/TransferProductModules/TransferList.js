/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useContext } from 'react';
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
import UndoIcon from '@material-ui/icons/Undo';
import { Alert } from '@material-ui/lab';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  divMargin: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function TransferList({ formState }) {
  const classes = useStyles();

  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [transfers, setTransfers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(1);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fetchTransfers() {
    try {
      setLoading(true)
      const result = await API.get(`shops/${shopId}/transfers?page=${page}`);

      const transferData = result.data.data;
      const { paging } = result.data;
      setLoading(false)
      setTransfers(transferData);
      setTotalPages(paging.pages);
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data;
      setError(message);
    }
  }

  const fetchPage = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    if (error) {
      setSuccess('');
    }
    if (success) {
      setSuccess('');
    }
  }, [error, success]);

  useEffect(() => {
    if (formState === 'list') {
      fetchTransfers();
    }
  }, [shopId, formState]);

  const getType = (transfer) => {
    const shopFrom = transfer.from._id;
    let type = 'In';

    if (shopFrom === shopId) {
      type = 'Out';
    }
    return type;
  };

  async function undoTransfer(transferId) {
    try {
      await API.delete(`transfers/${transferId}`);
      fetchTransfers();
    } catch (err) {
      const { message } = err.response.data;
      setError(message);
    }
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
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Undo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.length > 0 ? (
              transfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell>{transfer.product.customBrandName}</TableCell>
                  <TableCell>{transfer.product.storeQuantity}</TableCell>
                  <TableCell>{getType(transfer)}</TableCell>
                  <TableCell align="center">
                    <Button onClick={() => undoTransfer(transfer._id)}>
                      <UndoIcon />
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
  );
}

TransferList.propTypes = {
  formState: PropTypes.string.isRequired,
};
