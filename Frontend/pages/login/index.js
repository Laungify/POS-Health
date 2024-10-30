import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CircularProgress from '@mui/material/CircularProgress'
import useAuthState from '../../stores/auth'
import API from '../../utils/api'
import OneSignal from 'react-onesignal'

export default function Login() {
  const router = useRouter()
  const { logIn } = useAuthState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const login = async e => {
    try {
      e.preventDefault()
      setIsLoading(true)
      setError('')

      const data = {
        email:email.toLowerCase(),
        password,
      }

      const result = await API.post(
        `${process.env.NEXT_PUBLIC_API_URL}/staff/login`,
        { ...data },
      )

      const logInData = {
        token: result.data.token,
        staff: result.data.staff,
        company: result.data.staff?.company || {},
      }

      logIn(logInData)
      //console.log("log in", logInData.staff._id)
      OneSignal.login(logInData.staff._id);
      setIsLoading(false)
      setIsSubmitted(true)
      router.push('/')
    } catch (err) {
      setIsLoading(false)
      const { message } = err.response.data
      setError(message)
    }
  }

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
          Sign in
        </Typography>
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        <p style={{ textAlign: 'center' }}>
          {isLoading && <CircularProgress />}
        </p>
        <form onSubmit={login}>
          <TextField
            type="email"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <Button
            disabled={isLoading || isSubmitted}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disableElevation
          >
            Sign In
          </Button>
        </form>
        <div style={{ marginTop: '10px' }}>
          <Link href="/register">Don&apos;t have an account? Sign Up</Link>
        </div>
        <div style={{ marginTop: '10px' }}>
          <Link href="/forgot_password">Forgot Password</Link>
        </div>
      </div>
    </Container>
  )
}
