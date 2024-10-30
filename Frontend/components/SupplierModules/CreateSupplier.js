import { TextField, Button, Grid, Card, MenuItem } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import API from '../../utils/api'
import useAuthState from '../../stores/auth'
import useCurrentShopState from '../../stores/currentShop';

export default function CreateSuppliers({ setFormState }) {
    const { currentShop } = useCurrentShopState();
    const shopId = currentShop._id;

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [contact, setContact] = useState('')

    const { getUserId } = useAuthState()


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const CreateSupplier = async () => {
        const data = {
            shopId,
            name,
            email,
            contact,
            staffId: getUserId()
        }

        if (!name || !contact || !shopId) {
            setError('All fields are required')
        } else {
            try {
                setLoading(true)

                await API.post(`suppliers`, {
                    ...data
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
            <h3>New Supplier</h3>
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
                                //required
                                fullWidth
                                label="Email"
                                value={email}
                                type="email"
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
                        onClick={() => CreateSupplier()}
                        disabled={loading}
                    >
                        Add
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}

CreateSuppliers.propTypes = {
    shopId: PropTypes.string.isRequired,
    setFormState: PropTypes.func.isRequired,
}
