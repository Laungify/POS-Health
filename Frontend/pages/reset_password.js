import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Link from 'next/link'
import { useRouter } from 'next/router'
import CircularProgress from '@mui/material/CircularProgress'
import API from '../utils/api'

export default function Reset() {
  const router = useRouter()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const token = router?.query.token

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!password || !confirm) {
      return setError('All field are required')
    }
    if (password.length < 6) {
      return setError('New password must be at least 6 characters')
    }
    if (password !== confirm) {
      return setError('Password and confirm password do not match')
    }
    try {
      setIsLoading(true)
      const result = await API.post(`staff/reset_password`, {
        password,
        confirm,
        token,
      })

      setIsLoading(false)
      setSuccess(result.data.message)
      setIsSubmitted(true)

      setTimeout(() => {
        router.push('/login')
      }, 2000)
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
          Reset Password
        </Typography>
        <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        <p style={{ textAlign: 'center' }}>
          {isLoading && <CircularProgress />}
        </p>
        <form onSubmit={submit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
            onChange={e => setConfirm(e.target.value)}
            autoFocus
            inputProps={{ minLength: 6 }}
            autoComplete="off"
            type="password"
          />

          <Button
            disabled={!password || !confirm || isLoading || isSubmitted}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disableElevation
          >
            Reset password
          </Button>
        </form>
        <div style={{ marginTop: '10px' }}>
          <Link href="/login">Sign In</Link>
        </div>
      </div>
    </Container>
  )
}
