/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Modal, Button, TextField } from '@material-ui/core';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import API from '../utils/api';
import CircularProgress from '@mui/material/CircularProgress';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    maxWidth: '300px',
    position: 'absolute',
    width: 600,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function ForgotPasswordModal({ open, closeModal }) {
  //console.log("props", closeModal)
  const classes = useStyles();
  const router = useRouter();

  const [modalStyle] = React.useState(getModalStyle);
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [success, setSuccess] = useState("")

  const close = () => {
    setEmail('');
    closeModal();
  };

  const handleForgotPassword = async () => {

    setError("")
    setSuccess("")
    if (!email) {
      return setError("Email is required")
    } else {
      try {
        setIsLoading(true)
        const result = await API.post(
          `staff/request-password-reset/`,
          {
            email,
          }
        )

        setIsLoading(false)
        setSuccess(result.data.message)
        //setTimeout(closeModal(), 3000)
        setIsSubmitted(true)
      } catch (error) {
        setIsLoading(false)
        const message = error.response.data.message
        setError(message)
      }
    }
  }

  return (
    <Modal open={open} onClose={close}>
      <div style={{ marginTop: '1rem', marginLeft: '1rem' }} className={classes.paper}>
        <h2>Reset Password</h2>
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        <p style={{ color: "green", textAlign: "center" }}>{success}</p>
        <p style={{ color: "green", textAlign: "center" }}>{isLoading && <CircularProgress />}</p>
        <form>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </form>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disableElevation
          disabled={!email || isLoading || isSubmitted}
          onClick={() => handleForgotPassword()}
        >
          Submit
        </Button>
      </div>
    </Modal>
  );
}

ForgotPasswordModal.propTypes = {
  open: PropTypes.bool,
  closeModal: PropTypes.func.isRequired,
};
