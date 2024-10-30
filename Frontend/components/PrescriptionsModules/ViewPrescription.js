/* eslint-disable no-underscore-dangle */
import {
  Button,
  Grid,
  Card,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import PropTypes from 'prop-types';
import CreateSale from './CreateSale';
import ImageZoom from '../custom/ImageZoom';
import PatientDetailsCard from '../PatientsModules/PatientDetailsCard'
import { formatDateTime, calculateAge } from '../../utils/helpers'

const useStyles = makeStyles(() => ({
  toggleBtn: {
    backgroundColor: '#9e9e9e !important',
    color: 'black !important',
  },
  toggleBtnSelected: {
    backgroundColor: '#4caf50 !important',
  },
  textCenter: {
    textAlign: 'center',
  },
}));

export default function ViewPrescription({ prescription, setFormState }) {
  const classes = useStyles();

  const { url, patient, shop } = prescription;
  const shopId = shop._id;
  const prescriptionId = prescription._id;

  return (
    <div>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <Card style={{ margin: '20px 0px', padding: '10px' }} body>
            <h2>Patient</h2>
            <PatientDetailsCard patient={patient} />
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card body>
            <div className={classes.textCenter}>
              <h2>Prescription</h2>
            </div>
            {url.endsWith('.pdf') ? (
              <iframe
                src={url}
                width="100%"
                height="500px"
                title="PDF Viewer"
              />
            ) : (
              <ImageZoom src={url} />
            )}

            {/* <ImageZoom src={url} /> */}
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={6} style={{ padding: '10px' }}>
          {!prescription.processed && (
            <Card body style={{ padding: '10px' }}>
              <CreateSale
                shopId={shopId}
                patient={patient}
                prescriptionId={prescriptionId}
                prescription={prescription}
                setFormState={setFormState}
              />
            </Card>
          )}
          {prescription.processed && (
            <Card body style={{ padding: '10px' }}>
              <div><b>Date Ordered: </b>{formatDateTime(prescription.createdAt)}</div>

              {prescription.quoteTime && (<div><b>Date Quoted: </b>{formatDateTime(prescription.quoteTime)}</div>)}

              {prescription.confirmTime && (<div><b>Date Confirmed: </b>{formatDateTime(prescription.confirmTime)}</div>)}

              {prescription.cancellationTime && (<div><b>Date Cancelled: </b>{formatDateTime(prescription.cancellationTime)}</div>)}

              {prescription.endSaleTime && (<div><b>Date Sold: </b>{formatDateTime(prescription.endSaleTime)}</div>)}
              <br />
              {prescription.staff && (<div><b>Staff: </b>{prescription.staff.firstName + " " + prescription.staff.lastName}</div>)}
            </Card>
          )}
        </Grid>
      </Grid>

      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item>
          <Button
            m="2"
            variant="contained"
            disableElevation
            onClick={() => setFormState('list')}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

ViewPrescription.propTypes = {
  prescription: PropTypes.object.isRequired,
  setFormState: PropTypes.func.isRequired,
};
