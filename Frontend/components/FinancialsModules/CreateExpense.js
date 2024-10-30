import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useCurrentShopState from '../../stores/currentShop';

export default function CreateExpense({ setFormState }) {
    const { currentShop } = useCurrentShopState();
    const shopId = currentShop._id;

    const [accountTo, setAccountTo] = useState('')
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [paidTo, setPaidTo] = useState('')
    const [paymentMode, setPaymentMode] = useState([])
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().substr(0, 10))
    const [receiptImage, setReceiptImage] = useState(null)

    const { getUserId } = useAuthState()


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const CreateExpense = async () => {

        const data = {
            shopId,
            accountTo,
            description,
            amount,
            paidTo,
            paymentMode,
            transactionDate,
            staffId: getUserId()
        }

        if (!description || !shopId || !amount || !paidTo || !paymentMode) {
            setError('All fields are required')
        } else {
            try {
                setLoading(true)
                // const formData = new FormData()
                // formData.append('file', receiptImage)

                // Object.keys(data).forEach(key => {
                //     formData.append(key, data[key])
                // })
                //await API.post(`expenses`, formData)

                await API.post(`expenses`, {
                    ...data,
                });
                setLoading(false)
                setFormState('list')
            } catch (err) {
                setLoading(false)
                const { message } = err.response.data
                setError(message)
            }
        }
    }

    const paymentModeOptions = ['mpesa', 'cash', 'cheque', 'credit', 'bank transfer']

    const handleChangePaymentMode = e => {
        setPaymentMode(e.target.value)
    }


    return (
        <div>
            <h3>New Expense</h3>
            {error && (
                <Alert severity="error" variant="outlined">
                    {error}
                </Alert>
            )}
            <Card style={{ padding: '10px' }}>
                <form>
                    <Grid container spacing={2}>
                        {/* <Grid item xs={12}>
                            {receiptImage && (
                                <div>
                                    <p>Selected Image:</p>
                                    <img
                                        src={URL.createObjectURL(receiptImage)}
                                        alt="Selected"
                                        width="200"
                                    />
                                </div>
                            )}
                            <input
                                name="file"
                                accept="image/*"
                                id="image-input"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={e => setReceiptImage(e.target.files[0])}
                            />
                            <label htmlFor="image-input">
                                <Button
                                    disableElevation
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                >
                                    {receiptImage ? 'Change' : 'Upload'} Image
                                </Button>
                            </label>
                        </Grid> */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                //required
                                fullWidth
                                label="Account To"
                                value={accountTo}
                                onChange={e => setAccountTo(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Paid To"
                                value={paidTo}
                                onChange={e => setPaidTo(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Transaction Date"
                                type="date"
                                value={transactionDate}
                                InputLabelProps={{ shrink: true }}
                                onChange={e => setTransactionDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Payment Mode"
                                select
                                SelectProps={{
                                    multiple: true, // Enable multi-select
                                    value: paymentMode,
                                    onChange: handleChangePaymentMode,
                                    renderValue: selected => selected.join(', '), // Display selected values
                                }}
                            >
                                {paymentModeOptions.map(option => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
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
                        onClick={() => CreateExpense()}
                        disabled={loading}
                    >
                        Add
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}

CreateExpense.propTypes = {
    shopId: PropTypes.string.isRequired,
    setFormState: PropTypes.func.isRequired,
}
