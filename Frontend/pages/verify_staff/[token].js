import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Container, CssBaseline } from '@material-ui/core';
import API from '../../utils/api';

export default function VerifyStaff() {
  const router = useRouter();
  const code = router.query.token;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formAction, setFormAction] = useState('set');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const submitPassword = async () => {
    try {
      setIsLoading(true);
      await API.post(`staff/password`, {
        password,
        confirm,
        code,
      });
      setIsLoading(false);
      router.push('/login');
    } catch (err) {
      setIsLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  const [email, setEmail] = useState('');

  const retry = async () => {
    try {
      setIsLoading(true);
      await API.post(`staff/reinvite`, { email });
      setIsLoading(false);
      const message = 'Sent invite link to your email';
      setError('');
      setSuccess(message);
    } catch (err) {
      setIsLoading(false);
      const { message } = err.response.data;
      setError(message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      {formAction === 'set' && (
        <div
          style={{
            marginTop: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2>Set a password for your account</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <p style={{ color: 'green' }}>{success}</p>
          <form noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Password"
              name="Password"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Confirm"
              name="Confirm"
              value={confirm}
              type="password"
              onChange={(e) => setConfirm(e.target.value)}
            />

            <Button
              disabled={isLoading}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => submitPassword()}
            >
              submit
            </Button>

            <Button
              style={{ marginTop: '10px' }}
              type="button"
              fullWidth
              variant="contained"
              color="default"
              disableElevation
              onClick={() => setFormAction('retry')}
            >
              resend invite
            </Button>
          </form>
        </div>
      )}

      {formAction === 'retry' && (
        <div
          style={{
            marginTop: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2>Resend Invite</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <p style={{ color: 'green' }}>{success}</p>
          <form noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              disabled={isLoading}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => retry()}
            >
              resend
            </Button>
          </form>
        </div>
      )}
    </Container>
  );
}
