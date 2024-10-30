import React from 'react';
import QRCode from 'qrcode.react';
import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  stampContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '2px solid #000',
    padding: '10px',
    width: '100px',
    margin: '10px auto 0 auto', // margin adjustment for positioning
  },
  qrcode: {
    marginBottom: '10px',
  },
  paidText: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: 'red',
  },
}));

export default function CustomStamp ({ shopName }){
  const classes = useStyles();
  
  return (
    <Box className={classes.stampContainer}>
      <QRCode className={classes.qrcode} value={shopName} size={50} />
      <Typography className={classes.paidText}>PAID</Typography>
    </Box>
  );
};

