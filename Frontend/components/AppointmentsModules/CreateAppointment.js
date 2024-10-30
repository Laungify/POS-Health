/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { Alert } from '@material-ui/lab'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import { set, parse } from 'date-fns'
import API from '../../utils/api'
import { isEmptyObject } from '../../utils/helpers'

export default function CreateAppointment({ shopId, setFormState }) {
  const [patients, setPatients] = useState([])
  const [staff, setStaff] = useState([])
  /*  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null) */
  const [notes, setNotes] = useState(null)
  const [type, setType] = useState(null)

  const types = ['online', 'office', 'home']

  const [patient, setPatient] = useState({})
  const [doctor, setDoctor] = useState({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const result = await API.get(`shops/${shopId}/patients`)

      const items = result.data.data

      //console.log("items", items)

      const extractedPatients = items.map(element => ({ ...element.patient }))

      //console.log("extractedPatients", extractedPatients)

      //setPatients(extractedPatients)
      setPatients(items)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      const { message } = err.response.data
      setError(message)
    }
  }

  async function fetchStaff() {
    try {
      const result = await API.get(`shops/${shopId}/staff`)

      const staffData = result.data.data

      //console.log("staffData", staffData)

      // const doctors = staffData.filter(item => item.roles.includes('doctor'))
      const doctors = staffData.filter(item => item.shops.some(shop => shop.roles.includes('doctor')))

      //console.log("doctors", doctors)

      const extractedDoctors = doctors.map(element => ({ ...element.member }))

      //console.log("extractedDoctors", extractedDoctors)

      doctors.map(item => item.member)

      //setStaff(extractedDoctors)
      setStaff(doctors)
    } catch (err) {
      const { message } = err.response.data
      setError(message)
    }
  }

  useEffect(() => {
    fetchPatients()
    fetchStaff()
  }, [])

  const [selectedDate, setSelectedDate] = useState(null)

  const getAvailabilityData = () =>
    doctor?.availability.length > 0 ? doctor.availability : []

  const disableUnavailableDays = date => {
    const chosenDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    )
    const availabilityData = getAvailabilityData()

    const isDateAvailable = availabilityData.some(availabilityItem => {
      const availabilityStart = new Date(availabilityItem.range.start)
      const availabilityEnd = new Date(availabilityItem.range.end)

      availabilityStart.setHours(0, 0, 0, 0)
      availabilityEnd.setHours(0, 0, 0, 0)

      // Check if chosenDate is within the availability range
      if (chosenDate >= availabilityStart && chosenDate <= availabilityEnd) {
        // Check if the day of the week is in the schedule
        const selectedDayOfWeek = chosenDate.toLocaleDateString('en-US', {
          weekday: 'long',
        })
        const isDayInSchedule = availabilityItem.schedule.some(
          day => day.dayOfWeek === selectedDayOfWeek,
        )

        return isDayInSchedule
      }

      return false
    })

    return isDateAvailable
  }

  const [availabilityTimeData, setAvailabilityTimeData] = useState([])

  const handleDateChange = date => {
    setSelectedDate(date)

    // Get the selected day of the week
    const selectedDayOfWeek = date.toLocaleDateString('en-US', {
      weekday: 'long',
    })

    let availabilityItem = {}

    const availabilityData = getAvailabilityData()

    availabilityData.forEach(item => {
      const matchingScheduleItems = item.schedule.find(
        scheduleItem => scheduleItem.dayOfWeek === selectedDayOfWeek,
      )

      if (matchingScheduleItems) {
        availabilityItem = matchingScheduleItems
      }
    })

    if (availabilityItem) {
      setAvailabilityTimeData(availabilityItem.hours)
    } else {
      setAvailabilityTimeData([])
    }
  }
  const [selectedTime, setSelectedTime] = useState(null)

  const handleTimeChange = newTime => {
    setSelectedTime(newTime)
  }

  const filterTime = time => {
    const hour = time.getHours().toString()
    return availabilityTimeData.includes(hour)
  }

  const createAppointment = async () => {
    const timeString = selectedTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    function combineDateWithTime(date, time) {
      if (!date || !time) {
        return null // Handle invalid input gracefully
      }
      const localDate = new Date(date)

      const parsedTime = parse(time, 'hh:mm a', new Date())
      const hours = parsedTime.getHours()
      const minutes = parsedTime.getMinutes()

      const combinedDate = set(localDate, {
        hours,
        minutes,
        seconds: 0,
        milliseconds: 0,
      })

      return combinedDate
    }

    const data = {
      userId: patient,
      staffId: doctor._id,
      shopId,
      notes,
      date: combineDateWithTime(selectedDate, timeString),
      type,
    }

    if (!data.userId || !data.staffId || !data.date || !data.type) {
      /*   open('error', 'Missing required fields'); */
      setError('Missing required fields')
    } else {
      try {
        setLoading(true)
        API.post(`appointments`, {
          ...data,
        })
        setLoading(false)
        setFormState('list')
        /*  open('success', 'appointment added'); */
        /* setError('appointment added') */
      } catch (err) {
        setLoading(false)
        const { message } = err.response.data
        /*   open('error', message); */
        setError(message)
      }
    }
  }

  return (
    <div>
      <h3>New Appointment</h3>
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
                label="Patient"
                value={patient}
                onChange={e => setPatient(e.target.value)}
                select
              >
                {patients.map(option => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.fullName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              {/*    <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Doctor"
                value={doctor}
                onChange={e => setDoctor(e.target.value)}
                select
              >
                {staff.map(option => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.fullName}
                  </MenuItem>
                ))}
              </TextField> */}
              <Autocomplete
                value={doctor}
                onChange={(event, newValue) => setDoctor(newValue)}
                options={staff}
                getOptionLabel={option =>
                  !isEmptyObject(option)
                    ? `${option.firstName} ${option.lastName}`
                    : ''
                }
                getOptionSelected={(option, value) => option._id === value._id}
                renderInput={params => (
                  <TextField
                    {...params}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Doctor"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                variant="outlined"
                margin="normal"
                fullWidth
                label="Type"
                value={type}
                onChange={e => setType(e.target.value)}
                select
              >
                {types.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Date"
                value={date}
                type="date"
                onChange={e => setDate(e.target.value)}
              /> */}
              <p>Date: </p>
              <DatePicker
                disabled={isEmptyObject(doctor)}
                required
                selected={selectedDate}
                onChange={handleDateChange}
                filterDate={disableUnavailableDays}
                minDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/*  <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Time"
                value={time}
                type="time"
                onChange={e => setTime(e.target.value)}
              /> */}
              <p>Time: </p>
              <DatePicker
                disabled={isEmptyObject(doctor)}
                required
                selected={selectedTime}
                onChange={handleTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={60}
                dateFormat="h:mm aa"
                filterTime={filterTime}
                label="time"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={5}
                multiline
              />
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
            onClick={() => createAppointment()}
            disabled={loading}
          >
            Add
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

CreateAppointment.propTypes = {
  shopId: PropTypes.string.isRequired,
  setFormState: PropTypes.func.isRequired,
}
