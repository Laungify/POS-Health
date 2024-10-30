import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { makeStyles } from '@material-ui/core/styles';
import useSnackbarState from '../../stores/snackbar';

const useStyles = makeStyles((theme) => ({
  success: {
    backgroundColor: theme.palette.success.main,
  },
  error: {
    backgroundColor: theme.palette.error.main,
  },
}));

function SnackbarNotification() {
  const classes = useStyles();
  const { status, message, variant, close } = useSnackbarState();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={status}
      autoHideDuration={3000}
      onClose={close}
    >
      <SnackbarContent className={classes[variant]} message={message} />
    </Snackbar>
  );
}

export default SnackbarNotification;
