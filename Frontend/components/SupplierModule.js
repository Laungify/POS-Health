import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CreateSupplier from './SupplierModules/CreateSupplier';
import SuppliersList from './SupplierModules/SuppliersList';
import EditSupplier from './SupplierModules/EditSupplier';

export default function SupplierModule() {
    const [formState, setFormState] = useState('list');
    const [currentSupplier, setCurrentSupplier] = useState({});

    const edit = (supplier) => {
        setCurrentSupplier(supplier);
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
                            New Supplier
                        </Button>
                    )}
                </Box>
            </Grid>

            {formState === 'create' && <CreateSupplier setFormState={setFormState} />}

            {formState === 'edit' && (
                <EditSupplier supplier={currentSupplier} setFormState={setFormState} />
            )}

            {formState === 'list' && (
                <SuppliersList edit={edit} formState={formState} />
            )}
        </div>
    );
}
