/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Table,
    TableHead,
    Button,
    TableContainer,
    TableCell,
    TableRow,
    TableBody,
    Paper,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { Alert } from '@material-ui/lab';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';
import SearchBar from 'material-ui-search-bar'
import { formatDateTime } from '../../utils/helpers'
import { formatDate } from '../../utils/helpers'

const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 650,
    },
    divMargin: {
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export default function ExpenseList({ edit, formState }) {
    const classes = useStyles();

    const { currentShop } = useCurrentShopState();
    const shopId = currentShop._id;

    const [expenses, setExpenses] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('')

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function useDebounce(value, delay) {
        const [debouncedValue, setDebouncedValue] = useState(value)

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value)
            }, delay)

            return () => {
                clearTimeout(handler)
            }
        }, [value, delay])

        return debouncedValue
    }

    const debouncedSearch = useDebounce(searchQuery, 500)

    async function clearSearch() {
        try {
            setLoading(true)
            setError('')
            setSuccess('')
            const result = await API.get(`shops/${shopId}/expenses?page=${page}`)

            const items = result.data.data
            const { paging } = result.data

            setExpenses(items)
            setTotalPages(paging.pages)
            setLoading(false)
        } catch (err) {
            const { message } = err.response.data
            setLoading(false)
            setError(message)
        }
    }

    async function fetchExpenses() {
        try {
            setLoading(true)
            setError('')
            setSuccess('')
            const result = await API.get(`shops/${shopId}/expenses?page=${page}&search=${debouncedSearch}`);

            const data = result.data.data;
            const { paging } = result.data;

            setExpenses(data);
            setTotalPages(paging.pages);
            setLoading(false)
        } catch (err) {
            const { message } = err.response.data;
            setLoading(false)
            setError(message);
        }
    }

    const fetchPage = (event, value) => {
        setPage(value);
    };

    const deleteExpense = async (expenseId) => {
        try {
            setLoading(true);
            await API.delete(`expenses/${expenseId}`);
            setLoading(false);
            setSuccess('Successfully deleted expense');
            fetchExpenses();
        } catch (err) {
            setLoading(false);
            const { message } = err.response.data;
            setError(message);
        }
    };

    const editExpense = (expense) => {
        edit(expense);
    };

    useEffect(() => {
        if (error) {
            setSuccess('');
        }
        if (success) {
            setSuccess('');
        }
    }, [error, success]);

    useEffect(() => {
        if (debouncedSearch) fetchExpenses()
        if (formState === 'list') {
            fetchExpenses();
        }
    }, [shopId, formState, debouncedSearch, page]);

    return (
        <div>
            {error && (
                <Alert severity="error" variant="outlined">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" variant="outlined">
                    {success}
                </Alert>
            )}
            <SearchBar
                style={{ marginBottom: '10px' }}
                placeholder="Search by Expense by description or paid to."
                value={searchQuery}
                onChange={newValue => {
                    setSearchQuery(newValue)
                }}
                onCancelSearch={() => {
                    setSearchQuery('')
                    clearSearch()
                }}
            />
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Account To</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Paid To</TableCell>
                            <TableCell>Payment Mode</TableCell>
                            <TableCell>Transaction Date</TableCell>
                            <TableCell>Staff</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <TableRow key={expense._id}>
                                    <TableCell>{formatDateTime(expense.createdAt)}</TableCell>
                                    <TableCell>{expense.accountTo}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>{expense.amount}</TableCell>
                                    <TableCell>{expense.paidTo}</TableCell>
                                    <TableCell>{expense.paymentMode}</TableCell>
                                    <TableCell>{formatDate(expense.transactionDate)}</TableCell>
                                    <TableCell>{expense.staff.fullName}</TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => editExpense(expense)}>
                                            <EditIcon />
                                        </Button>
                                        {/* <Button onClick={() => deleteReceipt(receipt._id)}>
                      <DeleteIcon />
                    </Button> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    {loading ? "loading..." : "No data found"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div
                    style={{
                        justifyContent: 'center',
                        display: 'flex',
                        margin: '10px',
                    }}
                >
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={fetchPage}
                        color="primary"
                        shape="rounded"
                    />
                </div>
            </TableContainer>
        </div>
    );
}

ExpenseList.propTypes = {
    edit: PropTypes.func.isRequired,
    formState: PropTypes.string.isRequired,
};
