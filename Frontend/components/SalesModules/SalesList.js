/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useRef } from 'react'
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
  Collapse,
  Box,
  Typography,
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import PrintIcon from '@material-ui/icons/Print'
import { Alert } from '@material-ui/lab'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import PropTypes from 'prop-types'
import SearchBar from 'material-ui-search-bar'
import API from '../../utils/api'
import { formatDateTime } from '../../utils/helpers'
import useCurrentShopState from '../../stores/currentShop'
import useAuthState from '../../stores/auth'
import { useOffline } from '../../context/offlineContext'
import { useSales } from '../../services/quickSalesProviderService'
import fetchCachedData from '../../utils/fetchCachedData'
import { addData, deleteData, getAllData, openIndexedDB, clearData } from '../../utils/indexDBUtils'
import indexDBDexi from '../../utils/dexiIndexDB'

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

export default function SalesList({ edit, print, formState }) {
  const classes = useStyles()

  const { accountType } = useAuthState()
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [sales, setSales] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isOnline = useOffline();
  const { syncDoneSales } = useSales();
  const isMounted = useRef(false);



  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  }

  const debouncedSearch = useDebounce(searchQuery, 500);
  let salesData = [];

  async function fetchSales() {
    try {
      setLoading(true);
      setError('');

      const result = await API.get(`shops/${shopId}/sales?page=${page}&search=${searchQuery}`);
      const saleData = result.data.data;

      // Clear the old cached sales and add the new sales data to the cache
      await indexDBDexi.doneSales.clear();
      await indexDBDexi.doneSales.bulkAdd(saleData);

      if (isMounted.current) {
        setSales(saleData);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching from API:', err.message || err);

      try {
        // Fetch sales from cache if API call fails
        const cachedSales = await indexDBDexi.doneSales.toArray();

        if (isMounted.current) {
          if (cachedSales.length > 0) {
            if (cachedSales.length > 0) {
              const filteredCachedSales = searchQuery
              ? cachedSales.filter(sale => {
                  const regexPattern = new RegExp(searchQuery, "i");
            
                  return (
                    sale.patientName?.match(regexPattern) ||
                    sale.products.some(product =>
                      product.productName.match(regexPattern) ||
                      product.genericName.match(regexPattern)
                    ) ||
                    sale.bill.paymentMethod.match(regexPattern)
                  );
                })
              : cachedSales;
            
            setSales(filteredCachedSales);
          } else {
            setError('No sales found in cache');
          }
          setLoading(false);
        }
      }
      } catch (cacheError) {
        console.error('Error fetching sales from IndexedDB:', cacheError);

        if (isMounted.current) {
          setError('Failed to fetch sales from both server and cache');
          setLoading(false);
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }

  async function clearSearch() {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await API.get(`shops/${shopId}/sales?page=${page}`);
      const items = result.data.data;
      const { paging } = result.data;

      setSales(items);
      setTotalPages(paging.pages);

      await indexDBDexi.sales.put({ shopId, items });

      setLoading(false);
    } catch (err) {
      const { message } = err.response?.data || err.message;
      setError(message);
      setLoading(false);
    }
  }

  useEffect(() => {
    isMounted.current = true;

    fetchSales();

    return () => {
      isMounted.current = false;
    };
  }, [shopId, formState, page, debouncedSearch]);

  // useEffect(() => { console.log('cached sales: 👇👇👇', sales) }, [sales])



  const fetchPage = (event, value) => {
    setPage(value);
  };

  const deleteSale = async (saleId) => {
    try {
      setLoading(true);
      await API.delete(`sales/${saleId}`);
      setLoading(false);
      setSuccess('Successfully deleted sale');
      fetchSales();
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  const editSale = (sale) => {
    edit(sale);
  };

  const printSale = (sale) => {
    print(sale);
  };

  useEffect(() => {
    if (error) {
      setSuccess('');
    }
    if (success) {
      setError('');
    }
  }, [error, success]);

  const [subTableOpen, setSubTableOpen] = useState('');

  const checkIfSubTableOpen = (sale) => !!(sale && sale === subTableOpen);


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

      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="center">Patient</TableCell>
              <TableCell align="center">Products Sold</TableCell>
              <TableCell align="center">Total Price</TableCell>
              <TableCell align="center">Discounts</TableCell>
              <TableCell align="center">Final Price</TableCell>
              <TableCell align="center">Billed</TableCell>
              <TableCell align="center">Date Sold</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.length > 0 ? (
              sales.map(sale => (
                <React.Fragment key={sale._id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        onClick={() => {
                          if (subTableOpen === sale._id) {
                            setSubTableOpen('')
                          } else {
                            setSubTableOpen(sale._id)
                          }
                        }}
                      >
                        {subTableOpen === sale._id ? (
                          <KeyboardArrowDownIcon />
                        ) : (
                          <KeyboardArrowUpIcon />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell align="center">{sale.patient?.firstName !== undefined ? `${sale.patient.firstName} ${sale.patient.lastName}` : '' || sale.patientName}</TableCell>
                    <TableCell align="center">{sale.products.length}</TableCell>
                    <TableCell align="center">{sale.salesPrice}</TableCell>
                    <TableCell align="center">
                      {sale.discount?.type === 'Amount'
                        ? sale.discount?.value + ' ' + 'kes'
                        : sale.discount?.type === 'Price Override'
                          ? sale.salesPrice - sale.discount?.value + ' ' + 'kes'
                          : sale.discount?.type === 'Percentage'
                            ? sale.discount?.value + '%'
                            : null}
                    </TableCell>
                    <TableCell align="center">
                      {sale.bill?.totalCost || sale.discountPrice}
                    </TableCell>
                    <TableCell align="center">
                      {Object.keys(sale?.bill || {}).length ? (
                        <CheckIcon style={{ color: 'green' }} />
                      ) : (
                        <CloseIcon style={{ color: 'red' }} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {formatDateTime(sale.createdAt)}
                    </TableCell>
                    <TableCell align="center">
                      <Button onClick={() => printSale(sale)}>
                        <PrintIcon />
                      </Button>
                      {sale?.cancellationTime && (
                        <Button
                          variant="contained"
                          disableElevation>
                          Cancelled
                        </Button>
                      )}
                      {!sale?.bill && !sale?.cancellationTime && (
                        <Button onClick={() => editSale(sale)}>
                          <EditIcon />
                        </Button>
                      )}
                      {accountType !== 'staff' && (
                        <Button onClick={() => deleteSale(sale._id)}>
                          <DeleteIcon />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={6}
                    >
                      <Collapse
                        in={checkIfSubTableOpen(sale._id)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ margin: 1 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Products
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Selling Price</TableCell>
                                <TableCell align="right">Discount</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="right">Payment Method</TableCell>
                                <TableCell align="right">Source</TableCell>
                                <TableCell align="right">Staff</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sale.products.map(product => (
                                <TableRow key={product._id}>
                                  <TableCell component="th" scope="row">
                                    {product.productName + ' ' + product.strength.replace('not applicable', '') + ' ' + product.formulation.replace('not applicable', '')}
                                  </TableCell>
                                  <TableCell align="right">
                                    {product.quantity}
                                  </TableCell>
                                  <TableCell align="right">
                                    {product.sellingPrice}
                                  </TableCell>
                                  {product.discount?.value ? (
                                    <TableCell align="right">
                                      {product.discount?.value}%
                                    </TableCell>
                                  ) : (
                                    <TableCell align="right">0</TableCell>
                                  )}
                                  <TableCell align="right">
                                    {product.quantity *
                                      product.sellingPrice *
                                      (product.discount?.value
                                        ? (100 - product.discount?.value) / 100
                                        : 1)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {sale.bill?.paymentMethod}
                                  </TableCell>
                                  <TableCell align="right">
                                    {sale.source}
                                  </TableCell>
                                  <TableCell align="right">
                                    {sale.staff?.fullName}
                                  </TableCell>
                                </TableRow>
                              ))}
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
                <TableCell colSpan={8} align="center">
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

SalesList.propTypes = {
  edit: PropTypes.func.isRequired,
  print: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
}
