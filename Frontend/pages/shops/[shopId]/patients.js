/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react'
import { Tabs, Tab, Grid } from '@material-ui/core'
import { useRouter } from 'next/router'
import PatientsModule from '../../../components/PatientsModule'
import Layout from '../../../templates/layout'
import Modal from '../../../components/modal'
import EncountersModule from '../../../components/PatientsModules/EncountersModule'
import MedicationEncountersModule from '../../../components/PatientsModules/MedicationEncountersModule'
import PatientDetailsCard from '../../../components/PatientsModules/PatientDetailsCard'
import { currentPatientContext } from '../../../context/currentPatientContext'
import useCurrentShopState from '../../../stores/currentShop'
import useFetchShopData from '../../../hooks/fetchShowShop'
import MedicalNotes from '../../../components/PatientsModules/MedicalNotes'

export function PatientPageComponent() {
  const router = useRouter()
  const { shopId } = router.query

  const [currentTab, setCurrentTab] = useState(0)

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue)
  }


  useEffect(() => {
    setCurrentTab(0)
  }, [shopId])

  const [displayMedical, setDisplayMedical] = useState(0)

  const toggleMedical = toggle => {
    setDisplayMedical(toggle)
  }

  const [currentPatient, setCurrentPatient] = useState({})
  const { currentShop } = useCurrentShopState()

  const [currentMedications, setCurrentMedications] = useState([])
  const [currentEncounter, setCurrentEncounter] = useState({})
  const [currentClinic, setCurrentClinic] = useState({})
  
  const [refresh, setRefresh] = useState(false)


  const handleRefresh = () => {
    setRefresh(prevRefresh => !prevRefresh)
  }

  // Memoize the value object
  const providerValue = React.useMemo(() => ({
    currentPatient,
    setCurrentPatient,
    currentMedications,
    setCurrentMedications,
    currentEncounter,
    setCurrentEncounter,
    currentClinic,
    setCurrentClinic,
  }), [currentPatient, currentMedications, currentEncounter, currentClinic]);
  return (
    <>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="on"
      >
        <Tab label="Patients" key="patients" />
        {displayMedical && <Tab label="Medical History" key="medical" />}
        {displayMedical && <Tab label="Medications" key="medications" />}
        {displayMedical && <Tab label="Medical Notes" key="medicalNotes" />}
      </Tabs>
      <currentPatientContext.Provider
        value={providerValue}
      >
        {currentTab === 0 && (
          <PatientsModule
            setDisplayMedical={toggleMedical}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 1 && (
          <>
            <PatientDetailsCard patient={currentPatient} />
            <EncountersModule setCurrentTab={setCurrentTab} />
          </>
        )}

        {currentTab === 2 && (
          <Grid container spacing={2}>
            <Grid item style={{ margin: '10px', overflow: 'hidden' }}>
              <PatientDetailsCard patient={currentPatient} />
            </Grid>
            <Grid xs={12} item style={{ margin: '10px', overflow: 'hidden' }}>
              <h3>Medication Review and Therapy Plan</h3>
            </Grid>

            <Grid item style={{ margin: '10px', overflow: 'hidden' }}>
              <MedicationEncountersModule
                setCurrentTab={setCurrentTab}
                handleRefresh={handleRefresh}
              />
            </Grid>
          </Grid>
        )}

        {currentTab === 3 && (
          <Grid container spacing={2}>
            <Grid item style={{ margin: '10px', overflow: 'hidden' }}>
              <PatientDetailsCard patient={currentPatient} />
            </Grid>
            <Grid xs={12} item style={{ margin: '10px', overflow: 'hidden' }}>
              {/* <h3>Clinical Notes</h3> */}
              <MedicalNotes setCurrentTab={setCurrentTab} />
            </Grid>

          </Grid>
        )}
      </currentPatientContext.Provider>
    </>
  )
}

export default function PatientPage() {
  const router = useRouter()
  const { shopId } = router.query

  const [currentTab, setCurrentTab] = useState(0)

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  useEffect(() => {
    setCurrentTab(0)
  }, [shopId])


  const [displayMedical, setDisplayMedical] = useState(0)

  const toggleMedical = toggle => {
    setDisplayMedical(toggle)
  }

  const [currentPatient, setCurrentPatient] = useState({})
  const { currentShop } = useCurrentShopState()

  const [currentMedications, setCurrentMedications] = useState([])
  const [currentEncounter, setCurrentEncounter] = useState({})

  const [refresh, setRefresh] = useState(false)

  const handleRefresh = () => {
    setRefresh(prevRefresh => !prevRefresh)
  }
  const { showShop, error } = useFetchShopData(shopId)

  return (
    <Layout>
      <Modal showShop={showShop} />
      <h1>{currentShop.name}</h1>

      {router.isReady ? <PatientPageComponent /> : <p>Loading...</p>}
    </Layout>
  )
}
