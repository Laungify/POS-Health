/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import { useQueryParam, StringParam } from "use-query-params"
import { makeStyles } from '@material-ui/core/styles';
import { Modal, Button, TextField } from '@material-ui/core';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PropTypes from 'prop-types';
import API from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';


const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        maxWidth: '300px',
        position: 'absolute',
        marginTop: '1rem',
        marginLeft: '1rem',
        //width: 600,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default function ResetModal() {

    const classes = useStyles();
    const router = useRouter();

    //const [token, setToken] = useState(router?.query.token);
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = React.useState('');
    const [success, setSuccess] = useState("")

    const token = router?.query.token


    const handleResetPassword = async () => {
        setError("")
        setSuccess("")
        if (!password || !confirm) {
            return setError("All field are required")
        }
        if (password.length < 6) {
            return setError("New password must be at least 6 characters")
        }
        if (password !== confirm) {
            return setError("Password and confirm password do not match")
        } else {
            try {
                setIsLoading(true)
                const result = await API.post(
                    `staff/reset-password`,
                    {
                        password,
                        confirm,
                        token,
                    }
                )

                setIsLoading(false)
                setSuccess(result.data.message)
                setIsSubmitted(true)
                //navigate("/login")
            } catch (error) {
                setIsLoading(false)
                const message = error.response.data.message
                setError(message)
            }
        }
    }

    return (
        <>
            <div className={classes.paper}>
                <h2>Reset Password</h2>
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
                <p style={{ color: "green", textAlign: "center" }}>{success}</p>
                <p style={{ textAlign: "center" }}>{isLoading && <CircularProgress />}</p>
                <form>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        inputProps={{ minLength: 6 }}
                        autoComplete="off"
                        type="password"
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Confirm new password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoFocus
                        inputProps={{ minLength: 6 }}
                        autoComplete="off"
                        type="password"
                    />
                </form>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={() => handleResetPassword()}
                    disabled={!password || !confirm || isLoading || isSubmitted}
                >
                    Submit
                </Button>
                <div
                    style={{
                        marginTop: '10px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        width: '5rem',
                        height: '2rem',
                        fontSize: '1.25rem'
                    }}>
                    <Link href="/login">Sign in</Link>
                </div>
            </div>
        </>
    );
}

ResetModal.propTypes = {
    open: PropTypes.bool,
    closeModal: PropTypes.func,
};
