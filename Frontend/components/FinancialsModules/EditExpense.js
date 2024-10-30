import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useCurrentShopState from '../../stores/currentShop';
import { format } from 'date-fns'

export default function EditExpense({ expense, setFormState }) {
    const { currentShop } = useCurrentShopState();
    const shopId = currentShop._id;

    const [accountTo, setAccountTo] = useState(expense?.accountTo || '')
    const [description, setDescription] = useState(expense?.description || '')
    const [amount, setAmount] = useState(expense?.amount || '')
    const [paidTo, setPaidTo] = useState(expense?.paidTo || '')
    const [transactionDate, setTransactionDate] = useState(format(new Date(expense?.transactionDate), 'yyyy-MM-dd') || '')
    const [paymentMode, setPaymentMode] = useState(expense?.paymentMode || [])
    const [receiptImage, setReceiptImage] = useState(expense?.receiptImage || null)

    const { getUserId } = useAuthState()

    const [imageUploaded, setImageUploaded] = React.useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const editExpense = async () => {
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
                // await API.patch(`expenses/${expense._id}`, formData)
                await API.patch(`expenses/${expense._id}`, {
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
            <h3>Edit Expense</h3>
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
                                    <img
                                        src={
                                            imageUploaded
                                                ? URL.createObjectURL(receiptImage)
                                                : receiptImage
                                        }
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
                                onChange={e => {
                                    setReceiptImage(e.target.files[0])
                                    setImageUploaded(true)
                                }}
                            />
                            <label htmlFor="image-input">
                                <Button
                                    disableElevation
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                >
                                    {receiptImage ? ' Change' : ' Upload'} profile image
                                </Button>
                            </label>
                        </Grid> */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="accountTo"
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
                                label="description"
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
                                label="paidTo"
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
                                label="paymentMode"
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
                {/* <Grid item>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disableElevation
                        onClick={() => editExpense()}
                        disabled={loading}
                    >
                        Edit
                    </Button>
                </Grid> */}
            </Grid>
        </div>
    )
}

EditExpense.propTypes = {
    expense: PropTypes.object.isRequired,
    setFormState: PropTypes.func.isRequired,
}
