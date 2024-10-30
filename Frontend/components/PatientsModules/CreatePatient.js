/* eslint-disable no-underscore-dangle */
import {
  TextField,
  Button,
  Grid,
  Card,
  MenuItem,
  ListItem,
  List,
  IconButton,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import kenyanCounties from '../../utils/counties'
import useCurrentShopState from '../../stores/currentShop'
import useSnackbarState from '../../stores/snackbar'
export default function CreatePatient({ setFormState }) {
  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const { open } = useSnackbarState()

  const [loading, setLoading] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState('')
  const [dob, setDob] = useState('')
  const [allergies, setAllergies] = useState([])
  const [bloodGroup, setBloodGroup] = useState('')
  const [county, setCounty] = useState('')
  const [street, setStreet] = useState('')
  const [occupation, setOccupation] = useState({ current: '', previous: '' })

  // Next of Kin
  const [nextOfKinFirstName, setNextOfKinFirstName] = useState('')
  const [nextOfKinLastName, setNextOfKinLastName] = useState('')
  const [nextOfKinPhoneNumber, setNextOfKinPhoneNumber] = useState('')
  const [nextOfKinEmail, setNextOfKinEmail] = useState('')
  const [nextOfKinCounty, setNextOfKinCounty] = useState('')
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState('')

  const genders = ['male', 'female']
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const [newAllergy, setNewAllergy] = useState('')

  const addAllergy = () => {
    const items = [...allergies]
    items.push(newAllergy)

    setAllergies(items)
    setNewAllergy('')
  }

  const removeAllergy = index => {
    const items = [...allergies]
    items.splice(index, 1)
    setAllergies(items)
  }

  const createPatient = async () => {
    const data = {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      dob,
      allergies,
      bloodGroup,
      physicalAddress: {
        county,
        street,
      },
      occupation,
      nextOfKin: {
        firstName: nextOfKinFirstName,
        lastName: nextOfKinLastName,
        email: nextOfKinEmail,
        phoneNumber: nextOfKinPhoneNumber,
        relationShip: nextOfKinRelationship,
        physicalAddress: {
          county: nextOfKinCounty,
        },
      },
    }
    if (!firstName || !lastName || !email || !phoneNumber) {
      open('error', 'Missing required fields')
    } else {
      try {
        setLoading(true)
        await API.post(`shops/${shopId}/patients`, {
          ...data,
        })
        setLoading(false)
        setFormState('list')
        open('success', 'patient added')
      } catch (err) {
        setLoading(false)
        const { message } = err.response.data
        open('error', message)
      }
    }
  }

  return (
    <div>
      <h3>Create Patient</h3>
      <h3>Details</h3>
      <form onSubmit={createPatient}>
        <Card style={{ padding: '10px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="First name"
                autoFocus
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                label="Phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Gender"
                value={gender}
                onChange={e => setGender(e.target.value)}
                select
              >
                {genders.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="DOB"
                value={dob}
                onChange={e => setDob(e.target.value)}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Occupation</h4>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Current"
                value={occupation.current}
                onChange={e =>
                  setOccupation({ ...occupation, current: e.target.value })
                }
              />
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Previous"
                value={occupation.previous}
                onChange={e =>
                  setOccupation({ ...occupation, previous: e.target.value })
                }
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Physical Address</h4>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="County"
                value={county}
                onChange={e => setCounty(e.target.value)}
                select
              >
                {kenyanCounties.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Street"
                value={street}
                onChange={e => setStreet(e.target.value)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Blood Group</h4>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Blood Group"
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                select
              >
                {bloodGroups.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Allergies</h4>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item sm={6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={newAllergy}
                    placeholder="new allergy"
                    onChange={e => setNewAllergy(e.target.value)}
                  />
                </Grid>
                <Grid item sm={6}>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={() => addAllergy()}
                    disabled={!newAllergy}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
              <List>
                {allergies.map((allergy, index) => (
                  <Grid key={allergy} container justifyContent="space-between">
                    <Grid item>
                      <ListItem>{allergy}</ListItem>
                    </Grid>
                    <Grid item>
                      <IconButton onClick={() => removeAllergy(index)}>
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </List>
            </Grid>
          </Grid>
          <h3>Next of Kin</h3>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="First name"
                value={nextOfKinFirstName}
                onChange={e => setNextOfKinFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Last name"
                value={nextOfKinLastName}
                onChange={e => setNextOfKinLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Email"
                value={nextOfKinEmail}
                onChange={e => setNextOfKinEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Phone number"
                value={nextOfKinPhoneNumber}
                onChange={e => setNextOfKinPhoneNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Relationship"
                value={nextOfKinRelationship}
                onChange={e => setNextOfKinRelationship(e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Physical Address</h4>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="County"
                value={nextOfKinCounty}
                onChange={e => setNextOfKinCounty(e.target.value)}
                select
              >
                {kenyanCounties.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
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
              onClick={() => createPatient()}
              disabled={loading}
            >
              Create
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

CreatePatient.propTypes = {
  setFormState: PropTypes.func.isRequired,
}
