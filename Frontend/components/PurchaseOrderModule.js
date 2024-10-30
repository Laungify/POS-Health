import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CreatePurchaseOrder from './PurchaseOrderModules/CreatePurchaseOrder';
import PurchaseOrderList from './PurchaseOrderModules/PurchaseOrderList';
import EditPurchaseOrder from './PurchaseOrderModules/EditPurchaseOrder';

export default function PurchaseOrderModule() {
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState({});

  const [formState, setFormState] = useState('list');

  const edit = (purchaseOrder) => {
    setCurrentPurchaseOrder(purchaseOrder);
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
              New Purchase
            </Button>
          )}
        </Box>
      </Grid>

      {formState === 'create' && (
        <CreatePurchaseOrder setFormState={setFormState} />
      )}

      {formState === 'edit' && (
        <EditPurchaseOrder
          order={currentPurchaseOrder}
          setFormState={setFormState}
        />
      )}

      {formState === 'list' && (
        <PurchaseOrderList edit={edit} formState={formState} />
      )}
    </div>
  );
}
