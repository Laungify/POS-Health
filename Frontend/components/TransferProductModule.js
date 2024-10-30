/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import PropTypes from 'prop-types';
import CreateTransfer from './TransferProductModules/CreateTransfer';
import TransferList from './TransferProductModules/TransferList';

export default function PurchaseOrderModule() {
  const [formState, setFormState] = useState('list');

  return (
    <div>
      <Grid container justifyContent="flex-end">
        <Box my={1}>
          {formState === 'list' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setFormState('create')}
            >
              New Transfer
            </Button>
          )}
        </Box>
      </Grid>

      {formState === 'create' && <CreateTransfer setFormState={setFormState} />}

      {formState === 'list' && <TransferList formState={formState} />}
    </div>
  );
}

CreateTransfer.propTypes = {
  setFormState: PropTypes.func.isRequired,
};

TransferList.propTypes = {
  formState: PropTypes.string.isRequired,
};
