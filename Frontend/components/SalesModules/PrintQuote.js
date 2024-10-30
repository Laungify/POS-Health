import { Button, Grid } from '@material-ui/core';
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import html2canvas from 'html2canvas';
import PrintQuotation from './PrintQuotation'

export default function PrintSale({ product, setFormState }) {
  const quotationRef = useRef(); 

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
      <h3>Print Receipt/Label/Invoice/Quotation</h3>

      {/* Invoice Section */}
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12}>
          <PrintQuotation product={product} ref={quotationRef} />
        </Grid>
        <Grid item>
          <ReactToPrint
            content={() => quotationRef.current}
            trigger={() => (
              <Button variant="contained" color="primary" disableElevation>
                Print Invoice
              </Button>
            )}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => handleDownload(quotationRef, 'Quote')}
          >
            Download Invoice
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

PrintSale.propTypes = {
  product: PropTypes.object.isRequired,
  setFormState: PropTypes.func.isRequired,
};
