import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CreateExpense from './FinancialsModules/CreateExpense';
import ExpensesList from './FinancialsModules/ExpensesList';
import EditExpense from './FinancialsModules/EditExpense';

export default function FinancialModule() {
    const [formState, setFormState] = useState('list');
    const [currentExpense, setCurrentExpense] = useState({});

    const edit = (expense) => {
        setCurrentExpense(expense);
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
                            New Expense
                        </Button>
                    )}
                </Box>
            </Grid>

            {formState === 'create' && <CreateExpense setFormState={setFormState} />}

            {formState === 'edit' && (
                <EditExpense expense={currentExpense} setFormState={setFormState} />
            )}

            {formState === 'list' && (
                <ExpensesList edit={edit} formState={formState} />
            )}
        </div>
    );
}
