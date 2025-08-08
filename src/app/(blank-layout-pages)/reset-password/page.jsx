'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from '@/configs/url';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!token) {
      return setError("Invalid or missing token");
    }

    try {
      setLoading(true);
      const res = await axios.put(`${BASE_URL}/api/user/update-password/${token}`, {
        token,
        password,
      });

      setMessage("Password reset successful! Redirecting...");
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={3}>
          Reset Your Password
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            type="password"
            label="New Password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            label="Confirm Password"
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
