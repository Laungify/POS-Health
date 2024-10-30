import React, { useState } from 'react';
import { TextField, Button } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';
import API from '../../utils/api';
import useAuthState from '../../stores/auth';

export default function Register() {
  const router = useRouter();
  const { logInDoctor } = useAuthState();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const register = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const data = {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirm,
      };
      const result = await API.post(`doctors`, {
        ...data,
      });
      logInDoctor(result.data);
      setLoading(false);
      setIsSubmitted(true);
      router.push('/');
    } catch (err) {
      console.log('🚀 ~ file: doctor.js:46 ~ register ~ err:', err);
      setLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div
        style={{
          marginTop: '100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" align="center">
          Health Information Management System
        </Typography>
        <br />
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <p style={{ color: 'red' }}>{error}</p>
        <p style={{ textAlign: 'center' }}>{loading && <CircularProgress />}</p>
        <form onSubmit={register}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                typ="email"
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                autoComplete="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="confirm"
                label="Confirm Password"
                type="password"
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Grid>
          </Grid>
          <br />
          <Button
            disabled={loading || isSubmitted}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disableElevation
          >
            Sign Up
          </Button>
          <div style={{ marginTop: '10px' }}>
            <Link href="/login">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </Container>
  );
}
