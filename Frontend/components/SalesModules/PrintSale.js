/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-underscore-dangle */
import { Button, Grid } from '@material-ui/core';
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import html2canvas from 'html2canvas'; // Import html2canvas
import PrintReceipt from './PrintReceipt';
import PrintInvoice from './PrintInvoice'
import PrintLabel from './PrintLabel';

export default function PrintSale({ sale, setFormState }) {
  const receiptRef = useRef();
  const labelRef = useRef();

  const handleDownload = (elementRef, fileName) => {
    html2canvas(elementRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${fileName}.png`;
      link.click();
    });
  };

  return (
    <>
      <h3>Print Invoice/Receipt/Label</h3>

      {/* Receipt Section */}
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <PrintInvoice sale={sale} ref={receiptRef} />
        </Grid>
        <Grid item>
          <ReactToPrint
            content={() => receiptRef.current}
            trigger={() => (
              <Button variant="contained" color="primary" disableElevation>
                Print
              </Button>
            )}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => handleDownload(receiptRef, 'Receipt')}
          >
            DOWNLOAD
          </Button>
        </Grid>
      </Grid>

      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <PrintReceipt sale={sale} ref={receiptRef} />
        </Grid>
        <Grid item>
          <ReactToPrint
            content={() => receiptRef.current}
            trigger={() => (
              <Button variant="contained" color="primary" disableElevation>
                Print
              </Button>
            )}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => handleDownload(receiptRef, 'Receipt')}
          >
            DOWNLOAD
          </Button>
        </Grid>
      </Grid>



      {/* Label Section */}
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <PrintLabel sale={sale} ref={labelRef} />
        </Grid>
        <Grid item>
          <ReactToPrint
            content={() => labelRef.current}
            trigger={() => (
              <Button variant="contained" color="primary" disableElevation>
                Print
              </Button>
            )}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => handleDownload(labelRef, 'Label')}
          >
            Download Label
          </Button>
        </Grid>
      </Grid>

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
          >
            Back
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

PrintSale.propTypes = {
  sale: PropTypes.object.isRequired,
  setFormState: PropTypes.func.isRequired,
};
