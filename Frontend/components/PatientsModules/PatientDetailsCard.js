/* eslint-disable react/forbid-prop-types */
import React from 'react'
import { Grid, Card } from '@material-ui/core'
import PropTypes from 'prop-types'
import { calculateAge } from '../../utils/helpers'

function PatientsDetailsCard({ patient }) {
  return (
    <Card style={{ margin: '20px 0px', padding: '20px' }}>
      <h3>Patient</h3>
      <Grid container>
        <Grid item xs={12} sm={4}>
          <p>
            <strong>Name: </strong>
            {`${patient.firstName} ${patient.lastName}`}
          </p>
        </Grid>
        <Grid item xs={12} sm={4}>
          <p>
            <strong>Age: </strong>
            {patient?.dob ? calculateAge(patient.dob) : 'N/A'}
          </p>
        </Grid>
        <Grid item xs={12} sm={4}>
          <p>
            <strong>Gender: </strong> {patient?.gender || 'N/A'}
          </p>
        </Grid>
        <Grid item xs={12} sm={4}>
          <p>
            <strong>Phone Number: </strong>
            {patient?.phoneNumber || 'N/A'}
          </p>
        </Grid>
        <Grid item xs={12} sm={4}>
          <p>
            <strong>Weight: </strong> {patient?.weight || 'N/A'}
          </p>
        </Grid>
        <Grid item xs={12} sm={4}>
          <p>
            <strong>Allergies: </strong>
            {patient?.allergies.length > 0
              ? patient.allergies.map(allergy => (
                  <span key={allergy}>{`${allergy}, `}</span>
                ))
              : 'N/A'}
          </p>
        </Grid>
      </Grid>
    </Card>
  )
}

export default PatientsDetailsCard

PatientsDetailsCard.propTypes = {
  patient: PropTypes.object.isRequired,
}
