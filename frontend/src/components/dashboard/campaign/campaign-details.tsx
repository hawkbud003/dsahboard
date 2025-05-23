import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton
} from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { X } from '@phosphor-icons/react';
import * as React from 'react';
import { DetailGrid, DetailRow, FileDownloadItem, SectionContainer } from '../layout/section-container';
import TargetType from '../layout/target-type';
import { Campaign } from '@/types/campaign';
import { utils } from '@/lib/CommonUtils';
import { useAuth } from '@/hooks/use-auth';

interface CampaignDetailsPopOverProps {
  data?:Campaign;
  onClose: () => void;
  open: boolean;
}


export function CampaignDetailsPopOver({onClose, open, data }: CampaignDetailsPopOverProps): React.JSX.Element {
  
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
    };
    const {auth} = useAuth();
    const downloadFile = (fileUrl?: string) => {
      if(!fileUrl) return;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    };

    return (
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: '55%',
            height: '90%',
            maxWidth: 'none',
            padding: 2,
          },
        }}
      >
        {/* Header */}
        <DialogTitle 
          sx={{ 
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 3,
            px: 4,
            marginBottom:2,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ flex: 1, mr: 4 }}>
            <Typography 
              variant="h5"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {data?.name || 'Campaign Details'}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: 'absolute',
              right: (theme) => theme.spacing(2),
              top: (theme) => theme.spacing(2),
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover'
              }
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
  
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Campaign Details Section */}
            <SectionContainer title="Campaign Overview">
              <DetailGrid>
                {Object.entries({
                  Objective: data?.objective,
                  Status: data?.status,
                  'Total Budget': data?.total_budget !== undefined ? `₹${data.total_budget}` : 'N/A',
                  'Buy Type': data?.buy_type,
                  'Unit Rate': data?.unit_rate !== undefined ? `₹${data.unit_rate}` : 'N/A',
                  'Start Time': data?.start_time,
                  'End Time': data?.end_time,
                  "Spend": data?.payment !== undefined &&  data?.payment !== null? `₹${data.payment}` : 'N/A',
                  Clicks: data?.clicks,
                  Impressions: data?.impressions,
                  CTR: data?.ctr,
                  VTR: data?.vtr,
                  Views: data?.views,
                }).map(([label, value]) => (
                  <DetailRow 
                    key={label}
                    label={label}
                    value={value}
                    onCopy={() => copyToClipboard(String(value))}
                  />
                ))}
              </DetailGrid>
            </SectionContainer>

            {/* Additional Details Section */}
            <SectionContainer title="Targeting Details">
              <DetailGrid>
                {Object.entries({
                  Locations: data?.location?.map(loc => loc.city).join(', '),
                  Languages: data?.language?.join(', '),
                  Devices: data?.device?.join(', '),
                  Environment: data?.environment?.join(', '),
                  Carrier: data?.carrier?.join(', '),
                  'Device Prices': data?.device_price?.join(', '),
                  Exchanges: data?.exchange?.join(', '),
                  'Landing Page': data?.landing_page,
                }).map(([label, value]) => (
                  <DetailRow
                    key={label}
                    label={label}
                    value={value}
                    onCopy={() => copyToClipboard(String(value))}
                  />
                ))}
              </DetailGrid>
            </SectionContainer>

            {/* Interest Section */}
            <SectionContainer title="Interest Targeting">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {data &&
                    <TargetType 
                      targetType={data.target_type?.map(type => `${type.category} > ${type.subcategory}`).join(', ')} 
                      isRemovable={false} 
                    />
                   }
                </Grid>
              </Grid>
            </SectionContainer>

            {/* Attachments Section */}
            <SectionContainer title="Attachments">
              <Grid container spacing={2}>
                {data && data.creative?.map((creative, index) => (
                  <FileDownloadItem
                    key={creative.id}
                    label={utils.formatProperCase(creative.name)}
                    onDownload={() => downloadFile(creative.file)}
                  />
                ))}

                {(auth?.usertype === 'admin' || 
                  (data?.status && !['Created', 'Learning'].includes(data.status))) && 
                  [{ label: 'Campaign Report', files: data?.campaign_files }].map(
                    ({ label, files }) =>
                      files?.map((file, index) => (
                        <FileDownloadItem
                          key={`${label}-${index}`}
                          label={`${label}`}
                          onDownload={() => downloadFile(file.file)}
                        />
                      ))
                  )}
              </Grid>
            </SectionContainer>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }
  