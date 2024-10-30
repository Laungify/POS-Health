/* eslint-disable no-underscore-dangle */
import React, { useContext, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import PatientsList from './PatientsModules/PatientsList'
import CreatePatient from './PatientsModules/CreatePatient'
import EditPatient from './PatientsModules/EditPatient'
import ViewPatient from './PatientsModules/ViewPatient'
import { isEmptyObject } from '../utils/helpers'
import { currentPatientContext } from '../context/currentPatientContext'
import API from '../utils/api'
import useCurrentShopState from '../stores/currentShop'

export default function PatientModule({
  setDisplayMedical,
  currentTab,
  setCurrentTab,
}) {
  const { currentPatient, setCurrentPatient } = useContext(
    currentPatientContext,
  )

  const { currentShop } = useCurrentShopState()

  const shopId = currentShop._id

  const router = useRouter()
  const { query } = router

  const [formState, setFormState] = React.useState('list')

  const edit = patient => {
    setCurrentPatient(patient)
    setFormState('edit')
    setDisplayMedical(1)
  }

  const view = patient => {
    setCurrentPatient(patient)
    setFormState('view')
  }

  React.useEffect(() => {
    if (!isEmptyObject(currentPatient)) {
      setFormState('edit')
    }
    if (formState === 'edit') {
      setDisplayMedical(1)
    } else {
      setDisplayMedical(0)
    }
  }, [formState])

  useEffect(() => {
    const patientId = query.patient

    if (patientId) {
      const fetchPatient = async () => {
        try {
          const result = await API.get(`users/${patientId}`)

          setCurrentPatient(result.data)
          edit(result.data)
        } catch (err) {
          const { message } = err.response.data
          console.log(
            '🚀 ~ file: PatientsModule.js:59 ~ fetchPatient ~ message:',
            message,
          )
        }
      }

      fetchPatient()
    }
  }, [])

  return (
    <div>
      <Grid container justifyContent="flex-end">
        <Box my={1}>
          {formState === 'list' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setFormState('create')}
            >
              New Patient
            </Button>
          )}
        </Box>
      </Grid>

      {formState === 'create' && <CreatePatient setFormState={setFormState} />}

      {formState === 'edit' && (
        <EditPatient
          setFormState={setFormState}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />
      )}

      {formState === 'view' && (
        <ViewPatient patient={currentPatient} setFormState={setFormState} />
      )}

      {formState === 'list' && (
        <PatientsList edit={edit} view={view} formState={formState} />
      )}
    </div>
  )
}

PatientModule.propTypes = {
  setDisplayMedical: PropTypes.func.isRequired,
  currentTab: PropTypes.number.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
}
