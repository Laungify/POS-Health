/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  TextField,
  Button,
  Grid,
  Card,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableHead,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useForm, Controller } from 'react-hook-form'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import Alert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'
import { formatDate } from '../../utils/helpers'
import API from '../../utils/api'

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

function CreateMedication({
  setFormState,
  shopId,
  currentPatient,
  setMedications,
  medications,
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isDirty, isSubmitting, isValid },
    watch,
  } = useForm({
    defaultValues: {
      productName: '',
      genericName: '',
      category: null,
      dosage: '',
      route: '',
      frequency: '',
      duration: '',
      comment: '',
      regardsToMeal: '',
      reason: '',
      startDate: formatDate(new Date()),
      endDate: formatDate(new Date()),
      instructions: '',
      /* medicationStatus: false, */
    },
  })

  /* const medicationStatusValue = watch('medicationStatus') */

  const onSubmit = async data => {
    try {
      /*   setError('');
      setSuccess('');
      setLoading(true);
 */
      const patientId = currentPatient._id
      setMedications([...medications, data])

      /* await API.post(`shops/${shopId}/patients/${patientId}/medications`, {
        ...data,
      });
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setSuccess('Updated medical history');
      setLoading(false); */
      setFormState('list')
    } catch (err) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      setLoading(false)
      const { message } = err.response.data
      setError(message)
    }
  }

  const categories = [
    'Antimicrobials',
    'Diabetics',
    'OTC',
    'Herbal',
    'Hypertensives',
    'Asthma',
    'Oncology',
    'Others',
  ]

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card body="true" style={{ padding: '10px', margin: '10px' }}>
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
        <h3>New Medication</h3>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.genericName?.message}
              helperText={errors.genericName?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('genericName', {
                required: 'This field is required',
              })}
              label="Generic Name"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.productName?.message}
              helperText={errors.productName?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('productName', {
                required: 'This field is required',
              })}
              label="Product Name"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  select
                  variant="outlined"
                  fullWidth
                  label="Category"
                  MenuProps={{
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                  }}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.dosage?.message}
              helperText={errors.dosage?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('dosage', {
                required: 'This field is required',
              })}
              label="Dosage"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.route?.message}
              helperText={errors.route?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('route', {
                required: 'This field is required',
              })}
              label="Route"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.frequency?.message}
              helperText={errors.frequency?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('frequency', {
                required: 'This field is required',
              })}
              label="Frequency"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.duration?.message}
              helperText={errors.duration?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('duration', {
                required: 'This field is required',
              })}
              label="Duration in days"
              type="number"
              inputProps={{
                min: 0,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.startDate?.message}
              helperText={errors.startDate?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('startDate', {
                required: 'This field is required',
              })}
              label="Start Date"
              type="Date"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.endDate?.message}
              helperText={errors.endDate?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('endDate', {
                required: 'This field is required',
              })}
              label="End Date"
              type="Date"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.comment?.message}
              helperText={errors.comment?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('comment')}
              label="Comment"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.regardsToMeal?.message}
              helperText={errors.regardsToMeal?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('regardsToMeal')}
              label="Regards to Meal"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.reason?.message}
              helperText={errors.reason?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('reason')}
              label="Reason"
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.instructions?.message}
              helperText={errors.instructions?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('instructions')}
              label="Instructions"
              multiline
              rows={4}
            />
          </Grid>

          {/* <Grid item xs={12} md={6}>
            <p>Medication Status?</p>
            <FormControlLabel
              label={medicationStatusValue ? 'Continued' : 'Stopped'}
              control={
                <Checkbox
                  {...register('medicationStatus')}
                  checked={medicationStatusValue}
                />
              }
            />
          </Grid> */}
        </Grid>
      </Card>
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
          disabled={loading || !isDirty || isSubmitting || !isValid}
        >
          Add
        </Button>
      </Grid>
    </form>
  )
}

