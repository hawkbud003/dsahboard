'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CurrencyCircleDollar } from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';
import { accountClient } from '@/lib/AccountClient';

export function AmountSection(): React.JSX.Element {
  const [amount, setAmount] = React.useState<number>(0);
  const { auth } = useAuth();

  React.useEffect(() => {
    const fetchAmount = async () => {
      try {
        const userAmount = await accountClient.getUserWalletAmount();
        setAmount(userAmount);
      } catch (error) {
        console.error('Failed to fetch amount:', error);
      }
    };

    fetchAmount();
  }, []);

  return (
    <Box
      sx={{
        p: 2,
        borderTop: '1px solid var(--mui-palette-neutral-700)',
        backgroundColor: 'var(--SideNav-background)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        
        <Typography variant="h6" sx={{ color: 'var(--mui-palette-primary-main)', fontWeight: 600 }}>
         Wallet: ₹{amount.toLocaleString()}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: 'var(--NavItem-color)',
          fontSize: '0.75rem',
        }}
      >
        To add money, please contact support
      </Typography>
    </Box>
  );
} 