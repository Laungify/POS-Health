/* eslint-disable no-underscore-dangle */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button, Modal } from '@material-ui/core';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Autocomplete from '@material-ui/lab/Autocomplete';
import API from '../utils/api';
import kenyanCounties from '../utils/counties';
import useAuthState from '../stores/auth';
import useSnackbarState from '../stores/snackbar';

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

export default function EditShopModal({ open, closeModal, shop }) {
  const classes = useStyles();
  const router = useRouter();

  const { company } = useAuthState();
  const { open: openSnackbar } = useSnackbarState();

  const [modalStyle] = React.useState(getModalStyle);
  const [name, setName] = useState('');
  const [county, setCounty] = useState('');
  const [street, setStreet] = useState('');

  const [loading, setLoading] = React.useState(false);

  const shopId = shop._id;

  const edit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const data = {
        name,
        physicalAddress: {
          county,
          street,
        },
        companyId: company._id,
      };

      await API.patch(`shops/${shopId}`, {
        ...data,
      });

      setLoading(false);
      closeModal();
      router.push(`/`);
      openSnackbar('success', 'success');
    } catch (err) {
      setLoading(false);
      const { message } = err.response.data;
      openSnackbar('error', message);
    }
  };

  React.useEffect(() => {
    if (shop) {
      setName(shop.name || '');
      setCounty(shop?.physicalAddress?.county || '');
      setStreet(shop?.physicalAddress?.street || '');
    }
  }, [shop]);

  return (
    <Modal open={open} onClose={closeModal}>
      <div style={modalStyle} className={classes.paper}>
        <h2>Edit Shop</h2>
        <form onSubmit={edit}>
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
            disabled={loading}
          >
            Edit
          </Button>
        </form>
      </div>
    </Modal>
  );
}

EditShopModal.propTypes = {
  open: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  shop: PropTypes.object.isRequired,
};