function EditMedication({
  setFormState,
  shopId,
  currentPatient,
  currentMedication,
  setMedications,
  medicationIndex,
  medications,
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting, isValid },
    watch,
  } = useForm({
    defaultValues: {
      productName: currentMedication?.productName || '',
      genericName: currentMedication?.genericName || '',
      category: currentMedication?.category || '',
      dosage: currentMedication?.dosage || '',
      route: currentMedication?.route || '',
      frequency: currentMedication?.frequency || '',
      duration: currentMedication?.duration || '',
      comment: currentMedication?.comment || '',
      regardsToMeal: currentMedication?.regardsToMeal || '',
      reason: currentMedication?.reason || '',
      startDate:
        formatDate(currentMedication?.startDate) || formatDate(new Date()),
      endDate: formatDate(currentMedication?.endDate) || formatDate(new Date()),
      instructions: currentMedication?.instructions || '',
      /* medicationStatus: currentMedication?.medicationStatus || false, */
    },
  })

  const medicationStatusValue = watch('medicationStatus')

  const onSubmit = async data => {
    try {
      /* setError('');
      setSuccess('');
      setLoading(true);

      const patientId = currentPatient._id;
      await API.patch(
        `shops/${shopId}/patients/${patientId}/medications/${currentMedication._id}`,
        {
          ...data,
        }
      );

      setSuccess('Updated medical history');
      setLoading(false);
      setFormState('list'); */

      const newMedications = [...medications]

      newMedications[medicationIndex] = data

      setMedications(newMedications)
      setFormState('list')
    } catch (err) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      setLoading(false)
      const { message } = err.response.data
      setError(message)
    }
  }

  const categories = [
    'Antimicrobials',
    'Diabetics',
    'OTC',
    'Herbal',
    'Hypertensives',
    'Asthma',
    'Oncology',
    'Others',
  ]

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card body="true" style={{ padding: '10px', margin: '10px' }}>
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
        <h3>Edit Medication</h3>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.genericName?.message}
              helperText={errors.genericName?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('genericName', {
                required: 'This field is required',
              })}
              label="Generic Name"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.productName?.message}
              helperText={errors.productName?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('productName', {
                required: 'This field is required',
              })}
              label="Product Name"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  select
                  variant="outlined"
                  fullWidth
                  label="Category"
                  MenuProps={{
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                  }}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.dosage?.message}
              helperText={errors.dosage?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('dosage', {
                required: 'This field is required',
              })}
              label="Dosage"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.route?.message}
              helperText={errors.route?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('route', {
                required: 'This field is required',
              })}
              label="Route"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.frequency?.message}
              helperText={errors.frequency?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('frequency', {
                required: 'This field is required',
              })}
              label="Frequency"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.duration?.message}
              helperText={errors.duration?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('duration', {
                required: 'This field is required',
              })}
              label="Duration in days"
              type="number"
              inputProps={{
                min: 0,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.startDate?.message}
              helperText={errors.startDate?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('startDate', {
                required: 'This field is required',
              })}
              label="Start Date"
              type="Date"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.endDate?.message}
              helperText={errors.endDate?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('endDate', {
                required: 'This field is required',
              })}
              label="End Date"
              type="Date"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.comment?.message}
              helperText={errors.comment?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('comment')}
              label="Comment"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.regardsToMeal?.message}
              helperText={errors.regardsToMeal?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('regardsToMeal')}
              label="Regards to Meal"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.reason?.message}
              helperText={errors.reason?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('reason')}
              label="Reason"
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              error={!!errors.instructions?.message}
              helperText={errors.instructions?.message || ''}
              style={{ width: '100%', resize: 'vertical' }}
              {...register('instructions')}
              label="Instructions"
              multiline
              rows={4}
            />
          </Grid>

          {/*     <Grid item xs={12} md={6}>
            <p>Medication Status?</p>
            <FormControlLabel
              label={medicationStatusValue ? 'Continued' : 'Stopped'}
              control={
                <Checkbox
                  {...register('medicationStatus')}
                  checked={medicationStatusValue}
                />
              }
            />
          </Grid> */}
        </Grid>
      </Card>
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
          disabled={loading || !isDirty || isSubmitting || !isValid}
        >
          Edit
        </Button>
      </Grid>
    </form>
  )
}

