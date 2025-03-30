"use client"

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import { authClient } from '@/lib/auth-client';
import { Customer } from '@/types/auth';
import { Box, CircularProgress } from '@mui/material';

export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [count, setCount] = React.useState<number>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState(1);

  const handlPageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage+1)
    fetchCustomers(newPage+1);
  };

  async function fetchCustomers(pageNo:number) {
    setLoading(true)
    try {
      const {totalCount,data} = await authClient.getCustomers(pageNo);
      setCount(totalCount);
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchCustomers(1);
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Customers</Typography>
        </Stack>
      </Stack>
      {
        loading && customers? 
            <Box  
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <CircularProgress />
            </Box>
          :
          <CustomersTable count={count} rows={customers} page={page} handlePageChange={handlPageChange}/>
        }
    </Stack>
  );
}