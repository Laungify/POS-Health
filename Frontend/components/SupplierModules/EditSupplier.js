import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useCurrentShopState from '../../stores/currentShop';

export default function EditSuppliers({ supplier, setFormState }) {
    const { currentShop } = useCurrentShopState();
    const shopId = currentShop._id;

    const [name, setName] = useState(supplier?.name || '')
    const [email, setEmail] = useState(supplier?.email || '')
    const [contact, setContact] = useState(supplier?.contact || '')

    const { getUserId } = useAuthState()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const editSupplier = async () => {
        const data = {
            name,
            shopId,
            email,
            contact,
            staffId: getUserId()
        }

        if (!name || !contact || !shopId) {
            setError('All fields are required')
        } else {
            try {
                setLoading(true)

                await API.patch(`suppliers/${supplier._id}`, {
                    ...data,
                })
                setLoading(false)
                setFormState('list')
            } catch (err) {
                setLoading(false)
                const { message } = err.response.data
                setError(message)
            }
        }
    }

    return (
        <div>
            <h3>Edit Supplier</h3>
            {error && (
                <Alert severity="error" variant="outlined">
                    {error}
                </Alert>
            )}
            <Card style={{ padding: '10px' }}>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Contact"
                                value={contact}
                                onChange={e => setContact(e.target.value)}
                                type="number"
                            />
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
                        onClick={() => editSupplier()}
                        disabled={loading}
                    >
                        Edit
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}

EditSuppliers.propTypes = {
    supplier: PropTypes.object.isRequired,
    setFormState: PropTypes.func.isRequired,
}
