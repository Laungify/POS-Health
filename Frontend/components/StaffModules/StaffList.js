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
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import OpenInNew from '@material-ui/icons/OpenInNew'
import { Alert } from '@material-ui/lab'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useSnackbarState from '../../stores/snackbar'

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

export default function StaffList({ edit, formState, shopId }) {
  const { open } = useSnackbarState()

  const classes = useStyles()

  const { accountType } = useAuthState()

  const [staff, setStaff] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)

  async function fetchStaff() {
    try {
      setLoading(true)
      const result = await API.get(`shops/${shopId}/staff?page=${page}`)

      const staffData = result.data.data
      //console.log("staffData", staffData)
      const { paging } = result.data
      setLoading(false)
      setStaff(staffData)

      setTotalPages(paging.pages)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  const fetchPage = (event, value) => {
    setPage(value)
  }

  const deleteStaff = async staffId => {
    try {
      setLoading(true)
      await API.delete(`staff/${staffId}/shop/${shopId}`)
      setLoading(false)
      open('success', 'Successfully deleted staff')
      fetchStaff()
    } catch (err) {
      console.log(
        '🚀 ~ file: ProductsTable.js ~ line 143 ~ deleteProduct ~ error',
        err,
      )
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  const editStaff = data => {
    edit(data)
  }

  useEffect(() => {
    if (formState === 'list') {
      fetchStaff()
    }
  }, [shopId, formState])

  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.length > 0 ? (
              staff.map(person => (
                <TableRow key={person._id}>
                  <TableCell>
                    {`${person?.firstName || person?.lastName
                      ? `${person.firstName} ${person.lastName}`
                      : person.email
                      } `}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const shop = person.shops.find(
                        item => item.shop.toString() === shopId.toString(),
                      )

                      if (shop) {
                        return shop.roles.join(', ')
                      }
                      return ''
                    })()}
                  </TableCell>
                  <TableCell align="center">
                    {accountType === 'company' && (
                      <>
                        <Button onClick={() => editStaff(person)}>
                          <EditIcon />
                        </Button>
                        <Button onClick={() => deleteStaff(person._id)}>
                          <DeleteIcon />
                        </Button>
                      </>
                    )}
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

StaffList.propTypes = {
  edit: PropTypes.func.isRequired,
  formState: PropTypes.string.isRequired,
  shopId: PropTypes.string.isRequired,
}
