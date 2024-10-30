import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CircularProgress from '@mui/material/CircularProgress'
import useAuthState from '../stores/auth'
import API from '../utils/api'

export default function Login() {
  const router = useRouter()
  const { logIn } = useAuthState()
  const [email, setEmail] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const submit = async e => {
    try {
      e.preventDefault()
      setIsLoading(true)
      setError('')

      const result = await API.post(
        `${process.env.NEXT_PUBLIC_API_URL}/staff/request_password_reset`,
        {
          email,
        },
      )

      setIsLoading(false)
      setSuccess(result.data.message)
      setIsSubmitted(true)
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
          Forgot Password
        </Typography>
        <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        <p style={{ textAlign: 'center' }}>
          {isLoading && <CircularProgress />}
        </p>
        <form onSubmit={submit}>
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

          <Button
            disabled={!email || isLoading || isSubmitted}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disableElevation
          >
            Get reset link
          </Button>
          <div style={{ marginTop: '10px' }}>
            <Link href="/register">Don&apos;t have an account? Sign Up</Link>
          </div>
        </form>
      </div>
    </Container>
  )
}
