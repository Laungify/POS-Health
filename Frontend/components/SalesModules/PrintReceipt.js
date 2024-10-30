import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  Table,
  TableHead,
  TableContainer,
  TableCell,
  TableRow,
  TableBody,
  Paper,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CustomStamp from '../CustomStamp';
import QRCode from "react-qr-code";


const containerStyle = {
  width: '30%',
  maxWidth: '150px',
  margin: '0 auto',
  height: 'auto',
  // Mobile responsiveness
  '@media (max-width: 600px)': {
    width: '50%',
    maxWidth: '100px', 
  },
};

const useStyles = makeStyles(() => ({
  table: {
    minWidth: 650,
  },
  card: {
    padding: '20px',
    width: '100%',
    maxWidth: '800px',
    border: '1px solid #ddd',
    marginTop: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  textAlignRight: {
    textAlign: 'right',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  tableCell: {
    padding: '8px',
    fontSize: '14px',
  },
  boldText: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  totalSection: {
    flex: 1,
    textAlign: 'right',
  },
  paidSection: {
    flex: 1,
    textAlign: 'left',
  },
  stamp: {
    marginTop: '10px',
    padding: '5px',
    border: '1px solid #000',
    display: 'inline-block',
    textAlign: 'center',
    width: '100%',
  },
  signatureBox: {
    borderTop: '1px solid #000',
    paddingTop: '5px',
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '20px', // Adjusted margin to create more space
  },
  smallText: {
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '10px',
  },
  paidText: {
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'red',
    marginTop: '10px',
  },
}));

const PrintReceipt = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const { sale } = props;

  const currentDate = new Date().toLocaleDateString();

  const saleProducts = sale.products || [];
  const discount = sale?.discount || {};
  const total = saleProducts
    .map(item => parseFloat(item.sellingPrice) * parseFloat(item.quantity))
    .reduce((a, b) => a + b, 0);

  let discountAmount = 0;
  let discountText = '';
  if (discount.type === 'Percentage') {
    discountAmount = total * (parseFloat(discount.value) / 100);
    discountText = `- ${discountAmount.toFixed(2)} KES`;
  } else if (discount.type === 'Amount') {
    discountAmount = parseFloat(discount.value);
    discountText = `- ${discountAmount.toFixed(2)} KES`;
  } else if (discount.type === 'Price Override') {
    discountAmount = total - parseFloat(discount.value);
    discountText = `- ${discountAmount.toFixed(2)} KES`;
  }

  const isFullyPaid = sale?.bill?.received >= sale.salesPrice;

  return (
    <Grid key='container' container direction="column" justifyContent="center" alignItems="center" ref={ref}>
      <Card className={classes.card}>
        <Grid item xs={12} className={classes.header}>
          <h3>RECEIPT</h3>
          <Typography variant="h6">{sale.shop.name || 'Shop Name'} pharmacy</Typography>
          <Typography variant="body2">
            {`${sale.shop.physicalAddress?.street || 'Street Name'}, ${sale.shop.physicalAddress?.county || 'County Name'}`}
          </Typography>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" className={classes.boldText}>Sale Type: {sale.saleType || 'Sale Type'}</Typography>
            <Typography variant="body2">Patient Name: {` ${sale?.patientName || ''} ${sale?.patient?.firstName || ''} ${sale?.patient?.lastName || ''
              }`}</Typography>

          </Grid>
          <Grid item xs={6} className={classes.textAlignRight}>
            <Typography variant="body2" className={classes.boldText}>Invoice No:</Typography>
            <Typography variant="body2">{sale._id}</Typography>
            <Typography variant="body2" className={classes.boldText}>Invoice Date:</Typography>
            <Typography variant="body2">{new Date(sale.createdAt).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>

        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell className={classes.tableCell}>Description</TableCell>
                <TableCell className={classes.tableCell}>Quantity</TableCell>
                <TableCell className={classes.tableCell}>Unit Price</TableCell>
                <TableCell className={classes.tableCell}>Total</TableCell>
                <TableCell className={classes.tableCell}>VAT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sale.products.map(item => (
                <TableRow key={item._id.$oid}>
                  <TableCell className={classes.tableCell}>
                    {item.productName}{' '}
                    {item.strength?.replace('not applicable', '')}{' '}
                    {item.formulation?.replace('not applicable', '')}
                  </TableCell>
                  <TableCell className={classes.tableCell}>{item.quantity}</TableCell>
                  <TableCell className={classes.tableCell}>{item.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className={classes.tableCell}>{item.totalProductPrice.toFixed(2)}</TableCell>
                  <TableCell className={classes.tableCell}>
                    {item.vat ? (0.16 * item.sellingPrice * item.quantity).toFixed(2) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Grid container className={classes.totalContainer}>
          <Grid item xs={4} className={classes.paidSection}>
            <Typography variant="body2">Goods Delivered By: {sale.deliveredBy || 'N/A'}</Typography>
            <Typography variant="body2">Goods Removed By: {sale.removedBy || 'N/A'}</Typography>
            <div className={classes.signatureBox}>
              <Typography variant="body2">Signature:</Typography>
            </div>
          </Grid>

          {/* Total Section */}
          <Grid item xs={8} className={classes.totalSection}>
            <Typography variant="body2" className={classes.boldText}>Total Due:</Typography>
            <Typography variant="body2">{sale.salesPrice.toFixed(2)} KES</Typography>
            <Typography variant="body2" style={{ color: 'green' }}>Discount: {discountText}</Typography>
            <Typography variant="body2">Amount Paid: {sale?.bill?.received || '0'} KES</Typography>
            <Typography variant="body2">Change: {sale?.bill?.change || '0'} KES</Typography>
          </Grid>
        </Grid>

        {isFullyPaid && (
          <>
            <Typography className={classes.paidText}>PAID</Typography>
            <div style={containerStyle}>
              <QRCode value={`Invoice No: ${sale._id}, Amount: ${sale.salesPrice.toFixed(2)} KES`} size={128} />
            </div>
          </>
        )}
        <Typography className={classes.smallText}>
          Thank you for your business!
        </Typography>
      </Card>
    </Grid>
  );
});

PrintReceipt.displayName = 'PrintInvoice';

PrintReceipt.propTypes = {
  sale: PropTypes.object.isRequired,
};

export default PrintReceipt;
