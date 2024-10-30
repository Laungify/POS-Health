/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */ import Alert from '@material-ui/lab/Alert'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  TextField,
  Button,
  Grid,
  Card,
  List,
  ListItem,
  IconButton,
  ListItemText,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  MenuItem,
} from '@material-ui/core'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import AddCircleIcon from '@material-ui/icons/AddCircleOutline'
import { makeStyles } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import useAuthState from '../../stores/auth'
import API from '../../utils/api'
import kenyanCounties from '../../utils/counties'
import useSnackbarState from '../../stores/snackbar'
import { formatDate } from '../../utils/helpers'

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const roleOptions = ['admin', 'pharmacy', 'billing', 'doctor']

function hasRole(roles, targetRole) {
  if (roles) {
    return roles.includes(targetRole)
  }
  return false
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
  },
  accordion: {
    marginBottom: theme.spacing(1),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}))

function ListAvailability({ setFormState, edit, staffId }) {
  const { open } = useSnackbarState()

  const [loading, setLoading] = useState(false)

  const [availability, setAvailability] = useState([])

  const fetchAvailability = async () => {
    try {
      setLoading(true)

      const result = await API.get(`staff/${staffId}/availability`)

      setAvailability(result.data)
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      open('error', message)
      setLoading(false)
    }
  }

  const deleteAvailability = async id => {
    try {
      setLoading(true)
      await API.delete(`staff/${staffId}/availability/${id}`)

      fetchAvailability()

      open('success', 'deleted availability')
    } catch (err) {
      const { message } = err.response.data
      open('error', message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  return (
    <Card variant="outlined" style={{ padding: '20px', marginTop: '20px' }}>
      <Grid container spacing={2}>
        <Grid item>
          <h3>Availability schedule</h3>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setFormState('add')}>
            <AddCircleIcon color="primary" />
          </IconButton>
        </Grid>
      </Grid>
      <List>
        {availability.map(item => (
          <ListItem key={item._id}>
            <Grid container spacing={2}>
              <Grid item>
                <p>
                  {formatDate(item.range.start)} to {formatDate(item.range.end)}
                </p>
              </Grid>

              <Grid item>
                <Button onClick={() => edit(item)}>
                  <EditIcon />
                </Button>
              </Grid>

              <Grid item>
                <Button onClick={() => deleteAvailability(item._id)}>
                  <DeleteIcon />
                </Button>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Card>
  )
}

function AddAvailability({ setFormState, staffId }) {
  const classes = useStyles()

  const [availability, setAvailability] = useState({})

  const { open } = useSnackbarState()

  const [loading, setLoading] = useState(false)

  const handleAvailabilityChange = (day, hour) => {
    setAvailability(prevAvailability => ({
      ...prevAvailability,
      [day]: {
        ...(prevAvailability[day] || {}),
        [hour]: !prevAvailability[day]?.[hour],
      },
    }))
  }

  const formatAvailability = () => {
    try {
      const formattedAvailability = []

      for (const day of daysOfWeek) {
        // Filter the hours (indexes) that are true
        const availableHours = Object.keys(availability[day] || {}).filter(
          hour => availability[day][hour],
        )

        // If there are available hours for the day, add them to the formatted availability array
        if (availableHours.length > 0) {
          formattedAvailability.push({
            dayOfWeek: day,
            hours: availableHours.map(hour => hour),
          })
        }
      }

      return formattedAvailability
    } catch (error) {
      // Handle errors (e.g., show an error message)
      console.error('Error formatting availability:', error)
      return [] // Return an empty array in case of an error
    }
  }

  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  })

  const saveAvailability = async () => {
    try {
      const filteredAvailability = formatAvailability()

      if (filteredAvailability.length === 0) {
        return open('error', 'You must select available hours')
      }

      setLoading(true)

      await API.post(`staff/${staffId}/availability`, {
        range: dateRange,
        schedule: filteredAvailability,
      })
      setLoading(false)
      open('success', 'updated availability')
      setFormState('list')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <Card variant="outlined" style={{ padding: '20px', marginTop: '20px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h3>Availability schedule</h3>
          <p>Select availability range</p>
        </Grid>

        <Grid item>
          <TextField
            required
            label="Start Date"
            type="date"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            value={dateRange.start}
            onChange={e =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
          />
        </Grid>
        <Grid item>
          <TextField
            required
            label="End Date"
            type="date"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </Grid>
      </Grid>

      <p>Select all hours you are available</p>

      <Grid container spacing={2}>
        {daysOfWeek.map(day => (
          <Grid item xs={6} sm={3} key={day}>
            <Accordion className={classes.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${day}-content`}
                id={`${day}-header`}
              >
                <Typography className={classes.heading}>{day}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {Array.from({ length: 24 }, (_, hour) => (
                    <FormControlLabel
                      key={hour}
                      control={
                        <Checkbox
                          checked={availability[day]?.[hour] || false}
                          onChange={() => handleAvailabilityChange(day, hour)}
                        />
                      }
                      label={`${hour}:00 - ${hour === 23 ? '00' : hour + 1}:00`}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
      <Grid container justify="flex-end" spacing={2}>
        <Grid item>
          <Button
            disableElevation
            type="button"
            variant="contained"
            onClick={() => setFormState('list')}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            disableElevation
            type="button"
            variant="contained"
            color="primary"
            onClick={() => saveAvailability()}
          >
            update
          </Button>
        </Grid>
      </Grid>
    </Card>
  )
}

function EditAvailability({ setFormState, availability, staffId }) {
  const classes = useStyles()

  const [currentAvailability, setCurrentAvailability] = useState(availability)

  const { open } = useSnackbarState()

  const [loading, setLoading] = useState(false)

  const handleAvailabilityChange = (day, hour) => {
    const newAvailability = { ...currentAvailability }

    const dayIndex = newAvailability.schedule.findIndex(
      item => item.dayOfWeek === day,
    )

    if (dayIndex !== -1) {
      const hourExists =
        newAvailability.schedule[dayIndex]?.hours.includes(hour)

      if (hourExists) {
        newAvailability.schedule[dayIndex].hours = newAvailability.schedule[
          dayIndex
        ].hours.filter(h => h !== hour)
      } else {
        newAvailability.schedule[dayIndex].hours.push(hour)
      }
    } else {
      newAvailability.schedule.push({
        dayOfWeek: day,
        hours: [hour],
      })
    }

    setCurrentAvailability(newAvailability)
  }

  const { range } = currentAvailability

  const [dateRange, setDateRange] = useState({
    start: new Date(range.start),
    end: new Date(range.end),
  })

  function doesHourExist(targetDayOfWeek, targetHour) {
    const filteredDay = currentAvailability.schedule.find(
      item => item.dayOfWeek === targetDayOfWeek,
    )

    return filteredDay
      ? !!filteredDay.hours.find(item => item == targetHour)
      : false
  }

  const updateAvailability = async () => {
    try {
      setLoading(true)

      await API.patch(`staff/${staffId}/availability/${availability._id}`, {
        ...currentAvailability,
        range: dateRange,
      })
      setLoading(false)
      open('success', 'updated availability')
      setFormState('list')
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <Card variant="outlined" style={{ padding: '20px', marginTop: '20px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h3>Edit Availability schedule</h3>
          <p>Select availability range</p>
        </Grid>

        <Grid item>
          <TextField
            required
            label="Start Date"
            type="date"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            value={formatDate(dateRange.start)}
            onChange={e =>
              setDateRange({ ...dateRange, start: new Date(e.target.value) })
            }
          />
        </Grid>
        <Grid item>
          <TextField
            required
            label="End Date"
            type="date"
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            value={formatDate(dateRange.end)}
            onChange={e =>
              setDateRange({ ...dateRange, end: new Date(e.target.value) })
            }
          />
        </Grid>
      </Grid>

      <p>Select all hours you are available</p>

      <Grid container spacing={2}>
        {daysOfWeek.map(day => (
          <Grid item xs={6} sm={3} key={day}>
            <Accordion className={classes.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${day}-content`}
                id={`${day}-header`}
              >
                <Typography className={classes.heading}>{day}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {Array.from({ length: 24 }, (_, hour) => (
                    <FormControlLabel
                      key={hour}
                      control={
                        <Checkbox
                          checked={doesHourExist(day, hour)}
                          onChange={() =>
                            handleAvailabilityChange(day, hour.toString())
                          }
                        />
                      }
                      label={`${hour}:00 - ${hour === 23 ? '00' : hour + 1}:00`}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
      <Grid container justify="flex-end" spacing={2}>
        <Grid item>
          <Button
            disableElevation
            type="button"
            variant="contained"
            onClick={() => setFormState('list')}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            disableElevation
            type="button"
            variant="contained"
            color="primary"
            onClick={() => updateAvailability()}
          >
            update
          </Button>
        </Grid>
      </Grid>
    </Card>
  )
}

function Availability({ staffId }) {
  const [formState, setFormState] = useState('list')

  const [availability, setAvailability] = useState({})

  const edit = item => {
    setAvailability(item)
    setFormState('edit')
  }

  return (
    <div>
      {formState === 'list' && (
        <ListAvailability
          setFormState={setFormState}
          edit={edit}
          staffId={staffId}
        />
      )}

      {formState === 'add' && (
        <AddAvailability setFormState={setFormState} staffId={staffId} />
      )}

      {formState === 'edit' && (
        <EditAvailability
          setFormState={setFormState}
          availability={availability}
          staffId={staffId}
        />
      )}
    </div>
  )
}

function EditDoctor({ staff, shopRoles, shopId, setFormState }) {
  const classes = useStyles()
  const { getUserId, setStaff } = useAuthState()

  const { open } = useSnackbarState()

  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: {
      firstName: staff?.firstName || '',
      lastName: staff?.lastName || '',
      email: staff?.email || '',
      phoneNumber: staff?.phoneNumber || '',
      registrationNumber: staff?.registrationNumber || '',
      specialty: staff?.specialty || '',
      about: staff?.about || '',
      profileImage: staff?.profileImage || '',
      officeLocation: {
        county: staff?.officeLocation?.county || '',
        street: staff?.officeLocation?.street || '',
        building: staff?.officeLocation?.building || '',
      },
      education: staff?.education || [],
      languages: staff?.languages || [],
      roles: shopRoles,
    },
  })

  const {
    fields: education,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: 'education',
  })

  const {
    fields: languages,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: 'languages',
  })

  const [selectedImage, setSelectedImage] = React.useState(
    staff?.profileImage || null,
  )

  const [imageUploaded, setImageUploaded] = React.useState(false)

  const roles = watch('roles', [])

  const handleChangeRoles = event => {
    setValue('roles', event.target.value)
  }

  const onSubmit = async data => {
    try {
      const formData = new FormData()

      if (imageUploaded && selectedImage) {
        formData.append('file', selectedImage)
      }

      formData.append('shopId', shopId)
      formData.append('firstName', data?.firstName || '')
      formData.append('lastName', data?.lastName || '')
      formData.append('email', data?.email || '')
      formData.append('phoneNumber', data?.phoneNumber || '')
      formData.append('registrationNumber', data?.registrationNumber || '')
      formData.append('specialty', data?.specialty || '')
      formData.append('about', data?.about || '')

      formData.append(
        'officeLocation[county]',
        data?.officeLocation?.county || '',
      )
      formData.append(
        'officeLocation[street]',
        data?.officeLocation?.street || '',
      )
      formData.append(
        'officeLocation[building]',
        data?.officeLocation?.building || '',
      )

      data?.education
        ? data?.education.forEach((educationItem, index) => {
            formData.append(
              `education[${index}][institution]`,
              educationItem.institution,
            )
            formData.append(
              `education[${index}][qualification]`,
              educationItem.qualification,
            )
          })
        : formData.append('education', [])

      data?.languages
        ? data?.languages?.forEach((language, index) => {
            formData.append(`languages[${index}]`, language || '')
          })
        : formData.append('languages', [])

      data?.roles
        ? data?.roles?.forEach((role, index) => {
            formData.append(`roles[${index}]`, role || '')
          })
        : formData.append('roles', [])

      const result = await API.patch(`staff/${staff._id.toString()}`, formData)
      if (staff._id.toString() === getUserId().toString()) {
        setStaff(result.data)
      }
      open('success', 'Updated')
    } catch (err) {
      const { message } = err.response.data
      open('error', message)
    }
  }

  return (
    <>
      <h3>Edit Staff</h3>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Card style={{ padding: '20px', marginTop: '20px' }} variant="outlined">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {selectedImage && (
                <div>
                  <img
                    src={
                      imageUploaded
                        ? URL.createObjectURL(selectedImage)
                        : selectedImage
                    }
                    alt="Selected"
                    width="200"
                  />
                </div>
              )}
              <input
                name="file"
                accept="image/*"
                id="image-input"
                type="file"
                style={{ display: 'none' }}
                onChange={e => {
                  setSelectedImage(e.target.files[0])
                  setImageUploaded(true)
                }}
              />
              <label htmlFor="image-input">
                <Button
                  disableElevation
                  variant="contained"
                  color="primary"
                  component="span"
                >
                  {selectedImage ? ' Change' : ' Upload'} profile image
                </Button>
              </label>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                name="firstName"
                variant="outlined"
                margin="normal"
                fullWidth
                label="First name"
                {...register('firstName', {
                  required: 'This field is required',
                })}
                error={!!errors.firstName?.message}
                helperText={errors.firstName?.message || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                name="lastName"
                variant="outlined"
                margin="normal"
                fullWidth
                label="Last name"
                {...register('lastName', {
                  required: 'This field is required',
                })}
                error={!!errors.lastName?.message}
                helperText={errors.lastName?.message || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                name="email"
                type="email"
                variant="outlined"
                margin="normal"
                fullWidth
                label="Email"
                {...register('email', {
                  required: 'This field is required',
                })}
                error={!!errors.email?.message}
                helperText={errors.email?.message || ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                name="phoneNumber"
                variant="outlined"
                margin="normal"
                label="Phone number"
                fullWidth
                {...register('phoneNumber', {
                  required: 'This field is required',
                })}
                error={!!errors.phoneNumber?.message}
                helperText={errors.phoneNumber?.message || ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="registrationNumber"
                variant="outlined"
                margin="normal"
                label="Registration Number"
                fullWidth
                {...register('registrationNumber')}
                error={!!errors.registrationNumber?.message}
                helperText={errors.registrationNumber?.message || ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="specialty"
                variant="outlined"
                margin="normal"
                label="Specialty"
                fullWidth
                {...register('specialty')}
                error={!!errors.specialty?.message}
                helperText={errors.specialty?.message || ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="about"
                variant="outlined"
                margin="normal"
                label="About"
                fullWidth
                multiline
                rows="10"
                {...register('about')}
                error={!!errors.about?.message}
                helperText={errors.about?.message || ''}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Office Location</h4>
              <Controller
                name="officeLocation.county"
                control={control}
                defaultValue={staff?.officeLocation?.county || ''}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disableClearable
                    options={kenyanCounties}
                    value={field.value}
                    onChange={(_, newValue) => {
                      field.onChange(newValue)
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="County"
                        variant="outlined"
                      />
                    )}
                  />
                )}
              />
              <TextField
                name="street"
                variant="outlined"
                margin="normal"
                fullWidth
                label="Street"
                {...register('officeLocation.street')}
                error={!!errors.officeLocation?.street?.message}
                helperText={errors.officeLocation?.street?.message || ''}
              />

              <TextField
                name="building"
                variant="outlined"
                margin="normal"
                fullWidth
                label="Building"
                {...register('officeLocation.building')}
                error={!!errors.officeLocation?.building?.message}
                helperText={errors.officeLocation?.building?.message || ''}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <h4 style={{ marginRight: '10px' }}>Role</h4>
            </Grid>

            <Grid item>
              <Controller
                name="roles"
                control={control}
                defaultValue={shopRoles}
                rules={{ required: 'Please select at least one role' }} // Adding the required rule
                render={({ field }) => (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    label="Role"
                    select
                    SelectProps={{
                      multiple: true, // Enable multi-select
                      value: roles,
                      onChange: handleChangeRoles,
                      renderValue: selected => selected.join(', '), // Display selected values
                    }}
                    error={!!errors.roles?.message}
                    helperText={errors.roles?.message || ''}
                  >
                    {roleOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          </Grid>

          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h4 style={{ marginRight: '10px' }}>Education</h4>
              <IconButton onClick={() => appendEducation()}>
                <AddCircleIcon color="primary" />
              </IconButton>
            </div>
            <List>
              <Grid container spacing={2}>
                {education.map((field, index) => (
                  <Grid item xs={12} sm={6} key={field.id}>
                    <Card variant="outlined" style={{ margin: '10px' }}>
                      <Grid container justifyContent="flex-end">
                        <IconButton onClick={() => removeEducation(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>

                      <ListItem>
                        <ListItemText>
                          <TextField
                            required
                            name={`education[${index}].institution`}
                            margin="normal"
                            label="Institution"
                            fullWidth
                            defaultValue={field.institution}
                            {...register(`education[${index}].institution`, {
                              required: 'This field is required',
                            })}
                            error={
                              !!errors.education?.[index]?.institution?.message
                            }
                            helperText={
                              errors.education?.[index]?.institution?.message ||
                              ''
                            }
                          />
                          <TextField
                            required
                            name={`education[${index}].qualification`}
                            margin="normal"
                            label="Qualification"
                            fullWidth
                            defaultValue={field.qualification}
                            {...register(`education[${index}].qualification`, {
                              required: 'This field is required',
                            })}
                            error={
                              !!errors.education?.[index]?.qualification
                                ?.message
                            }
                            helperText={
                              errors.education?.[index]?.qualification
                                ?.message || ''
                            }
                          />
                        </ListItemText>
                      </ListItem>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </List>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h4 style={{ marginRight: '10px' }}>Languages</h4>
              <IconButton onClick={() => appendLanguage()}>
                <AddCircleIcon color="primary" />
              </IconButton>
            </div>
            <List>
              <Grid container spacing={2}>
                {languages.map((field, index) => (
                  <Grid item xs={12} sm={6} key={field.id}>
                    <Card variant="outlined" style={{ margin: '10px' }}>
                      <Grid container justifyContent="flex-end">
                        <IconButton onClick={() => removeLanguage(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>

                      <ListItem>
                        <TextField
                          required
                          name={`language[${index}]`}
                          margin="normal"
                          label="Language"
                          defaultValue={getValues(`languages[${index}]`, '')}
                          fullWidth
                          {...register(`languages[${index}]`, {
                            required: 'This field is required',
                          })}
                          error={!!errors.language?.[index]?.message}
                          helperText={errors.language?.[index]?.message || ''}
                        />
                      </ListItem>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </List>
          </div>

          {
            /* isValid &&  */ !isSubmitting && (
              <Grid
                container
                justifyContent="flex-end"
                spacing={2}
                style={{ marginTop: '10px' }}
              >
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                  >
                    Update
                  </Button>
                </Grid>
              </Grid>
            )
          }
        </Card>
      </form>

      <Availability staffId={staff._id} />
      <div style={{ textAlign: 'right', padding: '20px' }}>
        <Button
          variant="contained"
          disableElevation
          onClick={() => setFormState('list')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </>
  )
}

function EditDefault({ staff, shopRoles, shopId, setFormState }) {
  const { accountType } = useAuthState()
  const { open } = useSnackbarState()

  const [staffId] = useState(staff?._id)
  const [email, setEmail] = useState(staff?.email || '')
  const [phoneNumber, setPhoneNumber] = useState(staff?.phoneNumber || '')
  const [firstName, setFirstName] = useState(staff?.firstName || '')
  const [lastName, setLastName] = useState(staff?.lastName || '')
  const [roles, setRoles] = useState(shopRoles)

  const [loading, setLoading] = useState(false)

  const editStaff = async () => {
    const data = {
      shopId,
      email,
      phoneNumber,
      firstName,
      lastName,
      roles,
    }
    if (!firstName || !lastName || !email || !phoneNumber || !roles) {
      open('success', 'All fields are required')
    } else {
      try {
        setLoading(true)
        await API.patch(`staff/${staffId}`, {
          ...data,
        })
        setLoading(false)
        setFormState('list')
        open('success', 'Updated')
      } catch (err) {
        setLoading(false)
        const { message } = err.response.data
        open('error', message)
      }
    }
  }

  const handleChangeRoles = e => {
    setRoles(e.target.value)
  }

  return (
    <div>
      <h3>Edit Staff</h3>
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
              {/* <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Role"
                value={role}
                onChange={e => setRoles(e.target.value)}
                select
              >
                {roles.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField> */}
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
        {accountType === 'company' && (
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => editStaff()}
              disabled={loading}
            >
              Edit
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  )
}

export default function EditStaff({ staff, shopId, setFormState }) {
  const shop = staff.shops.find(
    item => item.shop.toString() === shopId.toString(),
  )

  let shopRoles = []
  if (shop) {
    shopRoles = shop.roles
  }

  return (
    <div>
      {hasRole(shopRoles, 'doctor') ? (
        <EditDoctor
          staff={staff}
          shopRoles={shopRoles}
          shopId={shopId}
          setFormState={setFormState}
        />
      ) : (
        <EditDefault
          staff={staff}
          shopId={shopId}
          setFormState={setFormState}
          shopRoles={shopRoles}
        />
      )}
    </div>
  )
}

EditDoctor.propTypes = {
  staff: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
  shopRoles: PropTypes.array.isRequired,
}

EditDefault.propTypes = {
  staff: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
  shopRoles: PropTypes.array.isRequired.isRequired,
}

EditStaff.propTypes = {
  staff: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
}
