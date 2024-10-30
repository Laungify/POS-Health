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
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Alert } from '@material-ui/lab';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import { formatDateTime } from '../../utils/helpers';
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

export default function PurchaseOrderList({ edit, formState }) {
  const classes = useStyles();

  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function fetchPurchaseOrders() {
    try {
      setLoading(true);
      const result = await API.get(
        `shops/${shopId}/purchase_orders?page=${page}`
      );

      const products = result.data.data;
      const { paging } = result.data;

      setPurchaseOrders(products);
      setTotalPages(paging.pages);
      setLoading(false);
    } catch (err) {
      const { message } = err.response.data;
      setError(message);
    }
  }

  const fetchPage = (event, value) => {
    setPage(value);
  };

  const deletePurchaseOrder = async (orderId) => {
    try {
      setLoading(true);
      await API.delete(`purchase_orders/${orderId}`);
      setLoading(false);
      setSuccess('Successfully deleted purchase order');
      fetchPurchaseOrders();
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  const editPurchaseOrder = (order) => {
    edit(order);
  };

  useEffect(() => {
    if (formState === 'list') {
      fetchPurchaseOrders();
    }
  }, [formState, shopId, page]);

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
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders.length > 0 ? (
              purchaseOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.product.customBrandName}</TableCell>
                  <TableCell>{order.product.storeQuantity}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Button onClick={() => editPurchaseOrder(order)}>
                      <EditIcon />
                    </Button>
                    <Button onClick={() => deletePurchaseOrder(order._id)}>
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

PurchaseOrderList.propTypes = {
  edit: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
};
