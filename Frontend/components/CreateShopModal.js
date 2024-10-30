/* eslint-disable no-underscore-dangle */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Modal, Button, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import API from '../utils/api';
import kenyanCounties from '../utils/counties';
import useAuthState from '../stores/auth';
import useSnackbarState from '../stores/snackbar';
import useCurrentShopState from '../stores/currentShop';
import indexDBDexi from '../utils/dexiIndexDB';

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
    maxWidth: '350px',
    position: 'absolute',
    width: 600,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function CreateShopModal({ open, closeModal }) {
  const classes = useStyles();
  const router = useRouter();

  const { setCurrentShop } = useCurrentShopState();

  const { company } = useAuthState();
  const { open: openSnackbar } = useSnackbarState();

  const [modalStyle] = React.useState(getModalStyle);
  const [name, setName] = React.useState('');
  const [county, setCounty] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const close = () => {
    setName('');
    setCounty('');
    setStreet('');
    closeModal();
  };

  const create = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      const data = {
        name,
        physicalAddress: {
          county,
          street,
        },
        companyId: company._id,
        showShop: false,
      };
      const result = await API.post(`shops`, {
        ...data,
      });

      const shopId = result.data._id;

      // update showShop in IndexDB
      await indexDBDexi.showShop.put({ id: shopId, showShop: false });

      setCurrentShop(result.data);

      setIsLoading(false);
      setIsSubmitted(true);
      close();
      router.push(`/shops/${shopId}`);
    } catch (err) {
      setIsLoading(false);
      const { message } = err.response.data;
      openSnackbar('error', message);
    }
  };
  

  return (
    <Modal open={open} onClose={close}>
      <div style={modalStyle} className={classes.paper}>
        <p style={{ textAlign: 'center' }}>
          {isLoading && <CircularProgress />}
        </p>
        <h2>Create Shop</h2>
        <form onSubmit={create}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Pharmacy Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Autocomplete
            disableClearable
            value={county}
            options={kenyanCounties}
            onChange={(event, newValue) => setCounty(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="County" variant="outlined" />
            )}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Pharmacy Estate"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disableElevation
            disabled={isLoading || isSubmitted}
          >
            Create
          </Button>
        </form>
      </div>
    </Modal>
  );
}

CreateShopModal.propTypes = {
  open: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};
