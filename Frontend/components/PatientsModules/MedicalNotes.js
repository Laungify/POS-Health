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
  FormGroup,
  Checkbox,
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
import ClinicalModule from './ClinicalModule'
import PrescriptionsModule from './ClinicalModuleEdit'



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



function CreateClinicalNotes({ setFormState }) {
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

  const [medicationUnderstanding, setMedicalUnderstanding] = useState('')

  const handleCheckbox = e => {
    setMedicalUnderstanding(e.target.name)
  }

  const isChecked = checkbox => checkbox === medicationUnderstanding

  const [intervention, setIntervention] = useState('')

  const handleInterventionCheckbox = e => {
    setIntervention(e.target.name)
  }

  const isInterventionChecked = checkbox => checkbox === intervention

  const [otherExplanations, setOtherExplanations] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [recommendationToClinician, setRecommendationToClinician] = useState('')
  const [recommendationToPatient, setRecommendationToPatient] = useState('')

  const [prescriptions, setPrescriptions] = useState([])
  const [triageNotes, setTriageNotes] = useState("")
  const [isEditingTriageNotes, setIsEditingTriageNotes] = useState(false);




  const onSubmit = async () => {
    try {
      setLoading(true);

      const patientId = currentPatient._id;

      const newClinicalNotes = {
        shopId,
        reviewerId: getUserId(),
        userId: patientId,
        triageNotes,
        prescriptions,
        intervention: {
          details: intervention,
          otherExplanations,
        },
        followUp,
        recommendationToPatient,
        recommendationToClinician,
      };

      console.log('New Clinical Notes:', newClinicalNotes);
      await API.post(`clinical_notes`, {
        ...newClinicalNotes,
      });

      setLoading(false);
      setFormState('list');
      open('success', 'Clinical Notes saved successfully');
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'An error occurred';
      open('error', message);
    }
  };

  const handleSaveTriageNotes = () => {
    setIsEditingTriageNotes(true);
  };

  const handleDeleteTriageNotes = () => {
    setTriageNotes('');
    setIsEditingTriageNotes(false);
  };

  const handleEditTriageNotes = () => {
    setIsEditingTriageNotes(false);
  };


  return (
    <div>
        <h3>Triage Notes</h3>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Complaint</h3>
        {!isEditingTriageNotes ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TextField
              variant="outlined"
              fullWidth
              rows={5}
              multiline
              placeholder="Enter Triage Notes"
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveTriageNotes}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p>{triageNotes || 'No triage notes available'}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditTriageNotes}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDeleteTriageNotes}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Grid item xs={12}>
        <PrescriptionsModule
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          shopId={shopId}
          encounterId={currentPatient._id}
        />
      </Grid>
      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Intervention</h3>
        <FormGroup>
          {['Need for closer observation', 'Need for referral - specialist care', 'Need for referral - Patient care journey support'].map((intervention) => (
            <FormControlLabel
              key={intervention}
              control={
                <Checkbox
                  checked={isInterventionChecked(intervention)}
                  onChange={(e) => setIntervention(e.target.name)}
                  name={intervention}
                />
              }
              label={intervention}
            />
          ))}
        </FormGroup>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          label="Other explanation"
          placeholder="Other explanation"
          value={otherExplanations}
          onChange={(e) => setOtherExplanations(e.target.value)}
        />
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Follow Up</h3>
        <p>
          clear communication to the patient/care giver what is expected
          before next visit
        </p>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Follow Up"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
        />
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Recommendation to Clinician</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Recommendation"
          value={recommendationToClinician}
          onChange={(e) => setRecommendationToClinician(e.target.value)}
        />
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Recommendation to Patient</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Recommendation"
          value={recommendationToPatient}
          onChange={(e) => setRecommendationToPatient(e.target.value)}
        />
      </Card>

      <Grid item xs={12}>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            disableElevation
            onClick={() => setFormState('list')}
          >
            Cancel
          </Button>

          <Button
            style={{ marginLeft: '10px' }}
            variant="contained"
            color="primary"
            disableElevation
            disabled={loading}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

