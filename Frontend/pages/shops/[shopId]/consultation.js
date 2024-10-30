/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, Grid, Card, Box } from '@material-ui/core'
import Layout from '../../../templates/layout'
import AppointmentsList from '../../../components/AppointmentsModules/AppointmentsList'
import VideoChat from '../../../components/AppointmentsModules/VideoChat'
import CreateAppointment from '../../../components/AppointmentsModules/CreateAppointment'
import { VideoChatContextProvider } from '../../../context/videoChatContext'
import { formatDateTime } from '../../../utils/helpers'

function AppointmentDetailsCard({ appointment }) {
  return (
    <Card style={{ margin: '10px', padding: '10px' }}>
      <h3>Appointment</h3>
      <Grid container item>
        <Grid item xs={12} sm={4}>
          <p>Patient: {appointment.user.fullName}</p>
        </Grid>
        <Grid item xs={12} sm={4}>
          <p>Date: {formatDateTime(appointment.date)}</p>
        </Grid>
        <Grid item xs={12} sm={4}>
          <p>Type: {appointment.type}</p>
        </Grid>
        {appointment.notes && (
          <Grid item xs={12} sm={4}>
            <p>Notes: {appointment.notes}</p>
          </Grid>
        )}
      </Grid>
    </Card>
  )
}

export default function Appointments() {
  const router = useRouter()
  const { shopId } = router.query

  const [formState, setFormState] = useState('list')

  const [appointment, setAppointment] = useState({})

  const view = (data, state) => {
    setAppointment(data)
    setFormState(state)
  }

  const goToPatient = id => {
    router.push(`/shops/${shopId}/patients?patient=${id}`)
  }

  return (
    <Layout>
      <h3>Appointments</h3>
      {formState === 'create' && (
        <CreateAppointment shopId={shopId} setFormState={setFormState} />
      )}
      {formState === 'list' && (
        <>
          <Grid container justifyContent="flex-end">
            <Box my={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setFormState('create')}
              >
                New Appointment
              </Button>
            </Box>
          </Grid>
          <AppointmentsList view={view} shopId={shopId} formState={formState} />
        </>
      )}
      {formState === 'videoCall' && (
        <VideoChatContextProvider>
          <VideoChat appointment={appointment} setFormState={setFormState} />
        </VideoChatContextProvider>
      )}

      {formState === 'view' && (
        <>
          <AppointmentDetailsCard appointment={appointment} />

          <Button
            disableElevation
            variant="contained"
            color="primary"
            onClick={() => goToPatient(appointment.user._id)}
          >
            View Profile
          </Button>

          <Button
            disableElevation
            variant="contained"
            onClick={() => setFormState('list')}
            style={{ margin: '10px' }}
          //disabled={loading}
          >
            Back
          </Button>
        </>
      )}
    </Layout>
  )
}
