"use client"
import { paths } from '@/paths';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import * as React from 'react';

import { CampaignDetailsPopOver } from '@/components/dashboard/campaign/campaign-details';
import { CampaignTable } from '@/components/dashboard/campaign/campaign-table';
import { FieldSelector } from '@/components/dashboard/layout/field-selector';
import RedirectBtn from '@/components/dashboard/layout/redirect-btn';
import { Search } from '@/components/dashboard/layout/search';
import { useAuth } from '@/hooks/use-auth';
import { usePopover } from '@/hooks/use-popover';
import { campaignClient } from '@/lib/CampaignClient';
import { Campaign } from '@/types/campaign';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';

const AVAILABLE_FIELDS = [
  'Campaign Id',
  'Campaign Name',
  'Advertiser Name',
  'Objective',
  'Buy Type',
  'Unit Rate',
  'Budget',
  'Spend',
  'Impression',
  'Click',
  'CTR',
  'Views',
  'VTR',
  'Status'
];

export default function Page(): React.JSX.Element {
  const {auth} = useAuth();
  const searchPlaceholder = auth?.usertype === "admin" ?
    "Search by Campaign Name & Advertiser Name & Status" :
    "Search by Campaign Name & Status"
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [campaign, setCampaign] = React.useState<Campaign>();
  const [count, setCount] = React.useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = React.useState(1);
  const campaignPopOver = usePopover<HTMLDivElement>();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedFields, setSelectedFields] = React.useState<string[]>(AVAILABLE_FIELDS);

  const handleViewCampaign = (id: number) => {
    const selectedCampaign = campaigns.find((campaign) => campaign.id === id);
      if (selectedCampaign) {
      setCampaign(selectedCampaign);
      campaignPopOver.handleOpen();
    }
  };
  
  const handleUpdateStatus = async(campaignId:number,status:string) =>{
    try {
      const result = await campaignClient.patchCampaign("status",status,campaignId);
      if (result) {
        fetchCampaigns(1,searchQuery);
      }
    } catch (error:any) {
      throw new Error(error);
    }
  }

  const handleUploadReport = async(selectedFile: File, campaignId: number) =>{
    try {
      await campaignClient.uploadFile(selectedFile, "report-upload", campaignId);
      setTimeout(() => {fetchCampaigns(1,searchQuery)}, 5000);
    } catch (error:any) {
      throw new Error(error);
    }
  }
  
  const handlPageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage+1)
    fetchCampaigns(newPage+1,searchQuery);
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFieldSelection = (fields: string[]) => {
    setSelectedFields(fields);
  };

  async function fetchCampaigns(pageNo:number,query:string) {
    setLoading(true)
    try {
      const {count,data} = await campaignClient.getCampaigns(pageNo,query);
      setCount(count);
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if(searchQuery!==""){
      const getData = setTimeout(() => {
        fetchCampaigns(1,searchQuery);
      },2000);
      return () => clearTimeout(getData)
    }
    fetchCampaigns(1,searchQuery);
  }, [searchQuery]);


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Campaigns</Typography>
        </Stack>
        <div>
          <RedirectBtn url={paths.dashboard.createCampaign} redirect={true}/>
        </div>
      </Stack>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          p: 2, 
          border: '1px solid #e0e0e0',
          borderRadius: 0,
          color: 'white'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Search 
            placeholder={searchPlaceholder} 
            onSearch={onSearchChange} 
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldSelector 
            onFieldsChange={handleFieldSelection} 
            selectedFields={selectedFields} 
          />
        </Box>
      </Box>
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
        <CampaignTable 
          count={count} 
          rows={campaigns} 
          page={page} 
          handlePageChange={handlPageChange} 
          handleViewCampaign={handleViewCampaign}
          handleUpdateStatus = {handleUpdateStatus}
          handleUploadReport ={handleUploadReport}
          selectedFields={selectedFields}
        />
        }
        <CampaignDetailsPopOver onClose={campaignPopOver.handleClose} open={campaignPopOver.open}  data={campaign}/>
    </Stack>
  );
}

