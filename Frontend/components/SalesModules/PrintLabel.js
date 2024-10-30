import React from 'react';
import PropTypes from 'prop-types';
import { formatDateTime } from '../../utils/helpers';
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

const useStyles = makeStyles(() => ({
  card: {
    padding: '20px',
    margin: '20px',
    width: '100%',
    maxWidth: '600px',
    border: '1px solid #ddd',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  table: {
    minWidth: 350,
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
  labelText: {
    height: '100px',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '16px',
  },
  smallText: {
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '10px',
  },
}));

const PrintLabel = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const { sale } = props;

  return sale.products.map((item) => (
    <Grid
      container
      spacing={1}
      direction="column"
      justifyContent="center"
      alignItems="center"
      ref={ref}
      key={item._id}
      style={{ overflow: 'auto' }}
    >
      <Card className={classes.card}>
        <Grid item xs={12} className={classes.header}>
          <Typography variant="h6">Drug Label</Typography>
          <Typography variant="body2">
            Date: {formatDateTime(sale.createdAt)}
          </Typography>
          <Typography variant="body2">
            {sale.shop.name} Pharmacy
          </Typography>
          <Typography variant="body2">
            Patient Name: {`${sale.patientName || ''}`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table className={classes.table}>
              <TableHead className={classes.tableHeader}>
                <TableRow>
                  <TableCell className={classes.tableCell}>Drug Name</TableCell>
                  <TableCell className={classes.tableCell}>Strength</TableCell>
                  <TableCell className={classes.tableCell}>Formulation</TableCell>
                  <TableCell className={classes.tableCell}>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className={classes.tableCell}>{item.productName}</TableCell>
                  <TableCell className={classes.tableCell}>{item.strength || 'N/A'}</TableCell>
                  <TableCell className={classes.tableCell}>{item.formulation || 'N/A'}</TableCell>
                  <TableCell className={classes.tableCell}>{item.quantity}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className={classes.labelText}>
                    {item.comment || 'No comments'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography className={classes.smallText}>
            Thank You
          </Typography>
        </Grid>
      </Card>
    </Grid>
  ));
});

PrintLabel.displayName = 'PrintLabel';

PrintLabel.propTypes = {
  sale: PropTypes.object.isRequired,
};

export default PrintLabel;
