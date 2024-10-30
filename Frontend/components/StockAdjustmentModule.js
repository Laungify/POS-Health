import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CreateStockAdjustment from './StockAdjustmentModules/CreateStockAdjustment';
import StockAdjustmentsList from './StockAdjustmentModules/StockAdjustmentsList';
import EditStockAdjustment from './StockAdjustmentModules/EditStockAdjustment';

export default function StockAdjustmentModule() {
    const [formState, setFormState] = useState('list');
    const [currentStockAdjustment, setCurrentStockAdjustment] = useState({});

    const edit = (stockAdjustment) => {
        setCurrentStockAdjustment(stockAdjustment);
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
                            New Stock Adjustment
                        </Button>
                    )}
                </Box>
            </Grid>

            {formState === 'create' && <CreateStockAdjustment setFormState={setFormState} />}

            {formState === 'edit' && (
                <EditStockAdjustment stockAdjustment={currentStockAdjustment} setFormState={setFormState} />
            )}

            {formState === 'list' && (
                <StockAdjustmentsList edit={edit} formState={formState} />
            )}
        </div>
    );
}
