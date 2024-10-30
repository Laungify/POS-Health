/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import {
  Button,
  Grid,
  Card,
  Table,
  TableCell,
  TableRow,
  TableBody,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import { formatDateTime, calculateAge } from '../../utils/helpers'
import API from '../../utils/api'
import ImageZoom from '../custom/ImageZoom'
import useCurrentShopState from '../../stores/currentShop'
import useSnackbarState from '../../stores/snackbar'
import useAuthState from '../../stores/auth'

const useStyles = makeStyles(() => ({
  toggleBtn: {
    backgroundColor: '#9e9e9e !important',
    color: 'black !important',
  },
  toggleBtnSelected: {
    backgroundColor: '#4caf50 !important',
  },
  textCenter: {
    textAlign: 'center',
  },
}))

export default function ViewOrder({ order, setFormState, newSale }) {
  //console.log("order", order)
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id
  const { getUserId } = useAuthState()

  const { open } = useSnackbarState()

  const classes = useStyles()
  const [processed] = useState(order.processed)
  const [loading, setLoading] = React.useState(false)

  const {
    createdAt,
    totalPrice,
    product,
    patient,
    paymentMethod,
    orderStatus,
    address,
    cancellationTime,
    endSaleTime,
    quoteTime,
    confirmTime,
    receiveTime,
    staff,
    discount,
    bill
  } = order
  const {
    sellingPrice,
    productName,
    formulation,
    strength,
    packSize,
    quantity,
    reqQuantity,
    prescription,
    unit,
    totalProductPrice
    //discount,
  } = product
  const { firstName, lastName, email, phoneNumber, dob } = patient[0]
  const fullName = firstName || lastName ? `${firstName} ${lastName}` : 'N/A'

  const createSale = async () => {
    const products = [
      {
        ...order.product,
      },
    ]

    const data = {
      shopId,
      patient: order?.patient || {},
      products,
      salesPrice: order.totalPrice,
      orderId: order._id,
      orderStatus: order.orderStatus,
      diagnosis: order.diagnosis
    }
    newSale(data)
  }

  const updateOrderStatus = async () => {

    const staff = {
      staffId: getUserId(),
    }

    try {
      setLoading(true)
      await API.patch(`orders/${order._id}/processcancel/`, { ...staff })
      setLoading(false)
      setFormState('list')
      open('success', 'order cancelled')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <div>
      <Grid container justifyContent="center">
        <Card style={{ width: '30rem', margin: '20px' }}>
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <h2>Order</h2>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Product
                </TableCell>
                <TableCell align="center">{`${productName} ${formulation !== 'not applicable' ? formulation : ''
                  } 
                                 ${strength !== 'not applicable' ? strength : ''
                  } ${packSize}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Unit
                </TableCell>
                <TableCell align="center">{unit}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Price
                </TableCell>
                {/* <TableCell colSpan={5} align="center">
                  {discount?.value
                    ? Math.round(sellingPrice * ((100 - discount.value) / 100))
                    : sellingPrice}
                </TableCell> */}
                <TableCell colSpan={5} align="center">
                  {sellingPrice}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Quantity Requested
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {reqQuantity || quantity}
                </TableCell>
              </TableRow>
              {(orderStatus === 'receive' || orderStatus === 'review') && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Quantity Sold
                  </TableCell>
                  <TableCell colSpan={5} align="center">
                    {quantity}
                  </TableCell>
                </TableRow>
              )}

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Total Price
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {totalProductPrice || totalPrice}
                </TableCell>
              </TableRow>
              {discount?.value && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Discount applied
                  </TableCell>
                  <TableCell colSpan={5} align="center">
                    {discount?.type + ":" + discount?.value}
                  </TableCell>
                </TableRow>
              )}
              {(orderStatus === 'receive' || orderStatus === 'review') && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Final Price
                  </TableCell>
                  <TableCell colSpan={5} align="center">
                    {bill?.totalCost}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Date Ordered
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {formatDateTime(createdAt)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Processed
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {processed ? (
                    <CheckIcon style={{ color: 'green' }} />
                  ) : (
                    <CloseIcon style={{ color: 'red' }} />
                  )}
                </TableCell>
              </TableRow>
              {orderStatus === 'cancelled' && (<>
                {quoteTime && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Date Quoted:
                      </TableCell>
                      <TableCell colSpan={5} align="center">
                        {formatDateTime(quoteTime)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                {confirmTime && (<>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Date Confirmed:
                    </TableCell>
                    <TableCell colSpan={5} align="center">
                      {formatDateTime(confirmTime)}
                    </TableCell>
                  </TableRow>
                </>)}
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Date cancelled
                  </TableCell>
                  <TableCell colSpan={5} align="center">
                    {formatDateTime(cancellationTime)}
                  </TableCell>
                </TableRow>

              </>)}
              {orderStatus === 'receive' && (<>
                {quoteTime && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Quoted Date:
                      </TableCell>
                      <TableCell colSpan={5} align="center">
                        {formatDateTime(quoteTime)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                {confirmTime && (<>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Confirmed Date:
                    </TableCell>
                    <TableCell colSpan={5} align="center">
                      {formatDateTime(confirmTime)}
                    </TableCell>
                  </TableRow>
                </>)}
                {endSaleTime && (<>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Sold Date:
                    </TableCell>
                    <TableCell colSpan={5} align="center">
                      {formatDateTime(endSaleTime)}
                    </TableCell>
                  </TableRow>
                </>)}
              </>)}
              {orderStatus === 'received' && (<>
                {quoteTime && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Quoted Date:
                      </TableCell>
                      <TableCell colSpan={5} align="center">
                        {formatDateTime(quoteTime)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                {confirmTime && (<>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Confirmed Date:
                    </TableCell>
                    <TableCell colSpan={5} align="center">
                      {formatDateTime(confirmTime)}
                    </TableCell>
                  </TableRow>
                </>)}
                {endSaleTime && (<>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Sold Date:
                    </TableCell>
                    <TableCell colSpan={5} align="center">
                      {formatDateTime(endSaleTime)}
                    </TableCell>
                  </TableRow>
                </>)}
                {receiveTime && (<>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Received Date:
                    </TableCell>
                    <TableCell colSpan={5} align="center">
                      {formatDateTime(receiveTime)}
                    </TableCell>
                  </TableRow>
                </>)}
              </>)}
              {orderStatus === 'confirmed' && (<>
                {quoteTime && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Quoted Date:
                      </TableCell>
                      <TableCell colSpan={5} align="center">
                        {formatDateTime(quoteTime)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                {confirmTime && (<>
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Confirmed Date:
                    </TableCell>
                    <TableCell colSpan={5} align="center">
                      {formatDateTime(confirmTime)}
                    </TableCell>
                  </TableRow>
                </>)}
              </>)}
              {orderStatus === 'review' && (<>
                {quoteTime && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Quoted Date:
                      </TableCell>
                      <TableCell colSpan={5} align="center">
                        {formatDateTime(quoteTime)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </>)}
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Order Status
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {(() => {
                    switch (orderStatus) {
                      case 'order sent':
                        return 'New Order'
                      case 'receive':
                        return 'dispatch'
                      default:
                        return orderStatus
                    }
                  })()}
                </TableCell>
              </TableRow>
              {order.staff.length > 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    staff
                  </TableCell>
                  <TableCell colSpan={5} align="center">
                    {order.staff[0].firstName + " " + order.staff[0].lastName}
                  </TableCell>
                </TableRow>
              )}

              {/* {orderStatus === 'order sent' ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          variant="contained"
                          disableElevation
                          onClick={() => updateOrderStatus()}
                        >
                          Cancel Order
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="contained"
                          color="primary"
                          disableElevation
                          onClick={() => createSale()}
                        >
                          Create Sale
                        </Button>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              ) : null} */}
              {!order.processed && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Create Sale
                  </TableCell>
                  <TableCell colSpan={5} align="center">
                    <Button
                      m="2"
                      variant="contained"
                      color="primary"
                      disableElevation
                      onClick={() => createSale()}
                    >
                      Sell
                    </Button>
                  </TableCell>
                </TableRow>

              )}
              {!order.processed && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Button
                      m="2"
                      variant="contained"
                      color="primary"
                      disableElevation
                      disabled={loading}
                      onClick={() => updateOrderStatus()}
                    >
                      Cancel Order
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {prescription && (
          <Card style={{ width: '20rem', margin: '20px' }}>
            <div className={classes.textCenter}>
              <h2>Prescription</h2>
            </div>
            {prescription.endsWith('.pdf') ? (
              <iframe
                src={prescription}
                width="100%"
                height="500px"
                title="PDF Viewer"
              />
            ) : (
              <ImageZoom src={prescription} />
            )}

            {/* <ImageZoom src={prescription} /> */}
          </Card>
        )}

        <Card style={{ width: '20rem', margin: '5px' }}>
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <h2>Patient</h2>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Name
                </TableCell>
                <TableCell align="center">{fullName || 'N/A'}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Email
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {email}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Phone number
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {phoneNumber || 'N/A'}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Age
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {dob ? calculateAge(dob) : 'N/A'}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Address
                </TableCell>
                <TableCell colSpan={5} align="center">
                  <address>
                    <p>County: {address.county}</p>
                    <p>Street: {address.street}</p>
                  </address>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} align="center">
                  Payment Method
                </TableCell>
                <TableCell colSpan={5} align="center">
                  {paymentMethod}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Grid>

      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item>
          <Button
            m="2"
            variant="contained"
            disableElevation
            onClick={() => setFormState('list')}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

ViewOrder.propTypes = {
  order: PropTypes.object.isRequired,
  setFormState: PropTypes.func.isRequired,
  newSale: PropTypes.func.isRequired,
}
