/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  TextField,
  Button,
  Grid,
  Card,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableHead,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
} from '@material-ui/core'
import { useForm, useFieldArray } from 'react-hook-form'
import CloseIcon from '@material-ui/icons/Close'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import { makeStyles } from '@material-ui/core/styles'
import { formatDate } from '../../utils/helpers'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useSnackbarState from '../../stores/snackbar'
import { currentPatientContext } from '../../context/currentPatientContext'
import useCurrentShopState from '../../stores/currentShop'

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

function CreateEncounter({ setFormState }) {
  const { currentPatient } = useContext(currentPatientContext)
  const { open } = useSnackbarState()
  const { getUserId } = useAuthState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: {
      treatmentAbout: '',
      adverseReaction: '',
      date: formatDate(new Date()),
      chiefComplaint: '',
      interventions: '',
      diagnosis: '',
      medicationsGiven: [],
      testsPerformed: [],
      facilitiesVisited: [],
      testsPrescribed: '',
    },
  })

  const {
    fields: medicationsGiven,
    append: appendMedicationGiven,
    remove: removeMedicationGiven,
  } = useFieldArray({
    control,
    name: 'medicationsGiven',
  })

  const {
    fields: testsPerformed,
    append: appendTestPerformed,
    remove: removeTestPerformed,
  } = useFieldArray({
    control,
    name: 'testsPerformed',
  })

  const {
    fields: facilitiesVisited,
    append: appendFacilitiesVisited,
    remove: removeFacilitiesVisited,
  } = useFieldArray({
    control,
    name: 'facilitiesVisited',
  })

  const [medicationEffective, setMedicationEffective] = useState(null)

  const [prevMedicalRecordsAvailable, setPrevMedicalRecordsAvailable] =
    useState(null)

  const onSubmit = async data => {
    try {
      setLoading(true)

      const patientId = currentPatient._id

      const newMedicalHistory = {
        shopId,
        staffId: getUserId(),
        encounter: {
          ...data,
          medicationEffective,
          prevMedicalRecordsAvailable,
          medicationsGiven: data.medicationsGiven.map(item => item.value),
          testsPerformed: data.testsPerformed.map(item => item.value),
          facilitiesVisited: data.facilitiesVisited.map(item => item.value),
        },
      }

      await API.post(`shops/${shopId}/patients/${patientId}/medical_history`, {
        ...newMedicalHistory,
      })
      open('success', 'success')
      setLoading(false)
      setFormState('list')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item sm={12}>
          <Card style={{ padding: '10px', margin: '10px' }}>
            <Grid item sm={12}>
              <Grid item>
                <h3>Antimicrobial Use</h3>
              </Grid>
              <Grid item>
                <p>Encounter date?</p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  type="date"
                  variant="outlined"
                  error={!!errors.date?.message}
                  helperText={errors.date?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('date', {
                    required: 'This field is required',
                  })}
                />
              </Grid>
              <Grid item>
                <p>What was the treatment about?</p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  variant="outlined"
                  error={!!errors.treatmentAbout?.message}
                  helperText={errors.treatmentAbout?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('treatmentAbout', {
                    required: 'This field is required',
                  })}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
            <Grid item sm={12}>
              <p>What medications were given?</p>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => appendMedicationGiven('')}
              >
                New
              </Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <List>
                {medicationsGiven.map((field, index) => (
                  <ListItem key={field.id}>
                    <ListItemText>
                      <TextField
                        error={!!errors.medicationsGiven?.[index]?.message}
                        helperText={
                          errors.medicationsGiven?.[index]?.message || ''
                        }
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`medicationsGiven.${index}.value`, {
                          required: 'This field is required',
                        })}
                        multiline
                      />
                    </ListItemText>
                    <IconButton onClick={() => removeMedicationGiven(index)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item sm={12} md={6}>
              <p>Was the medication effective?</p>
              <FormControl>
                <RadioGroup
                  onChange={e => setMedicationEffective(e.target.value)}
                  value={medicationEffective}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="yes"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="no"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <Grid item sm={12}>
                <p>
                  Was there any adverse drug reaction by use of any
                  antimicrobial?
                </p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  variant="outlined"
                  error={!!errors.adverseReaction?.message}
                  helperText={errors.adverseReaction?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('adverseReaction', {
                    required: 'This field is required',
                  })}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item sm={12}>
          <Card style={{ padding: '10px', margin: '10px' }}>
            <Grid item>
              <h3>Current medical status</h3>
            </Grid>
            <Grid item sm={12}>
              <p>What is the patient ailing from/patient chief complaint?</p>
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                variant="outlined"
                error={!!errors.chiefComplaint?.message}
                helperText={errors.chiefComplaint?.message || ''}
                style={{ width: '100%', resize: 'vertical' }}
                {...register('chiefComplaint', {
                  required: 'This field is required',
                })}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item sm={12}>
              <p>What tests have been performed to confirm diagnosis?</p>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => appendTestPerformed('')}
              >
                New
              </Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <List>
                {testsPerformed.map((field, index) => (
                  <ListItem key={field.id}>
                    <ListItemText>
                      <TextField
                        error={!!errors.testsPerformed?.[index]?.message}
                        helperText={
                          errors.testsPerformed?.[index]?.message || ''
                        }
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`testsPerformed.${index}.value`, {
                          required: 'This field is required',
                        })}
                        multiline
                      />
                    </ListItemText>
                    <IconButton onClick={() => removeTestPerformed(index)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item sm={12} md={6}>
              <p>Any previous medical records available?</p>
              <FormControl>
                <RadioGroup
                  onChange={e => setPrevMedicalRecordsAvailable(e.target.value)}
                  value={prevMedicalRecordsAvailable}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="yes"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="no"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <p>Previous facilities visited?</p>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => appendFacilitiesVisited('')}
              >
                New
              </Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <List>
                {facilitiesVisited.map((field, index) => (
                  <ListItem key={field.id}>
                    <ListItemText>
                      <TextField
                        error={!!errors.facilitiesVisited?.[index]?.message}
                        helperText={
                          errors.facilitiesVisited?.[index]?.message || ''
                        }
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`facilitiesVisited.${index}.value`, {
                          required: 'This field is required',
                        })}
                        multiline
                      />
                    </ListItemText>
                    <IconButton onClick={() => removeFacilitiesVisited(index)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item sm={12}>
              <p>What interventions have been presented thus far?</p>
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                variant="outlined"
                error={!!errors.interventions?.message}
                helperText={errors.interventions?.message || ''}
                style={{ width: '100%', resize: 'vertical' }}
                {...register('interventions', {
                  required: 'This field is required',
                })}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item sm={12}>
              <p>
                What is the current diagnosis established from this point
                forward?
              </p>
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                variant="outlined"
                error={!!errors.diagnosis?.message}
                helperText={errors.diagnosis?.message || ''}
                style={{ width: '100%', resize: 'vertical' }}
                {...register('diagnosis', {
                  required: 'This field is required',
                })}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item sm={12}>
              <Grid item sm={12}>
                <p>The tests prescribed for confirmation of diagnosis?</p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  variant="outlined"
                  error={!!errors.testsPrescribed?.message}
                  helperText={errors.testsPrescribed?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('testsPrescribed')}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end">
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            setFormState('list')
          }}
        >
          Cancel
        </Button>

        <Button
          style={{ marginLeft: '10px' }}
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          disabled={loading || isSubmitting || !isValid}
        >
          Submit
        </Button>
      </Grid>
    </form>
  )
}

function EditEncounter({ setFormState, currentEncounter: edits }) {
  const { currentPatient } = useContext(currentPatientContext)
  const { getUserId } = useAuthState()
  const { open } = useSnackbarState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [loading, setLoading] = useState(false)

  const [medicationEffective, setMedicationEffective] = useState(
    'medicationEffective' in edits.encounter
      ? edits.encounter.medicationEffective.toString()
      : null,
  )

  const [prevMedicalRecordsAvailable, setPrevMedicalRecordsAvailable] =
    useState(
      'prevMedicalRecordsAvailable' in edits.encounter
        ? edits.encounter.prevMedicalRecordsAvailable.toString()
        : null,
    )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
  } = useForm({
    defaultValues: {
      treatmentAbout: edits?.encounter?.treatmentAbout || '',
      medicationsGiven:
        edits?.encounter?.medicationsGiven.map(item => ({ value: item })) || [],
      adverseReaction: edits?.encounter?.adverseReaction || '',
      date: edits?.encounter?.date
        ? formatDate(new Date(edits.encounter.date))
        : formatDate(new Date()),
      chiefComplaint: edits?.encounter?.chiefComplaint || '',
      interventions: edits?.encounter?.interventions || '',
      diagnosis: edits?.encounter?.diagnosis || '',
      testsPrescribed: edits?.encounter?.testsPrescribed || '',
      testsPerformed:
        edits?.encounter?.testsPerformed.map(item => ({ value: item })) || [],
      facilitiesVisited:
        edits?.encounter?.facilitiesVisited.map(item => ({
          value: item,
        })) || [],
    },
  })

  const {
    fields: medicationsGiven,
    append: appendMedicationGiven,
    remove: removeMedicationGiven,
  } = useFieldArray({
    control,
    name: 'medicationsGiven',
  })

  const {
    fields: testsPerformed,
    append: appendTestPerformed,
    remove: removeTestPerformed,
  } = useFieldArray({
    control,
    name: 'testsPerformed',
  })

  const {
    fields: facilitiesVisited,
    append: appendFacilitiesVisited,
    remove: removeFacilitiesVisited,
  } = useFieldArray({
    control,
    name: 'facilitiesVisited',
  })

  const onSubmit = async data => {
    try {
      setLoading(true)

      const patientId = currentPatient._id

      const updates = {
        /* staffId: getUserId(), */
        encounter: {
          ...data,
          medicationEffective,
          prevMedicalRecordsAvailable,
          medicationsGiven: data.medicationsGiven.map(item => item.value),
          testsPerformed: data.testsPerformed.map(item => item.value),
          facilitiesVisited: data.facilitiesVisited.map(item => item.value),
        },
      }

      await API.patch(
        `shops/${shopId}/patients/${patientId}/medical_history/${edits._id}`,
        {
          ...updates,
        },
      )
      open('success', 'updated')
      setLoading(false)
      setFormState('list')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item sm={12}>
          <Card style={{ padding: '10px', margin: '10px' }}>
            <Grid item sm={12}>
              <Grid item>
                <h3>Antimicrobial Use</h3>
              </Grid>
              <Grid item>
                <p>Encounter date?</p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  type="date"
                  variant="outlined"
                  error={!!errors.date?.message}
                  helperText={errors.date?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('date', {
                    required: 'This field is required',
                  })}
                />
              </Grid>
              <Grid item>
                <p>What was the treatment about?</p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  variant="outlined"
                  error={!!errors.treatmentAbout?.message}
                  helperText={errors.treatmentAbout?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('treatmentAbout', {
                    required: 'This field is required',
                  })}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
            <Grid item sm={12}>
              <p>What medications were given?</p>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => appendMedicationGiven('')}
              >
                New
              </Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <List>
                {medicationsGiven.map((field, index) => (
                  <ListItem key={field.id}>
                    <ListItemText>
                      <TextField
                        error={!!errors.medicationsGiven?.[index]?.message}
                        helperText={
                          errors.medicationsGiven?.[index]?.message || ''
                        }
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`medicationsGiven.${index}.value`, {
                          required: 'This field is required',
                        })}
                        multiline
                      />
                    </ListItemText>
                    <IconButton onClick={() => removeMedicationGiven(index)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item sm={12} md={6}>
              <p>Was the medication effective?</p>
              <FormControl>
                <RadioGroup
                  onChange={e => setMedicationEffective(e.target.value)}
                  value={medicationEffective}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="yes"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="no"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <Grid item sm={12}>
                <p>
                  Was there any adverse drug reaction by use of any
                  antimicrobial?
                </p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  variant="outlined"
                  error={!!errors.adverseReaction?.message}
                  helperText={errors.adverseReaction?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('adverseReaction', {
                    required: 'This field is required',
                  })}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item sm={12}>
          <Card body="true" style={{ padding: '10px', margin: '10px' }}>
            <Grid item>
              <h3>Current medical status</h3>
            </Grid>
            <Grid item sm={12}>
              <p>What is the patient ailing from/patient chief complaint?</p>
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                variant="outlined"
                error={!!errors.chiefComplaint?.message}
                helperText={errors.chiefComplaint?.message || ''}
                style={{ width: '100%', resize: 'vertical' }}
                {...register('chiefComplaint', {
                  required: 'This field is required',
                })}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item sm={12}>
              <p>What tests have been performed to confirm diagnosis?</p>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => appendTestPerformed('')}
              >
                New
              </Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <List>
                {testsPerformed.map((field, index) => (
                  <ListItem key={field.id}>
                    <ListItemText>
                      <TextField
                        error={!!errors.testsPerformed?.[index]?.message}
                        helperText={
                          errors.testsPerformed?.[index]?.message || ''
                        }
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`testsPerformed.${index}.value`, {
                          required: 'This field is required',
                        })}
                        multiline
                      />
                    </ListItemText>
                    <IconButton onClick={() => removeTestPerformed(index)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item sm={12} md={6}>
              <p>Any previous medical records available?</p>
              <FormControl>
                <RadioGroup
                  onChange={e => setPrevMedicalRecordsAvailable(e.target.value)}
                  value={prevMedicalRecordsAvailable}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="yes"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="no"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <p>Previous facilities visited?</p>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => appendFacilitiesVisited('')}
              >
                New
              </Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <List>
                {facilitiesVisited.map((field, index) => (
                  <ListItem key={field.id}>
                    <ListItemText>
                      <TextField
                        error={!!errors.facilitiesVisited?.[index]?.message}
                        helperText={
                          errors.facilitiesVisited?.[index]?.message || ''
                        }
                        style={{ width: '100%', resize: 'vertical' }}
                        {...register(`facilitiesVisited.${index}.value`, {
                          required: 'This field is required',
                        })}
                        multiline
                      />
                    </ListItemText>
                    <IconButton onClick={() => removeFacilitiesVisited(index)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item sm={12}>
              <p>What interventions have been presented thus far?</p>
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                variant="outlined"
                error={!!errors.interventions?.message}
                helperText={errors.interventions?.message || ''}
                style={{ width: '100%', resize: 'vertical' }}
                {...register('interventions', {
                  required: 'This field is required',
                })}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item sm={12}>
              <p>
                What is the current diagnosis established from this point
                forward?
              </p>
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                variant="outlined"
                error={!!errors.diagnosis?.message}
                helperText={errors.diagnosis?.message || ''}
                style={{ width: '100%', resize: 'vertical' }}
                {...register('diagnosis', {
                  required: 'This field is required',
                })}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item sm={12}>
              <Grid item sm={12}>
                <p>The tests prescribed for confirmation of diagnosis?</p>
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  variant="outlined"
                  error={!!errors.testsPrescribed?.message}
                  helperText={errors.testsPrescribed?.message || ''}
                  style={{ width: '100%', resize: 'vertical' }}
                  {...register('testsPrescribed')}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end">
        <Button
          variant="contained"
          disableElevation
          onClick={() => {
            setFormState('list')
          }}
        >
          Cancel
        </Button>

        <Button
          style={{ marginLeft: '10px' }}
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          disabled={loading}
        >
          Update
        </Button>
      </Grid>
    </form>
  )
}

function EncountersList({ setFormState, setCurrentEncounter }) {
  const { currentPatient } = useContext(currentPatientContext)
  const classes = useStyles()
  const { open } = useSnackbarState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [loading, setLoading] = useState(false)

  const patientId = currentPatient._id

  const editEncounter = encounter => {
    setFormState('edit')
    setCurrentEncounter(encounter)
  }

  const [medicalHistory, setMedicalHistory] = useState([])

  async function fetchMedicalHistory() {
    try {
      setLoading(true)
      const result = await API.get(
        `shops/${shopId}/patients/${patientId}/medical_history`,
      )

      const medicalHistoryData = result.data.data

      setMedicalHistory(medicalHistoryData)
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      open('error', message)
      setLoading(false)
    }
  }

  const deleteEncounter = async medicalHistoryId => {
    try {
      setLoading(true)

      await API.delete(
        `shops/${shopId}/patients/${patientId}/medical_History/${medicalHistoryId}`,
      )

      open('success', 'deleted')
      setLoading(false)
      setFormState('list')
      fetchMedicalHistory()
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  useEffect(() => {
    fetchMedicalHistory()
  }, [])

  return (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Encounter Id</TableCell>
            <TableCell>Reviewer</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {medicalHistory.length > 0 ? (
            medicalHistory.map(item => (
              <TableRow key={item._id}>
                <TableCell>
                  {formatDate(new Date(item.encounter.date))}
                </TableCell>
                <TableCell>{item._id}</TableCell>
                <TableCell>{item?.reviewer?.fullName}</TableCell>
                <TableCell align="center">
                  <Button onClick={() => editEncounter(item)}>
                    <EditIcon />
                  </Button>
                  <Button onClick={() => deleteEncounter(item._id)}>
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
    </TableContainer>
  )
}

export default function EncounterModule({ setCurrentTab }) {
  const [formState, setFormState] = useState('list')
  const [currentEncounter, setCurrentEncounter] = useState({})

  return (
    <>
      {formState === 'list' && (
        <>
          <Card style={{ padding: '20px', marginTop: '20px' }}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <h3>Past Encounters</h3>
              </Grid>
              <Grid item>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  disableElevation
                  onClick={() => setFormState('create')}
                >
                  New
                </Button>
              </Grid>

              <EncountersList
                setFormState={setFormState}
                setCurrentEncounter={setCurrentEncounter}
              />
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
                onClick={() => {
                  setCurrentTab(0)
                }}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </>
      )}
      {formState === 'create' && (
        <CreateEncounter setFormState={setFormState} />
      )}
      {formState === 'edit' && (
        <EditEncounter
          setFormState={setFormState}
          currentEncounter={currentEncounter}
        />
      )}
    </>
  )
}

EncounterModule.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
}

CreateEncounter.propTypes = {
  setFormState: PropTypes.func.isRequired,
}
EditEncounter.propTypes = {
  setFormState: PropTypes.func.isRequired,
  currentEncounter: PropTypes.object.isRequired,
}

EncountersList.propTypes = {
  setFormState: PropTypes.func.isRequired,
  setCurrentEncounter: PropTypes.func.isRequired,
}
