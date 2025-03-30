'use client';

import { Customer } from '@/types/auth';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';
import * as React from 'react';

interface TableProps<T> {
  count?: number;
  page?: number;
  rows?: T;
  rowsPerPage?: number;
  handlePageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowClick?: (id: number,operation:string) => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 1,
  rowsPerPage = 10,
  handlePageChange,
  onRowClick,
}: TableProps<Customer[]>): React.JSX.Element {
  
  return (
    <Card sx={{ borderRadius: 0 }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Signed Up</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.first_name} {row.last_name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.profile?.phone_no}</TableCell>
                  <TableCell>{dayjs(row.date_joined).format('MMM D, YYYY')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={handlePageChange}
        page={page-1}
        rowsPerPage={rowsPerPage}
      />
    </Card>
  );
}