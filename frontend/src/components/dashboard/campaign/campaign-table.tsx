'use client';

import { useAuth } from '@/hooks/use-auth';
import { campaignClient } from '@/lib/CampaignClient';
import { utils } from '@/lib/CommonUtils';
import { paths } from '@/paths';
import { Campaign } from '@/types/campaign';
import { CircularProgress, IconButton, MenuItem, Select, SelectChangeEvent, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { CheckCircle, Eye, Pencil, PencilSlash, Upload, Warning } from '@phosphor-icons/react';
import { Download } from '@phosphor-icons/react/dist/ssr/Download';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface TableProps<T> {
  count?: number;
  page?: number;
  rows?: T;
  rowsPerPage?: number;
  handlePageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleViewCampaign?: (id: number) => void;
  handleUpdateStatus?: (id: number,status:string) => Promise<void>;
  handleUploadReport?: (selectedFile: File, campaignId: number) => Promise<void>;
  selectedFields?: string[];
}

const tableCellStyles = {
  maxWidth: '540px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',   
};

const uploadCellStyles = {
  ...tableCellStyles,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 1
};

const statusOptions = ["Created", "Learning","Live", "Pause Option", "Completed","Other"]; 

const COLUMN_MAPPING = {
  'Campaign Id': 'id',
  'Advertiser Name': 'advertiser',
  'Campaign Name': 'name',
  'Objective': 'objective',
  'Buy Type': 'buy_type',
  'Unit Rate': 'unit_rate',
  'Budget': 'budget',
  'Impression': 'impressions',
  'Budget Used': 'payments',
  'Click': 'clicks',
  'CTR': 'ctr',
  'Views': 'views',
  'VTR': 'vtr',
  'Status': 'status'
};

export function CampaignTable({
  count = 0,
  rows = [],
  page = 1,
  rowsPerPage = 10,
  handlePageChange,
  handleViewCampaign,
  handleUpdateStatus,
  handleUploadReport,
  selectedFields = Object.keys(COLUMN_MAPPING),
}: TableProps<Campaign[]>): React.JSX.Element {
  const {auth} = useAuth();
  const router = useRouter();
  const [editedStatus, setEditedStatus] = React.useState<Record<number, string>>({});
  const [editingRow, setEditingRow] = React.useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<Record<number, { loading: boolean; error?: string; success?: boolean }>>({});
  const [updateStatus, setUpdateStatus] = React.useState<Record<number, { loading: boolean; error?: string; success?: boolean }>>({});

  const shouldShowColumn = (columnName: string) => {
    if (!selectedFields || selectedFields.length === 0) return true;
    return selectedFields.includes(columnName);
  };

  const handleStatusEdit = (rowId: number) => {
    setEditingRow(prev => prev === rowId ? null : rowId);
  };

  const handleStatusChange = (rowId: number) => async (event: SelectChangeEvent) => {
    const newStatus = event.target.value as string;
    
    try {
      setEditedStatus(prev => ({ ...prev, [rowId]: newStatus }));
      if(handleUpdateStatus) {
        await handleUpdateStatus(rowId, newStatus);
      }
    } catch (e:any) {
      setEditedStatus(prev => ({ ...prev, [rowId]: rows.find(r => r.id === rowId)?.status || '' }));
      setUpdateStatus(prev => ({
        ...prev,
        [rowId]: { loading: false, error: e.message || 'Update failed', success: false }
      }));
    }
  };

  const handleViewCampaignClick = (id: number) => {
    handleViewCampaign && handleViewCampaign(id);
  };

  const handleCampaignEdit =(id:number)=>{
    const selectedCampaign = rows.find((campaign) => campaign.id === id);
    if(selectedCampaign){
      sessionStorage.setItem("id",String(id));
      sessionStorage.setItem("campaign",JSON.stringify(utils.transformCampaignToFormData(selectedCampaign)));       
      router.push(paths.dashboard.createCampaign) 
    }
  }

  const handleDownloadClick =(id:number)=>{
    const selectedCampaign = rows.find((campaign) => campaign.id === id);
    if(selectedCampaign){
      const fileUrl = selectedCampaign.campaign_files[0].file;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
  }

  const handleFileUpload =(e: React.ChangeEvent<HTMLInputElement>, campaignId:number)=>{
    if (!e.target.files) return;
    const selectedFile = e.target.files[0];
    handleUpload(selectedFile,campaignId)
    e.target.value = '';
  }

  const handleUpload = async (selectedFile: File, campaignId: number) => {
    setUploadStatus(prev => ({
      ...prev,
      [campaignId]: { loading: true, error: undefined, success: false }
    }));

    try {
      if(handleUploadReport){
        await handleUploadReport(selectedFile,campaignId)
        setUploadStatus(prev => ({
          ...prev,
          [campaignId]: { loading: false, success: true, error: undefined }
        }));
        
        setTimeout(() => {
          setUploadStatus(prev => {
            const { [campaignId]: _, ...rest } = prev;
            return rest;
          });
        }, 3000);
      }
    } catch (e: any) {
      setUploadStatus(prev => ({
        ...prev,
        [campaignId]: { loading: false, error: e.message || 'Upload failed', success: false }
      }));
    }
  };

  return (
    <Card sx={{ borderRadius: 0 }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              {shouldShowColumn('Campaign Id') && <TableCell sx={tableCellStyles}>Campaign Id</TableCell>}
              {auth?.usertype === 'admin' && shouldShowColumn('Advertiser Name') && 
                <TableCell sx={tableCellStyles}>Advertiser Name</TableCell>}
              {shouldShowColumn('Campaign Name') && <TableCell sx={tableCellStyles}>Campaign Name</TableCell>}
              {shouldShowColumn('Objective') && <TableCell sx={tableCellStyles}>Objective</TableCell>}
              {shouldShowColumn('Buy Type') && <TableCell sx={tableCellStyles}>Buy Type</TableCell>}
              {shouldShowColumn('Unit Rate') && <TableCell sx={tableCellStyles}>Unit Rate</TableCell>}
              {shouldShowColumn('Budget') && <TableCell sx={tableCellStyles}>Budget</TableCell>}
              {shouldShowColumn('Budget Used') && <TableCell sx={tableCellStyles}>Budget Used</TableCell>}
              {shouldShowColumn('Impression') && <TableCell sx={tableCellStyles}>Impression</TableCell>}
              {shouldShowColumn('Click') && <TableCell sx={tableCellStyles}>Click</TableCell>}
              {shouldShowColumn('CTR') && <TableCell sx={tableCellStyles}>CTR</TableCell>}
              {shouldShowColumn('Views') && <TableCell sx={tableCellStyles}>Views</TableCell>}
              {shouldShowColumn('VTR') && <TableCell sx={tableCellStyles}>VTR</TableCell>}
              {shouldShowColumn('Status') && <TableCell sx={tableCellStyles}>Status</TableCell>}
              <TableCell sx={tableCellStyles}>View</TableCell>
              {auth?.usertype === 'user' && (<TableCell sx={tableCellStyles}>Edit</TableCell>)}
              {auth?.usertype==='admin'?<TableCell sx={tableCellStyles}>Upload</TableCell>:
                 <TableCell sx={tableCellStyles}>Download</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                {shouldShowColumn('Campaign Id') && <TableCell sx={tableCellStyles}>{row.id}</TableCell>}
                {auth?.usertype === 'admin' && shouldShowColumn('Advertiser Name') && 
                  <TableCell sx={tableCellStyles}>
                    {utils.formatProperCase(row.user.first_name)} {utils.formatProperCase(row.user.last_name)}
                  </TableCell>
                }
                {shouldShowColumn('Campaign Name') && <TableCell sx={tableCellStyles}>{row.name}</TableCell>}
                {shouldShowColumn('Objective') && <TableCell sx={tableCellStyles}>{row.objective}</TableCell>}
                {shouldShowColumn('Buy Type') && <TableCell sx={tableCellStyles}>{row.buy_type}</TableCell>}
                {shouldShowColumn('Unit Rate') && 
                  <TableCell sx={tableCellStyles}><span className="WebRupee">&#x20B9;</span>{row.unit_rate}</TableCell>}
                {shouldShowColumn('Budget') && 
                  <TableCell sx={tableCellStyles}><span className="WebRupee">&#x20B9;</span>{row.total_budget}</TableCell>}
                {shouldShowColumn('Budget Used') && 
                  <TableCell sx={tableCellStyles}><span className="WebRupee">&#x20B9;</span>{row.payment}</TableCell>}
                {shouldShowColumn('Impression') && <TableCell sx={tableCellStyles}>{row.impressions}</TableCell>}
                {shouldShowColumn('Click') && <TableCell sx={tableCellStyles}>{row.clicks}</TableCell>}
                {shouldShowColumn('CTR') && <TableCell sx={tableCellStyles}>{row.ctr}</TableCell>}
                {shouldShowColumn('Views') && <TableCell sx={tableCellStyles}>{row.views}</TableCell>}
                {shouldShowColumn('VTR') && <TableCell sx={tableCellStyles}>{row.vtr}</TableCell>}
                {shouldShowColumn('Status') && 
                  <TableCell sx={tableCellStyles}>
                    {editingRow === row.id ? (
                      <>
                        <Select
                          value={editedStatus[row.id] || row.status}
                          onChange={handleStatusChange(row.id)}
                          size="small"
                          sx={{ 
                            width: 120,
                            '& .MuiSelect-select': { py: 0.5 }
                          }}
                          onBlur={() => setEditingRow(null)}
                        >
                          {statusOptions.map((status) => (
                            <MenuItem key={status} value={status} sx={{ fontSize: '0.875rem' }}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                        {updateStatus[row.id]?.error && (
                          <Typography variant="caption" color="error.main" sx={{ ml: 1, fontSize: "0.75rem", wordBreak: "break-word" }}>
                            {updateStatus[row.id]?.error}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}>
                        <span>{row.status}</span>
                        {auth?.usertype === 'admin' && (
                          <IconButton 
                            size="small"
                            onClick={() => handleStatusEdit(row.id)}
                            sx={{ p: 0, ml: 1 }}
                          >
                            <Pencil fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </TableCell>
                }
                <TableCell sx={tableCellStyles}><Eye onClick={() => handleViewCampaignClick(row.id)} fontSize="var(--icon-fontSize-md)" /></TableCell>
                {auth?.usertype==='admin'?
                  <>  
                    <TableCell sx={uploadCellStyles}>
                      <Tooltip title="Upload campaign report">
                        <IconButton 
                          component="label"
                          disabled={uploadStatus[row.id]?.loading}
                          sx={{
                            position: 'relative',
                            color: uploadStatus[row.id]?.success ? 'success.main' : 
                                  uploadStatus[row.id]?.error ? 'error.main' : 'inherit'
                          }}
                        >
                          {uploadStatus[row.id]?.loading ? (
                            <CircularProgress size={20} />
                          ) : uploadStatus[row.id]?.success ? (
                            <CheckCircle/>
                          ) : uploadStatus[row.id]?.error ? (
                            <Warning/>
                          ) : (
                            <Upload />
                          )}
                          <input
                            type="file"
                            hidden
                            accept=".xlsx, .xls"
                            onChange={(e) => handleFileUpload(e, row.id)}
                          />
                        </IconButton>
                      </Tooltip>
                      
                      {uploadStatus[row.id]?.error && (
                        <Typography variant="caption" color="error.main" sx={{ ml: 1, fontSize: "0.75rem", wordBreak: "break-word" }}>
                          {uploadStatus[row.id]?.error}
                        </Typography>
                      )}

                      {uploadStatus[row.id]?.success && (
                        <Typography variant="caption" color="success.main" sx={{ ml: 1, fontSize: "0.75rem", wordBreak: "break-word" }}>
                          Uploaded!
                        </Typography>
                      )}
                    </TableCell>
                  </>
                  :
                  <>
                    {row.status === "Created" && <TableCell sx={tableCellStyles}><Pencil onClick={() => handleCampaignEdit(row.id)}fontSize="var(--icon-fontSize-md)" /></TableCell>}
                    {row.status !== "Created" && <TableCell sx={tableCellStyles}><PencilSlash color='#cccccc' fontSize="var(--icon-fontSize-md)" /></TableCell>}
                    {!["Created", "Learning"].includes(row.status) && row.campaign_files?.length > 0 && (
                    <TableCell sx={tableCellStyles}>
                      <Download onClick={() => handleDownloadClick(row.id)} fontSize="var(--icon-fontSize-md)" />
                    </TableCell>
                  )}

                  {["Created", "Learning"].includes(row.status) || !row.campaign_files?.length ? (
                    <TableCell sx={tableCellStyles}>
                      <Download color="#cccccc" fontSize="var(--icon-fontSize-md)" />
                    </TableCell>
                  ) : null}
                  </>
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