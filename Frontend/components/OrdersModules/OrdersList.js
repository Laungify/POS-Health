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
  Typography,
  Collapse,
  Box,
  Paper,
} from '@material-ui/core'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import Pagination from '@material-ui/lab/Pagination'
import { Alert } from '@material-ui/lab'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import OpenInNew from '@material-ui/icons/OpenInNew'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import SearchBar from 'material-ui-search-bar'
import { formatDateTime } from '../../utils/helpers'
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

export default function OrdersList({ view, formState }) {
  const classes = useStyles()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { open } = useSnackbarState()
  const [searchQuery, setSearchQuery] = useState('')

  const [orders, setOrders] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)

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
      const result = await API.get(`shops/${shopId}/orders?page=${page}`)

      const items = result.data.data
      const { paging } = result.data

      setOrders(items)
      setTotalPages(paging.pages)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  async function fetchOrders() {
    try {
      setLoading(true)
      const result = await API.get(`shops/${shopId}/orders?page=${page}&search=${debouncedSearch}`)

      const items = result.data.data
      const { paging } = result.data

      setOrders(items)
      setTotalPages(paging.pages)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  const fetchPage = (event, value) => {
    setPage(value)
  }

  const viewOrder = order => {
    view(order)
  }

  useEffect(() => {
    if (debouncedSearch) fetchOrders()
    if (formState === 'list') {
      fetchOrders()
    }
  }, [debouncedSearch, page, formState, shopId])

  const [subTableOpen, setSubTableOpen] = useState('')

  const checkIfSubTableOpen = rowIndex => rowIndex === subTableOpen

  return (
    <div>
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
              <TableCell></TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Total Orders</TableCell>
              <TableCell>Processed Orders</TableCell>
              <TableCell>Date ordered</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <React.Fragment key={`${order._id}-${index}`}>
                  <TableRow>
                    <TableCell>
                      <Button
                        onClick={() => {
                          if (subTableOpen === index) {
                            setSubTableOpen('')
                          } else {
                            setSubTableOpen(index)
                          }
                        }}
                      >
                        {subTableOpen === index ? (
                          <KeyboardArrowDownIcon />
                        ) : (
                          <KeyboardArrowUpIcon />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {`${order.patient.firstName} ${order.patient.lastName}`}
                    </TableCell>
                    <TableCell>{order.orders.length}</TableCell>
                    <TableCell>
                      {
                        order.orders.filter(item => item.processed === true)
                          .length
                      }
                    </TableCell>
                    {/* <TableCell>{order.map(item => formatDateTime(item.createdAt))}</TableCell> */}
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={6}
                    >
                      <Collapse
                        in={checkIfSubTableOpen(index)}
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
                                <TableCell>Product name</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Date ordered</TableCell>
                                <TableCell align="center">Processed</TableCell>
                                <TableCell>Order Status</TableCell>
                                <TableCell align="center">View</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.orders.map(item => (
                                <TableRow key={`${order._id}-${item._id}`}>
                                  <TableCell>{`${item.product.productName} ${item.product.formulation !== 'not applicable'
                                    ? item.product.formulation
                                    : ''
                                    } 
                                 ${item.product.strength !== 'not applicable'
                                      ? item.product.strength
                                      : ''
                                    } ${item.product.packSize}`}</TableCell>
                                  <TableCell>{item.bill?.totalCost || item.totalPrice}</TableCell>
                                  <TableCell>{item.product.quantity}</TableCell>
                                  <TableCell>
                                    {formatDateTime(item.createdAt)}
                                  </TableCell>
                                  <TableCell align="center">
                                    {item.processed ? (
                                      <CheckIcon style={{ color: 'green' }} />
                                    ) : (
                                      <CloseIcon style={{ color: 'red' }} />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {(() => {
                                      switch (item.orderStatus) {
                                        case 'order sent':
                                          return (
                                            <div
                                              style={{
                                                background: '#556cd6',
                                                padding: '0.5rem',
                                                borderRadius: '10px',
                                                color: 'white',
                                              }}
                                            >
                                              New Order
                                            </div>
                                          )
                                        case 'receive':
                                          return 'dispatch'
                                        case 'confirmed':
                                          return (
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
                                          )
                                        default:
                                          return item.orderStatus
                                      }
                                    })()}
                                  </TableCell>

                                  <TableCell align="center">
                                    <Button onClick={() => viewOrder(item)}>
                                      <OpenInNew />
                                    </Button>
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

OrdersList.propTypes = {
  view: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
}