function EditEncounter({ setFormState, encounterId }) {
  const { currentPatient, currentEncounter, setCurrentEncounter } = useContext(
    currentPatientContext,
  )
  const { open } = useSnackbarState()
  const { getUserId } = useAuthState()

  const { currentShop } = useCurrentShopState()
  const shopId = currentShop._id

  const [loading, setLoading] = useState(false)

  const [prescriptions, setPrescriptions] = useState(
    currentEncounter?.prescriptions || [],
  )
  const [medications, setMedications] = useState(
    currentEncounter?.medications || [],
  )
  const [goals, setGoals] = useState(currentEncounter?.goals || [])
  const [referral, setReferral] = useState({
    doctor: currentEncounter?.referral?.doctor || {},
    comment: currentEncounter?.referral?.comment || '',
  })

  const [currentMedications, setCurrentMedications] = useState(
    currentEncounter?.currentMedications || [],
  )

  const [medicationUnderstanding, setMedicalUnderstanding] = useState(
    currentEncounter?.medicationUnderstanding || '',
  )

  const [isEditingTriageNotes, setIsEditingTriageNotes] = useState(false);


  const handleCheckbox = e => {
    setMedicalUnderstanding(e.target.name)
  }

  const isChecked = checkbox => checkbox === medicationUnderstanding

  const [intervention, setIntervention] = useState(
    currentEncounter?.intervention?.details || '',
  )

  const handleInterventionCheckbox = e => {
    setIntervention(e.target.name)
  }

  const isInterventionChecked = checkbox => checkbox === intervention

  const [potentialDrugInteractions, setPotentialDrugInteractions] = useState(
    currentEncounter?.potentialDrugInteractions || '',
  )
  const [potentialSideEffects, setPotentialSideEffects] = useState(
    currentEncounter?.potentialSideEffects || '',
  )
  const [pharmacologicalInterventions, setPharmacologicalInterventions] =
    useState(currentEncounter?.pharmacologicalInterventions || '')
  const [nonPharmacologicalInterventions, setNonPharmacologicalInterventions] =
    useState(currentEncounter?.nonPharmacologicalInterventions || '')
  const [therapeuticAlternatives, setTherapeuticAlternatives] = useState(
    currentEncounter?.therapeuticAlternatives || '',
  )
  const [otherExplanations, setOtherExplanations] = useState(
    currentEncounter?.intervention?.otherExplanations || '',
  )
  const [followUp, setFollowUp] = useState(currentEncounter?.followUp || '')

  const [triageNotes, setTriageNotes] = useState(currentEncounter?.triageNotes || '')

  const [recommendationToClinician, setRecommendationToClinician] = useState(
    currentEncounter?.recommendationToClinician || '',
  )
  const [recommendationToPatient, setRecommendationToPatient] = useState(
    currentEncounter?.recommendationToPatient || '',
  )
  const [initializing, setInitializing] = useState(true);

  const handleSaveTriageNotes = () => {
    setIsEditingTriageNotes(true);
  };

  const handleDeleteTriageNotes = () => {
    setTriageNotes('');
    setIsEditingTriageNotes(false);
  };

  const handleEditTriageNotes = () => {
    setIsEditingTriageNotes(true);
  };


  // Fetch the clinic data when the component mounts
  useEffect(() => {
    const fetchClinicalNotes = async () => {
      try {
        setLoading(true);
        const response = await API.get(`clinical_notes/${encounterId}`);
        const data = response.data;


        // Bind data to state
        setTriageNotes(data.triageNotes || '');
        setPrescriptions(data.prescriptions || []);
        setIntervention(data.intervention?.details || '');
        setOtherExplanations(data.intervention?.otherExplanations || '');
        setFollowUp(data.followUp || '');
        setRecommendationToClinician(data.recommendationToClinician || '');
        setRecommendationToPatient(data.recommendationToPatient || '');
        setLoading(false);
        setInitializing(false);
      } catch (error) {
        setLoading(false);
        setInitializing(false);
        open('error', 'Failed to load clinical notes');
      }
    };

    fetchClinicalNotes();
  }, [encounterId]);

  const onSubmit = async () => {
    try {
      setLoading(true)

      const patientId = currentPatient._id

      const updatedClinicalNotes = {
        shopId,
        reviewerId: getUserId(),
        userId: patientId,
        triageNotes,
        prescriptions,
        intervention: {
          details: intervention,
          otherExplanations,
        },
        followUp,
        recommendationToClinician,
        recommendationToPatient,
      };
      console.log(
        '🚀 ~ file: MedicationEncountersModule.js:1769 ~ onSubmit ~ newMedicationEncounter:',
        updatedClinicalNotes,
      )

      await API.patch(`clinical_notes/${encounterId}`, updatedClinicalNotes);

      open('success', 'Clinical Notes updated successfully');
      setLoading(false);
      setFormState('list');
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'An error occurred';
      open('error', message);
    }
  };

  return (
    <div>
      <h1>Edit Clinical Notes</h1>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Complaint</h3>
        {!isEditingTriageNotes ? (
          <div>
            <p>{triageNotes || 'No triage notes available'}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditTriageNotes}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDeleteTriageNotes}
              >
                Delete
              </Button>
            </div>
          </div>


        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TextField
              variant="outlined"
              fullWidth
              rows={5}
              multiline
              placeholder="Enter Triage Notes"
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveTriageNotes}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Grid item xs={12}>
        <ClinicalModule
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
          shopId={shopId}
          encounterId={encounterId}
        />
      </Grid>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Intervention</h3>
        <FormGroup>
          {[
            'Need for closer observation',
            'Need for referral - specialist care',
            'Need for referral - Patient care journey support',
          ].map((interventionOption) => (
            <FormControlLabel
              key={interventionOption}
              control={
                <Checkbox
                  checked={isInterventionChecked(interventionOption)}
                  onChange={(e) => setIntervention(e.target.name)}
                  name={interventionOption}
                />
              }
              label={interventionOption}
            />
          ))}
        </FormGroup>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          label="Other explanation"
          placeholder="Other explanation"
          value={otherExplanations}
          onChange={(e) => setOtherExplanations(e.target.value)}
        />
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Follow Up</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Follow Up"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
        />
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Recommendation to Clinician</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Recommendation"
          value={recommendationToClinician}
          onChange={(e) => setRecommendationToClinician(e.target.value)}
        />
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Recommendation to Patient</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Recommendation"
          value={recommendationToPatient}
          onChange={(e) => setRecommendationToPatient(e.target.value)}
        />
      </Card>

      <Grid item xs={12}>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              setFormState('list');
            }}
          >
            Cancel
          </Button>

          <Button
            style={{ marginLeft: '10px' }}
            variant="contained"
            color="primary"
            disableElevation
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
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
        `users/${patientId}/clinical_encounters`,
      )


      const medicalHistoryData = result.data

      setMedicalHistory(medicalHistoryData)
      setLoading(false)
    } catch (err) {
      const { message } = err.response.data
      open('error', message)
      setLoading(false)
    }

  }

  const deleteEncounter = async id => {
    try {
      setLoading(true)

      await API.delete(`clinical_notes/${id}`)

      fetchMedicalHistory()
      /// force rerender


      open('success', 'deleted')
      setLoading(false)
      setFormState('list')
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
            medicalHistory.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{formatDate(new Date(item.date))}</TableCell>
                <TableCell>{item._id}</TableCell>
                <TableCell>{`${item?.reviewer?.firstName} ${item?.reviewer?.lastName}`}</TableCell>
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
              <TableCell colSpan={4} align="center">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function MedicalNotes({ setCurrentTab }) {
  const [formState, setFormState] = useState('list')
  const [currentClinic, setCurrentEncounter] = useState({})

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
        <CreateClinicalNotes setFormState={setFormState} />
      )}
      {formState === 'edit' && (
        <EditEncounter
          setFormState={setFormState}
          currentClinic={currentClinic}
          encounterId={currentClinic._id}
        />
      )}
    </>
  )
}

MedicalNotes.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
}

CreateClinicalNotes.propTypes = {
  setFormState: PropTypes.func.isRequired,
}
EditEncounter.propTypes = {
  setFormState: PropTypes.func.isRequired,
  encounterId: PropTypes.string.isRequired,
}

EncountersList.propTypes = {
  setFormState: PropTypes.func.isRequired,
  setCurrentEncounter: PropTypes.func.isRequired,
}
