'use client';

import { utils } from '@/lib/CommonUtils';
import { Creative } from '@/types/creative';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Download } from '@phosphor-icons/react/dist/ssr/Download';
import * as React from 'react';

interface TableProps<T> {
  count?: number;
  page?: number;
  rows?: T;
  rowsPerPage?: number;
  handlePageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
}

const tableCellStyles = {
  maxWidth: '540px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',   
};

export function CreativeTable({
  count = 0,
  rows = [],
  page = 1,
  rowsPerPage = 10,
  handlePageChange,
}: TableProps<Creative[]>): React.JSX.Element {

  const handleDownloadClick =(id:number)=>{
    const selectedCreative = rows.find((creative) => creative.id === id);
    if(selectedCreative && selectedCreative.file){
      const fileUrl = selectedCreative.file;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
  }
  return (
    <Card sx={{ borderRadius: 0 }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellStyles}>Creative Id</TableCell>
              <TableCell sx={tableCellStyles}>Creative Name</TableCell>
              <TableCell sx={tableCellStyles}>Creative Type</TableCell>
              <TableCell sx={tableCellStyles}>Description</TableCell>
              <TableCell sx={tableCellStyles}>Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell sx={tableCellStyles}>{row.id}</TableCell>
                <TableCell sx={tableCellStyles}>{utils.formatProperCase(row.name)}</TableCell>
                <TableCell sx={tableCellStyles}>{utils.formatProperCase(row.creative_type)}</TableCell>
                <TableCell sx={tableCellStyles}>{row.description}</TableCell>
                {row.file && 
                  <TableCell sx={tableCellStyles}>
                      <Download onClick={() => handleDownloadClick(row.id)} fontSize="var(--icon-fontSize-md)" />
                  </TableCell>
                }
              </TableRow>
            ))}
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