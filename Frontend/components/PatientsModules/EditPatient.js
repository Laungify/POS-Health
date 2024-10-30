/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import {
  TextField,
  Button,
  Grid,
  Card,
  List,
  ListItem,
  IconButton,
} from '@material-ui/core'
import React, { useState, useEffect, useContext } from 'react'
import { format } from 'date-fns'
import CloseIcon from '@material-ui/icons/Close'
import PropTypes from 'prop-types'
import Autocomplete from '@material-ui/lab/Autocomplete'
import API from '../../utils/api'
import kenyanCounties from '../../utils/counties'
import useSnackbarState from '../../stores/snackbar'
import { currentPatientContext } from '../../context/currentPatientContext'
import useCurrentShopState from '../../stores/currentShop'

function Details() {
  const { open } = useSnackbarState()
  const { currentPatient: patient, setCurrentPatient } = useContext(
    currentPatientContext,
  )

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [patientId] = useState(patient._id)
  const [firstName, setFirstName] = useState(patient?.firstName || '')
  const [lastName, setLastName] = useState(patient?.lastName || '')
  const [email, setEmail] = useState(patient?.email || '')
  const [phoneNumber, setPhoneNumber] = useState(patient?.phoneNumber || '')
  const [gender, setGender] = useState(patient?.gender || null)
  const [dob, setDob] = useState(
    patient?.dob ? format(new Date(patient?.dob), 'yyyy-MM-dd') : '',
  )
  const [county, setCounty] = useState(patient?.physicalAddress?.county || null)
  const [street, setStreet] = useState(patient?.physicalAddress?.street || '')
  const [bloodGroup, setBloodGroup] = useState(patient?.bloodGroup || null)

  const [occupation, setOccupation] = useState({
    current: patient?.occupation?.current || '',
    previous: patient?.occupation?.previous || '',
  })

  const [loading, setLoading] = useState(false)

  const genders = ['male', 'female']

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const [isSaved, setIsSaved] = useState(true)

  useEffect(() => {
    if (
      firstName !== patient.firstName ||
      lastName !== patient.lastName ||
      email !== patient.email ||
      phoneNumber !== patient.phoneNumber ||
      gender !== patient.gender ||
      dob !== format(new Date(patient.dob), 'yyyy-MM-dd') ||
      county !== patient.physicalAddress.county ||
      street !== patient.physicalAddress.street ||
      occupation !== patient.occupation ||
      bloodGroup !== patient.bloodGroup
    ) {
      setIsSaved(false)
    } else {
      setIsSaved(true)
    }
  }, [
    firstName,
    lastName,
    email,
    phoneNumber,
    gender,
    dob,
    county,
    street,
    bloodGroup,
    occupation,
  ])

  const update = async () => {
    try {
      if (!firstName || !lastName || !email || !phoneNumber) {
        open('error', 'Missing required fields')
      } else {
        setLoading(true)

        const updates = {
          ...patient,
          firstName,
          lastName,
          email,
          phoneNumber,
          gender,
          dob,
          bloodGroup,
          physicalAddress: {
            county,
            street,
          },
          occupation,
        }
        const result = await API.patch(
          `shops/${shopId}/patients/${patientId}`,
          {
            ...updates,
          },
        )
        open('success', 'Updated')
        setCurrentPatient(result.data)
        setIsSaved(true)
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <Card style={{ padding: '20px', marginTop: '20px' }}>
      <form>
        <h3>Details</h3>
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
              required
              fullWidth
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              label="Phone number"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              disableClearable
              value={gender}
              options={genders}
              onChange={(event, newValue) => setGender(newValue)}
              renderInput={params => (
                <TextField {...params} label="Gender" variant="outlined" />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              label="DOB"
              value={dob}
              onChange={e => setDob(e.target.value)}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sm={6}>
            <h4>Physical Address</h4>
            <Autocomplete
              disableClearable
              value={county}
              options={kenyanCounties}
              onChange={(event, newValue) => setCounty(newValue)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="County"
                  variant="outlined"
                  margin="normal"
                />
              )}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Street"
              value={street}
              onChange={e => setStreet(e.target.value)}
            />
          </Grid>
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

        {/* <Grid container spacing={2}>
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
            <Autocomplete
              disableClearable
              value={county}
              options={kenyanCounties}
              onChange={(event, newValue) => setCounty(newValue)}
              renderInput={params => (
                <TextField {...params} label="County" variant="outlined" />
              )}
            />
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              label="Street"
              value={street}
              onChange={e => setStreet(e.target.value)}
            />
          </Grid>
        </Grid> */}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <h4>Blood Group</h4>
            <Autocomplete
              disableClearable
              value={bloodGroup}
              options={bloodGroups}
              onChange={(event, newValue) => setBloodGroup(newValue)}
              renderInput={params => (
                <TextField {...params} label="Blood Group" variant="outlined" />
              )}
            />
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent="flex-end"
          spacing={2}
          style={{ marginTop: '10px' }}
        >
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => update()}
              disabled={loading || isSaved}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

function NextOfKin() {
  const { open } = useSnackbarState()
  const { currentPatient: patient, setCurrentPatient } = useContext(
    currentPatientContext,
  )

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const nextOfKin = patient?.nextOfKin || {}

  const [patientId] = useState(patient._id)
  const [firstName, setFirstName] = useState(nextOfKin?.firstName || '')
  const [lastName, setLastName] = useState(nextOfKin?.lastName || '')
  const [email, setEmail] = useState(nextOfKin?.email || '')
  const [phoneNumber, setPhoneNumber] = useState(nextOfKin?.phoneNumber || '')
  const [county, setCounty] = useState(
    nextOfKin?.physicalAddress?.county || null,
  )
  const [relationship, setRelationship] = useState(
    nextOfKin?.relationship || '',
  )

  const [loading, setLoading] = useState(false)

  const [isSaved, setIsSaved] = useState(true)

  useEffect(() => {
    if (
      firstName !== nextOfKin.firstName ||
      lastName !== nextOfKin.lastName ||
      email !== nextOfKin.email ||
      phoneNumber !== nextOfKin.phoneNumber ||
      relationship !== nextOfKin.relationship ||
      county !== nextOfKin.physicalAddress.county
    ) {
      setIsSaved(false)
    } else {
      setIsSaved(true)
    }
  }, [firstName, lastName, email, phoneNumber, relationship, county])

  const update = async () => {
    try {
      if (!firstName || !lastName || !email || !phoneNumber) {
        open('error', 'Missing required fields')
      } else {
        setLoading(true)

        const updates = {
          ...patient,
          nextOfKin: {
            firstName,
            lastName,
            email,
            phoneNumber,
            relationship,
            physicalAddress: {
              county,
            },
          },
        }
        const result = await API.patch(
          `shops/${shopId}/patients/${patientId}`,
          {
            ...updates,
          },
        )

        open('success', 'Updated')
        setCurrentPatient(result.data)
        setIsSaved(true)
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <Card style={{ padding: '20px', marginTop: '20px' }}>
      <form>
        <h3>Next of Kin</h3>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
              required
              fullWidth
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              variant="outlined"
              margin="normal"
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
              label="Relationship"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <h4>Physical Address</h4>
            <Autocomplete
              disableClearable
              value={county}
              options={kenyanCounties}
              onChange={(event, newValue) => setCounty(newValue)}
              renderInput={params => (
                <TextField {...params} label="County" variant="outlined" />
              )}
            />
          </Grid>
        </Grid>

        <Grid
          container
          justifyContent="flex-end"
          spacing={2}
          style={{ marginTop: '10px' }}
        >
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => update()}
              disabled={loading || isSaved}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

function Allergies() {
  const { open } = useSnackbarState()
  const { currentPatient: patient, setCurrentPatient } = useContext(
    currentPatientContext,
  )

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [allergies, setAllergies] = useState(patient?.allergies || [])

  const [loading, setLoading] = useState(false)
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

  const [isSaved, setIsSaved] = useState(true)

  useEffect(() => {
    if (allergies !== patient.allergies) {
      setIsSaved(false)
    } else {
      setIsSaved(true)
    }
  }, [allergies])

  const update = async () => {
    try {
      setLoading(true)
      const updates = {
        ...patient,
        allergies,
      }
      const result = await API.patch(
        `shops/${shopId}/patients/${patient._id}`,
        {
          ...updates,
        },
      )
      setLoading(false)
      open('success', 'Updated allergies')
      setCurrentPatient(result.data)
      setIsSaved(true)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }
  return (
    <Card body="true" style={{ padding: '20px', marginTop: '20px' }}>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <h3>Allergies</h3>
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
                  disabled={!newAllergy || allergies.includes(newAllergy)}
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

        <Grid
          container
          justifyContent="flex-end"
          spacing={2}
          style={{ marginTop: '10px' }}
        >
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => update()}
              disabled={loading || isSaved}
            >
              Update
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}
export default function EditPatient({
  setFormState,
  currentTab,
  setCurrentTab,
}) {
  const { setCurrentPatient } = useContext(currentPatientContext)

  return (
    <div>
      {currentTab === 0 && (
        <>
          <Details />
          <Allergies />
          <NextOfKin />
        </>
      )}
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
            onClick={() => {
              setFormState('list')
              setCurrentTab(0)
              setCurrentPatient({})
            }}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

EditPatient.propTypes = {
  setFormState: PropTypes.func.isRequired,
  currentTab: PropTypes.number.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
}
