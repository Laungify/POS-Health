import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  TextField, // Import TextField
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
import WarningIcon from '@material-ui/icons/Warning'

const useStyles = makeStyles(theme => ({
  warningDialogTitle: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.common.white,
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
}))

export default function ConfirmDialog({ open, onClose, title, onConfirm }) {
  const classes = useStyles()
  const [cancellationReason, setCancellationReason] = useState('')

  const handleConfirm = () => {
    onConfirm(cancellationReason)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className={classes.warningDialogTitle}>
        <Grid container direction="row" alignItems="center">
          <WarningIcon style={{ marginTop: '2px' }} />
          <span>Warning</span>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{title}</DialogContentText>
        <TextField
          label="Cancellation Reason"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          className={classes.textField}
          value={cancellationReason}
          onChange={e => setCancellationReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disableElevation>
          Cancel
        </Button>
        <Button
          disableElevation
          onClick={handleConfirm}
          color="secondary"
          variant="contained"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
}
