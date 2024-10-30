import React from 'react'
import PropTypes from 'prop-types'
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
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

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
  tableCellRight: {
    textAlign: 'right',
    padding: '8px',
    fontSize: '14px',
  },
  boldText: {
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '12px',
  },
  signatureContainer: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signatureBox: {
    borderTop: '1px solid #000',
    paddingTop: '5px',
    textAlign: 'center',
    fontSize: '14px',
  },
}))

const PrintQuotation = React.forwardRef((props, ref) => {
  const classes = useStyles()
  const { products = [], watchedProduct = [] } = props;
  const currentDate = new Date().toLocaleDateString();

  // Function to convert date format with ordinal suffix
  const dateConverter = (expiryDate) => {
    if (!expiryDate) return '';
    const date = new Date(expiryDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const day = date.getDate();
    const suffix = day => {
      if (day >= 11 && day <= 13) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    return formattedDate.replace(day, day + suffix(day));
  }

  const totalCostPayable = watchedProduct.reduce(
    (total, item, i) => total + (item.sellingPrice || 0) * (item.quantity || 0),
    0
  );

  return (
    <Grid container direction="column" justifyContent="center" alignItems="center" ref={ref}>
      <Card className={classes.card}>
        {products.length > 0 && (
          <Grid item xs={12} className={classes.header}>
            <Typography variant="h6">Quotation</Typography>

            <Typography variant="h6">{products[0]?.shop?.name || 'Shop Name'}</Typography>
            <Typography variant="body2">{products[0]?.shop?.physicalAddress?.county || 'County'} - {products[0]?.shop?.physicalAddress?.street || 'Street'}</Typography>
          </Grid>
        )}

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" className={classes.boldText}>Sale Type:</Typography>
            <Typography variant="body2">Quick Sale</Typography>
          </Grid>
          <Grid item xs={6} className={classes.textAlignRight}>
            <Typography variant="body2" className={classes.boldText}>Invoice No:</Typography>
            <Typography variant="body2">RNO: {Math.floor(Math.random() * 1000000000)}</Typography>
            <Typography variant="body2" className={classes.boldText}>Invoice Date:</Typography>
            <Typography variant="body2">{currentDate}</Typography>
          </Grid>
        </Grid>

        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell className={classes.tableCell}>Description</TableCell>
                <TableCell className={classes.tableCell}>Quantity</TableCell>
                <TableCell className={classes.tableCell}>Batch No</TableCell>
                <TableCell className={classes.tableCell}>Expiry</TableCell>
                <TableCell className={classes.tableCell}>Price</TableCell>
                <TableCell className={classes.tableCell}>Discount</TableCell>
                <TableCell className={classes.tableCell}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((item, i) => (
                <TableRow key={item._id}>
                  <TableCell className={classes.tableCell}>{item.productName || 'Product Name'}</TableCell>
                  <TableCell className={classes.tableCell}>{watchedProduct[i]?.quantity || '0'}</TableCell>
                  <TableCell className={classes.tableCell}>{item.batchNumber || 'Batch Number'}</TableCell>
                  <TableCell className={classes.tableCell}>{dateConverter(item.expiry)}</TableCell>
                  <TableCell className={classes.tableCellRight}>
                    {watchedProduct[i]?.sellingPrice || '0.00'}
                  </TableCell>
                  <TableCell className={classes.tableCell}>{watchedProduct[i]?.discount || '0.00'}</TableCell>
                  <TableCell className={classes.tableCellRight}>
                    {(watchedProduct[i]?.sellingPrice || 0) * (watchedProduct[i]?.quantity || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

         <Grid container className={classes.totalCostContainer}>
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.boldText}>
              Total Cost Payable: {totalCostPayable}
            </Typography>
          </Grid>
        </Grid>

        {products.length > 0 && (
          <Grid container className={classes.signatureContainer}>
            <Grid item xs={6}>
              <Typography variant="body2">Prepared By: {products[0].staff?.fullName || 'Staff Name'}</Typography>
              <Typography variant="body2">Phone Number: {products[0].staff?.phoneNumber || 'Phone Number'}</Typography>
              <Typography variant="body2">Goods Delivered By: {products[0].supplier || 'Supplier'}</Typography>
            </Grid>
            <Grid item xs={6} className={classes.signatureBox}>
              <Typography variant="body2">Signature:</Typography>
            </Grid>
          </Grid>
        )}

        <Typography className={classes.footerText}>
          Thank you for your business!
        </Typography>
      </Card>
    </Grid>
  )
})

PrintQuotation.displayName = 'PrintQuotation'

PrintQuotation.propTypes = {
  products: PropTypes.array,
  watchedProduct: PropTypes.array,
  index: PropTypes.any
}

export default PrintQuotation