import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import API from '../../utils/api'

export default function CreateStaff({ shopId, setFormState }) {
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roles, setRoles] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const createStaff = async () => {
    const data = {
      shopId,
      email,
      phoneNumber,
      firstName,
      lastName,
      roles,
    }

    //console.log("data", data)
    if (!email || !phoneNumber || !firstName || !lastName || !roles) {
      setError('All fields are required')
    } else {
      try {
        setLoading(true)
        await API.post(`staff`, {
          ...data,
        })
        setLoading(false)
        setFormState('list')
      } catch (err) {
        setLoading(false)
        const { message } = err.response.data
        setError(message)
      }
    }
  }

  const roleOptions = ['admin', 'pharmacy', 'billing', 'doctor']

  const handleChangeRoles = e => {
    setRoles(e.target.value)
  }

  return (
    <div>
      <h3>New Staff</h3>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <Card style={{ padding: '10px' }}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Role"
                select
                SelectProps={{
                  multiple: true, // Enable multi-select
                  value: roles,
                  onChange: handleChangeRoles,
                  renderValue: selected => selected.join(', '), // Display selected values
                }}
              >
                {roleOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </form>
      </Card>
      <Grid
        container
        justifyContent="flex-end"
        spacing={2}
        style={{ marginTop: '10px' }}
      >
        <Grid item>
          <Button
            m="2"
            variant="contained"
            disableElevation
            onClick={() => setFormState('list')}
            disabled={loading}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => createStaff()}
            disabled={loading}
          >
            Add
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

CreateStaff.propTypes = {
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
}
