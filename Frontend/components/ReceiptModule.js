import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CreateReceipt from './ReceiptModules/CreateReceipt';
import ReceiptsList from './ReceiptModules/ReceiptsList';
import EditReceipt from './ReceiptModules/EditReceipt';

export default function ReceiptModule() {
  const [formState, setFormState] = useState('list');
  const [currentReceipt, setCurrentReceipt] = useState({});

  const edit = (receipt) => {
    setCurrentReceipt(receipt);
    setFormState('edit');
  };

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
              New Receipt
            </Button>
          )}
        </Box>
      </Grid>

      {formState === 'create' && <CreateReceipt setFormState={setFormState} />}

      {formState === 'edit' && (
        <EditReceipt receipt={currentReceipt} setFormState={setFormState} />
      )}

      {formState === 'list' && (
        <ReceiptsList edit={edit} formState={formState} />
      )}
    </div>
  );
}
