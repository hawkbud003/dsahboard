"use client"
import * as React from 'react';
import { paths } from '@/paths';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CreativeTable } from '@/components/dashboard/creative/creative-table';
import RedirectBtn from '@/components/dashboard/layout/redirect-btn';
import { Search } from '@/components/dashboard/layout/search';
import { creativeClient } from '@/lib/CreativeClient';
import { Creative } from '@/types/creative';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';

export default function Page(): React.JSX.Element {
  const searchPlaceholder = "Search by Creative Name & Type"
  const [creatives, setCreatives] = React.useState<Creative[]>([]);
  const [count, setCount] = React.useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = React.useState(1);
  const [searchQuery,setSearchQuery] = React.useState<string>("")

  const handlPageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage+1)
    fetchCreatives(newPage+1,searchQuery);
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };


  async function fetchCreatives(pageNo:number,query:string) {
    setLoading(true)
    try {
      const {count,data} = await creativeClient.getCreatives(pageNo,query);
      setCount(count);
      if (Array.isArray(data)) {
        setCreatives(data);
      } else {
        setCreatives([]);
      }
    } catch (error) {
      console.error('Error fetching creatives:', error);
      setCreatives([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if(searchQuery!==""){
      const getData = setTimeout(() => {
        fetchCreatives(1,searchQuery);
      },2000);
      return () => clearTimeout(getData)
    }
    fetchCreatives(1,searchQuery);
  }, [searchQuery]);


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Creatives</Typography>
        </Stack>
        <div>
          <RedirectBtn url={paths.dashboard.creativeCreate} redirect={true}/>
        </div>
      </Stack>
      <Search placeholder={searchPlaceholder} onSearch={onSearchChange} />
      {loading ? 
          <Box  
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <CircularProgress />
          </Box>
        :
        <CreativeTable 
          count={count} 
          rows={creatives} 
          page={page} 
          handlePageChange={handlPageChange} 
        />
        }
    </Stack>
  );
}

