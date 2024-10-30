/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import {
  TextField,
  Button,
  Grid,
  Card,
  MenuItem,
  List,
  ListItem,
  IconButton,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import React, { useState, useContext } from 'react';
import { format } from 'date-fns';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import { currentPatientContext } from '../../context/currentPatientContext';
import useCurrentShopState from '../../stores/currentShop';

export default function ViewPatient({ setFormState }) {
  const { currentPatient: patient, setCurrentPatient } = useContext(
    currentPatientContext
  );

  const { currentShop } = useCurrentShopState();
  const shopId = currentShop._id;

  const [patientId] = useState(patient._id);
  const [firstName, setFirstName] = useState(patient.firstName);
  const [lastName, setLastName] = useState(patient.lastName);
  const [email, setEmail] = useState(patient?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(patient?.phoneNumber || '');
  const [gender, setGender] = useState(patient?.gender || '');
  const [dob, setDob] = useState(
    format(new Date(patient?.dob), 'yyyy-MM-dd') || ''
  );
  const [allergies, setAllergies] = useState(patient?.allergies || []);
  const [county, setCounty] = useState(patient?.physicalAddress?.county || '');
  const [street, setStreet] = useState(patient?.physicalAddress?.street || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genders = ['male', 'female'];

  const [newAllergy, setNewAllergy] = useState('');

  const addAllergy = () => {
    const items = [...allergies];
    items.push(newAllergy);

    setAllergies(items);
    setNewAllergy('');
  };

  const removeAllergy = (index) => {
    const items = [...allergies];
    items.splice(index, 1);
    setAllergies(items);
  };

  const editPatient = async () => {
    const data = {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      dob,
      allergies,
      physicalAddress: {
        county,
        street,
      },
    };
    if (!firstName || !lastName || !email || !phoneNumber) {
      setError('Missing required fields');
    } else {
      try {
        setLoading(true);
        const result = await API.patch(
          `shops/${shopId}/patients/${patientId}`,
          {
            ...data,
          }
        );
        setCurrentPatient(result.data);
        setLoading(false);
        setFormState('list');
      } catch (err) {
        setLoading(false);
        const { message } = err.response.data;
        setError(message);
      }
    }
  };

  return (
    <div>
      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}
      <Card body="true" style={{ padding: '10px' }}>
        <form>
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
                onChange={(e) => setFirstName(e.target.value)}
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
                onChange={(e) => setLastName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                select
              >
                {genders.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="DOB"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Physical Address</h4>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="County"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <h4>Allergies</h4>
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
                    onChange={(e) => setNewAllergy(e.target.value)}
                  />
                </Grid>
                <Grid item sm={6}>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={() => addAllergy()}
                    disabled={!newAllergy}
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
            onClick={() => editPatient()}
            disabled={loading}
          >
            Edit
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

ViewPatient.propTypes = {
  setFormState: PropTypes.func.isRequired,
};
