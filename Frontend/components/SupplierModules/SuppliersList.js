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

export default function SuppliersList({ edit, formState }) {
    const classes = useStyles();

    const { currentShop } = useCurrentShopState();
    const shopId = currentShop._id;

    const [suppliers, setSuppliers] = useState([]);
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
            const result = await API.get(`shops/${shopId}/suppliers?page=${page}`)

            const items = result.data.data
            const { paging } = result.data

            setSuppliers(items)
            setTotalPages(paging.pages)
            setLoading(false)
        } catch (err) {
            const { message } = err.response.data
            setError(message)
            setLoading(false)
        }
    }

    async function fetchSuppliers() {
        try {
            setLoading(true)
            setError('')
            setSuccess('')
            const result = await API.get(`shops/${shopId}/suppliers?page=${page}&search=${debouncedSearch}`);

            const data = result.data.data;
            const { paging } = result.data;

            setSuppliers(data);
            setTotalPages(paging.pages);
            setLoading(false)
        } catch (err) {
            const { message } = err.response.data;
            setError(message);
            setLoading(false)
        }
    }

    const fetchPage = (event, value) => {
        setPage(value);
    };

    const deleteSupplier = async (supplierId) => {
        try {
            setLoading(true);
            await API.delete(`suppliers/${supplierId}`);
            setLoading(false);
            setSuccess('Successfully deleted supplier');
            fetchSuppliers();
        } catch (err) {
            setLoading(false);
            const { message } = err.response.data;
            setError(message);
        }
    };

    const editSupplier = (supplier) => {
        edit(supplier);
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
        if (debouncedSearch) fetchSuppliers()
        if (formState === 'list') {
            fetchSuppliers();
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
                placeholder="Search by supplier name..."
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
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                                <TableRow key={supplier._id}>
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell>{supplier.email}</TableCell>
                                    <TableCell>{supplier.contact}</TableCell>
                                    <TableCell align="center">
                                        <Button onClick={() => editSupplier(supplier)}>
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

SuppliersList.propTypes = {
    edit: PropTypes.func.isRequired,
    formState: PropTypes.string.isRequired,
};