function MedicationsList({
  setFormState,
  formState,
  setCurrentMedication,
  shopId,
  currentPatient,
  medications,
  setMedicationIndex,
  setMedications,
}) {
  const classes = useStyles()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const patientId = currentPatient._id

  const editMedication = (medication, index) => {
    setFormState('edit')
    setCurrentMedication(medication)
    setMedicationIndex(index)
  }

  /* const fetchMedications = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const result = await API.get(
        `shops/${shopId}/patients/${patientId}/medications`
      );
      setMedications(result.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };
 */
  const deleteMedication = async index => {
    try {
      /*  setError('');
      setSuccess('');
      setLoading(true);

      await API.delete(
        `shops/${shopId}/patients/${patientId}/medications/${medicationId}`
      );
      setSuccess('Updated medical history');
      setLoading(false);
      setFormState('list');
       fetchMedications(); */
      const newMedications = [...medications]
      newMedications.splice(index, 1)
      setMedications(newMedications)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      setError(message)
    }
  }

  /*  useEffect(() => {
    fetchMedications();
  }, [formState]); */

  return (
    <TableContainer>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Medication</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {medications.length > 0 ? (
            medications.map((medication, index) => (
              <TableRow key={medication._id}>
                <TableCell>{medication.productName}</TableCell>
                <TableCell align="center">
                  <Button onClick={() => editMedication(medication, index)}>
                    <EditIcon />
                  </Button>
                  <Button onClick={() => deleteMedication(index)}>
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

export default function MedicationModule({
  shopId,
  currentPatient,
  medications,
  setMedications,
}) {
  const [formState, setFormState] = useState('list')
  const [currentMedication, setCurrentMedication] = useState({})

  const [medicationIndex, setMedicationIndex] = useState(null)

  return (
    <>
      {formState === 'list' && (
        <Card body="true" style={{ padding: '10px' }}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <h3>Medications</h3>
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
            <MedicationsList
              setFormState={setFormState}
              formState={formState}
              setCurrentMedication={setCurrentMedication}
              shopId={shopId}
              currentPatient={currentPatient}
              medications={medications}
              setMedicationIndex={setMedicationIndex}
              setMedications={setMedications}
            />
          </Grid>
        </Card>
      )}
      {formState === 'create' && (
        <CreateMedication
          setFormState={setFormState}
          shopId={shopId}
          currentPatient={currentPatient}
          medications={medications}
          setMedications={setMedications}
        />
      )}
      {formState === 'edit' && (
        <EditMedication
          setFormState={setFormState}
          shopId={shopId}
          currentPatient={currentPatient}
          currentMedication={currentMedication}
          medications={medications}
          medicationIndex={medicationIndex}
          setMedications={setMedications}
        />
      )}
    </>
  )
}

MedicationModule.propTypes = {
  shopId: PropTypes.string.isRequired,
  currentPatient: PropTypes.object.isRequired,
  medications: PropTypes.array.isRequired,
  setMedications: PropTypes.func.isRequired,
}

CreateMedication.propTypes = {
  currentPatient: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
  medications: PropTypes.array.isRequired,
  setMedications: PropTypes.func.isRequired,
}
EditMedication.propTypes = {
  currentPatient: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
  currentMedication: PropTypes.object.isRequired,
  medications: PropTypes.array.isRequired,
  medicationIndex: PropTypes.number.isRequired,
  setMedications: PropTypes.func.isRequired,
}

MedicationsList.propTypes = {
  formState: PropTypes.string.isRequired,
  currentPatient: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
  setCurrentMedication: PropTypes.func.isRequired,
  medications: PropTypes.array.isRequired,
  setMedicationIndex: PropTypes.func.isRequired,
  setMedications: PropTypes.func.isRequired,
}
