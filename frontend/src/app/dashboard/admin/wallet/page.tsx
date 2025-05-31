'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Card, CardContent, Container, Grid, MenuItem, Select, TextField, Typography, Alert, CircularProgress, Paper, Avatar } from '@mui/material';
import { accountClient } from '@/lib/AccountClient';
import { authClient } from '@/lib/AuthClient';
import { User } from '@phosphor-icons/react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  wallet_amount: number;
}

export default function AdminWalletPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | ''>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authResponse = await authClient.getAuth();
      if (!authResponse.success || !authResponse.data || authResponse.data.usertype !== 'admin') {
        router.push('/dashboard/overview');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setInitialLoading(true);
        const response = await accountClient.getAllUsersWithWallet();
        setUsers(response.data || []);
      } catch (error) {
        setError('Failed to fetch users');
        setUsers([]);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleWalletUpdate = async (action: 'add' | 'subtract') => {
    if (!selectedUser || !amount) {
      setError('Please select a user and enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await accountClient.updateUserWallet(selectedUser, amountNum, action);
      setSuccess(response.message);
      
      // Update the user's wallet amount in the local state
      setUsers(users.map(user => 
        user.id === selectedUser 
          ? { ...user, wallet_amount: response.data.amount }
          : user
      ));
      
      setAmount('');
    } catch (error: any) {
      setError(error instanceof Error ? error.message : 'Failed to update wallet');
    } finally {
      setLoading(false);
    }
  };

  const selectedUserData = users.find(user => user.id === selectedUser);

  if (initialLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Wallet Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select User
                </Typography>
                <Select
                  fullWidth
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(Number(e.target.value))}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select User
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </CardContent>
            </Card>
          </Grid>

          {selectedUserData && (
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
                      <User size={32} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5">
                        {selectedUserData.first_name} {selectedUserData.last_name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {selectedUserData.email}
                      </Typography>
                      {selectedUserData.company_name && (
                        <Typography variant="body2" color="text.secondary">
                          {selectedUserData.company_name}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      borderRadius: 2,
                      mb: 3
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Current Balance
                    </Typography>
                    <Typography variant="h3">
                      ₹{selectedUserData.wallet_amount.toLocaleString()}
                    </Typography>
                  </Paper>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Update Wallet
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleWalletUpdate('add')}
                            disabled={loading}
                            fullWidth
                          >
                            Add Money
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleWalletUpdate('subtract')}
                            disabled={loading}
                            fullWidth
                          >
                            Subtract Money
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <CircularProgress />
                    </Box>
                  )}

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {success}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
} 