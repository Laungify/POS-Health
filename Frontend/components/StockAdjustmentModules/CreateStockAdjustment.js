/* eslint-disable no-underscore-dangle */
import { TextField, Button, Grid, Card } from '@material-ui/core';
import { Alert, Autocomplete } from '@material-ui/lab';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import useCurrentShopState from '../../stores/currentShop';
import useAuthState from '../../stores/auth'

export default function CreateStockAdjustments({ setFormState }) {
    const { currentShop } = useCurrentShopState();
    const shopId = currentShop._id;

    const { getUserId } = useAuthState()

    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState({});
    const [storeQuantity, setStoreQuantity] = useState(0);
    const [reason, setReason] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const CreateStockAdjustment = async () => {
        const stockAdjustment = {
            productId: product._id,
            storeQuantity: parseFloat(storeQuantity),
            shopId,
            reason,
            staffId: getUserId()
        };

        if (!product._id || !storeQuantity || !reason) {
            setError('Missing required fields');
        } else {
            try {
                setLoading(true);
                await API.post(`stockAdjustments`, {
                    ...stockAdjustment,
                });
                setLoading(false);
                setFormState('list');
            } catch (err) {
                setLoading(false);
                const { message } = err.response.data;
                setError(message);
            }
        }
    };

    useEffect(() => {
        API.get(`shops/${shopId}/products`)
            .then((result) => {
                const items = result.data.data;
                setProducts(items);
            })
            .catch((err) => {
                const { message } = err.response.data;
                setError(message);
            });
    }, [shopId]);

    return (
        <div>
            {error && (
                <Alert severity="error" variant="outlined">
                    {error}
                </Alert>
            )}
            <h3>New StockAdjustment</h3>
            <Card style={{ padding: '10px' }}>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                disableClearable
                                value={product}
                                options={products}
                                onChange={(event, newValue) => {
                                    setProduct(newValue);
                                }}
                                getOptionLabel={(option) => option.customBrandName || ''}
                                getOptionSelected={(option, value) =>
                                    option._id === value._id || {}
                                }
                                renderInput={(params) => (
                                    <TextField
                                        autoFocus
                                        {...params}
                                        label="Product"
                                        variant="outlined"
                                        margin="normal"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Quantity"
                                value={storeQuantity}
                                type="number"
                                onChange={(e) => setStoreQuantity(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <h4>Current Quantity: {product.storeQuantity}</h4>
                            <h4>Unit: {product.unit}</h4>
                            <h4>Current Cost Per Unit: {product.costPrice}</h4>
                        </Grid>
                    </Grid>
                </form>
            </Card>
            <Grid
                container
                justifyContent="flex-end"
                spacing={2}
                style={{ marginTop: '10px' }}
            >
                <Grid item>
                    <Button
                        m="2"
                        variant="contained"
                        disableElevation
                        onClick={() => setFormState('list')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => CreateStockAdjustment()}
                        disabled={loading}
                    >
                        Create
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
}

CreateStockAdjustments.propTypes = {
    setFormState: PropTypes.func.isRequired,
};
