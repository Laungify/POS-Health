/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import WarningIcon from '@material-ui/icons/Warning';

const useStyles = makeStyles((theme) => ({
  warningDialogTitle: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.common.white,
  },
}));

export default function ConfirmDialog({ open, onClose, title, onConfirm }) {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.warningDialogTitle}>
        <Grid container direction="row">
          <WarningIcon style={{ marginTop: '2px' }} />
          <span>Warning</span>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{title}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disableElevation>
          Cancel
        </Button>
        <Button
          disableElevation
          onClick={() => {
            onClose();
            onConfirm();
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
