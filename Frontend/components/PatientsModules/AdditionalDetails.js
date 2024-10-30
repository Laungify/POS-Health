/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Card,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import API from '../../utils/api';

export default function AdditionalDetails({
  shopId,
  currentPatient,
  setCurrentPatient,
}) {
  const additionalData = currentPatient?.additionalData;

  const [medicationUnderstanding, setMedicalUnderstanding] = useState(
    additionalData?.medicationUnderstanding || ''
  );

  const handleCheckbox = (e) => {
    setMedicalUnderstanding(e.target.name);
  };

  const isChecked = (checkbox) => checkbox === medicationUnderstanding;

  const [intervention, setIntervention] = useState(
    additionalData?.intervention?.details || ''
  );

  const handleInterventionCheckbox = (e) => {
    setIntervention(e.target.name);
  };

  const isInterventionChecked = (checkbox) => checkbox === intervention;

  const [potentialDrugInteractions, setPotentialDrugInteractions] = useState(
    additionalData?.potentialDrugInteractions || ''
  );
  const [potentialSideEffects, setPotentialSideEffects] = useState(
    additionalData?.potentialSideEffects || ''
  );
  const [pharmacologicalInterventions, setPharmacologicalInterventions] =
    useState(additionalData?.pharmacologicalInterventions || '');
  const [nonPharmacologicalInterventions, setNonPharmacologicalInterventions] =
    useState(additionalData?.nonPharmacologicalInterventions || '');
  const [therapeuticAlternatives, setTherapeuticAlternatives] = useState(
    additionalData?.therapeuticAlternatives || ''
  );
  const [otherExplanations, setOtherExplanations] = useState(
    additionalData?.intervention?.otherExplanations || ''
  );
  const [followUp, setFollowUp] = useState(additionalData?.followUp || '');

  function areFieldsEqual(userInput, databaseValue) {
    // Check if both values are undefined or both are empty strings
    if (
      (userInput === undefined || userInput === '') &&
      (databaseValue === undefined || databaseValue === '')
    ) {
      return true;
    }

    // Compare the values
    return userInput === databaseValue;
  }

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (fieldName, fieldValue) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const update = { ...additionalData };

      update[fieldName] = fieldValue;

      const result = await API.patch(
        `shops/${shopId}/patients/${currentPatient._id}`,
        {
          ...currentPatient,
          additionalData: update,
        }
      );

      setCurrentPatient(result.data);
      setSuccess('Updated data');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  return (
    <>
      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Patient medication understanding</h3>
        <p>
          (Extent of interpretation on the use of the medicine by the patient)
        </p>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked('0-25%')}
                onChange={handleCheckbox}
                name="0-25%"
              />
            }
            label="0-25%"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked('25-50%')}
                onChange={handleCheckbox}
                name="25-50%"
              />
            }
            label="25-50%"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked('50-75%')}
                onChange={handleCheckbox}
                name="50-75%"
              />
            }
            label="50-75%"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked('75-100%')}
                onChange={handleCheckbox}
                name="75-100%"
              />
            }
            label="75-100%"
          />
        </FormGroup>
        {!areFieldsEqual(
          medicationUnderstanding,
          additionalData?.medicationUnderstanding
        ) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() =>
                onSubmit('medicationUnderstanding', medicationUnderstanding)
              }
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Potential drug interactions</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Potential drug effects"
          value={potentialDrugInteractions}
          onChange={(e) => setPotentialDrugInteractions(e.target.value)}
        />
        {!areFieldsEqual(
          potentialDrugInteractions,
          additionalData?.potentialDrugInteractions
        ) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() =>
                onSubmit('potentialDrugInteractions', potentialDrugInteractions)
              }
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Potential side effects</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Potential side effects"
          value={potentialSideEffects}
          onChange={(e) => setPotentialSideEffects(e.target.value)}
        />
        {!areFieldsEqual(
          potentialSideEffects,
          additionalData?.potentialSideEffects
        ) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() =>
                onSubmit('potentialSideEffects', potentialSideEffects)
              }
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Therapeutic Alternatives</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Therapeutic Alternatives"
          value={therapeuticAlternatives}
          onChange={(e) => setTherapeuticAlternatives(e.target.value)}
        />
        {!areFieldsEqual(
          therapeuticAlternatives,
          additionalData?.therapeuticAlternatives
        ) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() =>
                onSubmit('therapeuticAlternatives', therapeuticAlternatives)
              }
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Pharmacological Interventions</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Pharmacological Interventions"
          value={pharmacologicalInterventions}
          onChange={(e) => setPharmacologicalInterventions(e.target.value)}
        />
        {!areFieldsEqual(
          pharmacologicalInterventions,
          additionalData?.pharmacologicalInterventions
        ) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() =>
                onSubmit(
                  'pharmacologicalInterventions',
                  pharmacologicalInterventions
                )
              }
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Non Pharmacological Interventions</h3>
        <TextField
          variant="outlined"
          fullWidth
          rows={5}
          multiline
          placeholder="Non Pharmacological Interventions"
          value={nonPharmacologicalInterventions}
          onChange={(e) => setNonPharmacologicalInterventions(e.target.value)}
        />
        {!areFieldsEqual(
          nonPharmacologicalInterventions,
          additionalData?.nonPharmacologicalInterventions
        ) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() =>
                onSubmit(
                  'nonPharmacologicalInterventions',
                  nonPharmacologicalInterventions
                )
              }
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Intervention</h3>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isInterventionChecked('Need for closer observation')}
                onChange={handleInterventionCheckbox}
                name="Need for closer observation"
              />
            }
            label="Need for closer observation"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isInterventionChecked(
                  'Need for referral - specialist care'
                )}
                onChange={handleInterventionCheckbox}
                name="Need for referral - specialist care"
              />
            }
            label="Need for referral - specialist care"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isInterventionChecked(
                  'Need for referral - Patient care journey support'
                )}
                onChange={handleInterventionCheckbox}
                name="Need for referral - Patient care journey support"
              />
            }
            label="Need for referral - Patient care journey support"
          />
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
        {(!areFieldsEqual(
          intervention,
          additionalData?.intervention?.details
        ) ||
          !areFieldsEqual(
            otherExplanations,
            additionalData?.intervention?.otherExplanations
          )) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() =>
                onSubmit('intervention', {
                  details: intervention,
                  otherExplanations,
                })
              }
            >
              Save
            </Button>
          </Box>
        )}
      </Card>

      <Card style={{ padding: '10px', margin: '10px' }}>
        <h3>Follow Up</h3>
        <p>
          clear communication to the patient/care giver what is expected before
          next visit
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
        {!areFieldsEqual(followUp, additionalData?.followUp) && (
          <Box display="flex" justifyContent="flex-end" marginTop="10px">
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => onSubmit('followUp', followUp)}
            >
              Save
            </Button>
          </Box>
        )}
      </Card>
    </>
  );
}

AdditionalDetails.propTypes = {
  currentPatient: PropTypes.object.isRequired,
  shopId: PropTypes.string.isRequired,
  setCurrentPatient: PropTypes.func.isRequired,
};
